from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db import models
from app.db.models import Event, Hall
from app.schemas.events import VenueCreate, VenueOut,HallCreate, HallOut
from app.db.session import get_db
from app.schemas.events import EventCreate, EventOut
from app.api.routers.auth import get_current_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/venues", response_model=VenueOut)
async def create_venue(payload: VenueCreate, db: AsyncSession = Depends(get_db), current_admin=Depends(get_current_admin)):
    venue = models.Venue(**payload.dict())
    db.add(venue)
    await db.commit()
    await db.refresh(venue)
    return venue


@router.get("/venues", response_model=list[VenueOut])
async def list_venues(db: AsyncSession = Depends(get_db), current_admin=Depends(get_current_admin)):
    """Bütün məkanları qaytarır (admin üçün)."""
    q = await db.execute(select(models.Venue))
    venues = q.scalars().all()
    return venues


@router.post("/halls", response_model=HallOut)
async def create_hall(payload: HallCreate, db: AsyncSession = Depends(get_db), current_admin=Depends(get_current_admin)):
    """Yeni zal (hall) əlavə edir"""
    hall = models.Hall(**payload.dict())
    db.add(hall)
    await db.commit()
    await db.refresh(hall)
    return hall


@router.get("/halls", response_model=list[HallOut])
async def list_halls(db: AsyncSession = Depends(get_db), current_admin=Depends(get_current_admin)):
    q = await db.execute(select(models.Hall))
    return q.scalars().all()


@router.post("/events", response_model=EventOut)
async def create_event(data: EventCreate, db: AsyncSession = Depends(get_db)):
    new_event = Event(**data.dict())
    db.add(new_event)
    await db.commit()
    await db.refresh(new_event)
    return new_event



@router.delete("/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(event_id: int, db: AsyncSession = Depends(get_db), _: dict = Depends(get_current_admin)):
    q = await db.execute(select(Event).where(Event.id == event_id))
    event = q.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    await db.delete(event)
    await db.commit()
    return
