import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Loader2, AlertCircle, Copy, Check, Code, CheckCircle, XCircle, AlertTriangle, Activity, RefreshCw, Trash2, X, Key, MessageSquare, Package } from 'lucide-react';
import { agentApi, agentLoaderApi, type AgentInstance } from '../api/client';
import type { AgentCard } from '../types/agent';
import { useLanguage } from '../contexts/LanguageContext';

export default function AgentDetail() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const [agent, setAgent] = useState<AgentCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteToken, setDeleteToken] = useState('');
  const [showWorkbenchModal, setShowWorkbenchModal] = useState(false);

  // Instance states
  const [instances, setInstances] = useState<AgentInstance[]>([]);
  const [instancesLoading, setInstancesLoading] = useState(false);
  const [deletingInstances, setDeletingInstances] = useState(false);

  useEffect(() => {
    if (agentId) {
      loadAgent();
    }
  }, [agentId]);

  // Open Workbench modal if navigated from Playground button
  useEffect(() => {
    const state = location.state as { openWorkbench?: boolean };
    if (state?.openWorkbench) {
      setShowWorkbenchModal(true);
      // Clear the state to prevent reopening on refresh
      navigate(location.pathname, { replace: true });
    }
  }, [location.state]);

  // Listen for messages from iframe to close workbench modal
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'CLOSE_WORKBENCH') {
        setShowWorkbenchModal(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const loadAgent = async () => {
    if (!agentId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await agentApi.getAgent(decodeURIComponent(agentId));
      setAgent(data);

      // Load instances for this agent
      await loadInstances(data.name);
    } catch (err) {
      setError('Failed to load agent details');
      console.error('Error loading agent:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadInstances = async (agentName: string) => {
    try {
      setInstancesLoading(true);
      const data = await agentLoaderApi.listInstances({ agent_name: agentName });
      setInstances(data.instances || []);
    } catch (err) {
      console.error('Failed to load instances:', err);
    } finally {
      setInstancesLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      // Try modern clipboard API first (HTTPS/localhost only)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for HTTP environments
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
        } finally {
          document.body.removeChild(textArea);
        }
      }
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard. Please copy manually.');
    }
  };

  // Check if delete is allowed
  // Check both at top level (flattened from agent_card) and in agent_card itself
  const allowDelete = agent?.['x-registry']?.allowDelete === true || agent?.agent_card?.['x-registry']?.allowDelete === true;

  // Handle refresh AgentCard
  const handleRefresh = async () => {
    if (!agentId) return;

    try {
      setRefreshing(true);
      const updatedAgent = await agentApi.refreshAgentCard(decodeURIComponent(agentId));
      setAgent(updatedAgent);
      alert('AgentCard refreshed successfully!');
    } catch (err: any) {
      console.error('Failed to refresh agent card:', err);
      alert(err.response?.data?.detail || 'Failed to refresh AgentCard');

      // Reload agent to get updated health status even after error
      try {
        const reloadedAgent = await agentApi.getAgent(decodeURIComponent(agentId));
        setAgent(reloadedAgent);
      } catch (reloadErr) {
        console.error('Failed to reload agent after refresh error:', reloadErr);
      }
    } finally {
      setRefreshing(false);
    }
  };

  // Handle delete agent (token-based for manual agents)
  const handleDelete = () => {
    if (!agentId || !agent) return;

    // Check if this is a manual agent (no agent_card_url)
    const hasAgentCardUrl = agent.agent_card_url;

    if (!hasAgentCardUrl) {
      // Manual agent - show token input modal
      setShowDeleteModal(true);
    } else {
      // URL-based agent - use original confirmation flow
      if (!confirm(`Are you sure you want to delete agent "${agent.name}"?`)) {
        return;
      }
      handleDeleteWithToken(undefined);
    }
  };

  // Delete agent with optional token
  const handleDeleteWithToken = async (token?: string) => {
    if (!agentId || !agent) return;

    try {
      setDeleting(true);

      // Call deleteAgent with optional token
      await agentApi.deleteAgent(decodeURIComponent(agentId), token);

      alert('Agent deleted successfully!');
      navigate('/agents');
    } catch (err: any) {
      console.error('Failed to delete agent:', err);
      alert(err.response?.data?.detail || 'Failed to delete agent');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setDeleteToken('');
    }
  };

  // Delete all instances (12.2)
  const handleDeleteAllInstances = async () => {
    if (!agent || instances.length === 0) return;

    const confirmMessage = language === 'ko'
      ? `이 Agent의 모든 Docker 인스턴스 (${instances.length}개)를 삭제하시겠습니까?\n\n삭제된 인스턴스:\n${instances.map(i => `- ${i.container_name} (Port: ${i.port})`).join('\n')}`
      : `Are you sure you want to delete all ${instances.length} Docker instance(s) for this agent?\n\nInstances to be deleted:\n${instances.map(i => `- ${i.container_name} (Port: ${i.port})`).join('\n')}`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setDeletingInstances(true);

      // Delete all instances
      const deletePromises = instances.map(instance =>
        agentLoaderApi.deleteInstance(instance.instance_id)
      );

      await Promise.all(deletePromises);

      alert(
        language === 'ko'
          ? `${instances.length}개의 인스턴스가 성공적으로 삭제되었습니다.`
          : `Successfully deleted ${instances.length} instance(s).`
      );

      // Reload instances
      await loadInstances(agent.name);
    } catch (err: any) {
      console.error('Failed to delete instances:', err);
      alert(err.response?.data?.detail || 'Failed to delete instances');
    } finally {
      setDeletingInstances(false);
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

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 ml-4">
              <button
                onClick={() => setShowWorkbenchModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <MessageSquare className="h-4 w-4" />
                {language === 'ko' ? 'Workbench 열기' : 'Open Workbench'}
              </button>

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-md text-xs font-medium transition-colors shadow-sm"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>

              {allowDelete ? (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              ) : (
                <div className="text-xs text-gray-400 italic">
                  Delete not allowed
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {agent.skills && agent.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {agent.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-brand-50 text-brand-700 border border-brand-200"
                >
                  {skill.id}
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

        {/* Running Instances Section (12.2) */}
        {instances.length > 0 && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 md:p-8 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                <h2 className="text-base font-semibold text-gray-900">
                  {language === 'ko' ? 'Docker 인스턴스' : 'Docker Instances'}
                  {' '}
                  <span className="text-sm text-gray-600">({instances.length})</span>
                </h2>
              </div>
              <button
                onClick={handleDeleteAllInstances}
                disabled={deletingInstances || instances.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                {deletingInstances
                  ? (language === 'ko' ? '삭제 중...' : 'Deleting...')
                  : (language === 'ko' ? '모든 인스턴스 삭제' : 'Delete All Instances')}
              </button>
            </div>

            <div className="space-y-3">
              {instances.map((instance) => (
                <div
                  key={instance.instance_id}
                  className="p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <code className="text-sm font-mono text-gray-900 font-semibold">
                          {instance.container_name}
                        </code>
                        {instance.status === 'running' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                            <CheckCircle className="h-3 w-3" />
                            Running
                          </span>
                        )}
                        {instance.status === 'starting' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Starting
                          </span>
                        )}
                        {instance.status === 'stopped' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                            <XCircle className="h-3 w-3" />
                            Stopped
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-600">
                        <div>
                          <span className="font-medium">Port:</span> {instance.port}
                        </div>
                        <div>
                          <span className="font-medium">Image:</span>{' '}
                          <code className="text-xs">{instance.docker_image.split('/').pop()}</code>
                        </div>
                        <div>
                          <span className="font-medium">Model:</span> {instance.llm_model || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Started:</span>{' '}
                          {instance.started_at ? new Date(instance.started_at).toLocaleString() : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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

        {/* Owner Information Section */}
        {(agent['x-registry'] || agent.agent_card?.['x-registry']) && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 mb-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Owner Information</h2>

            {(() => {
              const xRegistry = agent['x-registry'] || agent.agent_card?.['x-registry'];
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Contact */}
                  {xRegistry?.contact && (
                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                      <div className="text-xs text-gray-500 mb-2">Contact</div>
                      <a
                        href={`mailto:${xRegistry.contact}`}
                        className="text-sm font-semibold text-brand-600 hover:text-brand-700 hover:underline"
                      >
                        {xRegistry.contact}
                      </a>
                    </div>
                  )}

                  {/* Owner */}
                  {xRegistry?.owner && (
                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                      <div className="text-xs text-gray-500 mb-2">Owner</div>
                      <div className="text-sm font-semibold text-gray-900">{xRegistry.owner}</div>
                    </div>
                  )}

                  {/* Department */}
                  {xRegistry?.department && (
                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                      <div className="text-xs text-gray-500 mb-2">Department</div>
                      <div className="text-sm font-semibold text-gray-900">{xRegistry.department}</div>
                    </div>
                  )}

                  {/* Homepage */}
                  {xRegistry?.homepage && (
                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                      <div className="text-xs text-gray-500 mb-2">Homepage</div>
                      <div className="text-sm font-semibold text-gray-900">{xRegistry.homepage}</div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Usage Information */}
            {(() => {
              const xRegistry = agent['x-registry'] || agent.agent_card?.['x-registry'];
              return xRegistry?.usageDescription && (
                <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="text-xs font-medium text-blue-900 mb-2">How to Use</div>
                  <div className="text-sm text-blue-800">
                    {xRegistry.usageDescription}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

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
                    <h3 className="text-sm font-semibold text-gray-900">{skill.id}</h3>
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

            {/* Core Capabilities */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Streaming</span>
                  {agent.capabilities.streaming ? (
                    <CheckCircle className="h-5 w-5 text-success-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {agent.capabilities.streaming
                    ? 'Supports real-time streaming responses'
                    : 'Does not support streaming'}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Push Notifications</span>
                  {agent.capabilities.push_notifications ? (
                    <CheckCircle className="h-5 w-5 text-success-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {agent.capabilities.push_notifications
                    ? 'Can send push notifications to clients'
                    : 'Does not send push notifications'}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">State History</span>
                  {agent.capabilities.state_transition_history ? (
                    <CheckCircle className="h-5 w-5 text-success-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {agent.capabilities.state_transition_history
                    ? 'Tracks state transition history'
                    : 'Does not track state history'}
                </p>
              </div>
            </div>

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

      {/* Workbench Modal */}
      {showWorkbenchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-2xl w-full h-full max-w-[98vw] max-h-[98vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {agent.name} - Workbench
                </h3>
              </div>
              <button
                onClick={() => setShowWorkbenchModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Iframe Content */}
            <div className="flex-1 overflow-hidden">
              <iframe
                src={`${window.location.protocol}//${window.location.hostname}:7602/workbench/${encodeURIComponent(agent.name)}`}
                className="w-full h-full border-0"
                title="CopilotKit Workbench"
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Token Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">Delete Agent</h3>
              </div>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteToken('');
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Warning Message */}
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-red-900 mb-2">
                ⚠️ 경고
              </p>
              <p className="text-sm text-red-800">
                이 에이전트를 삭제하려면 등록 시 설정한 <strong>deleteToken</strong>을 입력해야 합니다.
              </p>
            </div>

            {/* Agent Name */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">삭제할 에이전트:</p>
              <p className="text-base font-semibold text-gray-900">{agent.name}</p>
            </div>

            {/* Token Input */}
            <div className="mb-6">
              <label htmlFor="deleteToken" className="block text-sm font-medium text-gray-700 mb-2">
                Delete Token
              </label>
              <input
                id="deleteToken"
                type="text"
                value={deleteToken}
                onChange={(e) => setDeleteToken(e.target.value)}
                placeholder="등록 시 설정한 deleteToken 입력"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-base"
                autoComplete="off"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteToken('');
                }}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => handleDeleteWithToken(deleteToken)}
                disabled={!deleteToken.trim() || deleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {deleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
