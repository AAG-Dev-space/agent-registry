"""Dependency injection for FastAPI endpoints."""

from backend.app.core.database import get_db

# Only export get_db dependency
__all__ = ["get_db"]
