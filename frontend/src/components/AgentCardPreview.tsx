import type { AgentCard } from '../types/agent';

interface AgentCardPreviewProps {
  agentCard: AgentCard;
}

export default function AgentCardPreview({ agentCard }: AgentCardPreviewProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <h2 className="text-base font-medium text-gray-900 mb-5">AgentCard Preview</h2>

      <div className="space-y-4">
        {/* Basic Info */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Basic Information</h3>
          <div className="space-y-2">
            <div className="flex">
              <span className="text-sm text-gray-500 w-32">Name:</span>
              <span className="text-sm text-gray-900 font-medium">{agentCard.name}</span>
            </div>
            <div className="flex">
              <span className="text-sm text-gray-500 w-32">Description:</span>
              <span className="text-sm text-gray-900">{agentCard.description}</span>
            </div>
            {agentCard.url && (
              <div className="flex">
                <span className="text-sm text-gray-500 w-32">URL:</span>
                <span className="text-sm text-gray-900 truncate">{agentCard.url}</span>
              </div>
            )}
            {agentCard.version && (
              <div className="flex">
                <span className="text-sm text-gray-500 w-32">Version:</span>
                <span className="text-sm text-gray-900">{agentCard.version}</span>
              </div>
            )}
          </div>
        </div>

        {/* Skills */}
        {agentCard.skills && agentCard.skills.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Skills ({agentCard.skills.length})</h3>
            <div className="space-y-2">
              {agentCard.skills.map((skill, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{skill.name || skill.id}</p>
                  <p className="text-xs text-gray-500 mt-1">{skill.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* A2A Protocol */}
        {agentCard.protocol_version && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">A2A Protocol</h3>
            <div className="space-y-2">
              <div className="flex">
                <span className="text-sm text-gray-500 w-32">Protocol Version:</span>
                <span className="text-sm text-gray-900">{agentCard.protocol_version}</span>
              </div>
              {agentCard.preferred_transport && (
                <div className="flex">
                  <span className="text-sm text-gray-500 w-32">Transport:</span>
                  <span className="text-sm text-gray-900">{agentCard.preferred_transport}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Capabilities */}
        {agentCard.capabilities && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Capabilities</h3>
            <div className="flex flex-wrap gap-2">
              {agentCard.capabilities.streaming && (
                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">Streaming</span>
              )}
              {agentCard.capabilities.push_notifications && (
                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">Push Notifications</span>
              )}
              {agentCard.capabilities.state_transition_history && (
                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">State History</span>
              )}
            </div>
          </div>
        )}

        {/* Metadata */}
        {agentCard.metadata && Object.keys(agentCard.metadata).length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Metadata</h3>
            <div className="space-y-2">
              {agentCard.metadata.platform && (
                <div className="flex">
                  <span className="text-sm text-gray-500 w-32">Platform:</span>
                  <span className="text-sm text-gray-900">{agentCard.metadata.platform}</span>
                </div>
              )}
              {agentCard.metadata.a2a_endpoint && (
                <div className="flex">
                  <span className="text-sm text-gray-500 w-32">A2A Endpoint:</span>
                  <span className="text-sm text-gray-900 truncate">{agentCard.metadata.a2a_endpoint}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
