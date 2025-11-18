export interface AgentSkill {
  id: string;
  name: string;
  description: string;
  tags: string[];
  examples?: string[];
  input_modes: string[];
  output_modes: string[];
  parameters?: Record<string, any>;
}

export interface AgentCapabilities {
  streaming?: boolean;
  push_notifications?: boolean;
  state_transition_history?: boolean;
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

export interface HealthCheckConfig {
  url: string;
  timeout?: number;
  expected_status?: number;
}

export interface AgentRegistryConfig {
  allowDelete?: boolean;
}

export interface AgentCard {
  name: string;
  description: string;
  url: string;
  version: string;
  protocol_version: string;
  preferred_transport?: string;
  default_input_modes?: string[];
  default_output_modes?: string[];
  capabilities?: AgentCapabilities;
  skills?: AgentSkill[];
  metadata?: Record<string, any>;
  health_status?: HealthStatus;
  health_check?: HealthCheckConfig;
  agent_card?: Record<string, any>; // Raw AgentCard from backend
  agent_card_url?: string; // URL to fetch AgentCard (for URL-based agents)
  'x-registry'?: AgentRegistryConfig; // Registry extension field
  created_at?: string;
  updated_at?: string;
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
