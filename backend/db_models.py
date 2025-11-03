"""SQLAlchemy models for PostgreSQL storage."""

from datetime import UTC, datetime
from typing import Optional

from pgvector.sqlalchemy import Vector
from sqlalchemy import JSON, Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


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


class HealthStatusModel(Base):
    """Health status model for agent monitoring."""

    __tablename__ = "health_status"

    # Primary key (agent name)
    agent_name = Column(
        String(255), primary_key=True, index=True
    )  # Foreign key to agents.name

    # Health status fields
    status = Column(
        String(50), default="active", nullable=False
    )  # active/inactive/deprecated
    last_check_at = Column(DateTime, nullable=True)
    failure_count = Column(Integer, default=0, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(
        DateTime,
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )


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
