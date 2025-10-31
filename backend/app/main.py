"""FastAPI application main module."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import api_router
from app.core.config import get_settings
from app.core.database import close_db, init_db
from app.core.security import get_password_hash, role_config
from app.models.user import UserModel

logger = logging.getLogger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan (startup and shutdown)."""
    # Startup
    logger.info("Starting A2A Registry...")

    # Initialize database
    await init_db()
    logger.info("Database initialized")

    # Initialize default users
    await initialize_default_users()

    yield

    # Shutdown
    logger.info("Shutting down A2A Registry...")
    await close_db()
    logger.info("Database connections closed")


async def initialize_default_users():
    """Initialize default users from role config."""
    from app.core.database import async_session_maker
    from sqlalchemy import select

    async with async_session_maker() as session:
        for user_data in role_config.default_users:
            # Check if user already exists
            result = await session.execute(
                select(UserModel).where(UserModel.username == user_data["username"])
            )
            existing = result.scalar_one_or_none()

            if not existing:
                # Create default user
                hashed_password = get_password_hash(user_data["password"])
                new_user = UserModel(
                    username=user_data["username"],
                    email=user_data.get("email"),
                    hashed_password=hashed_password,
                    role=user_data.get("role", "user"),
                    disabled=False,
                )
                session.add(new_user)
                logger.info(f"Created default user: {user_data['username']}")

        await session.commit()


def create_app() -> FastAPI:
    """Create and configure FastAPI application."""
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.VERSION,
        description="Agent-to-Agent Registry Service with Health Monitoring",
        lifespan=lifespan,
    )

    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include API router
    app.include_router(api_router)

    # Health check endpoint (for Docker/Kubernetes)
    @app.get("/health")
    async def health_check():
        """Health check endpoint."""
        return {"status": "healthy"}

    return app


# Create app instance
app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
    )
