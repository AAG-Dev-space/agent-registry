"""Pytest configuration and fixtures."""

import asyncio
from typing import AsyncGenerator, Generator

import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.core.config import Settings, get_settings
from backend.app.core.database import get_db
from backend.app.core.security import get_password_hash
from backend.app.main import create_app
from backend.app.models.base import Base
from backend.app.models.user import UserModel


# Test database URL (in-memory SQLite)
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
async def test_engine():
    """Create test database engine."""
    # For SQLite testing, we need to monkey-patch JSONB and Vector types
    import sqlalchemy
    from sqlalchemy import JSON, String
    from sqlalchemy.dialects import postgresql

    # Save original types
    original_jsonb = postgresql.JSONB
    original_vector = getattr(postgresql, 'Vector', None)

    # Replace with SQLite-compatible types
    postgresql.JSONB = JSON
    if original_vector:
        # Replace Vector with String for testing
        class FakeVector(String):
            def __init__(self, *args, **kwargs):
                super().__init__(length=1000)
        postgresql.Vector = FakeVector

    # Clear the metadata to force recreation with new types
    Base.metadata.clear()

    # Reimport models to pick up the patched types
    from importlib import reload
    from backend.app.models import agent, extension, health, user
    reload(agent)
    reload(extension)
    reload(health)
    reload(user)

    engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    # Drop tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()

    # Restore original types
    postgresql.JSONB = original_jsonb
    if original_vector:
        postgresql.Vector = original_vector


@pytest.fixture(scope="function")
async def test_db(test_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create test database session."""
    async_session_maker = sessionmaker(
        test_engine, class_=AsyncSession, expire_on_commit=False
    )

    async with async_session_maker() as session:
        yield session


@pytest.fixture(scope="function")
def test_settings() -> Settings:
    """Create test settings."""
    settings = Settings()
    settings.DATABASE_URL = TEST_DATABASE_URL
    settings.SECRET_KEY = "test-secret-key-for-testing-only"
    settings.ACCESS_TOKEN_EXPIRE_MINUTES = 30
    return settings


@pytest.fixture(scope="function")
def app(test_db: AsyncSession, test_settings: Settings):
    """Create test FastAPI application."""
    from contextlib import asynccontextmanager

    # Create a minimal lifespan that does nothing
    @asynccontextmanager
    async def test_lifespan(app):
        # No startup/shutdown for tests
        yield

    # Create app without lifespan
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from backend.app.api.v1 import api_router

    test_app = FastAPI(
        title="A2A Registry Test",
        version="test",
        lifespan=test_lifespan,
    )

    # Add CORS
    test_app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include router
    test_app.include_router(api_router)

    # Add health endpoint
    @test_app.get("/health")
    async def health_check():
        return {"status": "healthy"}

    # Override dependencies
    def get_test_settings():
        return test_settings

    async def get_test_db():
        yield test_db

    test_app.dependency_overrides[get_settings] = get_test_settings
    test_app.dependency_overrides[get_db] = get_test_db

    return test_app


@pytest.fixture(scope="function")
def client(app) -> Generator:
    """Create test client."""
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="function")
async def async_client(app) -> AsyncGenerator:
    """Create async test client."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac


@pytest.fixture(scope="function")
async def test_user(test_db: AsyncSession) -> UserModel:
    """Create test user."""
    user = UserModel(
        username="testuser",
        email="test@example.com",
        hashed_password=get_password_hash("testpass123"),
        role="user",
        disabled=False,
    )
    test_db.add(user)
    await test_db.commit()
    await test_db.refresh(user)
    return user


@pytest.fixture(scope="function")
async def test_admin(test_db: AsyncSession) -> UserModel:
    """Create test admin user."""
    admin = UserModel(
        username="admin",
        email="admin@example.com",
        hashed_password=get_password_hash("admin123"),
        role="admin",
        disabled=False,
    )
    test_db.add(admin)
    await test_db.commit()
    await test_db.refresh(admin)
    return admin


@pytest.fixture(scope="function")
def user_token(client, test_user: UserModel) -> str:
    """Get authentication token for test user."""
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "testuser", "password": "testpass123"},
    )
    return response.json()["access_token"]


@pytest.fixture(scope="function")
def admin_token(client, test_admin: UserModel) -> str:
    """Get authentication token for admin user."""
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "admin", "password": "admin123"},
    )
    return response.json()["access_token"]


@pytest.fixture
def sample_agent_card() -> dict:
    """Create sample agent card for testing."""
    return {
        "name": "test-agent",
        "url": "http://localhost:8080",
        "description": "Test agent for unit testing",
        "version": "1.0.0",
        "capabilities": ["chat", "search"],
        "metadata": {
            "author": "Test Author",
            "tags": ["test", "example"],
        },
    }
