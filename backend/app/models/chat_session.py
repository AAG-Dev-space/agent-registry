"""Chat Session and Message models for Agent Workbench."""

from datetime import UTC, datetime

from sqlalchemy import Column, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from .base import Base


def utc_now():
    """Return timezone-naive datetime in UTC."""
    return datetime.now(UTC).replace(tzinfo=None)


class ChatSessionModel(Base):
    """Chat Session model for tracking agent conversations."""

    __tablename__ = "chat_sessions"

    # Primary key
    session_id = Column(String(36), primary_key=True)  # UUID

    # Foreign key to agents table
    agent_name = Column(
        String(255),
        ForeignKey("agents.name", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Context ID for conversation context (persistent across messages)
    context_id = Column(String(36), nullable=True)  # UUID for A2A conversation context tracking

    # Timestamps
    created_at = Column(DateTime, default=utc_now, nullable=False)
    last_message_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    messages = relationship(
        "ChatMessageModel",
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="ChatMessageModel.created_at"
    )
    agent = relationship("AgentModel", back_populates="chat_sessions")


class ChatMessageModel(Base):
    """Chat Message model for storing conversation history."""

    __tablename__ = "chat_messages"

    # Primary key
    message_id = Column(String(36), primary_key=True)  # UUID

    # Foreign key to chat_sessions table
    session_id = Column(
        String(36),
        ForeignKey("chat_sessions.session_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Message metadata
    role = Column(String(20), nullable=False)  # user, agent, system
    content = Column(JSONB, nullable=False)  # Message content as JSON (text, artifacts, etc.)

    # Timestamps
    created_at = Column(DateTime, default=utc_now, nullable=False)

    # Relationships
    session = relationship("ChatSessionModel", back_populates="messages")
