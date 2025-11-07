import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Loader2, CheckCircle, AlertCircle, Check, XCircle, Copy, FileJson, Cloud, Link as LinkIcon, Eye, ExternalLink } from 'lucide-react';
import { agentApi } from '../api/client';
import type { AgentCard } from '../types/agent';
import AgentCardPreview from '../components/AgentCardPreview';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';

export default function RegisterAgent() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AgentCard URL verification state
  const [agentCardUrl, setAgentCardUrl] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [verifiedAgentCard, setVerifiedAgentCard] = useState<AgentCard | null>(null);

  // Copy to clipboard state
  const [copiedJson, setCopiedJson] = useState(false);

  // Sample AgentCard JSON
  const sampleAgentCard = {
    protocolVersion: "0.3.0",
    name: "my-agent",
    description: "Description of your agent",
    url: "http://your-domain.com",
    version: "1.0.0",
    preferredTransport: "JSONRPC",
    capabilities: {
      streaming: false,
      pushNotifications: false,
      stateTransitionHistory: false
    },
    defaultInputModes: ["text/plain"],
    defaultOutputModes: ["text/plain"],
    skills: [
      {
        id: "skill-id",
        name: "Skill Name",
        description: "Skill description",
        tags: ["tag1", "tag2"]
      }
    ],
    "x-registry": {
      allowDelete: false,
      contact: "agent-owner@example.com",
      owner: "knoxid",
      department: "AI Research Team",
      homepage: "https://example.com/my-agent",
      usageDescription: "Send JSONRPC 2.0 requests to the endpoint with your desired method and parameters"
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

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
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-title-md font-bold text-gray-900">
              {t('에이전트 등록하기', 'Register Your Agent')}
            </h1>
            <LanguageToggle />
          </div>
          <p className="text-gray-500">
            {t('아래 단계를 따라 에이전트를 레지스트리에 등록하세요', 'Follow these steps to register your agent in the registry')}
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="rounded-2xl border border-success-200 bg-success-50 p-6 mb-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-success-500" size={20} />
              <div>
                <p className="text-success-700 font-medium">{t('에이전트가 성공적으로 등록되었습니다!', 'Agent registered successfully!')}</p>
                <p className="text-success-600 text-sm mt-1">{t('에이전트 목록으로 이동 중...', 'Redirecting to agents list...')}</p>
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

        {/* Steps */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Create AgentCard */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold text-sm">
                1
              </div>
              <div className="flex items-center gap-2">
                <FileJson className="text-blue-600" size={20} />
                <h2 className="text-lg font-semibold text-gray-900">{t('AgentCard 작성하기', 'Create Your AgentCard')}</h2>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4 ml-11">
              {t('A2A 프로토콜 v0.3.0 규격에 따라 에이전트 정보가 담긴 JSON 파일을 작성하세요.', 'Create a JSON file with your agent information following the A2A protocol v0.3.0 specification.')}
            </p>

            {/* Sample AgentCard */}
            <div className="ml-11">
              <div className="mb-3">
                <h3 className="text-sm font-medium text-gray-900 mb-2">{t('AgentCard JSON 샘플:', 'Sample AgentCard JSON:')}</h3>
                <div className="relative bg-gray-900 rounded-lg p-4 overflow-x-auto max-h-96">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(JSON.stringify(sampleAgentCard, null, 2))}
                    className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition-colors"
                    title="Copy to clipboard"
                  >
                    {copiedJson ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                  <pre className="text-xs text-gray-100 font-mono">
                    {JSON.stringify(sampleAgentCard, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Field Descriptions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">{t('필수 필드 (MUST):', 'Required Fields (MUST):')}</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li><code className="bg-blue-100 px-1 rounded">protocolVersion</code> - {t('A2A 프로토콜 버전 (예: "0.3.0")', 'A2A protocol version (e.g., "0.3.0")')}</li>
                  <li><code className="bg-blue-100 px-1 rounded">name</code> - {t('고유 에이전트 식별자 (예: "my-agent")', 'Unique agent identifier (e.g., "my-agent")')}</li>
                  <li><code className="bg-blue-100 px-1 rounded">description</code> - {t('에이전트 설명', 'Brief description of your agent')}</li>
                  <li><code className="bg-blue-100 px-1 rounded">url</code> - {t('에이전트 엔드포인트 URL', "Your agent's endpoint URL")}</li>
                  <li><code className="bg-blue-100 px-1 rounded">version</code> - {t('에이전트 버전 (예: "1.0.0")', 'Agent version (e.g., "1.0.0")')}</li>
                </ul>
                <h4 className="text-sm font-medium text-blue-900 mt-3 mb-2">{t('선택 필드 (SHOULD):', 'Optional Fields (SHOULD):')}</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li><code className="bg-blue-100 px-1 rounded">preferredTransport</code> - {t('JSONRPC, REST, 또는 gRPC', 'JSONRPC, REST, or gRPC')}</li>
                  <li><code className="bg-blue-100 px-1 rounded">capabilities</code> - {t('스트리밍, 푸시알림 등', 'streaming, pushNotifications, etc.')}</li>
                  <li><code className="bg-blue-100 px-1 rounded">skills</code> - {t('에이전트 능력 목록 및 설명', 'List of agent capabilities with descriptions')}</li>
                </ul>
                <h4 className="text-sm font-medium text-blue-900 mt-3 mb-2">{t('레지스트리 확장 필드 (MUST):', 'Registry Extension Fields (MUST):')}</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>
                    <code className="bg-blue-100 px-1 rounded">x-registry.contact</code> - {t('담당자 이메일 주소 (예: knox@example.com)', 'Contact email (e.g., knox@example.com)')}
                  </li>
                  <li>
                    <code className="bg-blue-100 px-1 rounded">x-registry.owner</code> - {t('소유자 ID (예: knox)', 'Owner ID (e.g., knox)')}
                  </li>
                  <li>
                    <code className="bg-blue-100 px-1 rounded">x-registry.department</code> - {t('부서/팀 이름 (예: AI Platform Team)', 'Department/Team name (e.g., AI Platform Team)')}
                  </li>
                  <li>
                    <code className="bg-blue-100 px-1 rounded">x-registry.homepage</code> - {t('Confluence 페이지 또는 Agent 사용 Frontend/Web UI', 'Confluence page or Agent Frontend/Web UI')}
                  </li>
                </ul>
                <h4 className="text-sm font-medium text-blue-900 mt-3 mb-2">{t('레지스트리 확장 필드 (선택):', 'Registry Extension Fields (Optional):')}</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>
                    <code className="bg-blue-100 px-1 rounded">x-registry.usageDescription</code> - {t('Agent 사용 방법 설명', 'Description of how to use the agent')}
                  </li>
                  <li>
                    <code className="bg-blue-100 px-1 rounded">x-registry.allowDelete</code> - {t('에이전트 삭제 허용 여부 (기본값: false). ', 'Allow agent deletion (default: false). ')}
                    <strong>{t('true로 설정 시 UI에 Delete 버튼 생성됨', 'When set to true, Delete button appears in UI')}</strong>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 2: Host AgentCard */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full font-bold text-sm">
                2
              </div>
              <div className="flex items-center gap-2">
                <Cloud className="text-green-600" size={20} />
                <h2 className="text-lg font-semibold text-gray-900">{t('AgentCard 호스팅하기', 'Host Your AgentCard')}</h2>
              </div>
            </div>

            <div className="ml-11 space-y-3">
              <p className="text-sm text-gray-600">
                {t('AgentCard JSON 파일을 공개적으로 접근 가능한 URL에 업로드하세요.', 'Upload the AgentCard JSON file to your web server at a publicly accessible URL.')}
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-medium text-green-900 mb-2">💡 {t('권장 경로:', 'Recommended Path:')}</p>
                <code className="text-sm text-green-800 bg-green-100 px-2 py-1 rounded">
                  http://your-domain.com/.well-known/agent-card.json
                </code>
                <p className="text-xs text-green-700 mt-2">
                  {t('RFC 8615 표준을 따르는 well-known URI', 'Following RFC 8615 standard for well-known URIs')}
                </p>
              </div>

              <div className="text-xs text-gray-500">
                <p className="font-medium mb-1">{t('요구사항:', 'Requirements:')}</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>{t('공개적으로 접근 가능한 URL이어야 함', 'Must be publicly accessible URL')}</li>
                  <li>{t('Content-Type: application/json 반환', 'Must return')} <code className="bg-gray-100 px-1 rounded">Content-Type: application/json</code></li>
                  <li>{t('A2A v0.3.0 스키마에 맞는 유효한 JSON 파일', 'Must be a valid JSON file matching A2A v0.3.0 schema')}</li>
                </ul>
              </div>

              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  {t('필요시, 아래 방법을 참조하세요:', 'If needed, refer to the guide below:')}
                  {' '}
                  <a
                    href="https://confluence.samsungds.net/spaces/SLSIAI/pages/3029679239/04-02+Register+Agent"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
                  >
                    Confluence Guide
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Step 3: Verify URL */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-600 rounded-full font-bold text-sm">
                3
              </div>
              <div className="flex items-center gap-2">
                <LinkIcon className="text-purple-600" size={20} />
                <h2 className="text-lg font-semibold text-gray-900">{t('AgentCard URL 검증하기', 'Verify AgentCard URL')}</h2>
              </div>
            </div>

            <div className="ml-11">
              <p className="text-sm text-gray-600 mb-4">
                {t('호스팅한 AgentCard의 URL을 입력하고 접근 가능한지 검증하세요.', "Enter the URL where you hosted your AgentCard and verify it's accessible.")}
              </p>

              <div>
                <label htmlFor="agentCardUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('AgentCard URL', 'AgentCard URL')} *
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
                    placeholder="http://your-domain.com/.well-known/agent-card.json"
                    className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyUrl}
                    disabled={!agentCardUrl || verifying}
                    className="px-4 py-2.5 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        <span>{t('검증 중...', 'Verifying...')}</span>
                      </>
                    ) : (
                      t('검증', 'Verify')
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
                      {t('AgentCard가 성공적으로 검증되었습니다! 아래에서 미리보기를 확인하세요.', 'AgentCard verified successfully! Proceed to preview below.')}
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
                      {t('AgentCard URL을 확인하고 공개적으로 접근 가능한지 확인하세요.', "Please check your AgentCard URL and ensure it's publicly accessible.")}
                    </p>
                  </div>
                )}
                {verificationStatus === 'idle' && (
                  <p className="text-xs text-gray-500 mt-2">
                    {t('"검증" 버튼을 클릭하여 AgentCard를 가져오고 검증하세요', 'Click "Verify" to fetch and validate your AgentCard')}
                  </p>
                )}
              </div>

              {/* Auto Sync Info */}
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  ✅ {t('자동 동기화', 'Automatic Synchronization')}
                </p>
                <p className="text-sm text-blue-800">
                  {t(
                    'Registry에 등록된 AgentCard는 매일 1회 자동으로 URL을 폴링하여 변경사항을 감지합니다. AgentCard를 업데이트하면 자동으로 반영됩니다!',
                    'Registered AgentCards are automatically polled once per day to detect changes. Update your AgentCard and it will be automatically reflected in the registry!'
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Step 4: Preview & Register */}
          {verifiedAgentCard && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-orange-100 text-orange-600 rounded-full font-bold text-sm">
                  4
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="text-orange-600" size={20} />
                  <h2 className="text-lg font-semibold text-gray-900">{t('미리보기 & 등록', 'Preview & Register')}</h2>
                </div>
              </div>

              <div className="ml-11">
                <p className="text-sm text-gray-600 mb-4">
                  {t('AgentCard 세부 정보를 검토하고 레지스트리에 등록하세요.', 'Review your AgentCard details and register it to the registry.')}
                </p>

                <AgentCardPreview agentCard={verifiedAgentCard} />
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => navigate('/agents')}
              className="px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
            >
              {t('취소', 'Cancel')}
            </button>

            <button
              type="submit"
              disabled={loading || success || verificationStatus !== 'success'}
              className="flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-400 disabled:cursor-not-allowed text-white rounded-lg font-medium shadow-theme-xs transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  {t('등록 중...', 'Registering...')}
                </>
              ) : (
                <>
                  <Save size={20} />
                  {t('에이전트 등록', 'Register Agent')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
