"""A2A to AG-UI Protocol Bridge.

This module converts A2A Protocol agent responses to AG-UI event streams.
"""

import asyncio
import logging
import uuid
from typing import AsyncGenerator, Any

from ag_ui.core.events import (
    EventType,
    RunStartedEvent,
    RunFinishedEvent,
    RunErrorEvent,
    TextMessageStartEvent,
    TextMessageContentEvent,
    TextMessageEndEvent,
    ToolCallStartEvent,
    ToolCallArgsEvent,
    ToolCallEndEvent,
    ToolCallResultEvent,
)
from ag_ui.encoder import EventEncoder

logger = logging.getLogger(__name__)


class A2AtoAGUIBridge:
    """Bridge to convert A2A Protocol responses to AG-UI events."""

    def __init__(
        self,
        thread_id: str,
        run_id: str,
        encoder: EventEncoder,
        chunk_size: int = 10,
        chunk_delay: float = 0.03,
    ):
        """Initialize the bridge.

        Args:
            thread_id: Thread/session ID
            run_id: Run ID for this execution
            encoder: AG-UI event encoder
            chunk_size: Number of characters per chunk for streaming
            chunk_delay: Delay between chunks in seconds
        """
        self.thread_id = thread_id
        self.run_id = run_id
        self.encoder = encoder
        self.chunk_size = chunk_size
        self.chunk_delay = chunk_delay

    async def stream_from_agent(
        self,
        user_msg_content: str,
        agent_msg_content: dict[str, Any],
    ) -> AsyncGenerator[str, None]:
        """Stream AG-UI events from A2A agent response.

        Args:
            user_msg_content: User message text
            agent_msg_content: Agent response dict with 'text', 'trace', 'error' fields

        Yields:
            SSE-formatted AG-UI event strings
        """
        try:
            # 1. Emit RUN_STARTED event
            yield self.encoder.encode(
                RunStartedEvent(
                    type=EventType.RUN_STARTED,
                    thread_id=self.thread_id,
                    run_id=self.run_id,
                )
            )

            # 2. Check for errors
            if agent_msg_content.get("error"):
                error_text = agent_msg_content.get("text", "Unknown error")
                yield self.encoder.encode(
                    RunErrorEvent(
                        type=EventType.RUN_ERROR,
                        message=error_text,
                        code="AGENT_ERROR",
                    )
                )
                return

            # 3. Extract response components
            text_content = agent_msg_content.get("text", "")
            trace_events = agent_msg_content.get("trace", [])

            # 4. Generate message ID for this response
            message_id = str(uuid.uuid4())

            # 5. Emit TEXT_MESSAGE_START
            yield self.encoder.encode(
                TextMessageStartEvent(
                    type=EventType.TEXT_MESSAGE_START,
                    message_id=message_id,
                    role="assistant",
                )
            )

            # 6. Process trace events for tool calls (before text)
            tool_calls = self._extract_tool_calls(trace_events)
            for event in tool_calls:
                yield self.encoder.encode(event)

            # 7. Stream text content in chunks
            if text_content:
                async for chunk_event in self._chunk_text(message_id, text_content):
                    yield self.encoder.encode(chunk_event)

            # 8. Emit TEXT_MESSAGE_END
            yield self.encoder.encode(
                TextMessageEndEvent(
                    type=EventType.TEXT_MESSAGE_END,
                    message_id=message_id,
                )
            )

            # 9. Emit RUN_FINISHED event
            yield self.encoder.encode(
                RunFinishedEvent(
                    type=EventType.RUN_FINISHED,
                    thread_id=self.thread_id,
                    run_id=self.run_id,
                    result={"text": text_content},
                )
            )

        except Exception as e:
            logger.error(f"Error in AG-UI bridge: {e}", exc_info=True)
            yield self.encoder.encode(
                RunErrorEvent(
                    type=EventType.RUN_ERROR,
                    message=f"Bridge error: {str(e)}",
                    code="BRIDGE_ERROR",
                )
            )

    async def _chunk_text(
        self, message_id: str, text: str
    ) -> AsyncGenerator[TextMessageContentEvent, None]:
        """Chunk text into smaller pieces for streaming effect.

        Args:
            message_id: Message ID
            text: Full text to chunk

        Yields:
            TextMessageContentEvent for each chunk
        """
        for i in range(0, len(text), self.chunk_size):
            chunk = text[i : i + self.chunk_size]
            yield TextMessageContentEvent(
                type=EventType.TEXT_MESSAGE_CONTENT,
                message_id=message_id,
                delta=chunk,
            )
            # Small delay for typing effect
            if i + self.chunk_size < len(text):
                await asyncio.sleep(self.chunk_delay)

    def _extract_tool_calls(
        self, trace_events: list[dict[str, Any]]
    ) -> list[ToolCallStartEvent | ToolCallArgsEvent | ToolCallEndEvent | ToolCallResultEvent]:
        """Extract tool call events from trace.

        Args:
            trace_events: List of trace event dicts

        Returns:
            List of AG-UI tool call events
        """
        events = []
        tool_call_map = {}  # event_id -> tool_call_id mapping

        for event in trace_events:
            event_type = event.get("event_type")
            event_id = event.get("event_id", str(uuid.uuid4()))

            if event_type == "tool_call":
                # Tool call started
                tool_call_id = str(uuid.uuid4())
                tool_call_map[event_id] = tool_call_id

                events.append(
                    ToolCallStartEvent(
                        type=EventType.TOOL_CALL_START,
                        tool_call_id=tool_call_id,
                        tool_call_name=event.get("tool_name", "unknown"),
                    )
                )

                # Emit tool arguments
                tool_input = event.get("tool_input", {})
                if tool_input:
                    import json
                    events.append(
                        ToolCallArgsEvent(
                            type=EventType.TOOL_CALL_ARGS,
                            tool_call_id=tool_call_id,
                            delta=json.dumps(tool_input),
                        )
                    )

                # Emit tool call end
                events.append(
                    ToolCallEndEvent(
                        type=EventType.TOOL_CALL_END,
                        tool_call_id=tool_call_id,
                    )
                )

            elif event_type == "tool_response":
                # Tool call result
                tool_call_id = tool_call_map.get(event.get("call_id"), str(uuid.uuid4()))
                tool_output = event.get("tool_output", "")

                events.append(
                    ToolCallResultEvent(
                        type=EventType.TOOL_CALL_RESULT,
                        message_id=str(uuid.uuid4()),
                        tool_call_id=tool_call_id,
                        content=str(tool_output),
                        role="tool",
                    )
                )

        return events
