import { HttpAgent } from "@ag-ui/client";
import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";

// Get backend URL from environment or default to localhost
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:7601";

// Next.js API Route handler
export const POST = async (req: NextRequest) => {
  // Get agent name from query parameter
  const agentName = req.nextUrl.searchParams.get("agent");

  if (!agentName) {
    return new Response(
      JSON.stringify({ error: "Missing 'agent' query parameter" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // AG-UI endpoint (query param may not be preserved by HttpAgent)
  const aguiEndpoint = `${BACKEND_URL}/api/v1/agui/run`;

  // Create HttpAgent for this specific agent with custom headers
  const a2aAgent = new HttpAgent({
    url: aguiEndpoint,
    // Add agent name as custom header
    headers: {
      'X-Agent-Name': agentName,
    },
  });

  // Create CopilotRuntime with the AG-UI agent
  const runtime = new CopilotRuntime({
    agents: {
      a2aAgent,
    },
  });

  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter: new ExperimentalEmptyAdapter(),
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
