# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A2A Registry is a production-ready agent discovery platform implementing **A2A Protocol v0.3.0** (FastA2A standards). It provides a robust, scalable infrastructure for agent registration, discovery, and management in distributed Agent-to-Agent networks.

**Current Version**: 0.1.5
**Python Version**: 3.11+ (minimum 3.9+)
**License**: MIT

## Development Commands

### Setup and Installation

```bash
# Complete project setup (submodules + venv + dependencies + pre-commit)
make setup

# Install only development dependencies
make install-dev

# Install with documentation dependencies
pip install -e ".[dev,docs]"
```

### Testing

```bash
# Run all tests
make test
pytest

# Run tests with coverage
make test-cov

# Run specific test file
pytest tests/test_server.py

# Run specific test
pytest tests/test_server.py::test_register_agent -v

# Run tests in parallel
pytest -n auto
```

### Code Quality

```bash
# Format code with black and ruff
make format

# Run linting
make lint
ruff check src/

# Type checking
make typecheck
mypy src/ --ignore-missing-imports

# Run all dev checks (lint + typecheck + test)
make dev-check

# Run comprehensive checks (includes proto generation and formatting)
make check
```

### Running the Server

```bash
# Start server with default settings (localhost:8000)
a2a-registry serve

# Start server with custom settings
a2a-registry serve --host 0.0.0.0 --port 8080 --log-level DEBUG

# Development server with auto-reload
make dev-server
# OR
.venv/bin/python -c "from a2a_registry.server import create_app; import uvicorn; uvicorn.run(create_app(), host='127.0.0.1', port=8000, reload=True, factory=True)"
```

### Protocol Buffers

```bash
# Generate protobuf files from .proto definitions
make proto
# OR
python scripts/generate_proto.py
```

### Documentation

```bash
# Serve docs locally at http://127.0.0.1:8000
make docs-serve

# Build documentation
make docs-build
```

## Architecture

### Multi-Layer Architecture

The codebase is organized into distinct layers:

1. **Protocol Layer** (Multi-transport support)
   - JSON-RPC 2.0 (`jsonrpc_server.py`) - Primary transport
   - REST API (`server.py`) - FastAPI-based
   - GraphQL (`graphql/` directory) - Strawberry GraphQL
   - gRPC (`grpc_server.py`) - Experimental

2. **Storage Layer** (Pluggable backends)
   - Base: `storage.py` - Abstract `StorageBackend` interface
   - Vector-Enhanced: `vector_enhanced_storage.py` - Wraps any backend with semantic search
   - In-memory implementation for development
   - Extensible to PostgreSQL, MongoDB, Redis

3. **Vector Search System** (Semantic discovery)
   - `vector_generator.py` - Uses sentence-transformers for embedding generation
   - `vector_store.py` - FAISS-based vector storage with similarity search
   - `vector_enhanced_storage.py` - Information-theoretic composite scoring for agent-level search
   - Default model: `all-MiniLM-L6-v2` (384 dimensions)

4. **Configuration** (`config.py`)
   - Centralized configuration management
   - Environment variable support

### Key Design Patterns

**Storage Backend Pattern**: All storage implementations inherit from `StorageBackend` abstract class, enabling easy swapping of backends without changing business logic.

**Vector Enhancement Wrapper**: `VectorEnhancedStorage` wraps any `StorageBackend` to add semantic search capabilities transparently, following the decorator pattern.

**Multi-Phase Vector Search**:
1. Candidate generation (broad search)
2. Agent profiling (collect all matches per agent)
3. Information-theoretic composite scoring (aggregate multiple vector matches)

**Extension Provenance Tracking**: `ExtensionInfo` class tracks which agents declare each extension, first declaration time, trust levels, and usage counts.

## Protocol Buffer Generation

Protocol buffers are defined in `third_party/` submodules:
- `third_party/a2a/` - A2A protocol specifications
- `third_party/api-common-protos/` - Google API common protos

Generated Python code is in `src/a2a_registry/proto/generated/`:
- `registry_pb2.py` / `registry_pb2_grpc.py` - Registry service definitions
- `a2a_pb2.py` / `a2a_pb2_grpc.py` - A2A protocol definitions

**After modifying .proto files, always regenerate**: `make proto`

## Vector Search and Competencies

The registry supports semantic agent discovery through vector embeddings:

### Vector Generation
- **Agent-level vectors**: Generated from agent description, skills, and competencies
- **Query vectors**: Generated on-demand from natural language search queries
- **Composite scoring**: Agents with multiple vector matches are scored using information-theoretic aggregation

### Competencies Model
- Structured representation of agent capabilities with confidence scores (0.0-1.0)
- Support for competency metadata (category, verification source)
- Assessment sources: self-assessment, peer review, automated, verified

See `docs/COMPETENCIES_AND_VECTOR_SEARCH.md` for detailed design.

## GraphQL API

GraphQL support is optional (enabled by default if dependencies are installed):
- Schema: `src/a2a_registry/graphql/schema.py`
- Resolvers: `src/a2a_registry/graphql/resolvers.py`
- Types: `src/a2a_registry/graphql/types.py`
- Security: JWT-based authentication in `graphql/security.py`
- DataLoaders: Batch loading to prevent N+1 queries (`graphql/dataloaders.py`)

GraphQL endpoint: `/graphql` (with GraphiQL interface in development mode)

## Testing Strategy

### Test Organization
- `tests/test_basic.py` - Core functionality tests
- `tests/test_server.py` - FastAPI server integration tests
- `tests/test_jsonrpc.py` - JSON-RPC protocol tests
- `tests/test_vector_*.py` - Vector search functionality tests
- `tests/test_agent_extension.py` - Extension system tests
- `tests/fixtures/` - Test data (historical agent cards)

