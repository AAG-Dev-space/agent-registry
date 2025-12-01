"""
Docker Registry API endpoints.

Provides proxy access to private Docker Registry.
"""

import httpx
import os
from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/docker-registry", tags=["docker-registry"])

# Docker Registry URL (can be configured via environment variable)
DOCKER_REGISTRY_URL = os.getenv("DOCKER_REGISTRY_URL", "http://host.docker.internal:5000")


@router.get("/repositories", response_model=Dict[str, List[str]])
async def list_repositories():
    """List all repositories in the Docker Registry.

    Returns:
        Dict with 'repositories' key containing list of repository names

    Example response:
        {
            "repositories": ["personalized-shopping", "my-agent"]
        }
    """
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{DOCKER_REGISTRY_URL}/v2/_catalog")
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        logger.error(f"Failed to fetch repositories from Docker Registry: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Cannot reach Docker Registry: {str(e)}"
        )


@router.get("/repositories/{repository}/tags", response_model=Dict[str, Any])
async def list_tags(repository: str):
    """List all tags for a specific repository.

    Args:
        repository: Repository name (e.g., "personalized-shopping")

    Returns:
        Dict with 'name' and 'tags' keys

    Example response:
        {
            "name": "personalized-shopping",
            "tags": ["v1.0.0", "v1.1.0", "v1.2.0", "latest"]
        }
    """
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{DOCKER_REGISTRY_URL}/v2/{repository}/tags/list")
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Repository '{repository}' not found"
            )
        logger.error(f"Failed to fetch tags for {repository}: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Cannot fetch tags from Docker Registry: {str(e)}"
        )
    except httpx.HTTPError as e:
        logger.error(f"Failed to fetch tags for {repository}: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Cannot reach Docker Registry: {str(e)}"
        )


@router.get("/images", response_model=List[Dict[str, Any]])
async def list_all_images():
    """List all available images with their tags.

    Returns:
        List of image objects with repository name and tags

    Example response:
        [
            {
                "repository": "personalized-shopping",
                "tags": ["v1.0.0", "v1.1.0", "latest"],
                "image_count": 3
            },
            {
                "repository": "my-agent",
                "tags": ["v1.0.0"],
                "image_count": 1
            }
        ]
    """
    try:
        # Get all repositories
        repositories_data = await list_repositories()
        repositories = repositories_data.get("repositories", [])

        # Get tags for each repository
        images = []
        async with httpx.AsyncClient(timeout=10.0) as client:
            for repo in repositories:
                try:
                    response = await client.get(f"{DOCKER_REGISTRY_URL}/v2/{repo}/tags/list")
                    response.raise_for_status()
                    data = response.json()
                    tags = data.get("tags") or []

                    images.append({
                        "repository": repo,
                        "tags": sorted(tags, reverse=True),  # Latest tags first
                        "image_count": len(tags)
                    })
                except httpx.HTTPError as e:
                    logger.warning(f"Failed to fetch tags for {repo}: {e}")
                    # Skip this repository but continue with others
                    continue

        return sorted(images, key=lambda x: x["repository"])

    except HTTPException:
        # Re-raise HTTPException from list_repositories()
        raise
    except Exception as e:
        logger.error(f"Failed to list all images: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list images: {str(e)}"
        )
