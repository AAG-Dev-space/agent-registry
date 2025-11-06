# Tests

Simple test suite for A2A Agent Registry backend.

## Structure

```
tests/
├── conftest.py              # Pytest configuration and fixtures
├── endpoints/               # Endpoint-specific tests (one file per endpoint)
│   ├── test_health.py
│   ├── test_list_agents.py
│   ├── test_get_agent.py
│   ├── test_register_agent.py
│   ├── test_register_by_url.py
│   ├── test_sync_agent.py
│   ├── test_delete_agent.py
│   ├── test_search_agents.py
│   └── test_verify_agent.py
└── test_lifecycle.py        # Complete lifecycle integration tests
```

## Running Tests

Install pytest (if not in Docker):
```bash
pip install pytest pytest-asyncio
```

Run all tests:
```bash
pytest
```

Run specific test file:
```bash
pytest tests/endpoints/test_list_agents.py
pytest tests/test_lifecycle.py
```

Run specific test:
```bash
pytest tests/endpoints/test_list_agents.py::test_list_agents_empty
```

Run with verbose output:
```bash
pytest -v
```

## Test Categories

### Endpoint Tests (`tests/endpoints/`)

Each endpoint has its own test file with 2-3 simple tests:
- **Success case**: Normal operation
- **Failure case**: Error handling (404, 403, 400, etc.)
- **Edge case** (if applicable): Invalid data, missing fields, etc.

### Lifecycle Tests (`tests/test_lifecycle.py`)

Integration tests covering complete workflows:
- Full agent lifecycle: Register → List → Get → Update → Delete
- URL registration flow: Register by URL → Sync → Delete
- Health status lifecycle: Creation, updates, deletion
- Multiple agents: Managing several agents simultaneously
- Ownership verification: Delete permission checks

## Key Features

- **Mocked external calls**: HTTP requests to AgentCard URLs are mocked
- **In-memory database**: Uses SQLite for fast, isolated tests
- **A2A v0.3.0 compliant**: All test AgentCards follow the protocol spec
- **Health status verification**: Tests check that health_status is included in responses
- **No authentication required**: Tests reflect current public API design

## Common Fixtures

Defined in `conftest.py`:
- `client`: FastAPI TestClient for HTTP requests
- `test_db`: In-memory SQLite database session
- `test_engine`: Database engine with JSONB/Vector type patches

Each test file also defines:
- `sample_agent`: A2A v0.3.0 compliant AgentCard for testing
