from fastapi import APIRouter, Depends, HTTPException, status, Request
from jose import jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from django.conf import settings

from app.db import models
from app.db.session import get_db
from app.schemas.auth import UserCreate, Token, UserOut
from app.services.auth_service import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])



@router.post("/register", response_model=UserOut)
async def register(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    """Qeydiyyat: email və şifrə ilə yeni istifadəçi yaradılır."""
    q = await db.execute(select(models.User).where(models.User.email == payload.email))
    existing = q.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = models.User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=models.UserRole.user  # default user
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user



@router.post("/login", response_model=Token)
async def login(form: UserCreate, db: AsyncSession = Depends(get_db)):
    """İstifadəçi login olur və JWT token alır."""
    q = await db.execute(select(models.User).where(models.User.email == form.email))
    user = q.scalar_one_or_none()

    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return {"access_token": token, "token_type": "bearer"}



async def get_current_user(request: Request, db: AsyncSession = Depends(get_db)):
    """Başqa router-lərdə istifadəçi identifikasiyası üçün."""
    auth = request.headers.get("Authorization")
    if not auth or not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing auth token")

    token = auth.split(" ", 1)[1].strip()
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = int(payload.get("sub"))
    q = await db.execute(select(models.User).where(models.User.id == user_id))
    user = q.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=401, detail="User not found")


    request.state.rate_limit_key = f"user:{user.id}"
    return user


async def get_current_admin(request: Request, db: AsyncSession = Depends(get_db)):

    user = await get_current_user(request, db)
    if user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Admins only")
    return user



@router.get("/me", response_model=UserOut)
async def me(current_user=Depends(get_current_user)):
    """Hal-hazırda login olan istifadəçini qaytarır."""
    return current_user
