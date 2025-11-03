import { useState } from 'react';
import { ExternalLink, Code, Zap, Shield, CheckCircle, X } from 'lucide-react';
import type { AgentCard as AgentCardType } from '../types/agent';

interface AgentCardProps {
  agent: AgentCardType;
  onClick?: () => void;
}

export default function AgentCard({ agent, onClick }: AgentCardProps) {
  const [imageError, setImageError] = useState(false);

  // Generate avatar from agent name
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
      onClick={onClick}
      className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-slate-600 hover:bg-slate-800/70 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500 rounded-xl" />

      <div className="relative">
        {/* Header with Avatar and Title */}
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar */}
          <div
            className={`flex-shrink-0 w-14 h-14 ${getAvatarColor(agent.name)} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg`}
          >
            {getInitials(agent.name)}
          </div>

          {/* Title and Version */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
              {agent.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-400">v{agent.version}</span>
              <span className="text-xs text-slate-600">•</span>
              <span className="text-xs text-slate-400">A2A {agent.protocol_version}</span>
            </div>
          </div>

          {/* Protocol Badge */}
          {agent.preferred_transport && (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${getProtocolColor(agent.preferred_transport)}`}
            >
              <Code size={12} />
              {agent.preferred_transport}
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-slate-300 text-sm mb-4 line-clamp-2 leading-relaxed">
          {agent.description}
        </p>

        {/* Skills Section */}
        {agent.skills && agent.skills.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} className="text-yellow-400" />
              <span className="text-xs font-medium text-slate-400">
                Skills ({agent.skills.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {agent.skills.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-md border border-slate-600/30"
                >
                  {skill.id}
                </span>
              ))}
              {agent.skills.length > 3 && (
                <span className="px-2 py-1 bg-slate-700/30 text-slate-400 text-xs rounded-md border border-slate-600/20">
                  +{agent.skills.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Capabilities */}
        {agent.capabilities && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={14} className="text-green-400" />
              <span className="text-xs font-medium text-slate-400">Capabilities</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {agent.capabilities.extensions && agent.capabilities.extensions.length > 0 && (
                <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-md border border-green-500/20 flex items-center gap-1">
                  <CheckCircle size={10} />
                  {agent.capabilities.extensions.length} extensions
                </span>
              )}
              {agent.capabilities.protocols && agent.capabilities.protocols.length > 0 && (
                <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-md border border-blue-500/20">
                  {agent.capabilities.protocols.length} protocols
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer with URL */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
          <a
            href={agent.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 transition-colors truncate max-w-[70%]"
          >
            <ExternalLink size={12} />
            <span className="truncate">{new URL(agent.url).hostname}</span>
          </a>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            View Details →
          </button>
        </div>
      </div>

      {/* Hover glow effect */}
      <div className="absolute -inset-px bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
    </div>
  );
}
