from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class VenueBase(BaseModel):
    name: str
    address: Optional[str] = None
    capacity: Optional[int] = None


class VenueCreate(VenueBase):
    pass


class VenueOut(VenueBase):
    id: int

    class Config:
        from_attributes = True

class EventBase(BaseModel):
    title: str
    date_time: datetime
    poster_url: str | None = None
    status: str = "draft"
    hall_id: int


class EventCreate(EventBase):
    pass


class EventOut(EventBase):
    id: int

    class Config:
        from_attributes = True


class EventDetail(BaseModel):
    id: int
    title: str
    date_time: datetime
    poster_url: str | None
    status: str
    hall_name: str
    hall_seat_map: dict | None
    venue_name: str
    venue_city: str

class HallBase(BaseModel):
    name: str
    venue_id: int
    capacity: Optional[int] = None


class HallCreate(HallBase):
    pass


class HallOut(HallBase):
    id: int

    class Config:
        from_attributes = True
