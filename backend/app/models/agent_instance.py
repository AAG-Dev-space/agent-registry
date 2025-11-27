"""Agent Instance database model for running Docker containers."""

from datetime import UTC, datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from .base import Base


def utc_now():
    """Return timezone-naive datetime in UTC."""
    return datetime.now(UTC).replace(tzinfo=None)


class AgentInstanceModel(Base):
    """Agent Instance model for tracking running Docker containers."""

    __tablename__ = "agent_instances"

    # Primary key
    id = Column(String(36), primary_key=True)  # UUID

    # Foreign key to agents table
    agent_name = Column(
        String(255),
        ForeignKey("agents.name", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Docker information
    docker_image = Column(String(512), nullable=False)  # e.g., localhost:5000/personalized-shopping:v1.4.1
    container_id = Column(String(64), nullable=True)  # Docker container ID (64 chars for full ID)
    container_name = Column(String(255), unique=True, nullable=False)  # e.g., agent-shopping-550e

    # Network information
    port = Column(Integer, nullable=False)  # Assigned host port
    internal_port = Column(Integer, default=8000, nullable=False)  # Container internal port

    # Status: starting, running, stopped, error
    status = Column(String(20), nullable=False, default="starting", index=True)

    # Environment variables (stored as JSONB)
    env_vars = Column(JSONB, default=dict, nullable=False)

    # LiteLLM configuration (optional, extracted from env_vars for convenience)
    llm_model = Column(String(255), nullable=True)  # e.g., gemini/gemini-2.5-flash
    llm_api_base = Column(String(512), nullable=True)  # e.g., http://host.docker.internal:4444
    llm_api_key = Column(String(255), nullable=True)  # API key (should be encrypted in production)

    # Timestamps
    created_at = Column(DateTime, default=utc_now, nullable=False)
    started_at = Column(DateTime, nullable=True)  # When container actually started
    stopped_at = Column(DateTime, nullable=True)  # When container was stopped

    # Relationship to AgentModel
    agent = relationship("AgentModel", back_populates="instances")

    def to_dict(self):
        """Convert model to dictionary."""
        return {
            "instance_id": self.id,
            "agent_name": self.agent_name,
            "docker_image": self.docker_image,
            "container_id": self.container_id,
            "container_name": self.container_name,
            "port": self.port,
            "internal_port": self.internal_port,
            "status": self.status,
            "env_vars": self.env_vars,
            "llm_model": self.llm_model,
            "llm_api_base": self.llm_api_base,
            "llm_api_key": "***" if self.llm_api_key else None,  # Mask API key
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "stopped_at": self.stopped_at.isoformat() if self.stopped_at else None,
        }

    def __repr__(self):
        """String representation."""
        return f"<AgentInstance(id={self.id}, agent={self.agent_name}, status={self.status}, port={self.port})>"
