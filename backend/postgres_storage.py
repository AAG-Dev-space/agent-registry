"""PostgreSQL storage backend with pgvector support."""

import logging
from datetime import UTC, datetime
from typing import Optional

from fasta2a.schema import AgentCard  # type: ignore
from sqlalchemy import delete, select, text, update
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from .config import config
from .db_models import (
    AgentModel,
    Base,
    ExtensionModel,
    HealthStatusModel,
    UserModel,
)
from .storage import ExtensionInfo, StorageBackend

logger = logging.getLogger(__name__)


def utc_now():
    """Return timezone-naive datetime in UTC."""
    return utc_now().replace(tzinfo=None)


class PostgreSQLStorage(StorageBackend):
    """PostgreSQL storage backend with pgvector for semantic search."""

    def __init__(self, database_url: str):
        """Initialize PostgreSQL storage.

        Args:
            database_url: PostgreSQL connection URL (e.g., postgresql+asyncpg://user:pass@host/db)
        """
        self.database_url = database_url
        self.engine = create_async_engine(
            database_url,
            echo=False,  # Set to True for SQL debugging
            pool_pre_ping=True,  # Verify connections before using
            pool_size=10,
            max_overflow=20,
        )
        self.async_session = sessionmaker(
            self.engine, class_=AsyncSession, expire_on_commit=False
        )

    async def initialize(self) -> None:
        """Initialize database tables and pgvector extension."""
        async with self.engine.begin() as conn:
            # Enable pgvector extension
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
            # Create all tables
            await conn.run_sync(Base.metadata.create_all)
        logger.info("PostgreSQL database initialized with pgvector extension")

    async def close(self) -> None:
        """Close database connections."""
        await self.engine.dispose()
        logger.info("PostgreSQL connections closed")

    # Agent CRUD operations
    async def register_agent(self, agent_card: AgentCard) -> bool:
        """Register an agent in the registry."""
        agent_id = agent_card.get("name")
        if not agent_id:
            return False

        async with self.async_session() as session:
            try:
                # Check if agent already exists
                result = await session.execute(
                    select(AgentModel).where(AgentModel.name == agent_id)
                )
                existing = result.scalar_one_or_none()

                if existing:
                    # Update existing agent
                    existing.description = agent_card.get("description")
                    existing.url = agent_card.get("url")
                    existing.version = agent_card.get("version")
                    existing.protocol_version = agent_card.get("protocol_version")
                    existing.preferred_transport = agent_card.get("preferred_transport")
                    existing.agent_card = agent_card
                    existing.updated_at = utc_now()
                else:
                    # Create new agent
                    agent_model = AgentModel(
                        name=agent_id,
                        description=agent_card.get("description"),
                        url=agent_card.get("url"),
                        version=agent_card.get("version"),
                        protocol_version=agent_card.get("protocol_version"),
                        preferred_transport=agent_card.get("preferred_transport"),
                        agent_card=agent_card,
                    )
                    session.add(agent_model)

                    # Initialize health status
                    health_status = HealthStatusModel(
                        agent_name=agent_id,
                        status="active",
                        last_check_at=utc_now(),
                        failure_count=0,
                    )
                    session.add(health_status)

                await session.commit()
                logger.info(f"Registered agent: {agent_id}")
                return True
            except Exception as e:
                await session.rollback()
                logger.error(f"Failed to register agent {agent_id}: {e}")
                return False

    async def get_agent(self, agent_id: str) -> AgentCard | None:
        """Get an agent by ID."""
        async with self.async_session() as session:
            result = await session.execute(
                select(AgentModel).where(AgentModel.name == agent_id)
            )
            agent_model = result.scalar_one_or_none()
            if agent_model:
                return agent_model.agent_card
            return None

    async def list_agents(self) -> list[AgentCard]:
        """List all registered agents."""
        async with self.async_session() as session:
            result = await session.execute(select(AgentModel))
            agents = result.scalars().all()
            return [agent.agent_card for agent in agents]

    async def unregister_agent(self, agent_id: str) -> bool:
        """Unregister an agent."""
        async with self.async_session() as session:
            try:
                # Remove agent from extensions
                await self.remove_agent_from_extensions(agent_id)

                # Delete health status
                await session.execute(
                    delete(HealthStatusModel).where(
                        HealthStatusModel.agent_name == agent_id
                    )
                )

                # Delete agent
                result = await session.execute(
                    delete(AgentModel).where(AgentModel.name == agent_id)
                )

                await session.commit()
                if result.rowcount > 0:
                    logger.info(f"Unregistered agent: {agent_id}")
                    return True
                return False
            except Exception as e:
                await session.rollback()
                logger.error(f"Failed to unregister agent {agent_id}: {e}")
                return False

    async def search_agents(self, query: str) -> list[AgentCard]:
        """Search agents by name, description, or capabilities."""
        async with self.async_session() as session:
            query_lower = f"%{query.lower()}%"

            # Search using PostgreSQL full-text capabilities
            # Search in name, description, and within JSONB skills
            stmt = select(AgentModel).where(
                (AgentModel.name.ilike(query_lower))
                | (AgentModel.description.ilike(query_lower))
                | (
                    AgentModel.agent_card["skills"]
                    .astext.ilike(query_lower)  # Search in skills JSON
                )
            )

            result = await session.execute(stmt)
            agents = result.scalars().all()
            return [agent.agent_card for agent in agents]

    # Health monitoring methods
    async def update_agent_health_status(
        self, agent_id: str, status: str, last_check_at: datetime | None = None
    ) -> bool:
        """Update agent health status."""
        async with self.async_session() as session:
            try:
                result = await session.execute(
                    select(HealthStatusModel).where(
                        HealthStatusModel.agent_name == agent_id
                    )
                )
                health_status = result.scalar_one_or_none()

                if health_status:
                    health_status.status = status
                    health_status.last_check_at = last_check_at or utc_now()
                    health_status.updated_at = utc_now()
                else:
                    health_status = HealthStatusModel(
                        agent_name=agent_id,
                        status=status,
                        last_check_at=last_check_at or utc_now(),
                        failure_count=0,
                    )
                    session.add(health_status)

                await session.commit()
                logger.info(f"Updated health status for {agent_id}: {status}")
                return True
            except Exception as e:
                await session.rollback()
                logger.error(f"Failed to update health status for {agent_id}: {e}")
                return False

    async def get_agent_health_status(self, agent_id: str) -> dict | None:
        """Get agent health status information."""
        async with self.async_session() as session:
            result = await session.execute(
                select(HealthStatusModel).where(
                    HealthStatusModel.agent_name == agent_id
                )
            )
            health_status = result.scalar_one_or_none()
            if health_status:
                return {
                    "status": health_status.status,
                    "last_check_at": health_status.last_check_at,
                    "failure_count": health_status.failure_count,
                }
            return None

    async def get_agents_for_health_check(self) -> list[tuple[str, dict]]:
        """Get list of agents that need health checking."""
        async with self.async_session() as session:
            result = await session.execute(select(AgentModel))
            agents = result.scalars().all()

            health_check_agents = []
            for agent in agents:
                agent_card = agent.agent_card
                health_check_config = agent_card.get("health_check", {})
                if isinstance(health_check_config, dict) and health_check_config.get(
                    "url"
                ):
                    health_check_agents.append((agent.name, health_check_config))

            return health_check_agents

    # Extension-related methods
    async def store_extension(self, extension_info: ExtensionInfo) -> bool:
        """Store extension information."""
        async with self.async_session() as session:
            try:
                result = await session.execute(
                    select(ExtensionModel).where(
                        ExtensionModel.uri == extension_info.uri
                    )
                )
                existing = result.scalar_one_or_none()

                if existing:
                    existing.description = extension_info.description
                    existing.required = extension_info.required
                    existing.params = extension_info.params
                    existing.trust_level = extension_info.trust_level
                    existing.declaring_agents = list(extension_info.declaring_agents)
                    existing.updated_at = utc_now()
                else:
                    ext_model = ExtensionModel(
                        uri=extension_info.uri,
                        description=extension_info.description,
                        required=extension_info.required,
                        params=extension_info.params,
                        first_declared_by_agent=extension_info.first_declared_by_agent,
                        first_declared_at=extension_info.first_declared_at,
                        trust_level=extension_info.trust_level,
                        declaring_agents=list(extension_info.declaring_agents),
                    )
                    session.add(ext_model)

                await session.commit()
                logger.info(f"Stored extension: {extension_info.uri}")
                return True
            except Exception as e:
                await session.rollback()
                logger.error(f"Failed to store extension {extension_info.uri}: {e}")
                return False

    async def get_extension(self, uri: str) -> ExtensionInfo | None:
        """Get extension information by URI."""
        async with self.async_session() as session:
            result = await session.execute(
                select(ExtensionModel).where(ExtensionModel.uri == uri)
            )
            ext_model = result.scalar_one_or_none()
            if ext_model:
                ext_info = ExtensionInfo(
                    uri=ext_model.uri,
                    description=ext_model.description or "",
                    required=ext_model.required,
                    params=ext_model.params or {},
                    first_declared_by_agent=ext_model.first_declared_by_agent or "",
                    first_declared_at=ext_model.first_declared_at,
                    trust_level=ext_model.trust_level,
                )
                ext_info.declaring_agents = set(ext_model.declaring_agents or [])
                return ext_info
            return None

    async def list_extensions(
        self,
        uri_pattern: str | None = None,
        declaring_agents: list[str] | None = None,
        trust_levels: list[str] | None = None,
        page_size: int = 100,
        page_token: str | None = None,
    ) -> tuple[list[ExtensionInfo], str | None, int]:
        """List extensions with optional filtering and pagination."""
        async with self.async_session() as session:
            stmt = select(ExtensionModel)

            # Apply filters
            if uri_pattern:
                stmt = stmt.where(ExtensionModel.uri.ilike(f"%{uri_pattern}%"))

            if trust_levels:
                stmt = stmt.where(ExtensionModel.trust_level.in_(trust_levels))

            # Get total count
            count_result = await session.execute(
                select(text("COUNT(*)")).select_from(stmt.subquery())
            )
            total_count = count_result.scalar() or 0

            # Apply pagination
            offset = 0
            if page_token:
                try:
                    offset = int(page_token)
                except ValueError:
                    offset = 0

            stmt = stmt.limit(page_size).offset(offset)
            result = await session.execute(stmt)
            ext_models = result.scalars().all()

            # Convert to ExtensionInfo
            extensions = []
            for ext_model in ext_models:
                ext_info = ExtensionInfo(
                    uri=ext_model.uri,
                    description=ext_model.description or "",
                    required=ext_model.required,
                    params=ext_model.params or {},
                    first_declared_by_agent=ext_model.first_declared_by_agent or "",
                    first_declared_at=ext_model.first_declared_at,
                    trust_level=ext_model.trust_level,
                )
                ext_info.declaring_agents = set(ext_model.declaring_agents or [])

                # Filter by declaring_agents if needed
                if declaring_agents:
                    if any(agent in ext_info.declaring_agents for agent in declaring_agents):
                        extensions.append(ext_info)
                else:
                    extensions.append(ext_info)

            # Calculate next page token
            next_page_token = None
            if offset + page_size < total_count:
                next_page_token = str(offset + page_size)

            return extensions, next_page_token, total_count

    async def get_agent_extensions(self, agent_id: str) -> list[ExtensionInfo]:
        """Get all extensions used by a specific agent."""
        async with self.async_session() as session:
            # Query extensions where declaring_agents JSONB array contains agent_id
            stmt = select(ExtensionModel).where(
                ExtensionModel.declaring_agents.contains([agent_id])
            )
            result = await session.execute(stmt)
            ext_models = result.scalars().all()

            extensions = []
            for ext_model in ext_models:
                ext_info = ExtensionInfo(
                    uri=ext_model.uri,
                    description=ext_model.description or "",
                    required=ext_model.required,
                    params=ext_model.params or {},
                    first_declared_by_agent=ext_model.first_declared_by_agent or "",
                    first_declared_at=ext_model.first_declared_at,
                    trust_level=ext_model.trust_level,
                )
                ext_info.declaring_agents = set(ext_model.declaring_agents or [])
                extensions.append(ext_info)

            return extensions

    async def update_agent_extensions(
        self, agent_id: str, extensions: list[dict]
    ) -> bool:
        """Update extensions for an agent."""
        try:
            # Remove agent from all current extensions
            await self.remove_agent_from_extensions(agent_id)

            # Add agent to new extensions
            for ext_data in extensions:
                uri = ext_data.get("uri", "")
                if not uri:
                    continue

                # Check if extension is allowed
                if not config.is_extension_allowed(uri):
                    logger.warning(f"Extension {uri} not allowed in current mode")
                    continue

                existing_ext = await self.get_extension(uri)
                if existing_ext:
                    existing_ext.add_declaring_agent(agent_id)
                    await self.store_extension(existing_ext)
                else:
                    # Create new extension info
                    ext_info = ExtensionInfo(
                        uri=uri,
                        description=ext_data.get("description", ""),
                        required=ext_data.get("required", False),
                        params=ext_data.get("params", {}),
                        first_declared_by_agent=agent_id,
                        trust_level=config.get_default_trust_level(),
                    )
                    await self.store_extension(ext_info)

            return True
        except Exception as e:
            logger.error(f"Failed to update extensions for {agent_id}: {e}")
            return False

    async def remove_agent_from_extensions(self, agent_id: str) -> bool:
        """Remove agent from all extension declarations."""
        async with self.async_session() as session:
            try:
                # Get all extensions that include this agent
                stmt = select(ExtensionModel).where(
                    ExtensionModel.declaring_agents.contains([agent_id])
                )
                result = await session.execute(stmt)
                ext_models = result.scalars().all()

                for ext_model in ext_models:
                    declaring_agents = set(ext_model.declaring_agents or [])
                    declaring_agents.discard(agent_id)

                    if len(declaring_agents) == 0:
                        # Remove extension if no agents using it
                        await session.delete(ext_model)
                        logger.info(f"Removed unused extension: {ext_model.uri}")
                    else:
                        # Update declaring_agents list
                        ext_model.declaring_agents = list(declaring_agents)
                        ext_model.updated_at = utc_now()

                await session.commit()
                return True
            except Exception as e:
                await session.rollback()
                logger.error(f"Failed to remove agent from extensions: {e}")
                return False

    # User management methods
    async def get_user(self, username: str) -> dict | None:
        """Get user by username."""
        async with self.async_session() as session:
            result = await session.execute(
                select(UserModel).where(UserModel.username == username)
            )
            user_model = result.scalar_one_or_none()
            if user_model:
                return {
                    "username": user_model.username,
                    "email": user_model.email,
                    "hashed_password": user_model.hashed_password,
                    "role": user_model.role,
                    "disabled": user_model.disabled,
                }
            return None

    async def create_user(
        self, username: str, email: str, hashed_password: str, role: str = "user"
    ) -> dict:
        """Create a new user."""
        async with self.async_session() as session:
            try:
                # Check if user exists
                result = await session.execute(
                    select(UserModel).where(UserModel.username == username)
                )
                existing = result.scalar_one_or_none()
                if existing:
                    raise ValueError(f"User {username} already exists")

                user_model = UserModel(
                    username=username,
                    email=email,
                    hashed_password=hashed_password,
                    role=role,
                    disabled=False,
                )
                session.add(user_model)
                await session.commit()

                logger.info(f"Created new user: {username}")
                return {
                    "username": username,
                    "email": email,
                    "hashed_password": hashed_password,
                    "role": role,
                    "disabled": False,
                }
            except Exception as e:
                await session.rollback()
                logger.error(f"Failed to create user {username}: {e}")
                raise

    async def initialize_default_users(self) -> None:
        """Initialize default users from config."""
        try:
            from .auth import get_password_hash, role_config

            for user_data in role_config.default_users:
                username = user_data["username"]
                # Check if user already exists
                existing = await self.get_user(username)
                if not existing:
                    password = user_data["password"]
                    await self.create_user(
                        username=username,
                        email=user_data.get("email", ""),
                        hashed_password=get_password_hash(password),
                        role=user_data.get("role", "user"),
                    )
                    logger.info(f"Initialized default user: {username}")
        except Exception as e:
            logger.warning(f"Failed to initialize default users: {e}")
