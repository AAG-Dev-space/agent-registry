import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Loader2, CheckCircle, AlertCircle, Check, XCircle } from 'lucide-react';
import { agentApi } from '../api/client';
import type { AgentCard } from '../types/agent';
import AgentCardPreview from '../components/AgentCardPreview';

export default function RegisterAgent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AgentCard URL verification state
  const [agentCardUrl, setAgentCardUrl] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [verifiedAgentCard, setVerifiedAgentCard] = useState<AgentCard | null>(null);

  // Verify AgentCard URL
  const handleVerifyUrl = async () => {
    if (!agentCardUrl) return;

    setVerifying(true);
    setVerificationStatus('idle');
    setVerificationMessage('');
    setVerifiedAgentCard(null);

    try {
      const result = await agentApi.verifyAgentCardUrl(agentCardUrl);

      if (result.success && result.agent_card) {
        setVerificationStatus('success');
        setVerificationMessage(`✓ AgentCard verified successfully (${result.response_time_ms}ms)`);
        setVerifiedAgentCard(result.agent_card);
      } else {
        setVerificationStatus('error');
        setVerificationMessage(`✗ ${result.error || 'Verification failed'}`);
        setVerifiedAgentCard(null);
      }
    } catch (err: any) {
      setVerificationStatus('error');
      setVerificationMessage(`✗ ${err.response?.data?.detail || err.message || 'Verification failed'}`);
      setVerifiedAgentCard(null);
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (verificationStatus !== 'success' || !verifiedAgentCard) {
      setError('Please verify the AgentCard URL first');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await agentApi.registerAgentByUrl(agentCardUrl);
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
            Register your agent by providing the AgentCard URL
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
          {/* 1. AgentCard URL */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-base font-medium text-gray-900 mb-5">AgentCard URL</h2>
            <p className="text-sm text-gray-500 mb-5">
              Enter the URL where your AgentCard JSON is hosted. We recommend using <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">/.well-known/agent-card.json</code>
            </p>

            <div>
              <label htmlFor="agentCardUrl" className="block text-theme-sm font-medium text-gray-700 mb-2">
                AgentCard URL *
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  id="agentCardUrl"
                  required
                  value={agentCardUrl}
                  onChange={(e) => {
                    setAgentCardUrl(e.target.value);
                    setVerificationStatus('idle');
                    setVerificationMessage('');
                    setVerifiedAgentCard(null);
                  }}
                  placeholder="https://my-agent.example.com/.well-known/agent-card.json"
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={handleVerifyUrl}
                  disabled={!agentCardUrl || verifying}
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
                    AgentCard verified and ready for registration
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
                    Please check your AgentCard URL and try again
                  </p>
                </div>
              )}
              {verificationStatus === 'idle' && (
                <p className="text-xs text-gray-500 mt-2">
                  Click "Verify" to fetch and validate your AgentCard
                </p>
              )}
            </div>
          </div>

          {/* 2. AgentCard Preview */}
          {verifiedAgentCard && (
            <AgentCardPreview agentCard={verifiedAgentCard} />
          )}

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
