from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models import Event, Hall, Venue
from app.db.session import get_db
from app.schemas.events import EventOut, EventDetail

router = APIRouter(prefix="/api/events", tags=["events"])


@router.get("/", response_model=list[EventOut], summary="List events with optional filters")
async def list_events(
    q: str | None = Query(None),
    city: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    query = select(Event).join(Hall).join(Venue)

    if q:
        query = query.where(Event.title.ilike(f"%{q}%"))
    if city:
        query = query.where(Venue.city.ilike(f"%{city}%"))

    result = await db.execute(query)
    events = result.scalars().all()
    return events


@router.get("/{event_id}", response_model=EventDetail, summary="Get event details + hall info")
async def get_event(event_id: int, db: AsyncSession = Depends(get_db)):
    query = (
        select(Event, Hall, Venue)
        .join(Hall, Event.hall_id == Hall.id)
        .join(Venue, Hall.venue_id == Venue.id)
        .where(Event.id == event_id)
    )
    result = await db.execute(query)
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Event not found")

    event, hall, venue = row
    return EventDetail(
        id=event.id,
        title=event.title,
        date_time=event.date_time,
        poster_url=event.poster_url,
        status=event.status,
        hall_name=hall.name,
        hall_seat_map=hall.seat_map_json,
        venue_name=venue.name,
        venue_city=venue.city,
    )
