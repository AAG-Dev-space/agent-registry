import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Loader2, AlertCircle, ExternalLink, Code } from 'lucide-react';
import { agentApi } from '../api/client';
import type { AgentCard } from '../types/agent';

export default function AgentList() {
  const [agents, setAgents] = useState<AgentCard[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<AgentCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAgents();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = agents.filter(
        (agent) =>
          agent.name.toLowerCase().includes(query) ||
          agent.description.toLowerCase().includes(query) ||
          agent.skills?.some((skill) =>
            skill.description.toLowerCase().includes(query)
          )
      );
      setFilteredAgents(filtered);
    } else {
      setFilteredAgents(agents);
    }
  }, [searchQuery, agents]);

  const loadAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await agentApi.listAgents();
      setAgents(data);
      setFilteredAgents(data);
    } catch (err) {
      setError('Failed to load agents. Make sure the backend server is running.');
      console.error('Error loading agents:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Browse Agents</h1>
          <p className="text-slate-400">
            Discover registered agents and their capabilities
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search agents by name, description, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <span className="ml-3 text-slate-400">Loading agents...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-500" size={20} />
              <div>
                <p className="text-red-400 font-medium">{error}</p>
                <button
                  onClick={loadAgents}
                  className="text-sm text-red-300 hover:text-red-200 underline mt-1"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Agent Count */}
        {!loading && !error && (
          <div className="mb-4 text-slate-400">
            Found {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* Agents Grid */}
        {!loading && !error && filteredAgents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg mb-4">
              {searchQuery ? 'No agents found matching your search' : 'No agents registered yet'}
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Register the first agent
            </Link>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <div
              key={agent.name}
              className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-1">
                    {agent.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span>v{agent.version}</span>
                    <span>•</span>
                    <span>A2A {agent.protocol_version}</span>
                  </div>
                </div>
                <Link
                  to={`/agents/${encodeURIComponent(agent.name)}`}
                  className="text-blue-400 hover:text-blue-300"
                >
                  <ExternalLink size={18} />
                </Link>
              </div>

              <p className="text-slate-300 text-sm mb-4 line-clamp-3">
                {agent.description}
              </p>

              {/* Transport */}
              {agent.preferred_transport && (
                <div className="mb-4">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded">
                    <Code size={12} />
                    {agent.preferred_transport}
                  </span>
                </div>
              )}

              {/* Skills */}
              {agent.skills && agent.skills.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-2">
                    Skills ({agent.skills.length})
                  </h4>
                  <div className="space-y-1">
                    {agent.skills.slice(0, 3).map((skill) => (
                      <div
                        key={skill.id}
                        className="text-sm text-slate-300 truncate"
                      >
                        • {skill.description || skill.id}
                      </div>
                    ))}
                    {agent.skills.length > 3 && (
                      <div className="text-sm text-slate-400">
                        +{agent.skills.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* URL */}
              <div className="mt-4 pt-4 border-t border-slate-700">
                <a
                  href={agent.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:text-blue-300 truncate block"
                >
                  {agent.url}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
