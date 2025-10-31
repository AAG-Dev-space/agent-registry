"""Authentication API endpoints."""

import logging
from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.deps import get_current_active_user, get_db
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.user import UserModel
from app.schemas.auth import LoginRequest, RegisterRequest, Token, UserResponse

logger = logging.getLogger(__name__)
settings = get_settings()

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=Token)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Login with username and password.

    Returns JWT access token.
    """
    # Get user from database
    result = await db.execute(
        select(UserModel).where(UserModel.username == form_data.username)
    )
    user = result.scalar_one_or_none()

    # Verify credentials
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )

    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role},
        expires_delta=access_token_expires
    )

    logger.info(f"User logged in: {user.username}")

    return Token(access_token=access_token, token_type="bearer")


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    register_data: RegisterRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Register a new user account.

    Public endpoint - creates a user with 'user' role.
    """
    # Check if user already exists
    result = await db.execute(
        select(UserModel).where(UserModel.username == register_data.username)
    )
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    # Create new user
    hashed_password = get_password_hash(register_data.password)
    new_user = UserModel(
        username=register_data.username,
        email=register_data.email,
        hashed_password=hashed_password,
        role="user",  # Default role
        disabled=False,
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    logger.info(f"New user registered: {new_user.username}")

    return UserResponse(**new_user.to_dict())


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: Annotated[UserModel, Depends(get_current_active_user)],
):
    """Get current authenticated user information."""
    return UserResponse(**current_user.to_dict())
