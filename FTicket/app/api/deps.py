from fastapi import Depends, HTTPException, status, Request
from jose import jwt, JWTError
from app.core.config import settings
from app.db.session import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import models

async def get_db_session() -> AsyncSession:
    async for s in get_db():
        yield s

def get_current_user(token: str = Depends(lambda: None), request: Request = None):
    # we'll implement a FastAPI dependency that extracts token from header
    # but to avoid circular import we'll implement in router directly
    raise NotImplementedError("Use the provided dependency in routers (see auth router)")
