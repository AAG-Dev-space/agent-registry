import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Loader2, CheckCircle, AlertCircle, PlusCircle, X, Check, XCircle } from 'lucide-react';
import { agentApi } from '../api/client';
import type { AgentCard, AgentSkill } from '../types/agent';

export default function RegisterAgent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Health Check verification state
  const [healthCheckUrl, setHealthCheckUrl] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [verificationMessage, setVerificationMessage] = useState('');

  // A2A Support toggle
  const [supportsA2A, setSupportsA2A] = useState(false);

  const [formData, setFormData] = useState<Partial<AgentCard>>({
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

  const [enableCapabilities, setEnableCapabilities] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [stateTransitionHistory, setStateTransitionHistory] = useState(false);

  const [platform, setPlatform] = useState<string>('none');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Health Check 자동 검증
  const handleHealthCheckVerification = async () => {
    if (!healthCheckUrl) return;

    setVerifying(true);
    setVerificationStatus('idle');
    setVerificationMessage('');

    const startTime = performance.now();

    try {
      // Directly call the health check URL
      const response = await fetch(healthCheckUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      const responseTime = Math.round(performance.now() - startTime);

      if (response.ok) {
        try {
          const data = await response.json();

          // Check if response looks like an agent card (has name or url)
          if (typeof data === 'object' && (data.name || data.url)) {
            setVerificationStatus('success');
            setVerificationMessage(`✓ Agent verified successfully (${responseTime}ms)`);

            // Auto-fill agent card data if available
            setFormData(prev => ({
              ...prev,
              name: prev.name || data.name,
              description: prev.description || data.description,
              version: prev.version || data.version,
            }));
          } else {
            setVerificationStatus('error');
            setVerificationMessage(`✗ Response does not look like an agent card`);
          }
        } catch (parseErr) {
          setVerificationStatus('error');
          setVerificationMessage(`✗ Failed to parse JSON response`);
        }
      } else {
        setVerificationStatus('error');
        setVerificationMessage(`✗ HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err: any) {
      setVerificationStatus('error');
      setVerificationMessage(`✗ Connection error: ${err.message}`);
    } finally {
      setVerifying(false);
    }
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

    // Validation
    if (verificationStatus !== 'success') {
      setError('Please verify the health check URL first');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Prepare agent data
      const agentData: any = {
        ...formData,
        url: healthCheckUrl, // Use health check URL as agent URL
      };

      // Add capabilities if enabled
      if (enableCapabilities) {
        agentData.capabilities = {
          streaming,
          push_notifications: pushNotifications,
          state_transition_history: stateTransitionHistory,
        };
      }

      // Add metadata
      if (!agentData.metadata) {
        agentData.metadata = {};
      }

      // Add platform if selected
      if (platform !== 'none') {
        agentData.metadata.platform = platform;
      }

      // Add A2A support info
      agentData.metadata.supports_a2a = supportsA2A;

      // If A2A is not supported, remove protocol fields
      if (!supportsA2A) {
        delete agentData.protocol_version;
        delete agentData.preferred_transport;
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
          {/* 1. Basic Information */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-base font-medium text-gray-900 mb-5">1. Basic Information</h2>

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
            </div>
          </div>

          {/* 2. Health Check Verification */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-base font-medium text-gray-900 mb-5">2. Agent Health Check</h2>
            <p className="text-sm text-gray-500 mb-5">
              Enter your agent's health check endpoint. We will verify that the agent is accessible before registration.
            </p>

            <div>
              <label htmlFor="healthCheckUrl" className="block text-theme-sm font-medium text-gray-700 mb-2">
                Agent Health Check Endpoint *
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  id="healthCheckUrl"
                  required
                  value={healthCheckUrl}
                  onChange={(e) => {
                    setHealthCheckUrl(e.target.value);
                    setVerificationStatus('idle');
                    setVerificationMessage('');
                  }}
                  placeholder="https://my-agent.example.com/health"
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={handleHealthCheckVerification}
                  disabled={!healthCheckUrl || verifying}
                  className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    'Verify'
                  )}
                </button>
              </div>

              {/* Verification Status */}
              {verificationStatus === 'success' && (
                <div className="mt-3 p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
                    <Check size={18} />
                    <span>{verificationMessage}</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1 ml-6">
                    Your agent is accessible and ready for registration
                  </p>
                </div>
              )}
              {verificationStatus === 'error' && (
                <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200">
                  <div className="flex items-center gap-2 text-sm text-red-700 font-medium">
                    <XCircle size={18} />
                    <span>{verificationMessage}</span>
                  </div>
                  <p className="text-xs text-red-600 mt-1 ml-6">
                    Please check your agent URL and try again
                  </p>
                </div>
              )}
              {verificationStatus === 'idle' && (
                <p className="text-xs text-gray-500 mt-2">
                  Click "Verify" to check if the agent is accessible
                </p>
              )}
            </div>
          </div>

          {/* 3. A2A Support Section (Optional) */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-medium text-gray-900">3. A2A Protocol Support (Optional)</h2>
                <p className="text-sm text-gray-500 mt-1">Does this agent support A2A protocol?</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={supportsA2A}
                  onChange={(e) => setSupportsA2A(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
              </label>
            </div>

            {supportsA2A && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="version" className="block text-theme-sm font-medium text-gray-700 mb-2">
                      Agent Version *
                    </label>
                    <input
                      type="text"
                      id="version"
                      name="version"
                      required={supportsA2A}
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
                      required={supportsA2A}
                      value={formData.protocol_version}
                      onChange={handleInputChange}
                      placeholder="0.3.0"
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="preferred_transport" className="block text-theme-sm font-medium text-gray-700 mb-2">
                    Preferred Transport *
                  </label>
                  <select
                    id="preferred_transport"
                    name="preferred_transport"
                    required={supportsA2A}
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
                    <option value="none">Select platform (optional)</option>
                    <option value="agno">Agno</option>
                    <option value="adk">ADK (Agent Development Kit)</option>
                    <option value="autogen">AutoGen</option>
                    <option value="langgraph">LangGraph</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1.5">
                    Select the development framework used to build this agent
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 4. Skills */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-base font-medium text-gray-900 mb-5">4. Skills (Optional)</h2>

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

          {/* 5. Capabilities */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-medium text-gray-900">5. Capabilities (Optional)</h2>
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
                      Agent can stream responses in real-time
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
                      Agent can proactively send updates to clients
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
                      Agent tracks and exposes task state change history
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || success || verificationStatus !== 'success'}
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
