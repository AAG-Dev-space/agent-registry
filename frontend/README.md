# A2A Registry Frontend

Modern web interface for the A2A Registry - Agent Discovery Platform.

## Features

- 🔍 **Agent Discovery**: Browse and search registered agents
- ➕ **Agent Registration**: Easy-to-use form for registering new agents
- 📊 **Agent Details**: Comprehensive view of agent capabilities and metadata
- 🏥 **Health Monitoring**: Real-time server health status
- 🎨 **Modern UI**: Dark theme with responsive design using Tailwind CSS

## Tech Stack

- **React 18** with TypeScript
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library

## Prerequisites

- Node.js 18+ and npm
- A2A Registry backend server running on http://localhost:8000

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file or use the default settings:

```bash
cp .env.example .env
```

Edit `.env` to point to your backend server:

```
VITE_API_URL=http://localhost:8000
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at http://localhost:5173

### 4. Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

### 5. Preview Production Build

```bash
npm run preview
```

## Backend Server

Make sure the A2A Registry backend is running:

```bash
# From the project root
cd ..
.venv/bin/a2a-registry serve
```

Or with custom settings:

```bash
.venv/bin/a2a-registry serve --host 0.0.0.0 --port 8000 --log-level DEBUG
```

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── client.ts           # API client for backend communication
│   ├── components/
│   │   └── Layout.tsx          # Main layout with sidebar navigation
│   ├── pages/
│   │   ├── Home.tsx            # Landing page
│   │   ├── AgentList.tsx       # Browse agents with search
│   │   ├── AgentDetail.tsx     # Agent details view
│   │   ├── RegisterAgent.tsx   # Agent registration form
│   │   └── Health.tsx          # Server health monitoring
│   ├── types/
│   │   └── agent.ts            # TypeScript type definitions
│   ├── App.tsx                 # Main app component with routing
│   ├── main.tsx                # Application entry point
│   └── index.css               # Global styles with Tailwind
├── public/                     # Static assets
├── .env                        # Environment variables (not in git)
├── .env.example                # Environment variables template
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite configuration
└── tailwind.config.js          # Tailwind CSS configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features Overview

### Agent List Page
- View all registered agents
- Real-time search by name, description, or skills
- Card-based display with key information
- Quick navigation to agent details

### Agent Registration
- Intuitive form for agent registration
- Dynamic skill addition
- Transport protocol selection
- Form validation
- Success/error feedback

### Agent Details
- Complete agent information
- Skills and capabilities display
- Extension information
- Delete agent functionality

### Health Monitoring
- Real-time backend server status
- Connection troubleshooting
- Server information display
- Available endpoints reference

## API Integration

The frontend communicates with the backend using REST API:

- `GET /agents` - List all agents
- `POST /agents` - Register new agent
- `GET /agents/:id` - Get agent details
- `POST /agents/search` - Search agents
- `DELETE /agents/:id` - Delete agent
- `GET /health` - Health check

## Troubleshooting

### Backend Connection Issues

If you see connection errors:

1. Verify backend server is running: `curl http://localhost:8000/health`
2. Check CORS is enabled in backend (already configured)
3. Verify `VITE_API_URL` in `.env` matches backend URL
4. Check browser console for detailed error messages

### Build Issues

If build fails:

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

## License

MIT - Same as the main A2A Registry project
