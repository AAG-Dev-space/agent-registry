import axios from 'axios';
import type { AgentCard, RegisterAgentRequest, AgentSearchRequest, AgentSearchResponse } from '../types/agent';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const agentApi = {
  // Register a new agent
  registerAgent: async (agentCard: AgentCard): Promise<{ success: boolean; agent_id: string }> => {
    const response = await apiClient.post<{ success: boolean; agent_id: string }>('/agents', {
      agent_card: agentCard,
    } as RegisterAgentRequest);
    return response.data;
  },

  // Get all agents
  listAgents: async (): Promise<AgentCard[]> => {
    const response = await apiClient.get<{ agents: AgentCard[]; count: number }>('/agents');
    return response.data.agents;
  },

  // Get agent by ID
  getAgent: async (agentId: string): Promise<AgentCard> => {
    const response = await apiClient.get<{ agent_card: AgentCard }>(`/agents/${agentId}`);
    return response.data.agent_card;
  },

  // Search agents
  searchAgents: async (query: string): Promise<AgentCard[]> => {
    const response = await apiClient.post<AgentSearchResponse>('/agents/search', {
      query,
    } as AgentSearchRequest);
    return response.data.agents;
  },

  // Delete agent
  deleteAgent: async (agentId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete<{ success: boolean }>(`/agents/${agentId}`);
    return response.data;
  },
};

export default apiClient;
