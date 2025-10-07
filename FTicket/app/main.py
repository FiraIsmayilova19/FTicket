import asyncio
from fastapi import FastAPI
from app.api.routers import auth as auth_router
from app.api.routers import events as events_router
from app.api.routers import seats as seats_router
from app.api.routers import orders as orders_router
from app.db.session import engine
from app.db import models
from fastapi.middleware.cors import CORSMiddleware

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from starlette.requests import Request

app = FastAPI(title="EventWave API")
from app.api.routers import auth, seats, events, admin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth.router)
app.include_router(seats.router)
app.include_router(events.router)
app.include_router(admin.router)


# include routers
app.include_router(auth_router.router)
app.include_router(events_router.router)
app.include_router(seats_router.router)
app.include_router(orders_router.router)

# slowapi limiter global init
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(429, _rate_limit_exceeded_handler)

@app.on_event("startup")
async def startup():
    # ensure DB models exist in dev (use Alembic for production)
    async with engine.begin() as conn:
        await conn.run_sync(models.Base.metadata.create_all)

@app.get("/")
async def root():
    return {"message": "EventWave backend is up"}
