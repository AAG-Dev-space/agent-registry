"""Agent Loader service for managing agent instances."""

import asyncio
import logging
import time
import uuid
from datetime import UTC, datetime
from typing import Any, Dict, List, Optional

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.models.agent_instance import AgentInstanceModel
from backend.app.services.docker_service import DockerService

logger = logging.getLogger(__name__)


class AgentLoaderService:
    """Service for managing agent instances (Docker containers)."""

    def __init__(self, db: AsyncSession):
        """Initialize service.

        Args:
            db: Database session
        """
        self.db = db
        self.docker = DockerService()

    async def pull_and_start(
        self,
        docker_image: str,
        agent_name: Optional[str] = None,
        port: Optional[int] = None,
        env_vars: Optional[Dict[str, str]] = None,
        internal_port: int = 8000,
    ) -> Dict[str, Any]:
        """Pull Docker image, start container, and auto-register AgentCard.

        Args:
            docker_image: Docker image to pull and run
            agent_name: Optional agent name override (fetched from AgentCard if None)
            port: Host port to bind (auto-assign if None)
            env_vars: Environment variables for container
            internal_port: Container internal port (default: 8000)

        Returns:
            Dict containing instance information

        Raises:
            ValueError: If port unavailable
            RuntimeError: If Docker operation fails
        """
        env_vars = env_vars or {}

        logger.info(
            f"Starting agent instance: image={docker_image}, port={port}"
        )

        # 1. Auto-assign port if not specified
        if port is None:
            port = await self.find_available_port()
            logger.info(f"Auto-assigned port: {port}")

        # 2. Generate temporary instance ID and container name
        instance_id = str(uuid.uuid4())
        short_id = instance_id[:8]
        # Use temporary name first, will be updated after fetching AgentCard
        temp_name = f"temp-{short_id}"
        container_name = f"agent-{temp_name}-{short_id}"

        # 3. Pull image
        try:
            image_info = self.docker.pull_image(docker_image)
            logger.info(f"Pulled image: {docker_image} (ID: {image_info['image_id'][:12]})")
        except Exception as e:
            logger.error(f"Failed to pull image {docker_image}: {e}")
            raise

        # 4. Start container
        try:
            container_info = self.docker.start_container(
                image_name=docker_image,
                container_name=container_name,
                port=port,
                env_vars=env_vars,
                internal_port=internal_port,
            )
        except Exception as e:
            logger.error(f"Failed to start container {container_name}: {e}")
            raise

        # 5. Wait for container to be ready, fetch AgentCard, and register agent
        actual_agent_name = temp_name  # Default to temp name
        agent_card_registered = False

        try:
            is_ready = await self._wait_for_container_ready(port, timeout=60)

            if is_ready:
                # Fetch AgentCard
                agent_card = await self._fetch_agent_card(port)

                if agent_card:
                    # Use agent name from AgentCard
                    actual_agent_name = agent_card.get("name", temp_name)
                    if agent_name:
                        # If user provided name, use it instead
                        actual_agent_name = agent_name

                    # 5.1: Stop existing instances with the same agent name (version update)
                    await self._stop_existing_instances(actual_agent_name)

                    # Register agent in database FIRST (before creating instance)
                    await self._register_agent_from_card(agent_card, port)
                    agent_card_registered = True
                    logger.info(f"Successfully registered agent '{actual_agent_name}' from AgentCard")
                else:
                    logger.warning(f"Failed to fetch AgentCard, using temp name: {temp_name}")
            else:
                logger.warning(f"Container not ready within timeout, using temp name: {temp_name}")

        except Exception as e:
            logger.error(f"Error during AgentCard fetch: {e}")

        # 6. Create database record with actual agent name
        # Note: If AgentCard fetch failed, agent might not exist in DB
        # So we create a placeholder agent entry if needed
        if not agent_card_registered:
            from backend.app.models.agent import AgentModel
            result = await self.db.execute(
                select(AgentModel).where(AgentModel.name == temp_name)
            )
            temp_agent = result.scalar_one_or_none()

            if not temp_agent:
                # Create placeholder agent
                temp_agent = AgentModel(
                    name=temp_name,
                    agent_card={
                        "name": temp_name,
                        "url": f"http://localhost:{port}",
                        "description": "Temporary agent (AgentCard fetch failed)",
                        "protocolVersion": "0.3.0",
                        "version": "0.0.1",
                        "preferredTransport": "JSONRPC",
                        "capabilities": {},
                        "defaultInputModes": ["text/plain"],
                        "defaultOutputModes": ["text/plain"],
                        "skills": []
                    }
                )
                self.db.add(temp_agent)
                await self.db.commit()
                logger.info(f"Created placeholder agent: {temp_name}")

        instance = AgentInstanceModel(
            id=instance_id,
            agent_name=actual_agent_name,
            docker_image=docker_image,
            container_id=container_info["container_id"],
            container_name=container_name,
            port=port,
            internal_port=internal_port,
            status="starting",
            env_vars=env_vars,
            llm_model=env_vars.get("AGENT_MODEL"),
            llm_api_base=env_vars.get("AGENT_API_BASE"),
            llm_api_key=env_vars.get("AGENT_API_KEY"),
            started_at=datetime.now(UTC).replace(tzinfo=None),
        )

        self.db.add(instance)
        await self.db.commit()
        await self.db.refresh(instance)

        logger.info(
            f"Successfully started instance: {instance_id} "
            f"(agent: {actual_agent_name}, container: {container_name}, port: {port})"
        )

        return instance.to_dict()

    async def stop_instance(self, instance_id: str) -> Dict[str, Any]:
        """Stop a running agent instance.

        Args:
            instance_id: Instance ID

        Returns:
            Updated instance information

        Raises:
            ValueError: If instance not found
        """
        logger.info(f"Stopping instance: {instance_id}")

        # Get instance from database
        instance = await self.db.get(AgentInstanceModel, instance_id)
        if not instance:
            raise ValueError(f"Instance not found: {instance_id}")

        # Stop container
        if instance.container_id:
            try:
                self.docker.stop_container(instance.container_id)
                logger.info(f"Stopped container: {instance.container_id}")
            except ValueError:
                logger.warning(f"Container not found: {instance.container_id}")
            except Exception as e:
                logger.error(f"Failed to stop container: {e}")
                raise

        # Update database
        instance.status = "stopped"
        instance.stopped_at = datetime.now(UTC).replace(tzinfo=None)
        await self.db.commit()
        await self.db.refresh(instance)

        logger.info(f"Instance stopped: {instance_id}")
        return instance.to_dict()

    async def delete_instance(self, instance_id: str) -> None:
        """Delete an agent instance and its container.

        If this is the last instance of an agent, also delete the agent card.

        Args:
            instance_id: Instance ID

        Raises:
            ValueError: If instance not found
        """
        logger.info(f"Deleting instance: {instance_id}")

        # Get instance
        instance = await self.db.get(AgentInstanceModel, instance_id)
        if not instance:
            raise ValueError(f"Instance not found: {instance_id}")

        agent_name = instance.agent_name

        # Remove container
        if instance.container_id:
            try:
                self.docker.remove_container(instance.container_id, force=True)
                logger.info(f"Removed container: {instance.container_id}")
            except ValueError:
                logger.warning(f"Container not found: {instance.container_id}")
            except Exception as e:
                logger.error(f"Failed to remove container: {e}")
                # Continue with database deletion even if container removal fails

        # Delete from database
        await self.db.delete(instance)
        await self.db.commit()

        logger.info(f"Instance deleted: {instance_id}")

        # 5.2: Check if this was the last instance, if so delete the agent card
        await self._delete_agent_if_no_instances(agent_name)

    async def get_instance(self, instance_id: str) -> Dict[str, Any]:
        """Get instance details.

        Args:
            instance_id: Instance ID

        Returns:
            Instance information including current Docker status

        Raises:
            ValueError: If instance not found
        """
        instance = await self.db.get(AgentInstanceModel, instance_id)
        if not instance:
            raise ValueError(f"Instance not found: {instance_id}")

        result = instance.to_dict()

        # Add current Docker status
        if instance.container_id:
            try:
                docker_status = self.docker.get_container_status(instance.container_id)
                result["docker_status"] = docker_status
            except Exception as e:
                logger.warning(f"Failed to get Docker status: {e}")
                result["docker_status"] = "unknown"

        return result

    async def list_instances(
        self,
        agent_name: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> tuple[List[Dict[str, Any]], int]:
        """List agent instances with optional filtering.

        Args:
            agent_name: Filter by agent name
            status: Filter by status
            limit: Maximum number of results
            offset: Offset for pagination

        Returns:
            Tuple of (instances list, total count)
        """
        # Build query
        query = select(AgentInstanceModel)

        if agent_name:
            query = query.where(AgentInstanceModel.agent_name == agent_name)
        if status:
            query = query.where(AgentInstanceModel.status == status)

        # Get total count
        count_query = select(AgentInstanceModel)
        if agent_name:
            count_query = count_query.where(AgentInstanceModel.agent_name == agent_name)
        if status:
            count_query = count_query.where(AgentInstanceModel.status == status)

        count_result = await self.db.execute(count_query)
        total_count = len(count_result.scalars().all())

        # Get instances with pagination
        query = query.order_by(AgentInstanceModel.created_at.desc())
        query = query.offset(offset).limit(limit)

        result = await self.db.execute(query)
        instances = result.scalars().all()

        # Convert to dict and add Docker status
        instances_data = []
        for instance in instances:
            data = instance.to_dict()

            # Add current Docker status
            if instance.container_id:
                try:
                    docker_status = self.docker.get_container_status(instance.container_id)
                    data["docker_status"] = docker_status
                except Exception:
                    data["docker_status"] = "unknown"

            instances_data.append(data)

        return instances_data, total_count

    async def get_instance_logs(
        self,
        instance_id: str,
        tail: int = 100,
    ) -> List[str]:
        """Get container logs for an instance.

        Args:
            instance_id: Instance ID
            tail: Number of lines to return

        Returns:
            List of log lines

        Raises:
            ValueError: If instance not found
        """
        instance = await self.db.get(AgentInstanceModel, instance_id)
        if not instance:
            raise ValueError(f"Instance not found: {instance_id}")

        if not instance.container_id:
            return []

        try:
            return self.docker.get_container_logs(instance.container_id, tail=tail)
        except ValueError:
            logger.warning(f"Container not found: {instance.container_id}")
            return []
        except Exception as e:
            logger.error(f"Failed to get logs: {e}")
            raise

    async def find_available_port(
        self,
        start_port: int = 8000,
        end_port: int = 8999,
    ) -> int:
        """Find an available port in the specified range.

        Args:
            start_port: Start of port range
            end_port: End of port range

        Returns:
            Available port number

        Raises:
            RuntimeError: If no available ports
        """
        # Get all used ports from database
        result = await self.db.execute(
            select(AgentInstanceModel.port).where(
                AgentInstanceModel.status.in_(["starting", "running"])
            )
        )
        used_ports = set(row[0] for row in result.fetchall())

        # Find first available port
        for port in range(start_port, end_port + 1):
            if port not in used_ports:
                logger.debug(f"Found available port: {port}")
                return port

        raise RuntimeError(
            f"No available ports in range {start_port}-{end_port}. "
            f"Used ports: {len(used_ports)}"
        )

    async def sync_instance_status(self, instance_id: str) -> Dict[str, Any]:
        """Sync instance status with actual Docker container status.

        Args:
            instance_id: Instance ID

        Returns:
            Updated instance information

        Raises:
            ValueError: If instance not found
        """
        instance = await self.db.get(AgentInstanceModel, instance_id)
        if not instance:
            raise ValueError(f"Instance not found: {instance_id}")

        if not instance.container_id:
            logger.warning(f"Instance has no container_id: {instance_id}")
            instance.status = "error"
            await self.db.commit()
            return instance.to_dict()

        # Get Docker status
        try:
            docker_status = self.docker.get_container_status(instance.container_id)

            # Map Docker status to our status
            status_mapping = {
                "running": "running",
                "created": "starting",
                "exited": "stopped",
                "dead": "error",
                "paused": "stopped",
                "restarting": "starting",
                "removing": "stopped",
                "not_found": "error",
            }

            new_status = status_mapping.get(docker_status, "unknown")

            if instance.status != new_status:
                logger.info(
                    f"Updating instance {instance_id} status: "
                    f"{instance.status} -> {new_status}"
                )
                instance.status = new_status
                await self.db.commit()

        except Exception as e:
            logger.error(f"Failed to sync status for {instance_id}: {e}")
            instance.status = "error"
            await self.db.commit()

        await self.db.refresh(instance)
        return instance.to_dict()

    async def _wait_for_container_ready(
        self,
        port: int,
        timeout: int = 30,
        check_interval: float = 1.0,
    ) -> bool:
        """Wait for container to be ready by checking AgentCard endpoint.

        Args:
            port: Host port where container is accessible
            timeout: Maximum time to wait in seconds
            check_interval: Time between checks in seconds

        Returns:
            True if container is ready, False if timeout
        """
        # Use host.docker.internal to access host ports from within container
        agent_card_url = f"http://host.docker.internal:{port}/.well-known/agent-card.json"
        start_time = time.time()

        logger.info(f"Waiting for container to be ready on port {port}...")

        while time.time() - start_time < timeout:
            try:
                async with httpx.AsyncClient(timeout=5.0) as client:
                    response = await client.get(agent_card_url)
                    if response.status_code == 200:
                        logger.info(f"Container ready on port {port} (took {time.time() - start_time:.1f}s)")
                        return True
            except Exception:
                # Container not ready yet, continue waiting
                pass

            await asyncio.sleep(check_interval)

        logger.warning(f"Container on port {port} did not become ready within {timeout}s")
        return False

    async def _fetch_agent_card(self, port: int) -> Optional[Dict[str, Any]]:
        """Fetch AgentCard JSON from container.

        Args:
            port: Host port where container is accessible

        Returns:
            AgentCard dictionary if successful, None otherwise
        """
        # Use host.docker.internal to access host ports from within container
        agent_card_url = f"http://host.docker.internal:{port}/.well-known/agent-card.json"

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(agent_card_url)

                if response.status_code != 200:
                    logger.error(
                        f"Failed to fetch AgentCard from {agent_card_url}: "
                        f"HTTP {response.status_code}"
                    )
                    return None

                agent_card = response.json()
                logger.info(f"Successfully fetched AgentCard from {agent_card_url}")
                return agent_card

        except Exception as e:
            logger.error(f"Failed to fetch AgentCard from {agent_card_url}: {e}")
            return None

    async def _register_agent_from_card(
        self,
        agent_card: Dict[str, Any],
        port: int,
    ) -> bool:
        """Register agent in database using fetched AgentCard.

        Args:
            agent_card: AgentCard dictionary
            port: Host port where container is accessible

        Returns:
            True if registration successful, False otherwise
        """
        try:
            # Add agent_card_url to the card for future syncs
            # Use host.docker.internal to access host ports from within container
            agent_card_url = f"http://host.docker.internal:{port}/.well-known/agent-card.json"
            agent_card["agent_card_url"] = agent_card_url

            # Register agent in database
            from backend.app.services.agent_service import AgentService
            agent_service = AgentService(self.db)

            await agent_service.register_agent(agent_card)

            agent_name = agent_card.get("name", "unknown")
            logger.info(
                f"Successfully registered agent '{agent_name}' "
                f"from {agent_card_url}"
            )
            return True

        except Exception as e:
            logger.error(f"Failed to register AgentCard: {e}")
            return False

    async def _stop_existing_instances(self, agent_name: str) -> None:
        """Stop all existing instances of an agent (for version updates).

        Args:
            agent_name: Name of the agent

        This is used when starting a new version of an agent to replace old instances.
        """
        try:
            # Find all running instances with the same agent name
            result = await self.db.execute(
                select(AgentInstanceModel).where(
                    AgentInstanceModel.agent_name == agent_name
                )
            )
            existing_instances = result.scalars().all()

            if existing_instances:
                logger.info(
                    f"Found {len(existing_instances)} existing instance(s) "
                    f"for agent '{agent_name}', stopping them..."
                )

                for instance in existing_instances:
                    try:
                        # Stop and remove Docker container
                        if instance.container_id:
                            self.docker.stop_container(instance.container_id)
                            self.docker.remove_container(instance.container_id)
                            logger.info(
                                f"Stopped container {instance.container_id} "
                                f"for instance {instance.id}"
                            )

                        # Delete instance from database
                        await self.db.delete(instance)

                    except Exception as e:
                        logger.warning(
                            f"Failed to stop instance {instance.id}: {e}. "
                            f"Continuing with other instances..."
                        )

                await self.db.commit()
                logger.info(
                    f"Successfully stopped all existing instances for '{agent_name}'"
                )

        except Exception as e:
            logger.error(f"Error stopping existing instances for '{agent_name}': {e}")
            # Don't raise - we still want to proceed with starting the new instance

    async def _delete_agent_if_no_instances(self, agent_name: str) -> None:
        """Delete agent card if no instances remain.

        Args:
            agent_name: Name of the agent to check

        This is called after deleting an instance to clean up orphaned agent cards.
        """
        try:
            # Check if any instances remain for this agent
            result = await self.db.execute(
                select(AgentInstanceModel).where(
                    AgentInstanceModel.agent_name == agent_name
                )
            )
            remaining_instances = result.scalars().all()

            if not remaining_instances:
                # No instances left, delete the agent card
                logger.info(
                    f"No instances remain for agent '{agent_name}', "
                    f"deleting agent card..."
                )

                from backend.app.services.agent_service import AgentService
                agent_service = AgentService(self.db)

                try:
                    # Note: delete_agent will handle health_status cascade deletion
                    await agent_service.delete_agent(agent_name)
                    logger.info(f"Successfully deleted agent card for '{agent_name}'")
                except ValueError:
                    # Agent might not exist in database (e.g., temp agents)
                    logger.warning(
                        f"Agent '{agent_name}' not found in registry, "
                        f"skipping card deletion"
                    )
            else:
                logger.info(
                    f"Agent '{agent_name}' still has {len(remaining_instances)} "
                    f"instance(s), keeping agent card"
                )

        except Exception as e:
            logger.error(f"Error checking instances for agent '{agent_name}': {e}")
            # Don't raise - instance was already deleted
