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

export const workbenchApi = {
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
  getHistory: async (sessionId: string): Promise<ChatMessage[]> => {
    const response = await apiClient.get<ChatMessage[]>(
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
