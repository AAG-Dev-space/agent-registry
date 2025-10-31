"""Extension database model."""

from datetime import UTC, datetime

from sqlalchemy import Boolean, Column, DateTime, String, Text
from sqlalchemy.dialects.postgresql import JSONB

from .base import Base


def utc_now():
    """Return timezone-naive datetime in UTC."""
    return datetime.now(UTC).replace(tzinfo=None)


class ExtensionModel(Base):
    """Extension model for PostgreSQL storage."""

    __tablename__ = "extensions"

    # Primary key
    uri = Column(String(512), primary_key=True, index=True)

    # Extension metadata
    description = Column(Text, nullable=True)
    required = Column(Boolean, default=False)
    params = Column(JSONB, nullable=True)

    # Provenance tracking
    first_declared_by_agent = Column(String(255), nullable=True)
    first_declared_at = Column(DateTime, nullable=False)
    trust_level = Column(String(50), default="TRUST_LEVEL_UNVERIFIED")

    # List of agent names using this extension (stored as JSONB array)
    declaring_agents = Column(JSONB, default=list, nullable=False)

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
            "uri": self.uri,
            "description": self.description,
            "required": self.required,
            "params": self.params,
            "first_declared_by_agent": self.first_declared_by_agent,
            "first_declared_at": self.first_declared_at.isoformat() if self.first_declared_at else None,
            "trust_level": self.trust_level,
            "declaring_agents": self.declaring_agents,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
