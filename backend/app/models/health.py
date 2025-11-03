"""Health status database model."""

from datetime import UTC, datetime

from sqlalchemy import Column, DateTime, Integer, String

from .base import Base


def utc_now():
    """Return timezone-naive datetime in UTC."""
    return datetime.now(UTC).replace(tzinfo=None)


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
    last_response_time_ms = Column(Integer, nullable=True)
    failure_count = Column(Integer, default=0, nullable=False)
    last_error = Column(String(512), nullable=True)

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
            "agent_name": self.agent_name,
            "status": self.status,
            "last_check_at": self.last_check_at.isoformat() if self.last_check_at else None,
            "last_response_time_ms": self.last_response_time_ms,
            "failure_count": self.failure_count,
            "last_error": self.last_error,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
