import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Loader2, CheckCircle, AlertCircle, PlusCircle, X } from 'lucide-react';
import { agentApi } from '../api/client';
import type { AgentCard, AgentSkill } from '../types/agent';

export default function RegisterAgent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<AgentCard>({
    name: '',
    description: '',
    url: '',
    version: '0.1.0',
    protocol_version: '0.3.0',
    preferred_transport: 'JSONRPC',
    skills: [],
  });

  const [newSkill, setNewSkill] = useState<AgentSkill>({
    id: '',
    name: '',
    description: '',
    tags: [],
    examples: [],
    input_modes: ['text/plain'],
    output_modes: ['text/plain'],
  });

  const [enableHealthCheck, setEnableHealthCheck] = useState(false);
  const [healthCheckUrl, setHealthCheckUrl] = useState('');
  const [healthCheckTimeout, setHealthCheckTimeout] = useState(10);
  const [healthCheckExpectedStatus, setHealthCheckExpectedStatus] = useState(200);

  const [enableCapabilities, setEnableCapabilities] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [stateTransitionHistory, setStateTransitionHistory] = useState(false);

  const [platform, setPlatform] = useState<string>('generic');
  const [agentId, setAgentId] = useState<string>('');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = () => {
    if (newSkill.id && newSkill.name && newSkill.description) {
      setFormData((prev) => ({
        ...prev,
        skills: [...(prev.skills || []), newSkill],
      }));
      setNewSkill({
        id: '',
        name: '',
        description: '',
        tags: [],
        examples: [],
        input_modes: ['text/plain'],
        output_modes: ['text/plain'],
      });
    }
  };

  const handleRemoveSkill = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Prepare agent data with health check if enabled
      const agentData = { ...formData };

      if (enableHealthCheck && healthCheckUrl) {
        agentData.health_check = {
          url: healthCheckUrl,
          timeout: healthCheckTimeout,
          expected_status: healthCheckExpectedStatus,
        };
      }

      // Add capabilities if enabled
      if (enableCapabilities) {
        agentData.capabilities = {
          streaming,
          push_notifications: pushNotifications,
          state_transition_history: stateTransitionHistory,
        };
      }

      // Add platform to metadata
      if (!agentData.metadata) {
        agentData.metadata = {};
      }
      agentData.metadata.platform = platform;

      // Add agentId for Agno platform
      if (platform === 'agno' && agentId) {
        agentData.metadata.agentId = agentId;
      }

      await agentApi.registerAgent(agentData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/agents');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to register agent. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-title-md font-bold text-gray-900 mb-2">Register Agent</h1>
          <p className="text-gray-500">
            Add a new agent to the A2A Registry
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="rounded-2xl border border-success-200 bg-success-50 p-6 mb-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-success-500" size={20} />
              <div>
                <p className="text-success-700 font-medium">Agent registered successfully!</p>
                <p className="text-success-600 text-sm mt-1">Redirecting to agents list...</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="rounded-2xl border border-error-200 bg-error-50 p-6 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-error-500" size={20} />
              <div>
                <p className="text-error-700 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-base font-medium text-gray-900 mb-5">Basic Information</h2>

            <div className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-theme-sm font-medium text-gray-700 mb-2">
                  Agent Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="my-awesome-agent"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-theme-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe what your agent does..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="url" className="block text-theme-sm font-medium text-gray-700 mb-2">
                  Agent URL *
                </label>
                <input
                  type="url"
                  id="url"
                  name="url"
                  required
                  value={formData.url}
                  onChange={handleInputChange}
                  placeholder="https://my-agent.example.com"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="version" className="block text-theme-sm font-medium text-gray-700 mb-2">
                    Version *
                  </label>
                  <input
                    type="text"
                    id="version"
                    name="version"
                    required
                    value={formData.version}
                    onChange={handleInputChange}
                    placeholder="0.1.0"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="protocol_version" className="block text-theme-sm font-medium text-gray-700 mb-2">
                    Protocol Version *
                  </label>
                  <input
                    type="text"
                    id="protocol_version"
                    name="protocol_version"
                    required
                    value={formData.protocol_version}
                    onChange={handleInputChange}
                    placeholder="0.3.0"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="preferred_transport" className="block text-theme-sm font-medium text-gray-700 mb-2">
                    Preferred Transport
                  </label>
                  <select
                    id="preferred_transport"
                    name="preferred_transport"
                    value={formData.preferred_transport}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  >
                    <option value="JSONRPC">JSON-RPC</option>
                    <option value="REST">REST</option>
                    <option value="GRPC">gRPC</option>
                    <option value="GRAPHQL">GraphQL</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="platform" className="block text-theme-sm font-medium text-gray-700 mb-2">
                    Agent Platform
                  </label>
                  <select
                    id="platform"
                    name="platform"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  >
                    <option value="generic">Generic (기본)</option>
                    <option value="agno">Agno</option>
                    <option value="langchain">LangChain</option>
                    <option value="autogen">AutoGen</option>
                    <option value="custom">Custom</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1.5">
                    사용하는 Agent 개발 플랫폼을 선택하세요
                  </p>
                </div>
              </div>

              {/* Agno Agent ID */}
              {platform === 'agno' && (
                <div>
                  <label htmlFor="agentId" className="block text-theme-sm font-medium text-gray-700 mb-2">
                    Agent ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="agentId"
                    name="agentId"
                    required={platform === 'agno'}
                    value={agentId}
                    onChange={(e) => setAgentId(e.target.value)}
                    placeholder="e.g., web-search-agent"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">
                    Agno agent의 고유 ID (예: web-search-agent)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-base font-medium text-gray-900 mb-5">Skills</h2>

            {/* Existing Skills */}
            {formData.skills && formData.skills.length > 0 && (
              <div className="space-y-2 mb-5">
                {formData.skills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium text-sm">{skill.id}</p>
                      <p className="text-gray-500 text-sm">{skill.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(index)}
                      className="text-error-500 hover:text-error-600 p-1 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Skill */}
            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Skill ID (e.g., get_weather)"
                  value={newSkill.id}
                  onChange={(e) => setNewSkill((prev) => ({ ...prev, id: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Skill Name (e.g., Get Weather)"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Skill Description"
                  value={newSkill.description}
                  onChange={(e) => setNewSkill((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={handleAddSkill}
                disabled={!newSkill.id || !newSkill.name || !newSkill.description}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-lg font-medium transition-colors"
              >
                <PlusCircle size={18} />
                Add Skill
              </button>
            </div>
          </div>

          {/* Capabilities */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-medium text-gray-900">Capabilities (Optional)</h2>
                <p className="text-sm text-gray-500 mt-1">Define what your agent can do</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableCapabilities}
                  onChange={(e) => setEnableCapabilities(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
              </label>
            </div>

            {enableCapabilities && (
              <div className="space-y-4">
                {/* Streaming */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <input
                    type="checkbox"
                    id="streaming"
                    checked={streaming}
                    onChange={(e) => setStreaming(e.target.checked)}
                    className="mt-1 h-4 w-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                  />
                  <div className="flex-1">
                    <label htmlFor="streaming" className="block text-sm font-medium text-gray-900 cursor-pointer">
                      Streaming Support
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Agent can stream responses in real-time (e.g., like ChatGPT)
                    </p>
                  </div>
                </div>

                {/* Push Notifications */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <input
                    type="checkbox"
                    id="pushNotifications"
                    checked={pushNotifications}
                    onChange={(e) => setPushNotifications(e.target.checked)}
                    className="mt-1 h-4 w-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                  />
                  <div className="flex-1">
                    <label htmlFor="pushNotifications" className="block text-sm font-medium text-gray-900 cursor-pointer">
                      Push Notifications
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Agent can proactively send updates to clients (e.g., task completion alerts)
                    </p>
                  </div>
                </div>

                {/* State Transition History */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <input
                    type="checkbox"
                    id="stateTransitionHistory"
                    checked={stateTransitionHistory}
                    onChange={(e) => setStateTransitionHistory(e.target.checked)}
                    className="mt-1 h-4 w-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                  />
                  <div className="flex-1">
                    <label htmlFor="stateTransitionHistory" className="block text-sm font-medium text-gray-900 cursor-pointer">
                      State Transition History
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Agent tracks and exposes task state change history (pending → processing → completed)
                    </p>
                  </div>
                </div>

                <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                  <p className="text-sm text-blue-700">
                    <strong>A2A Protocol:</strong> These capabilities help clients understand what your agent can do and how to interact with it.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Health Check */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-medium text-gray-900">Health Check (Optional)</h2>
                <p className="text-sm text-gray-500 mt-1">Configure automatic health monitoring for your agent</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableHealthCheck}
                  onChange={(e) => setEnableHealthCheck(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
              </label>
            </div>

            {enableHealthCheck && (
              <div className="space-y-5">
                <div>
                  <label htmlFor="healthCheckUrl" className="block text-theme-sm font-medium text-gray-700 mb-2">
                    Health Check URL *
                  </label>
                  <input
                    type="url"
                    id="healthCheckUrl"
                    value={healthCheckUrl}
                    onChange={(e) => setHealthCheckUrl(e.target.value)}
                    placeholder="https://my-agent.example.com/health"
                    required={enableHealthCheck}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-2">The endpoint will be checked every 5 minutes</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="healthCheckTimeout" className="block text-theme-sm font-medium text-gray-700 mb-2">
                      Timeout (seconds)
                    </label>
                    <input
                      type="number"
                      id="healthCheckTimeout"
                      value={healthCheckTimeout}
                      onChange={(e) => setHealthCheckTimeout(parseInt(e.target.value))}
                      min="1"
                      max="60"
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="healthCheckExpectedStatus" className="block text-theme-sm font-medium text-gray-700 mb-2">
                      Expected Status Code
                    </label>
                    <input
                      type="number"
                      id="healthCheckExpectedStatus"
                      value={healthCheckExpectedStatus}
                      onChange={(e) => setHealthCheckExpectedStatus(parseInt(e.target.value))}
                      min="100"
                      max="599"
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> If the health check fails 3 times consecutively, the agent will be marked as inactive.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || success}
              className="flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-400 disabled:cursor-not-allowed text-white rounded-lg font-medium shadow-theme-xs transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Registering...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Register Agent
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/agents')}
              className="px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
