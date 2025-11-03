# A2A Registry

[![CI](https://github.com/allenday/a2a-registry/workflows/CI/badge.svg)](https://github.com/allenday/a2a-registry/actions)
[![Python Version](https://img.shields.io/badge/python-3.9%2B-blue)](https://www.python.org/downloads/)
[![PyPI Version](https://img.shields.io/pypi/v/a2a-registry.svg)](https://pypi.org/project/a2a-registry/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## Production-Ready Agent Discovery Platform

A2A Registry is the definitive solution for agent discovery, registration, and management in distributed Agent-to-Agent (A2A) networks. Built on **A2A Protocol v0.3.0** and FastA2A standards, it provides a robust, scalable infrastructure for dynamic agent ecosystems.

### Version Information
- **Current Version**: 0.1.5
- **Protocol Version**: A2A Protocol v0.3.0
- **Status**: Production-Ready
- **Web Interface**: Available ✨

### Key Highlights
- 🌐 **Modern Web Interface** - React-based UI for easy agent management
- 🔍 **Universal Agent Coordination** - Seamless multi-agent discovery
- 🔌 **Multi-Protocol Support** - JSON-RPC 2.0, REST, GraphQL, gRPC
- ⚡ **High-Performance Architecture** - Fast and scalable
- 🔒 **Comprehensive Security Model** - JWT authentication and RBAC
- 🧩 **Flexible Extension System** - Easily extensible
- 🔎 **Vector Search** - Semantic agent discovery with embeddings

## Quick Start

### Prerequisites
- Python 3.9+
- pip package manager
- Node.js 18+ and npm (for web interface)

### Installation

#### Backend Server
```bash
pip install a2a-registry
```

#### Web Interface (Optional)
```bash
cd frontend
npm install
```

### Running the Application

#### Option 1: Backend Only
```bash
# Start with default configuration
a2a-registry serve

# Custom configuration
a2a-registry serve --host 0.0.0.0 --port 8000 --log-level DEBUG
```

#### Option 2: Full Stack (Backend + Web Interface)

**Terminal 1 - Start Backend:**
```bash
a2a-registry serve --host 0.0.0.0 --port 8000
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
```

Then open your browser to **http://localhost:5173** 🎉

### Web Interface Features

The web interface provides:
- 🔍 **Agent Discovery** - Browse and search registered agents with real-time filtering
- ➕ **Easy Registration** - Intuitive form to register new agents with skills
- 📊 **Agent Details** - Comprehensive view of agent capabilities and metadata
- 🏥 **Health Monitoring** - Real-time server status and diagnostics
- 🎨 **Modern UI** - Dark theme, responsive design with Tailwind CSS

**Quick Demo:**
1. Start both backend and frontend servers
2. Visit http://localhost:5173
3. Click "Browse Agents" to see sample agents
4. Try "Register Agent" to add your own agent
5. Use the search to filter agents by name or skills

#### Agent Registration
```python
from a2a_registry import A2ARegistryClient

# Initialize client
client = A2ARegistryClient('http://localhost:8000')

# Define and register agent
weather_agent = {
    "name": "weather-agent",
    "description": "Provides real-time weather information",
    "version": "0.420.0",
    "protocol_version": "0.3.0",
    "preferred_transport": "JSONRPC",
    "skills": [
        {"id": "get_current_weather", "description": "Current weather data"},
        {"id": "get_forecast", "description": "7-day weather forecast"}
    ]
}

# Register agent
client.register_agent(weather_agent)

# Discover agents
forecast_agents = client.search_agents(skills=['get_forecast'])
```

## Project Structure

```
a2a-registry/
├── frontend/                    # Web Interface (React + TypeScript)
│   ├── src/
│   │   ├── pages/              # Home, AgentList, AgentDetail, Register, Health
│   │   ├── components/         # Layout, Navigation
│   │   ├── api/                # Backend API client
│   │   └── types/              # TypeScript definitions
│   └── README.md               # Frontend documentation
├── src/a2a_registry/           # Backend (Python FastAPI)
│   ├── server.py               # REST API & CORS
│   ├── jsonrpc_server.py       # JSON-RPC implementation
│   ├── graphql/                # GraphQL API
│   ├── storage.py              # Storage backends
│   ├── vector_*.py             # Vector search
│   └── proto/                  # Protocol buffers
├── tests/                      # Test suite
├── docs/                       # Documentation
├── CLAUDE.md                   # Backend development guide
└── FRONTEND_SETUP_GUIDE.md     # Frontend setup guide (Korean)
```

## Documentation

### Quick References
- 📖 [Frontend Setup Guide](FRONTEND_SETUP_GUIDE.md) - 프론트엔드 설치 및 사용법 (한글)
- 💻 [Backend Development Guide](CLAUDE.md) - Backend architecture and development
- 🌐 [Frontend README](frontend/README.md) - Frontend technical documentation

### Comprehensive Docs
- [Full Documentation](https://allenday.github.io/a2a-registry/)
- [Getting Started Guide](/docs/documentation/getting-started/quickstart.md)
- [API Reference](/docs/documentation/api/reference.md)
- [Architecture Overview](/docs/documentation/concepts/architecture.md)
- [Testing Guide](/docs/documentation/developer/testing.md)

## Supported Protocols
- JSON-RPC 2.0 (Primary)
- REST API
- GraphQL
- gRPC (Experimental)

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on how to get started.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Tech Stack

### Backend
- **FastAPI** - High-performance Python web framework
- **FastA2A** - A2A Protocol implementation
- **Uvicorn** - ASGI server
- **Strawberry GraphQL** - GraphQL API
- **Sentence Transformers** - Vector embeddings
- **FAISS** - Vector similarity search

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS
- **Axios** - HTTP client
- **Lucide React** - Icon library

## Screenshots

### Home Page
Modern landing page with feature highlights and quick navigation.

### Agent List
Browse all registered agents with real-time search and filtering capabilities.

### Agent Registration
Intuitive form interface for registering new agents with dynamic skill management.

### Agent Details
Comprehensive view of agent information, skills, capabilities, and extensions.

## Development

### Backend Development
```bash
# Install development dependencies
make install-dev

# Run tests
make test

# Run linting and type checking
make lint
make typecheck

# Format code
make format
```

### Frontend Development
```bash
cd frontend

# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## API Examples

### REST API
```bash
# List all agents
curl http://localhost:8000/agents

# Register an agent
curl -X POST http://localhost:8000/agents \
  -H "Content-Type: application/json" \
  -d '{"agent_card": {...}}'

# Search agents
curl -X POST http://localhost:8000/agents/search \
  -H "Content-Type: application/json" \
  -d '{"query": "weather"}'
```

### Web Interface
Simply open http://localhost:5173 in your browser for a graphical interface to:
- Browse and search agents
- Register new agents
- View agent details
- Monitor server health

## Troubleshooting

### Backend Issues
```bash
# Check server health
curl http://localhost:8000/health

# View server logs
# Logs are displayed in the terminal where you ran `a2a-registry serve`

# Restart server
# Press Ctrl+C to stop, then run again
a2a-registry serve --host 0.0.0.0 --port 8000
```

### Frontend Issues
```bash
# Check if backend is running
curl http://localhost:8000/health

# Clear npm cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install

# Check frontend is accessible
curl http://localhost:5173
```

### CORS Issues
CORS is already configured in the backend (`server.py`). If you still have issues:
1. Verify backend is running on port 8000
2. Check `.env` file in frontend directory has correct `VITE_API_URL`
3. Check browser console for detailed error messages

## Acknowledgments
- [A2A Protocol Specification](https://a2a-protocol.org)
- [FastA2A](https://github.com/a2aproject/FastA2A)
- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Built for the Future of Agent Ecosystems** 🚀

**Full Stack Implementation**: Backend (Python) + Frontend (React) for complete agent registry solution.