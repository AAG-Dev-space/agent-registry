import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, AlertCircle, Bot, Wrench, Database, ArrowRight } from 'lucide-react';
import { agentApi } from '../api/client';
import type { AgentCard as AgentCardType } from '../types/agent';

export default function AgentList() {
  const [agents, setAgents] = useState<AgentCardType[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<AgentCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>('');

  // Extract unique tags from agents
  const tags = Array.from(new Set(agents.flatMap(agent =>
    agent.skills?.map(skill => skill.name) || []
  )));

  useEffect(() => {
    loadAgents();
  }, []);

  useEffect(() => {
    let filtered = [...agents];

    // Apply tag filter
    if (selectedTag) {
      filtered = filtered.filter(
        (agent) => agent.skills?.some(skill => skill.name === selectedTag)
      );
    }

    setFilteredAgents(filtered);
  }, [selectedTag, agents]);

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

  const getIconForAgent = (name: string) => {
    const iconProps = { className: "h-6 w-6 text-gray-800" };

    const lowerName = name.toLowerCase();
    if (lowerName.includes('database') || lowerName.includes('db') || lowerName.includes('supabase') || lowerName.includes('prometheus')) {
      return <Database {...iconProps} />;
    } else if (lowerName.includes('tool') || lowerName.includes('helper') || lowerName.includes('harper')) {
      return <Wrench {...iconProps} />;
    } else if (lowerName.includes('data') || lowerName.includes('open')) {
      return <Database {...iconProps} />;
    }
    return <Bot {...iconProps} />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 md:px-6 max-w-screen-2xl">
        {/* Hero Section */}
        <section className="pt-8 pb-12">
          <div className="max-w-3xl">
            <h1 className="text-title-lg font-bold text-gray-900 mb-4">
              Discover A2A Agents
            </h1>
            <p className="text-theme-xl text-gray-500">
              Browse and discover powerful A2A agents to enhance your AI applications.
            </p>
          </div>
        </section>

        {/* Tag Filter Section */}
        {tags.length > 0 && (
          <section className="pb-8">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag('')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedTag === ''
                    ? 'bg-brand-500 text-white shadow-theme-xs'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                All
              </button>
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedTag === tag
                      ? 'bg-brand-500 text-white shadow-theme-xs'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-brand-500" size={40} />
            <span className="ml-3 text-lg text-gray-500">Loading agents...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-2xl border border-error-200 bg-error-50 p-6 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-error-500" size={24} />
              <div>
                <p className="text-error-700 font-medium">{error}</p>
                <button
                  onClick={loadAgents}
                  className="text-sm text-error-600 hover:text-error-700 underline mt-2"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Agents Grid */}
        {!loading && !error && (
          <section className="pb-12">
            {filteredAgents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg mb-4 text-gray-500">
                  No agents found
                </p>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-6 py-3 text-sm font-medium text-white shadow-theme-sm hover:bg-brand-600 transition-colors"
                >
                  Register First Agent
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredAgents.map((agent) => (
                  <div
                    key={agent.name}
                    className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 transition-all hover:shadow-theme-md group cursor-pointer"
                  >
                    {/* Icon */}
                    <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl mb-5">
                      {getIconForAgent(agent.name)}
                    </div>

                    {/* Agent Name */}
                    <h3 className="text-base font-medium text-gray-900 mb-2">
                      {agent.name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-500 mb-4 line-clamp-3">
                      {agent.description}
                    </p>

                    {/* Tags */}
                    {agent.skills && agent.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {agent.skills.slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                          >
                            {skill.name}
                          </span>
                        ))}
                        {agent.skills.length > 3 && (
                          <span className="px-3 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                            +{agent.skills.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* View Details Link */}
                    <div className="flex items-center gap-2 text-sm font-medium text-brand-500 group-hover:gap-3 transition-all">
                      <span>View details</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
