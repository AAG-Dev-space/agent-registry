"""CopilotKit Remote Endpoint for A2A Agent Workbench.

This module creates a CopilotKit-compatible endpoint that wraps our A2A agents.
The frontend CopilotKit component can connect directly to this endpoint.
"""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from copilotkit import CopilotKitSDK
from copilotkit.integrations.fastapi import add_fastapi_endpoint as copilotkit_add_endpoint

from backend.app.core.deps import get_db

logger = logging.getLogger(__name__)

router = APIRouter(tags=["copilotkit"])


# Global SDK instance (will be initialized in setup function)
_sdk: CopilotKitSDK | None = None


def get_copilotkit_sdk() -> CopilotKitSDK:
    """Get the CopilotKit SDK instance."""
    if _sdk is None:
        raise RuntimeError("CopilotKit SDK not initialized")
    return _sdk


def setup_copilotkit_endpoint(app, db_dependency=Depends(get_db)):
    """
    Set up CopilotKit endpoint on the FastAPI app.

    This function should be called from main.py after the app is created.

    Args:
        app: FastAPI application instance
        db_dependency: Database session dependency
    """
    global _sdk

    # For now, create a simple SDK with no actions
    # We'll add A2A agent wrapper later
    _sdk = CopilotKitSDK(
        actions=[],
        agents=[],
    )

    # Add CopilotKit endpoint to the app
    # This creates a POST endpoint at /copilotkit that handles all CopilotKit requests
    copilotkit_add_endpoint(app, _sdk, "/copilotkit")

    logger.info("CopilotKit endpoint added at /copilotkit")
