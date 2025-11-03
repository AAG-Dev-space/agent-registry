"""API tests for agent endpoints."""

import pytest
from fastapi import status


class TestAgentList:
    """Test agent listing endpoint."""

    @pytest.mark.asyncio
    async def test_list_agents_empty(self, client):
        """Test listing agents when none exist."""
        response = client.get("/api/v1/agents")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["agents"] == []
        assert data["count"] == 0

    @pytest.mark.asyncio
    async def test_list_agents_with_data(self, client, test_user, user_token, sample_agent_card):
        """Test listing agents with existing agents."""
        # First register an agent
        client.post(
            "/api/v1/agents",
            json=sample_agent_card,
            headers={"Authorization": f"Bearer {user_token}"},
        )

        # Then list agents
        response = client.get("/api/v1/agents")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["agents"]) == 1
        assert data["count"] == 1
        assert data["agents"][0]["name"] == "test-agent"


class TestAgentRegister:
    """Test agent registration endpoint."""

    @pytest.mark.asyncio
    async def test_register_agent_success(self, client, test_user, user_token, sample_agent_card):
        """Test successful agent registration."""
        response = client.post(
            "/api/v1/agents",
            json=sample_agent_card,
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["name"] == "test-agent"
        assert data["agent_card"]["url"] == "http://localhost:8080"
        assert data["agent_card"]["description"] == "Test agent for unit testing"

    @pytest.mark.asyncio
    async def test_register_agent_unauthorized(self, client, sample_agent_card):
        """Test agent registration without authentication."""
        response = client.post(
            "/api/v1/agents",
            json=sample_agent_card,
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.asyncio
    async def test_register_agent_duplicate(self, client, test_user, user_token, sample_agent_card):
        """Test registering duplicate agent."""
        # Register first time
        client.post(
            "/api/v1/agents",
            json=sample_agent_card,
            headers={"Authorization": f"Bearer {user_token}"},
        )

        # Try to register again
        response = client.post(
            "/api/v1/agents",
            json=sample_agent_card,
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @pytest.mark.asyncio
    async def test_register_agent_invalid_data(self, client, test_user, user_token):
        """Test agent registration with invalid data."""
        invalid_card = {"name": "test"}  # Missing required fields

        response = client.post(
            "/api/v1/agents",
            json=invalid_card,
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestAgentGet:
    """Test getting single agent endpoint."""

    @pytest.mark.asyncio
    async def test_get_agent_success(self, client, test_user, user_token, sample_agent_card):
        """Test getting agent by name."""
        # Register agent first
        client.post(
            "/api/v1/agents",
            json=sample_agent_card,
            headers={"Authorization": f"Bearer {user_token}"},
        )

        # Get agent
        response = client.get("/api/v1/agents/test-agent")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == "test-agent"
        assert data["agent_card"]["url"] == "http://localhost:8080"

    @pytest.mark.asyncio
    async def test_get_agent_not_found(self, client):
        """Test getting non-existent agent."""
        response = client.get("/api/v1/agents/nonexistent")

        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestAgentUpdate:
    """Test agent update endpoint."""

    @pytest.mark.asyncio
    async def test_update_agent_success(self, client, test_user, user_token, sample_agent_card):
        """Test updating agent."""
        # Register agent first
        client.post(
            "/api/v1/agents",
            json=sample_agent_card,
            headers={"Authorization": f"Bearer {user_token}"},
        )

        # Update agent
        updated_card = sample_agent_card.copy()
        updated_card["description"] = "Updated description"

        response = client.put(
            "/api/v1/agents/test-agent",
            json=updated_card,
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["agent_card"]["description"] == "Updated description"

    @pytest.mark.asyncio
    async def test_update_agent_unauthorized(self, client, sample_agent_card):
        """Test updating agent without authentication."""
        response = client.put(
            "/api/v1/agents/test-agent",
            json=sample_agent_card,
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.asyncio
    async def test_update_agent_not_found(self, client, test_user, user_token, sample_agent_card):
        """Test updating non-existent agent."""
        response = client.put(
            "/api/v1/agents/nonexistent",
            json=sample_agent_card,
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestAgentDelete:
    """Test agent deletion endpoint."""

    @pytest.mark.asyncio
    async def test_delete_agent_success(self, client, test_admin, admin_token, sample_agent_card):
        """Test deleting agent as admin."""
        # Register agent first
        client.post(
            "/api/v1/agents",
            json=sample_agent_card,
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        # Delete agent
        response = client.delete(
            "/api/v1/agents/test-agent",
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        assert response.status_code == status.HTTP_200_OK

        # Verify deletion
        get_response = client.get("/api/v1/agents/test-agent")
        assert get_response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.asyncio
    async def test_delete_agent_forbidden_for_user(self, client, test_user, user_token, test_admin, admin_token, sample_agent_card):
        """Test that regular users cannot delete agents."""
        # Register agent as admin
        client.post(
            "/api/v1/agents",
            json=sample_agent_card,
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        # Try to delete as regular user
        response = client.delete(
            "/api/v1/agents/test-agent",
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.asyncio
    async def test_delete_agent_unauthorized(self, client):
        """Test deleting agent without authentication."""
        response = client.delete("/api/v1/agents/test-agent")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.asyncio
    async def test_delete_agent_not_found(self, client, test_admin, admin_token):
        """Test deleting non-existent agent."""
        response = client.delete(
            "/api/v1/agents/nonexistent",
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestAgentSearch:
    """Test agent search endpoint."""

    @pytest.mark.asyncio
    async def test_search_agents(self, client, test_user, user_token):
        """Test searching agents."""
        # Register multiple agents
        agents = [
            {
                "name": "chat-agent",
                "url": "http://localhost:8081",
                "description": "Agent for chatting",
                "capabilities": ["chat"],
            },
            {
                "name": "search-agent",
                "url": "http://localhost:8082",
                "description": "Agent for searching",
                "capabilities": ["search"],
            },
        ]

        for agent in agents:
            client.post(
                "/api/v1/agents",
                json=agent,
                headers={"Authorization": f"Bearer {user_token}"},
            )

        # Search for chat
        response = client.get("/api/v1/agents/search?q=chat")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["agents"]) >= 1
        assert any(agent["name"] == "chat-agent" for agent in data["agents"])
