from pydantic import BaseModel


class TicketOut(BaseModel):
    id: int
    seat_id: int
    event_id: int
    price: float
    status: str

    class Config:
        from_attributes = True
