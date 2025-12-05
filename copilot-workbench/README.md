# CopilotKit Workbench

Minimal Next.js application for testing A2A agents with CopilotKit UI.

## Features

- 🪁 CopilotKit Chat UI
- 🔌 AG-UI Protocol integration
- 🎯 Direct connection to FastAPI backend
- 🎨 Tailwind CSS styling

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local`:
```bash
cp .env.local.example .env.local
```

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Usage

Navigate to `/workbench/[agentName]` to chat with an agent.

Example: `http://localhost:3000/workbench/secure_coding_consultant`

## Docker

Build and run with Docker:

```bash
docker build -t copilot-workbench .
docker run -p 3000:3000 -e BACKEND_URL=http://backend:8000 copilot-workbench
```

## Architecture

```
CopilotKit (React) → Next.js API Route → HttpAgent → FastAPI (AG-UI endpoint)
```

The Next.js API route acts as a bridge between CopilotKit's GraphQL protocol and the FastAPI AG-UI SSE endpoint.
