"""API v1 endpoints."""

from fastapi import APIRouter

from .agents import router as agents_router
from .agent_loader import router as agent_loader_router

# Create main API v1 router
api_router = APIRouter(prefix="/api/v1")

# Include all sub-routers
api_router.include_router(agents_router)
api_router.include_router(agent_loader_router)

__all__ = ["api_router"]
