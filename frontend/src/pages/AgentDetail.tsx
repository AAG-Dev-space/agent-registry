import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Loader2, AlertCircle, Copy, Check, Code, Trash2, CheckCircle, XCircle, AlertTriangle, Activity } from 'lucide-react';
import { agentApi } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import type { AgentCard, HealthStatus } from '../types/agent';

export default function AgentDetail() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [agent, setAgent] = useState<AgentCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="animate-spin text-brand-500" size={40} />
          <span className="text-lg text-gray-500">Loading agent details...</span>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="rounded-2xl border border-error-200 bg-error-50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-error-500" size={24} />
              <p className="text-error-700 font-medium">{error || 'Agent not found'}</p>
            </div>
            <Link
              to="/agents"
              className="inline-flex items-center gap-2 text-sm text-error-600 hover:text-error-700 font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to agents
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/agents')}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to agents
        </button>

        {/* Header Section */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-title-md font-bold text-gray-900 mb-2">
                {agent.name}
              </h1>
              <p className="text-base text-gray-500 mb-4">
                {agent.description}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                <span>Version {agent.version}</span>
                <span>•</span>
                <span>Protocol {agent.protocol_version}</span>
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
            {isAdmin && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 bg-error-500 hover:bg-error-600 disabled:bg-error-400 text-white rounded-lg font-medium shadow-theme-xs transition-colors"
              >
                <Trash2 size={18} />
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>

          {/* Tags */}
          {agent.skills && agent.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {agent.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-brand-50 text-brand-700 border border-brand-200"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">Version</div>
              <div className="text-sm font-semibold text-gray-900">{agent.version}</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">Protocol</div>
              <div className="text-sm font-semibold text-gray-900">{agent.protocol_version}</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">Transport</div>
              <div className="text-sm font-semibold text-gray-900">{agent.preferred_transport}</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">Skills</div>
              <div className="text-sm font-semibold text-gray-900">{agent.skills?.length || 0}</div>
            </div>
          </div>
        </div>

        {/* Health Status Section */}
        {agent.health_status && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-gray-700" />
              <h2 className="text-base font-semibold text-gray-900">Health Status</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status */}
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                <div className="text-xs text-gray-500 mb-2">Current Status</div>
                <div className="flex items-center gap-2">
                  {agent.health_status.status === 'active' && (
                    <>
                      <CheckCircle className="h-5 w-5 text-success-600" />
                      <span className="text-sm font-semibold text-success-700">Active</span>
                    </>
                  )}
                  {agent.health_status.status === 'inactive' && (
                    <>
                      <XCircle className="h-5 w-5 text-error-600" />
                      <span className="text-sm font-semibold text-error-700">Inactive</span>
                    </>
                  )}
                  {agent.health_status.status === 'deprecated' && (
                    <>
                      <XCircle className="h-5 w-5 text-gray-600" />
                      <span className="text-sm font-semibold text-gray-700">Deprecated</span>
                    </>
                  )}
                  {agent.health_status.status === 'unknown' && (
                    <>
                      <AlertTriangle className="h-5 w-5 text-gray-600" />
                      <span className="text-sm font-semibold text-gray-700">Unknown</span>
                    </>
                  )}
                </div>
              </div>

              {/* Last Check */}
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                <div className="text-xs text-gray-500 mb-2">Last Health Check</div>
                <div className="text-sm font-semibold text-gray-900">
                  {agent.health_status.last_check_at
                    ? new Date(agent.health_status.last_check_at).toLocaleString()
                    : 'Never'}
                </div>
              </div>

              {/* Failure Count */}
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                <div className="text-xs text-gray-500 mb-2">Consecutive Failures</div>
                <div className="text-sm font-semibold text-gray-900">
                  {agent.health_status.failure_count || 0}
                  <span className="text-xs text-gray-500 ml-1">/ 3</span>
                </div>
              </div>
            </div>

            {/* Status Message */}
            {agent.health_status.status === 'inactive' && (
              <div className="mt-4 p-3 rounded-lg bg-error-50 border border-error-200">
                <p className="text-sm text-error-700">
                  This agent has failed {agent.health_status.failure_count} consecutive health checks and is marked as inactive.
                </p>
              </div>
            )}
            {agent.health_status.status === 'active' && agent.health_status.failure_count > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <p className="text-sm text-yellow-700">
                  This agent has {agent.health_status.failure_count} recent failure(s). It will be marked inactive after 3 consecutive failures.
                </p>
              </div>
            )}
          </div>
        )}

        {/* URL Section */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Agent URL</h2>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <code className="flex-1 text-sm text-gray-700 font-mono break-all">
              {agent.url}
            </code>
            <button
              onClick={() => copyToClipboard(agent.url)}
              className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Copy to clipboard"
            >
              {copiedUrl ? (
                <Check className="h-5 w-5 text-success-500" />
              ) : (
                <Copy className="h-5 w-5 text-gray-500" />
              )}
            </button>
            <a
              href={agent.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="h-5 w-5 text-gray-500" />
            </a>
          </div>
        </div>

        {/* Skills Details Section */}
        {agent.skills && agent.skills.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 mb-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Skills & Capabilities ({agent.skills.length})
            </h2>
            <div className="space-y-4">
              {agent.skills.map((skill, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg bg-gray-50 border border-gray-100"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-900">{skill.name}</h3>
                    {skill.id && (
                      <code className="text-xs text-gray-500 font-mono bg-white px-2 py-1 rounded border border-gray-200">
                        {skill.id}
                      </code>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{skill.description}</p>

                  {skill.parameters && Object.keys(skill.parameters).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <h4 className="text-xs font-medium text-gray-500 mb-2">Parameters</h4>
                      <pre className="text-xs text-gray-700 bg-white p-3 rounded border border-gray-200 overflow-x-auto">
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
          <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 mb-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Capabilities</h2>

            {agent.capabilities.extensions && agent.capabilities.extensions.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Extensions</h3>
                <div className="space-y-2">
                  {agent.capabilities.extensions.map((ext, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900 font-mono">{ext.uri}</span>
                        {ext.required && (
                          <span className="text-xs px-2 py-0.5 bg-error-100 text-error-700 rounded font-medium">
                            Required
                          </span>
                        )}
                      </div>
                      {ext.description && (
                        <p className="text-sm text-gray-600 mt-1">{ext.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {agent.capabilities.protocols && agent.capabilities.protocols.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Supported Protocols</h3>
                <div className="flex flex-wrap gap-2">
                  {agent.capabilities.protocols.map((protocol) => (
                    <span
                      key={protocol}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg font-medium"
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
          <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 mb-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Metadata</h2>
            <pre className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-x-auto">
              {JSON.stringify(agent.metadata, null, 2)}
            </pre>
          </div>
        )}

        {/* Installation Instructions */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
          <h2 className="text-base font-semibold text-gray-900 mb-4">How to Use</h2>
          <div className="prose prose-sm max-w-none">
            <p className="text-sm text-gray-600 mb-4">
              To use this agent, you need to configure it in your A2A client. Add the agent URL to your client configuration:
            </p>
            <div className="bg-gray-900 rounded-lg p-4 mb-4 overflow-x-auto">
              <code className="text-sm text-gray-100 font-mono">
                {`// Add to your A2A client configuration
{
  "name": "${agent.name}",
  "url": "${agent.url}",
  "version": "${agent.version}",
  "protocol_version": "${agent.protocol_version}"
}`}
              </code>
            </div>
            <p className="text-sm text-gray-600">
              Make sure your A2A client supports protocol version <strong>{agent.protocol_version}</strong> and the <strong>{agent.preferred_transport}</strong> transport protocol.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
