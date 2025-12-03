"""Docker service for managing agent containers."""

import logging
import os
from typing import Any, Dict, List, Optional

import docker
from docker.errors import APIError, DockerException, ImageNotFound, NotFound

logger = logging.getLogger(__name__)

# Docker Registry credentials from environment variables
DOCKER_REGISTRY_USERNAME = os.getenv("DOCKER_REGISTRY_USERNAME", "")
DOCKER_REGISTRY_PASSWORD = os.getenv("DOCKER_REGISTRY_PASSWORD", "")


class DockerService:
    """Service for interacting with Docker daemon to manage agent containers."""

    def __init__(self):
        """Initialize Docker client."""
        try:
            self.client = docker.from_env()
            logger.info("Docker client initialized successfully")
        except DockerException as e:
            logger.error(f"Failed to initialize Docker client: {e}")
            raise RuntimeError(f"Docker is not available: {e}")

    def pull_image(self, image_name: str) -> Dict[str, Any]:
        """Pull Docker image from registry.

        Args:
            image_name: Full image name (e.g., localhost:5100/agent-images/personalized-shopping:v1.7.0)

        Returns:
            Dict containing image information:
            - image_id: Docker image ID
            - tags: List of image tags
            - size: Image size in bytes

        Raises:
            ValueError: If image not found
            RuntimeError: If Docker operation fails
        """
        try:
            logger.info(f"Pulling image: {image_name}")

            # Prepare authentication config if credentials are available
            auth_config = None
            if DOCKER_REGISTRY_USERNAME and DOCKER_REGISTRY_PASSWORD:
                auth_config = {
                    'username': DOCKER_REGISTRY_USERNAME,
                    'password': DOCKER_REGISTRY_PASSWORD
                }
                logger.info(f"Using registry authentication for user: {DOCKER_REGISTRY_USERNAME}")

            # Pull image with authentication
            image = self.client.images.pull(image_name, auth_config=auth_config)

            result = {
                "image_id": image.id,
                "tags": image.tags,
                "size": image.attrs.get("Size", 0),
            }

            logger.info(f"Successfully pulled image: {image_name} (ID: {image.short_id})")
            return result

        except ImageNotFound as e:
            logger.error(f"Image not found: {image_name}")
            raise ValueError(f"Image not found: {image_name}") from e
        except DockerException as e:
            logger.error(f"Failed to pull image {image_name}: {e}")
            raise RuntimeError(f"Docker error while pulling image: {e}") from e

    def start_container(
        self,
        image_name: str,
        container_name: str,
        port: int,
        env_vars: Dict[str, str],
        internal_port: int = 8000,
    ) -> Dict[str, Any]:
        """Start a new agent container.

        Args:
            image_name: Docker image to use
            container_name: Name for the container
            port: Host port to bind to
            env_vars: Environment variables as dict
            internal_port: Container internal port (default: 8000)

        Returns:
            Dict containing:
            - container_id: Docker container ID
            - status: Container status

        Raises:
            RuntimeError: If container fails to start
        """
        try:
            logger.info(f"Starting container: {container_name} from {image_name}")

            # Port mapping
            ports = {f"{internal_port}/tcp": port}

            # Run container
            container = self.client.containers.run(
                image=image_name,
                name=container_name,
                ports=ports,
                environment=env_vars,
                extra_hosts={
                    "host.docker.internal": "host-gateway",
                    "localhost": "host-gateway"  # Allow agent to access host services via localhost
                },
                detach=True,
                remove=False,  # Don't auto-remove so we can inspect logs
            )

            result = {
                "container_id": container.id,
                "status": container.status,
            }

            logger.info(
                f"Successfully started container: {container_name} "
                f"(ID: {container.short_id}, Port: {port})"
            )
            return result

        except APIError as e:
            logger.error(f"Failed to start container {container_name}: {e}")
            raise RuntimeError(f"Failed to start container: {e}") from e
        except DockerException as e:
            logger.error(f"Docker error starting container {container_name}: {e}")
            raise RuntimeError(f"Docker error: {e}") from e

    def stop_container(self, container_id: str, timeout: int = 10) -> None:
        """Stop a running container.

        Args:
            container_id: Docker container ID or name
            timeout: Seconds to wait for graceful shutdown

        Raises:
            RuntimeError: If stop operation fails
        """
        try:
            logger.info(f"Stopping container: {container_id}")
            container = self.client.containers.get(container_id)
            container.stop(timeout=timeout)
            logger.info(f"Successfully stopped container: {container_id}")

        except NotFound as e:
            logger.warning(f"Container not found when stopping: {container_id}")
            raise ValueError(f"Container not found: {container_id}") from e
        except APIError as e:
            logger.error(f"Failed to stop container {container_id}: {e}")
            raise RuntimeError(f"Failed to stop container: {e}") from e

    def remove_container(self, container_id: str, force: bool = True) -> None:
        """Remove a container.

        Args:
            container_id: Docker container ID or name
            force: Force removal even if running

        Raises:
            RuntimeError: If remove operation fails
        """
        try:
            logger.info(f"Removing container: {container_id} (force={force})")
            container = self.client.containers.get(container_id)
            container.remove(force=force)
            logger.info(f"Successfully removed container: {container_id}")

        except NotFound as e:
            logger.warning(f"Container not found when removing: {container_id}")
            raise ValueError(f"Container not found: {container_id}") from e
        except APIError as e:
            logger.error(f"Failed to remove container {container_id}: {e}")
            raise RuntimeError(f"Failed to remove container: {e}") from e

    def get_container_status(self, container_id: str) -> str:
        """Get current status of a container.

        Args:
            container_id: Docker container ID or name

        Returns:
            Status string: created, running, paused, restarting, removing, exited, dead

        Raises:
            ValueError: If container not found
        """
        try:
            container = self.client.containers.get(container_id)
            status = container.status
            logger.debug(f"Container {container_id} status: {status}")
            return status

        except NotFound:
            logger.warning(f"Container not found: {container_id}")
            return "not_found"
        except DockerException as e:
            logger.error(f"Failed to get status for {container_id}: {e}")
            raise RuntimeError(f"Failed to get container status: {e}") from e

    def get_container_logs(
        self,
        container_id: str,
        tail: int = 100,
        timestamps: bool = False,
    ) -> List[str]:
        """Get container logs.

        Args:
            container_id: Docker container ID or name
            tail: Number of lines from the end (default: 100)
            timestamps: Include timestamps in logs

        Returns:
            List of log lines as strings

        Raises:
            ValueError: If container not found
            RuntimeError: If operation fails
        """
        try:
            logger.debug(f"Fetching logs for container: {container_id} (tail={tail})")
            container = self.client.containers.get(container_id)

            logs = container.logs(
                tail=tail,
                timestamps=timestamps,
                stdout=True,
                stderr=True,
            )

            # Decode bytes to string and split into lines
            log_lines = logs.decode("utf-8").strip().split("\n")

            logger.debug(f"Retrieved {len(log_lines)} log lines for {container_id}")
            return log_lines

        except NotFound as e:
            logger.error(f"Container not found: {container_id}")
            raise ValueError(f"Container not found: {container_id}") from e
        except DockerException as e:
            logger.error(f"Failed to get logs for {container_id}: {e}")
            raise RuntimeError(f"Failed to get container logs: {e}") from e

    def list_containers(
        self,
        all_containers: bool = False,
        filters: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """List containers.

        Args:
            all_containers: Include stopped containers
            filters: Docker filters (e.g., {"status": "running"})

        Returns:
            List of container information dicts
        """
        try:
            containers = self.client.containers.list(all=all_containers, filters=filters)

            result = []
            for container in containers:
                result.append({
                    "id": container.id,
                    "short_id": container.short_id,
                    "name": container.name,
                    "status": container.status,
                    "image": container.image.tags[0] if container.image.tags else container.image.id,
                })

            return result

        except DockerException as e:
            logger.error(f"Failed to list containers: {e}")
            raise RuntimeError(f"Failed to list containers: {e}") from e

    def container_exists(self, container_name: str) -> bool:
        """Check if a container exists.

        Args:
            container_name: Container name

        Returns:
            True if container exists, False otherwise
        """
        try:
            self.client.containers.get(container_name)
            return True
        except NotFound:
            return False
        except DockerException as e:
            logger.error(f"Error checking container existence: {e}")
            return False

    def inspect_container(self, container_id: str) -> Dict[str, Any]:
        """Get detailed container information.

        Args:
            container_id: Docker container ID or name

        Returns:
            Container inspection data

        Raises:
            ValueError: If container not found
        """
        try:
            container = self.client.containers.get(container_id)
            return container.attrs

        except NotFound as e:
            raise ValueError(f"Container not found: {container_id}") from e
        except DockerException as e:
            logger.error(f"Failed to inspect container {container_id}: {e}")
            raise RuntimeError(f"Failed to inspect container: {e}") from e
