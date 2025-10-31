"""API tests for health endpoints."""

import pytest
from fastapi import status


class TestHealthCheck:
    """Test health check endpoint."""

    @pytest.mark.asyncio
    async def test_health_check(self, client):
        """Test basic health check endpoint."""
        response = client.get("/health")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "healthy"


class TestAgentHealth:
    """Test agent health monitoring endpoints."""

    @pytest.mark.asyncio
    async def test_list_agent_health(self, client):
        """Test listing all agent health statuses."""
        response = client.get("/api/v1/health")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)

    @pytest.mark.asyncio
    async def test_get_agent_health(self, client, test_user, user_token, sample_agent_card):
        """Test getting health status of specific agent."""
        # Register an agent first
        client.post(
            "/api/v1/agents",
            json=sample_agent_card,
            headers={"Authorization": f"Bearer {user_token}"},
        )

        # Get health status
        response = client.get("/api/v1/health/test-agent")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["agent_name"] == "test-agent"
        assert "status" in data
        assert "last_check" in data

    @pytest.mark.asyncio
    async def test_get_health_nonexistent_agent(self, client):
        """Test getting health of non-existent agent."""
        response = client.get("/api/v1/health/nonexistent")

        assert response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.asyncio
    async def test_update_agent_health(self, client, test_user, user_token, sample_agent_card):
        """Test updating agent health status."""
        # Register an agent first
        client.post(
            "/api/v1/agents",
            json=sample_agent_card,
            headers={"Authorization": f"Bearer {user_token}"},
        )

        # Update health status
        health_update = {
            "status": "healthy",
            "response_time_ms": 150,
            "details": {"uptime": "24h"},
        }

        response = client.post(
            "/api/v1/health/test-agent",
            json=health_update,
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "healthy"
        assert data["response_time_ms"] == 150
