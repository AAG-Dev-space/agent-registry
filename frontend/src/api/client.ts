import axios from 'axios';
import type { AgentCard, RegisterAgentRequest, AgentSearchRequest, AgentSearchResponse } from '../types/agent';

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
  // Register a new agent
  registerAgent: async (agentCard: AgentCard): Promise<{ success: boolean; agent_id: string }> => {
    const response = await apiClient.post<{ success: boolean; agent_id: string }>('/v1/agents', {
      agent_card: agentCard,
    } as RegisterAgentRequest);
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
  deleteAgent: async (agentId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete<{ success: boolean }>(`/v1/agents/${agentId}`);
    return response.data;
  },

  // Sync agent card
  refreshAgentCard: async (agentId: string): Promise<AgentCard> => {
    const response = await apiClient.post<AgentCard>(`/v1/agents/${agentId}/sync`);
    return response.data;
  },
};

export default apiClient;
