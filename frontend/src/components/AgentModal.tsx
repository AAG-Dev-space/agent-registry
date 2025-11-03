import { X, ExternalLink, Code, Zap, Shield, Package, Trash2 } from 'lucide-react';
import type { AgentCard } from '../types/agent';

interface AgentModalProps {
  agent: AgentCard;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: () => void;
}

export default function AgentModal({ agent, isOpen, onClose, onDelete }: AgentModalProps) {
  if (!isOpen) return null;

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-purple-500 to-purple-600',
      'bg-gradient-to-br from-green-500 to-green-600',
      'bg-gradient-to-br from-orange-500 to-orange-600',
      'bg-gradient-to-br from-pink-500 to-pink-600',
      'bg-gradient-to-br from-indigo-500 to-indigo-600',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getInitials = (name: string) => {
    return name
      .split('-')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getProtocolColor = (protocol: string) => {
    const colors: Record<string, string> = {
      JSONRPC: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      REST: 'bg-green-500/10 text-green-400 border-green-500/20',
      GRAPHQL: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      GRPC: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    };
    return colors[protocol] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 border-b border-slate-700/50 p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>

          {/* Agent Header */}
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div
              className={`flex-shrink-0 w-20 h-20 ${getAvatarColor(agent.name)} rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg`}
            >
              {getInitials(agent.name)}
            </div>

            {/* Title and Meta */}
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-white mb-2">{agent.name}</h2>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-2.5 py-1 bg-slate-700/50 text-slate-300 text-sm rounded-md">
                  v{agent.version}
                </span>
                <span className="px-2.5 py-1 bg-slate-700/50 text-slate-300 text-sm rounded-md">
                  A2A {agent.protocol_version}
                </span>
                {agent.preferred_transport && (
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium border ${getProtocolColor(agent.preferred_transport)}`}
                  >
                    <Code size={14} />
                    {agent.preferred_transport}
                  </div>
                )}
              </div>
              <a
                href={agent.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                <ExternalLink size={14} />
                {agent.url}
              </a>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Package size={18} className="text-blue-400" />
              Description
            </h3>
            <p className="text-slate-300 leading-relaxed">{agent.description}</p>
          </div>

          {/* Skills */}
          {agent.skills && agent.skills.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Zap size={18} className="text-yellow-400" />
                Skills ({agent.skills.length})
              </h3>
              <div className="space-y-3">
                {agent.skills.map((skill, index) => (
                  <div
                    key={index}
                    className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-white font-medium">{skill.id}</h4>
                    </div>
                    <p className="text-slate-400 text-sm">{skill.description}</p>
                    {skill.parameters && Object.keys(skill.parameters).length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-700/50">
                        <p className="text-xs text-slate-500 mb-2">Parameters:</p>
                        <pre className="text-xs text-slate-300 bg-slate-900/50 p-2 rounded overflow-x-auto">
                          {JSON.stringify(skill.parameters, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Capabilities */}
          {agent.capabilities && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Shield size={18} className="text-green-400" />
                Capabilities
              </h3>

              {agent.capabilities.extensions && agent.capabilities.extensions.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-slate-400 mb-2">
                    Extensions ({agent.capabilities.extensions.length})
                  </h4>
                  <div className="space-y-2">
                    {agent.capabilities.extensions.map((ext, index) => (
                      <div
                        key={index}
                        className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-sm text-blue-400 font-mono">{ext.uri}</code>
                          {ext.required && (
                            <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 text-xs rounded border border-orange-500/20">
                              Required
                            </span>
                          )}
                        </div>
                        {ext.description && (
                          <p className="text-slate-400 text-sm">{ext.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {agent.capabilities.protocols && agent.capabilities.protocols.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-2">
                    Supported Protocols
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {agent.capabilities.protocols.map((protocol, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-slate-700/50 text-slate-300 text-sm rounded-md border border-slate-600/50"
                      >
                        {protocol}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Metadata */}
          {agent.metadata && Object.keys(agent.metadata).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Metadata</h3>
              <pre className="text-sm text-slate-300 bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 overflow-x-auto">
                {JSON.stringify(agent.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        {onDelete && (
          <div className="border-t border-slate-700/50 p-4 bg-slate-800/30">
            <button
              onClick={onDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              <Trash2 size={16} />
              Delete Agent
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
