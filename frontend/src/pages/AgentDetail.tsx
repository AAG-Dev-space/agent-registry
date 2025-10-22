import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, ExternalLink, Code, Trash2 } from 'lucide-react';
import { agentApi } from '../api/client';
import type { AgentCard } from '../types/agent';

export default function AgentDetail() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<AgentCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (agentId) {
      loadAgent();
    }
  }, [agentId]);

  const loadAgent = async () => {
    if (!agentId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await agentApi.getAgent(decodeURIComponent(agentId));
      setAgent(data);
    } catch (err) {
      setError('Failed to load agent details');
      console.error('Error loading agent:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!agentId || !confirm('Are you sure you want to delete this agent?')) return;

    try {
      setDeleting(true);
      await agentApi.deleteAgent(decodeURIComponent(agentId));
      navigate('/agents');
    } catch (err) {
      alert('Failed to delete agent');
      console.error('Error deleting agent:', err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <span className="ml-3 text-slate-400">Loading agent details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-500" size={20} />
              <div>
                <p className="text-red-400 font-medium">{error || 'Agent not found'}</p>
                <Link to="/agents" className="text-sm text-red-300 hover:text-red-200 underline mt-1">
                  Back to agents list
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/agents"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to agents
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{agent.name}</h1>
              <div className="flex items-center gap-3 text-slate-400">
                <span>Version {agent.version}</span>
                <span>•</span>
                <span>A2A Protocol {agent.protocol_version}</span>
                {agent.preferred_transport && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Code size={14} />
                      {agent.preferred_transport}
                    </span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white rounded-lg transition-colors"
            >
              <Trash2 size={18} />
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">Description</h2>
          <p className="text-slate-300">{agent.description}</p>
        </div>

        {/* Endpoint */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">Endpoint</h2>
          <a
            href={agent.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
          >
            {agent.url}
            <ExternalLink size={16} />
          </a>
        </div>

        {/* Skills */}
        {agent.skills && agent.skills.length > 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Skills ({agent.skills.length})
            </h2>
            <div className="space-y-3">
              {agent.skills.map((skill) => (
                <div
                  key={skill.id}
                  className="p-4 bg-slate-900 rounded-lg border border-slate-700"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-white font-medium mb-1">{skill.id}</h3>
                      <p className="text-slate-400 text-sm">{skill.description}</p>
                    </div>
                  </div>

                  {skill.parameters && Object.keys(skill.parameters).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-700">
                      <h4 className="text-sm font-medium text-slate-400 mb-2">Parameters</h4>
                      <pre className="text-xs text-slate-300 bg-slate-950 p-2 rounded overflow-x-auto">
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
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">Capabilities</h2>

            {agent.capabilities.extensions && agent.capabilities.extensions.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-slate-400 mb-2">Extensions</h3>
                <div className="space-y-2">
                  {agent.capabilities.extensions.map((ext, index) => (
                    <div key={index} className="p-3 bg-slate-900 rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-mono text-sm">{ext.uri}</span>
                        {ext.required && (
                          <span className="text-xs px-2 py-0.5 bg-orange-600 text-white rounded">
                            Required
                          </span>
                        )}
                      </div>
                      {ext.description && (
                        <p className="text-slate-400 text-sm mt-1">{ext.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {agent.capabilities.protocols && agent.capabilities.protocols.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2">Supported Protocols</h3>
                <div className="flex flex-wrap gap-2">
                  {agent.capabilities.protocols.map((protocol) => (
                    <span
                      key={protocol}
                      className="px-3 py-1 bg-slate-700 text-slate-300 text-sm rounded"
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
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Metadata</h2>
            <pre className="text-sm text-slate-300 bg-slate-900 p-4 rounded overflow-x-auto">
              {JSON.stringify(agent.metadata, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
