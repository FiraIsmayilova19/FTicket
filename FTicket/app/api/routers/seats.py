from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.db import models
from app.db.session import get_db
from app.api.routers.auth import get_current_user
from app.services.reservation_service import reserve_seats, ReservationError

from slowapi import Limiter
from slowapi.util import get_remote_address


router = APIRouter(prefix="/api/events", tags=["seats"])

# Rate limiting (optional)
limiter = Limiter(key_func=lambda req: getattr(req.state, "rate_limit_key", get_remote_address(req)))


@router.get("/{event_id}/seats", summary="Get seats and their ticket status")
async def get_seats(event_id: int, db: AsyncSession = Depends(get_db)):

    q = await db.execute(
        select(models.Seat, models.Ticket)
        .join(models.Ticket, models.Ticket.seat_id == models.Seat.id)
        .where(models.Ticket.event_id == event_id)
    )
    rows = q.all()

    out = []
    for seat, ticket in rows:
        out.append({
            "seat_id": seat.id,
            "sector": seat.sector,
            "row": seat.row,
            "col": seat.col,
            "x": seat.x,
            "y": seat.y,
            "ticket_id": ticket.id,
            "price": ticket.price,
            "status": ticket.status,
        })
    return out


class ReservePayload(BaseModel):
    seats: list[int]


@router.post("/{event_id}/reserve")
@limiter.limit("10/minute")
async def reserve(
    event_id: int,
    payload: ReservePayload,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):

    try:
        res = await reserve_seats(db, event_id, payload.seats, current_user.id)
        return res
    except ReservationError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
