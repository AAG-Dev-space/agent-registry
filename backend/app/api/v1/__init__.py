"""API v1 endpoints."""

from fastapi import APIRouter

from .agents import router as agents_router
from .health import router as health_router

# Create main API v1 router
api_router = APIRouter(prefix="/api/v1")

# Include all sub-routers
api_router.include_router(agents_router)
api_router.include_router(health_router)

__all__ = ["api_router"]
