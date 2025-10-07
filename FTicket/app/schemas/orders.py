from pydantic import BaseModel
from datetime import datetime


class OrderItemOut(BaseModel):
    id: int
    ticket_id: int
    price: float

    class Config:
        from_attributes = True


class OrderOut(BaseModel):
    id: int
    total: float
    status: str
    created_at: datetime
    items: list[OrderItemOut] = []

    class Config:
        from_attributes = True
