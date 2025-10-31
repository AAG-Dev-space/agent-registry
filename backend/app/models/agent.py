"""Agent database model."""

from datetime import UTC, datetime

from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, DateTime, String, Text
from sqlalchemy.dialects.postgresql import JSONB

from .base import Base


def utc_now():
    """Return timezone-naive datetime in UTC."""
    return datetime.now(UTC).replace(tzinfo=None)


class AgentModel(Base):
    """Agent model for PostgreSQL storage."""

    __tablename__ = "agents"

    # Primary key
    name = Column(String(255), primary_key=True, index=True)

    # Agent card fields
    description = Column(Text, nullable=True)
    url = Column(String(512), nullable=False)
    version = Column(String(50), nullable=True)
    protocol_version = Column(String(50), nullable=True)
    preferred_transport = Column(String(50), nullable=True)

    # Store complete agent card as JSONB for flexibility
    agent_card = Column(JSONB, nullable=False)

    # Vector embedding for semantic search (384 dimensions for sentence-transformers)
    embedding = Column(Vector(384), nullable=True)

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
            "name": self.name,
            "description": self.description,
            "url": self.url,
            "version": self.version,
            "protocol_version": self.protocol_version,
            "preferred_transport": self.preferred_transport,
            "agent_card": self.agent_card,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
