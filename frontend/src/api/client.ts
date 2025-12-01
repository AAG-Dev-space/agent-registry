import axios from 'axios';
import type { AgentCard, AgentSearchRequest, AgentSearchResponse } from '../types/agent';

// Use /api for Docker deployment (proxied by nginx)
// Set VITE_API_URL environment variable for different backends
const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const agentApi = {
  // Register a new agent (direct JSON)
  registerAgent: async (agentCard: AgentCard): Promise<AgentCard> => {
    const response = await apiClient.post<AgentCard>('/v1/agents', agentCard);
    return response.data;
  },

  // Register agent by URL
  registerAgentByUrl: async (agentCardUrl: string): Promise<{ success: boolean; agent_id: string }> => {
    const response = await apiClient.post<{ success: boolean; agent_id: string }>('/v1/agents/register-by-url', {
      agent_card_url: agentCardUrl,
    });
    return response.data;
  },

  // Verify AgentCard URL
  verifyAgentCardUrl: async (url: string): Promise<{
    success: boolean;
    agent_card?: AgentCard;
    error?: string;
    validation_errors?: string[];
    response_time_ms?: number;
  }> => {
    const response = await apiClient.post('/v1/agents/verify', {
      url,
    });
    return response.data;
  },

  // Get all agents
  listAgents: async (): Promise<AgentCard[]> => {
    const response = await apiClient.get<{ agents: AgentCard[]; count: number }>('/v1/agents');
    return response.data.agents;
  },

  // Get agent by ID
  getAgent: async (agentId: string): Promise<AgentCard> => {
    const response = await apiClient.get<AgentCard>(`/v1/agents/${agentId}`);
    return response.data;
  },

  // Search agents
  searchAgents: async (query: string): Promise<AgentCard[]> => {
    const response = await apiClient.post<AgentSearchResponse>('/v1/agents/search', {
      query,
    } as AgentSearchRequest);
    return response.data.agents;
  },

  // Delete agent
  deleteAgent: async (agentId: string, token?: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete<{ success: boolean }>(`/v1/agents/${agentId}`, {
      headers: token ? { 'x-registry-token': token } : {},
    });
    return response.data;
  },

  // Sync agent card
  refreshAgentCard: async (agentId: string): Promise<AgentCard> => {
    const response = await apiClient.post<AgentCard>(`/v1/agents/${agentId}/sync`);
    return response.data;
  },
};

// Workbench API types
export interface ChatSession {
  session_id: string;
  agent_name: string;
  created_at: string;
  last_message_at: string;
  message_count: number;
  first_message_preview?: string;
}

export interface ChatMessage {
  message_id: string;
  session_id: string;
  role: 'user' | 'agent' | 'system';
  content: {
    text: string;
    error?: boolean;
  };
  created_at: string;
}

// Agent Loader API types
export interface AgentInstance {
  instance_id: string;  // Changed from 'id' to match backend schema
  agent_name: string;
  docker_image: string;
  container_id: string;
  container_name: string;
  port: number;
  internal_port: number;
  status: string;
  docker_status?: string;
  env_vars: Record<string, string>;
  llm_model?: string;
  llm_api_base?: string;
  llm_api_key?: string;
  created_at: string;
  started_at?: string;
  stopped_at?: string;
}

export interface StartInstanceRequest {
  docker_image: string;
  agent_name?: string;
  port?: number;
  env_vars?: Record<string, string>;
  internal_port?: number;
}

export const agentLoaderApi = {
  // Start new instance
  startInstance: async (request: StartInstanceRequest): Promise<AgentInstance> => {
    const response = await apiClient.post<AgentInstance>('/v1/agent-loader/start', request);
    return response.data;
  },

  // List instances
  listInstances: async (params?: {
    agent_name?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ instances: AgentInstance[]; total: number }> => {
    const response = await apiClient.get('/v1/agent-loader/instances', { params });
    return response.data;
  },

  // Get instance by ID
  getInstance: async (instanceId: string): Promise<AgentInstance> => {
    const response = await apiClient.get<AgentInstance>(`/v1/agent-loader/instances/${instanceId}`);
    return response.data;
  },

  // Stop instance
  stopInstance: async (instanceId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(`/v1/agent-loader/instances/${instanceId}/stop`);
    return response.data;
  },

  // Delete instance
  deleteInstance: async (instanceId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/v1/agent-loader/instances/${instanceId}`);
    return response.data;
  },

  // Get instance logs
  getLogs: async (instanceId: string, tail?: number): Promise<{ logs: string }> => {
    const response = await apiClient.get(`/v1/agent-loader/instances/${instanceId}/logs`, {
      params: { tail },
    });
    return response.data;
  },
};

// Docker Registry API types
export interface DockerRepository {
  repository: string;
  tags: string[];
  image_count: number;
}

export const dockerRegistryApi = {
  // List all repositories
  listRepositories: async (): Promise<{ repositories: string[] }> => {
    const response = await apiClient.get<{ repositories: string[] }>('/v1/docker-registry/repositories');
    return response.data;
  },

  // List tags for a specific repository
  listTags: async (repository: string): Promise<{ name: string; tags: string[] | null }> => {
    const response = await apiClient.get<{ name: string; tags: string[] | null }>(
      `/v1/docker-registry/repositories/${repository}/tags`
    );
    return response.data;
  },

  // List all images with their tags
  listImages: async (): Promise<DockerRepository[]> => {
    const response = await apiClient.get<DockerRepository[]>('/v1/docker-registry/images');
    return response.data;
  },
};

export const workbenchApi = {
  // List all sessions for an agent
  listSessions: async (agentName: string): Promise<ChatSession[]> => {
    const response = await apiClient.get<ChatSession[]>(`/v1/workbench/agents/${agentName}/sessions`);
    return response.data;
  },

  // Create new chat session
  createSession: async (agentName: string): Promise<ChatSession> => {
    const response = await apiClient.post<ChatSession>('/v1/workbench/sessions', {
      agent_name: agentName,
    });
    return response.data;
  },

  // Get session details
  getSession: async (sessionId: string): Promise<ChatSession> => {
    const response = await apiClient.get<ChatSession>(`/v1/workbench/sessions/${sessionId}`);
    return response.data;
  },

  // Send message to agent
  sendMessage: async (sessionId: string, content: string): Promise<[ChatMessage, ChatMessage]> => {
    const response = await apiClient.post<[ChatMessage, ChatMessage]>(
      `/v1/workbench/sessions/${sessionId}/messages`,
      { content }
    );
    return response.data;
  },

  // Get chat history
  getHistory: async (sessionId: string): Promise<{messages: ChatMessage[]}> => {
    const response = await apiClient.get<{messages: ChatMessage[]}>(
      `/v1/workbench/sessions/${sessionId}/history`
    );
    return response.data;
  },

  // Delete session
  deleteSession: async (sessionId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete<{ success: boolean }>(
      `/v1/workbench/sessions/${sessionId}`
    );
    return response.data;
  },
};

export default apiClient;
