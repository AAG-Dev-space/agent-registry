export interface AgentSkill {
  id: string;
  description: string;
  parameters?: Record<string, any>;
}

export interface AgentCapabilities {
  skills?: AgentSkill[];
  extensions?: Array<{
    uri: string;
    description?: string;
    required?: boolean;
  }>;
  protocols?: string[];
}

export interface HealthStatus {
  status: 'active' | 'inactive' | 'deprecated' | 'unknown';
  last_check_at: string | null;
  failure_count: number;
}

export interface AgentCard {
  name: string;
  description: string;
  url: string;
  version: string;
  protocol_version: string;
  preferred_transport?: string;
  capabilities?: AgentCapabilities;
  skills?: AgentSkill[];
  metadata?: Record<string, any>;
  health_status?: HealthStatus;
}

export interface RegisterAgentRequest {
  agent_card: AgentCard;
}

export interface AgentSearchRequest {
  query: string;
}

export interface AgentSearchResponse {
  agents: AgentCard[];
  count: number;
}
