"""Authentication API schemas."""

from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    """JWT token response."""

    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Data extracted from JWT token."""

    username: str | None = None
    role: str | None = None


class LoginRequest(BaseModel):
    """Login request schema."""

    username: str
    password: str


class RegisterRequest(BaseModel):
    """User registration request schema."""

    username: str
    password: str
    email: EmailStr | None = None


class UserResponse(BaseModel):
    """User response schema."""

    username: str
    email: str | None = None
    role: str
    disabled: bool = False
