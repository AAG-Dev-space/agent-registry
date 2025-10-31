"""Extension business logic service."""

import logging
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.extension import ExtensionModel

logger = logging.getLogger(__name__)


def utc_now():
    """Return timezone-naive datetime in UTC."""
    return datetime.now(UTC).replace(tzinfo=None)


class ExtensionService:
    """Service for extension business logic."""

    def __init__(self, db: AsyncSession):
        """Initialize extension service with database session."""
        self.db = db

    async def store_extension(self, extension_info: dict, agent_name: str) -> dict:
        """Store extension information.

        Args:
            extension_info: Extension information dictionary
            agent_name: Name of agent declaring this extension

        Returns:
            Stored extension dictionary
        """
        uri = extension_info.get("uri")
        if not uri:
            raise ValueError("Extension URI is required")

        result = await self.db.execute(
            select(ExtensionModel).where(ExtensionModel.uri == uri)
        )
        existing = result.scalar_one_or_none()

        if existing:
            # Update existing extension
            existing.description = extension_info.get("description")
            existing.required = extension_info.get("required", False)
            existing.params = extension_info.get("params")
            existing.trust_level = extension_info.get("trust_level", "TRUST_LEVEL_UNVERIFIED")

            # Add agent to declaring agents list if not already there
            if agent_name not in existing.declaring_agents:
                existing.declaring_agents.append(agent_name)

            existing.updated_at = utc_now()

            await self.db.commit()
            await self.db.refresh(existing)

            return existing.to_dict()

        else:
            # Create new extension
            ext_model = ExtensionModel(
                uri=uri,
                description=extension_info.get("description"),
                required=extension_info.get("required", False),
                params=extension_info.get("params"),
                first_declared_by_agent=agent_name,
                first_declared_at=utc_now(),
                trust_level=extension_info.get("trust_level", "TRUST_LEVEL_UNVERIFIED"),
                declaring_agents=[agent_name],
            )
            self.db.add(ext_model)

            await self.db.commit()
            await self.db.refresh(ext_model)

            logger.info(f"Stored new extension: {uri}")
            return ext_model.to_dict()

    async def get_extension(self, uri: str) -> dict | None:
        """Get extension by URI.

        Args:
            uri: Extension URI

        Returns:
            Extension dictionary or None if not found
        """
        result = await self.db.execute(
            select(ExtensionModel).where(ExtensionModel.uri == uri)
        )
        extension = result.scalar_one_or_none()

        if extension:
            return extension.to_dict()
        return None

    async def list_extensions(self) -> list[dict]:
        """List all extensions.

        Returns:
            List of extension dictionaries
        """
        result = await self.db.execute(select(ExtensionModel))
        extensions = result.scalars().all()

        return [ext.to_dict() for ext in extensions]