### Test Configuration
Tests use `pytest` with asyncio support enabled. See `[tool.pytest.ini_options]` in `pyproject.toml`.

**Coverage target**: Minimum 80%, target 90%+ for core modules.

## Code Style and Standards

- **Formatter**: Black (line length: 88)
- **Linter**: Ruff (configured in `pyproject.toml`)
- **Type Checker**: MyPy (Python 3.11, strict mode with exclusions for generated code)
- **Pre-commit hooks**: Installed via `make setup` or `pre-commit install`

### Important Exclusions
Generated code is excluded from linting and type checking:
- `src/a2a_registry/proto/generated/*`
- `third_party/*`

## Environment Variables

Development environment variables can be set in `.env` file:

```bash
A2A_REGISTRY_HOST=0.0.0.0
A2A_REGISTRY_PORT=8000
A2A_REGISTRY_DEBUG=true
A2A_REGISTRY_LOG_LEVEL=DEBUG
```

## Common Development Workflows

### Adding a New Storage Backend

1. Create new class inheriting from `StorageBackend` in `storage.py`
2. Implement all abstract methods: `register_agent`, `get_agent`, `list_agents`, `unregister_agent`, `search_agents`
3. Optionally wrap with `VectorEnhancedStorage` for semantic search
4. Add configuration in `config.py`
5. Write integration tests in `tests/`

### Adding a New Search Method

1. Extend search criteria in `proto/registry.proto` if needed
2. Regenerate protos: `make proto`
3. Implement search logic in storage backend
4. Add corresponding JSON-RPC method in `jsonrpc_server.py`
5. Add REST endpoint in `server.py`
6. Update GraphQL schema and resolvers if applicable
7. Write tests covering the new search method

### Modifying Vector Search Behavior

Vector search logic is centralized in `vector_enhanced_storage.py`:
- Adjust similarity thresholds in `search_agents_vector` method
- Modify composite scoring algorithm (currently uses max score per agent)
- Change embedding model in `VectorGenerator` initialization

## Deployment

### Docker Build
```bash
docker build -f deploy/Dockerfile -t a2a-registry:latest .
```

### Kubernetes
Deployment manifests are in `deploy/k8s/`:
- `deployment.yaml` - Main deployment configuration
- `monitoring.yaml` - Observability setup

### Cloud Deployment
See `deploy/README.md` and `deploy/DEPLOYMENT_GUIDE.md` for:
- GCP deployment via Cloud Build
- Kubernetes setup
- DNS and TLS configuration
- Secrets management

## Security Considerations

- **Development Mode**: Open access, no authentication
- **Production Mode**: JWT-based authentication, RBAC
- **Extension Trust Levels**: UNVERIFIED, VERIFIED, OFFICIAL
- **Agent Card Validation**: Required fields enforced in `server.py`

GraphQL security is handled in `graphql/security.py` with configurable authentication.

## Dependencies

### Core Runtime
- `fastapi` - Web framework for REST API
- `fasta2a` - A2A protocol schemas and utilities
- `uvicorn` - ASGI server
- `grpcio` / `grpcio-tools` - gRPC support
- `jsonrpcserver` - JSON-RPC 2.0 implementation
- `strawberry-graphql[fastapi]` - GraphQL API

### Vector Search
- `sentence-transformers` - Embedding generation
- `faiss-cpu` - Vector similarity search
- `numpy` - Numerical operations

### Development
- `black` - Code formatter
- `ruff` - Fast Python linter
- `mypy` - Static type checker
- `pytest` + `pytest-asyncio` + `pytest-cov` - Testing framework
- `pre-commit` - Git hooks management

## Troubleshooting

### Protocol Buffer Compilation Errors
```bash
# Clean and regenerate
rm -rf src/a2a_registry/proto/generated/*
make proto
```

### Missing Submodules
```bash
git submodule update --init --recursive
```

### Import Errors
```bash
# Ensure package is installed in editable mode
pip install -e .
# Or add to PYTHONPATH
export PYTHONPATH=src:$PYTHONPATH
```

### Vector Search Not Working
Ensure vector dependencies are installed: `pip install sentence-transformers faiss-cpu numpy`

## Documentation

- **Full Docs**: https://allenday.github.io/a2a-registry/
- **API Reference**: `/docs/documentation/api/reference.md`
- **Architecture**: `/docs/documentation/concepts/architecture.md`
- **Testing Guide**: `/docs/documentation/developer/testing.md`
- **Setup Guide**: `/docs/documentation/developer/setup.md`
- **GraphQL Architecture**: `/docs/graphql_architecture.md`
- **Vector Search Design**: `/docs/COMPETENCIES_AND_VECTOR_SEARCH.md`

## Important File Locations

- **Entry Points**: `src/a2a_registry/cli.py` (CLI), `src/a2a_registry/server.py` (FastAPI app)
- **Configuration**: `src/a2a_registry/config.py`
- **Storage**: `src/a2a_registry/storage.py`, `src/a2a_registry/vector_enhanced_storage.py`
- **Vector Components**: `src/a2a_registry/vector_generator.py`, `src/a2a_registry/vector_store.py`
- **Protocol Buffers**: `third_party/a2a/`, generated in `src/a2a_registry/proto/generated/`
- **GraphQL**: `src/a2a_registry/graphql/` directory
- **Tests**: `tests/` directory
- **Build Config**: `pyproject.toml`, `Makefile`
