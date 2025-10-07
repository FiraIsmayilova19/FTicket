from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db import models
from app.db.session import get_db
from app.api.routers.auth import get_current_user
from app.utils.qrcode_utils import generate_qr_for_ticket

router = APIRouter(prefix="/api/orders", tags=["orders"])

class CheckoutPayload(BaseModel):
    ticket_ids: list[int]

@router.post("/checkout")
async def checkout(payload: CheckoutPayload, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    # Mock payment: accept and immediately mark sold
    async with db.begin():
        total = 0.0
        tickets = []
        for tid in payload.ticket_ids:
            q = await db.execute(select(models.Ticket).where(models.Ticket.id == tid).with_for_update())
            ticket = q.scalar_one_or_none()
            if not ticket:
                raise HTTPException(status_code=404, detail=f"Ticket {tid} not found")
            if ticket.status != "reserved" or ticket.user_id != current_user.id:
                raise HTTPException(status_code=400, detail=f"Ticket {tid} not reserved by you")
            total += ticket.price
            tickets.append(ticket)
        # create order
        order = models.Order(user_id=current_user.id, total=total, status="paid")
        db.add(order)
        await db.flush()  # get order.id
        for t in tickets:
            t.status = "sold"
            db.add(t)
            item = models.OrderItem(order_id=order.id, ticket_id=t.id, price=t.price)
            db.add(item)

            qr_path = generate_qr_for_ticket(t.id, f"order:{order.id}|ticket:{t.id}")
            t.qr_code_url = qr_path
        await db.commit()

        return {"order_id": order.id, "total": total, "tickets": [{"ticket_id": t.id, "qr": t.qr_code_url} for t in tickets]}
