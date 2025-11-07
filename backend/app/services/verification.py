"""Agent ownership verification utilities."""

import httpx
from typing import Tuple
import logging

logger = logging.getLogger(__name__)


async def fetch_agent_card(url: str) -> dict:
    """Fetch AgentCard from URL.

    Args:
        url: AgentCard URL

    Returns:
        Parsed AgentCard JSON

    Raises:
        httpx.HTTPError: If fetch fails
        ValueError: If JSON parsing fails
    """
    async with httpx.AsyncClient(
        timeout=10.0,
        trust_env=False, 
        proxy=None, 
    ) as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.json()


async def verify_delete_permission(agent_card_url: str) -> Tuple[bool, str]:
    """Verify if agent deletion is allowed.

    Args:
        agent_card_url: URL of the AgentCard to verify

    Returns:
        Tuple of (is_allowed, reason)
        - is_allowed: True if deletion is allowed
        - reason: Human-readable reason for decision
    """
    try:
        # 1. Fetch current AgentCard
        agent_card = await fetch_agent_card(agent_card_url)

        # 2. Check x-registry extension field
        registry_config = agent_card.get("x-registry", {})

        # 3. Check allowDelete flag
        allow_delete = registry_config.get("allowDelete", False)
        if not allow_delete:
            return False, "AgentCard does not allow deletion (x-registry.allowDelete is not true)"

        # All checks passed
        return True, "Deletion allowed"

    except httpx.HTTPError as e:
        logger.error(f"Failed to fetch AgentCard from {agent_card_url}: {e}")
        return False, f"Failed to fetch AgentCard: {str(e)}"
    except ValueError as e:
        logger.error(f"Invalid AgentCard JSON from {agent_card_url}: {e}")
        return False, f"Invalid AgentCard JSON: {str(e)}"
    except Exception as e:
        logger.error(f"Verification error for {agent_card_url}: {e}")
        return False, f"Verification error: {str(e)}"
