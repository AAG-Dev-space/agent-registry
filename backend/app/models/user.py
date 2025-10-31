"""User database model."""

from datetime import UTC, datetime

from sqlalchemy import Boolean, Column, DateTime, String

from .base import Base


def utc_now():
    """Return timezone-naive datetime in UTC."""
    return datetime.now(UTC).replace(tzinfo=None)


class UserModel(Base):
    """User model for authentication."""

    __tablename__ = "users"

    # Primary key
    username = Column(String(255), primary_key=True, index=True)

    # User fields
    email = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="user", nullable=False)
    disabled = Column(Boolean, default=False, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(
        DateTime,
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )

    def to_dict(self):
        """Convert model to dictionary."""
        return {
            "username": self.username,
            "email": self.email,
            "role": self.role,
            "disabled": self.disabled,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
