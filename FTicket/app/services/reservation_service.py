from typing import List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import Ticket


class ReservationError(Exception):

    pass


async def reserve_seats(db: AsyncSession, event_id: int, seat_ids: List[int], user_id: int | None):

    try:
        async with db.begin():
            reserved_seats = []

            for sid in sorted(seat_ids):

                q = await db.execute(
                    select(Ticket)
                    .where(Ticket.event_id == event_id, Ticket.seat_id == sid)
                    .with_for_update()
                )
                ticket = q.scalar_one_or_none()

                if not ticket:
                    raise ReservationError(f"Seat {sid} does not exist.")
                if ticket.status != "available":
                    raise ReservationError(f"Seat {sid} not available (status={ticket.status}).")


                ticket.status = "reserved"
                ticket.user_id = user_id
                db.add(ticket)
                reserved_seats.append(sid)

        return {"reserved": reserved_seats}

    except ReservationError:

        raise
    except Exception as e:

        raise ReservationError(f"Unexpected error during reservation: {e}")
