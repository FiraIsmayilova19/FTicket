from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Float, JSON, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.session import Base

class RoleEnum(str, enum.Enum):
    admin = "admin"
    user = "user"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.user, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Venue(Base):
    __tablename__ = "venues"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    city = Column(String, nullable=False)

class Hall(Base):
    __tablename__ = "halls"
    id = Column(Integer, primary_key=True)
    venue_id = Column(Integer, ForeignKey("venues.id"), nullable=False)
    name = Column(String, nullable=False)
    seat_map_json = Column(JSON, nullable=True)
    venue = relationship("Venue", backref="halls")

class EventStatus(str, enum.Enum):
    draft = "draft"
    published = "published"

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True)
    hall_id = Column(Integer, ForeignKey("halls.id"), nullable=False)
    title = Column(String, nullable=False)
    date_time = Column(DateTime(timezone=True), nullable=False)
    poster_url = Column(String, nullable=True)
    status = Column(Enum(EventStatus), default=EventStatus.draft, nullable=False)
    hall = relationship("Hall", backref="events")

class Seat(Base):
    __tablename__ = "seats"
    id = Column(Integer, primary_key=True)
    hall_id = Column(Integer, ForeignKey("halls.id"), nullable=False)
    sector = Column(String, nullable=True)
    row = Column(String, nullable=True)
    col = Column(String, nullable=True)
    x = Column(Float, nullable=True)
    y = Column(Float, nullable=True)
    hall = relationship("Hall", backref="seats")

class Ticket(Base):
    __tablename__ = "tickets"
    id = Column(Integer, primary_key=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    seat_id = Column(Integer, ForeignKey("seats.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    price = Column(Float, nullable=False, default=0.0)
    status = Column(String, nullable=False, default="available")  # available/reserved/sold
    qr_code_url = Column(String, nullable=True)

    event = relationship("Event")
    seat = relationship("Seat")
    user = relationship("User")

    __table_args__ = (UniqueConstraint("event_id", "seat_id", name="uq_event_seat"),)

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    total = Column(Float, nullable=False)
    status = Column(String, nullable=False, default="pending")  # pending/paid/canceled
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User")

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False)
    price = Column(Float, nullable=False)
    order = relationship("Order", backref="items")
    ticket = relationship("Ticket")
