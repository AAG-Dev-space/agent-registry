"""Test /health endpoint."""

import pytest
from fastapi import status


@pytest.mark.asyncio
async def test_health_check(client):
    """Test basic health check returns healthy status."""
    response = client.get("/health")

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "healthy"
