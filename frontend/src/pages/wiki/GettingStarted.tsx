import { BookOpen, PlusCircle, Copy, Check, PlayCircle, Trash2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageToggle from '../../components/LanguageToggle';
import { useState } from 'react';

export default function HowToUse() {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  // Get API URL dynamically
  const getApiUrl = () => {
    const currentUrl = window.location.origin;
    // If running on port 7600 (frontend), backend is on 7601
    if (currentUrl.includes(':7600')) {
      return currentUrl.replace(':7600', ':7601');
    }
    // Otherwise assume backend is on /api
    return `${currentUrl}/api`;
  };

  const apiUrl = getApiUrl();

  const copyToClipboard = (text: string) => {
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          // Fallback to legacy method
          fallbackCopyToClipboard(text);
        });
    } else {
      // Fallback to legacy method
      fallbackCopyToClipboard(text);
    }
  };

  const fallbackCopyToClipboard = (text: string) => {
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
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }

    document.body.removeChild(textArea);
  };

  const exampleAgentCard: any = {
    // Required fields only (optional fields will use Registry defaults)
    name: "test-chatbot",
    description: "A simple test chatbot for A2A registry testing",
    url: "http://localhost:8080",
    preferredTransport: "JSONRPC",
    skills: [
      {
        id: "conversation",
        name: "Basic Conversation",
        description: "Simple conversation skill",
        tags: ["chat", "test"]
      }
    ],
    "x-registry": {
      contact: "agent-owner@example.com",
      owner: "knoxid",
      department: "AI Research Team",
      homepage: "http://example.com/test-chatbot",
      usageDescription: "Send JSONRPC 2.0 requests to the endpoint with method 'chat' and params containing 'message' field",
      allowDelete: false
    }
    // Optional fields (will be auto-filled by Registry):
    // protocolVersion: "0.3.0" (default)
    // version: "0.0" (default)
    // capabilities: {streaming: false, pushNotifications: false, stateTransitionHistory: false} (default)
    // defaultInputModes: ["text/plain"] (default)
    // defaultOutputModes: ["text/plain"] (default)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 md:px-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-brand-500" />
              <h1 className="text-title-lg font-bold text-gray-900">
                {t('사용 방법', 'How to Use')}
              </h1>
            </div>
            <LanguageToggle />
          </div>
          <p className="text-theme-xl text-gray-500">
            {t(
              'A2A 에이전트 등록 및 사용 가이드',
              'Guide to registering and using A2A agents'
            )}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Part 1: Registering Agents */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-2 mb-6">
              <PlusCircle className="h-6 w-6 text-brand-500" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t('1. 에이전트 등록하기', '1. Registering Your Agent')}
              </h2>
            </div>

            <div className="space-y-6">
              <p className="text-base text-gray-700">
                {t(
                  'Agent Registry는 URL 기반 등록 방식을 사용합니다. AgentCard JSON 파일을 작성하여 웹 서버에 호스팅한 후, 해당 URL을 레지스트리에 제출하세요.',
                  'Agent Registry uses a URL-based registration method. Create an AgentCard JSON file, host it on your web server, then submit the URL to the registry.'
                )}
              </p>

              {/* Registration Process */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  {t('등록 절차', 'Registration Process')}
                </h3>
                <ol className="text-base text-gray-700 space-y-1.5 ml-5 list-decimal">
                  <li>{t('AgentCard JSON 파일 작성', 'Create AgentCard JSON file')}</li>
                  <li>{t('웹 서버에 정적 파일로 호스팅', 'Host as static file on web server')}</li>
                  <li>{t('URL이 공개적으로 접근 가능한지 확인', 'Verify URL is publicly accessible')}</li>
                  <li>
                    {t('레지스트리에 URL 제출', 'Submit URL to registry')}
                  </li>
                </ol>
              </div>

              {/* Recommended URL Format */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  {t('권장 URL 형식', 'Recommended URL Format')}
                </h3>
                <div className="relative">
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <code className="text-xs text-gray-100 font-mono">
                      http://myagent.company.com/.well-known/agent-card.json
                    </code>
                  </div>
                  <button
                    onClick={() => copyToClipboard('http://myagent.company.com/.well-known/agent-card.json')}
                    className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition-colors"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <p className="text-base text-gray-700">
                {t(
                  '이 Registry는 A2A 프로토콜 v0.3.0을 참조하되, 기본값과 확장 필드를 추가하여 구현되었습니다. 필수 필드는 최소한으로 유지하되, 관리와 검색을 위한 x-registry 확장 필드를 사용합니다.',
                  'This Registry is implemented with reference to A2A Protocol v0.3.0, with additional default values and extension fields. Required fields are kept minimal, using x-registry extension fields for management and discovery.'
                )}
              </p>

              <p className="text-base text-gray-700">
                {t(
                  'AgentCard에는 다음 필드들이 포함되어야 합니다:',
                  'Your AgentCard should include the following fields:'
                )}
              </p>

              {/* Field Descriptions */}
              <div className="space-y-4">
                {/* Agent Name */}
                <div className="border-l-4 border-brand-500 pl-4 py-2">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {t('에이전트 이름', 'Agent Name')} <span className="text-error-500">*</span>
                  </h3>
                  <p className="text-base text-gray-700 mb-2">
                    {t(
                      '에이전트를 식별하는 고유한 이름입니다. URL에 사용되므로 영문 소문자, 숫자, 하이픈(-)만 사용하세요.',
                      'Unique identifier for your agent. Use lowercase letters, numbers, and hyphens only as it will be used in URLs.'
                    )}
                  </p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                    {t('예시:', 'Example:')} chatbot-assistant, code-analyzer
                  </code>
                </div>

                {/* Description */}
                <div className="border-l-4 border-brand-500 pl-4 py-2">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {t('설명', 'Description')} <span className="text-error-500">*</span>
                  </h3>
                  <p className="text-base text-gray-700 mb-2">
                    {t(
                      '에이전트가 무엇을 하는지 명확하게 설명합니다. 사용자가 에이전트 목록에서 볼 수 있는 중요한 정보입니다.',
                      'Clear description of what your agent does. This is what users see in the agent list.'
                    )}
                  </p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                    {t('예시:', 'Example:')} A general-purpose conversational AI assistant
                  </code>
                </div>

                {/* Agent URL */}
                <div className="border-l-4 border-brand-500 pl-4 py-2">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {t('에이전트 URL', 'Agent URL')} <span className="text-error-500">*</span>
                  </h3>
                  <p className="text-base text-gray-700 mb-2">
                    {t(
                      '에이전트 서비스의 기본 엔드포인트 URL입니다. 클라이언트가 이 URL로 요청을 보냅니다.',
                      'Base endpoint URL of your agent service. Clients will send requests to this URL.'
                    )}
                  </p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                    {t('예시:', 'Example:')} http://api.example.com/chatbot
                  </code>
                </div>

                {/* Preferred Transport */}
                <div className="border-l-4 border-brand-500 pl-4 py-2">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {t('전송 프로토콜', 'Preferred Transport')} <span className="text-error-500">*</span>
                  </h3>
                  <p className="text-base text-gray-700 mb-2">
                    {t(
                      '에이전트가 사용하는 전송 프로토콜입니다. AgentCard에 선언해야 합니다.',
                      'Transport protocol used by your agent. Must be declared in AgentCard.'
                    )}
                  </p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                    {t('예시:', 'Example:')} JSONRPC, REST, gRPC
                  </code>
                </div>

                {/* Skills */}
                <div className="border-l-4 border-brand-500 pl-4 py-2">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {t('스킬', 'Skills')} <span className="text-error-500">*</span>
                  </h3>
                  <p className="text-base text-gray-700 mb-2">
                    {t(
                      '에이전트가 수행할 수 있는 구체적인 작업들입니다. 각 스킬은 다음을 포함합니다:',
                      'Specific tasks your agent can perform. Each skill includes:'
                    )}
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                    <li><strong>{t('스킬 ID:', 'Skill ID:')}</strong> {t('고유 식별자', 'Unique identifier')} (conversation, data-analysis)</li>
                    <li><strong>{t('이름:', 'Name:')}</strong> {t('표시 이름', 'Display name')} (Conversation, Data Analysis)</li>
                    <li><strong>{t('설명:', 'Description:')}</strong> {t('스킬이 하는 일', 'What the skill does')}</li>
                    <li><strong>{t('태그:', 'Tags:')}</strong> {t('검색용 키워드', 'Keywords for discovery')} (chat, NLP, statistics)</li>
                    <li><strong>{t('예시:', 'Examples:')}</strong> {t('사용 예시 프롬프트', 'Example prompts')} ("Tell me a joke")</li>
                  </ul>
                </div>

                {/* x-registry Fields - Required */}
                <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg pl-4 py-3 mt-4">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {t('⚠️ x-registry 확장 필드', '⚠️ x-registry Extension Fields')} <span className="text-error-500">*</span>
                  </h3>
                  <p className="text-base text-gray-700 mb-3">
                    {t(
                      'Registry 관리를 위한 확장 필드입니다. 모든 x-registry 필드는 필수입니다.',
                      'Extension fields for Registry management. All x-registry fields are required.'
                    )}
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2 ml-4 list-disc">
                    <li><strong>contact:</strong> {t('담당자 이메일 주소', 'Contact email address')} (예: agent-owner@example.com)</li>
                    <li><strong>owner:</strong> {t('소유자 ID', 'Owner ID')} (예: knoxid)</li>
                    <li><strong>department:</strong> {t('소속 부서', 'Department')} (예: AI Research Team)</li>
                    <li><strong>homepage:</strong> {t('에이전트 홈페이지 URL (Confluence 링크, Frontend Web UI 등 자유롭게 기술)', 'Agent homepage URL (Confluence link, Frontend Web UI, etc. - flexible description)')} (예: http://example.com/agent)</li>
                    <li><strong>usageDescription:</strong> {t('사용 방법 설명', 'Usage description')} (예: "Send JSONRPC 2.0 requests...")</li>
                    <li><strong>allowDelete:</strong> {t('삭제 허용 여부 (true/false)', 'Allow deletion (true/false)')} (예: false)</li>
                  </ul>
                </div>

                {/* Optional Fields with Defaults */}
                <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg pl-4 py-3 mt-4">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {t('💡 선택 필드 (기본값 제공)', '💡 Optional Fields (with Defaults)')}
                  </h3>
                  <p className="text-base text-gray-700 mb-3">
                    {t(
                      '다음 필드들은 생략할 수 있으며, 생략 시 Registry가 자동으로 기본값을 할당합니다.',
                      'The following fields can be omitted, and the Registry will automatically assign default values.'
                    )}
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2 ml-4 list-disc">
                    <li>
                      <strong>protocolVersion:</strong> {t('프로토콜 버전', 'Protocol version')}
                      <code className="ml-2 text-xs bg-blue-100 px-2 py-0.5 rounded">{t('기본값:', 'default:')} "0.3.0"</code>
                    </li>
                    <li>
                      <strong>version:</strong> {t('에이전트 버전', 'Agent version')}
                      <code className="ml-2 text-xs bg-blue-100 px-2 py-0.5 rounded">{t('기본값:', 'default:')} "0.0"</code>
                    </li>
                    <li>
                      <strong>capabilities:</strong> {t('기능 선언', 'Capabilities')}
                      <code className="ml-2 text-xs bg-blue-100 px-2 py-0.5 rounded">{t('기본값:', 'default:')} {'{streaming: false, pushNotifications: false, stateTransitionHistory: false}'}</code>
                    </li>
                    <li>
                      <strong>defaultInputModes:</strong> {t('입력 MIME 타입', 'Input MIME types')}
                      <code className="ml-2 text-xs bg-blue-100 px-2 py-0.5 rounded">{t('기본값:', 'default:')} ["text/plain"]</code>
                    </li>
                    <li>
                      <strong>defaultOutputModes:</strong> {t('출력 MIME 타입', 'Output MIME types')}
                      <code className="ml-2 text-xs bg-blue-100 px-2 py-0.5 rounded">{t('기본값:', 'default:')} ["text/plain"]</code>
                    </li>
                  </ul>
                </div>

              </div>

              {/* AgentCard Example */}
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {t('AgentCard JSON 예시 (최소 필수 필드)', 'AgentCard JSON Example (Minimal Required Fields)')}
                </h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                  <p className="text-xs text-blue-800">
                    {t(
                      '💡 선택 필드들은 생략되었습니다. Registry가 자동으로 기본값을 할당합니다.',
                      '💡 Optional fields are omitted. The Registry will automatically assign default values.'
                    )}
                  </p>
                </div>
                <div className="relative bg-gray-900 rounded-lg p-4 overflow-x-auto max-h-96">
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(exampleAgentCard, null, 2))}
                    className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition-colors"
                    title={t('클립보드에 복사', 'Copy to clipboard')}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                  <pre className="text-xs text-gray-100 font-mono">
                    {JSON.stringify(exampleAgentCard, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Auto Sync Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-900 font-medium mb-2">
                  ✅ {t('자동 동기화', 'Automatic Synchronization')}
                </p>
                <p className="text-sm text-green-800">
                  {t(
                    'Registry는 하루 1회 자동으로 AgentCard URL을 폴링하여 변경사항을 감지합니다. AgentCard를 업데이트하면 자동으로 반영됩니다!',
                    'The registry automatically polls your AgentCard URL once per day to detect changes. Update your AgentCard and it will be automatically reflected!'
                  )}
                </p>
              </div>
            </div>
          </section>

          {/* Part 2: Using Registered Agents */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-2 mb-6">
              <PlayCircle className="h-6 w-6 text-brand-500" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t('2. 등록된 에이전트 사용하기', '2. Using Registered Agents')}
              </h2>
            </div>

            <div className="space-y-6">
              <p className="text-base text-gray-700">
                {t(
                  '레지스트리에 등록된 에이전트를 실제로 호출하여 사용하는 방법입니다.',
                  'How to actually call and use agents registered in the registry.'
                )}
              </p>

              {/* Step 2-1: Get Agent Card */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  {t('2-1. 에이전트 카드 가져오기', '2-1. Get Agent Card')}
                </h3>
                <p className="text-base text-gray-700 mb-3">
                  {t(
                    '레지스트리 API에서 에이전트 메타데이터를 조회합니다:',
                    'Retrieve agent metadata from the registry API:'
                  )}
                </p>
                <div className="relative">
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <code className="text-xs text-gray-100 font-mono">
                      curl {apiUrl}/api/v1/agents/chatbot-assistant
                    </code>
                  </div>
                  <button
                    onClick={() => copyToClipboard(`curl ${apiUrl}/api/v1/agents/chatbot-assistant`)}
                    className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition-colors"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>

                {/* Response Example */}
                <div className="mt-4">
                  <p className="text-xs font-medium text-gray-700 mb-2">{t('응답 예시:', 'Response Example:')}</p>
                  <div className="relative bg-gray-900 rounded-lg p-4 overflow-x-auto max-h-96">
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(exampleAgentCard, null, 2))}
                      className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition-colors"
                      title={t('클립보드에 복사', 'Copy to clipboard')}
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                    <pre className="text-xs text-gray-100 font-mono">
                      {JSON.stringify(exampleAgentCard, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Step 2-2: Call Agent */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  {t('2-2. 에이전트 호출하기', '2-2. Call the Agent')}
                </h3>
                <p className="text-base text-gray-700 mb-3">
                  {t(
                    'Agent Card의 url과 preferred_transport를 사용하여 에이전트에 메시지를 전송합니다.',
                    'Send a message to the agent using the url and preferred_transport from the Agent Card.'
                  )}
                </p>

                {/* JSONRPC Example */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    {t('JSONRPC 2.0 방식:', 'JSONRPC 2.0 Method:')}
                  </p>
                  <div className="relative">
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-xs text-gray-100 font-mono">
{`curl -X POST http://api.example.com/chatbot \\
  -H "Content-Type: application/json" \\
  -d '{
  "jsonrpc": "2.0",
  "method": "message/send",
  "params": {
    "skillId": "conversation",
    "messages": [
      {
        "role": "user",
        "parts": [
          {
            "type": "text",
            "text": "Tell me a joke"
          }
        ]
      }
    ]
  },
  "id": 1
}'`}
                      </pre>
                    </div>
                    <button
                      onClick={() => {
                        const cmd = `curl -X POST http://api.example.com/chatbot \\
  -H "Content-Type: application/json" \\
  -d '{
  "jsonrpc": "2.0",
  "method": "message/send",
  "params": {
    "skillId": "conversation",
    "messages": [
      {
        "role": "user",
        "parts": [
          {
            "type": "text",
            "text": "Tell me a joke"
          }
        ]
      }
    ]
  },
  "id": 1
}'`;
                        copyToClipboard(cmd);
                      }}
                      className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition-colors"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                {/* Expected Response */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-green-900 mb-2">
                    {t('예상 응답:', 'Expected Response:')}
                  </p>
                  <pre className="text-xs text-green-800 font-mono overflow-x-auto">
{`{
  "jsonrpc": "2.0",
  "result": {
    "taskId": "task-123",
    "status": "completed",
    "artifacts": [
      {
        "type": "text",
        "text": "Why did the AI go to therapy? Because it had too many unresolved dependencies!"
      }
    ]
  },
  "id": 1
}`}
                  </pre>
                </div>

                {/* Proxy Note */}
                <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                  <p className="text-sm text-yellow-900">
                    <strong>{t('💡 참고:', '💡 Note:')}</strong> {t(
                      '사내에서는 proxy 정책으로 인해 no-proxy 옵션이 필요할 수 있습니다.',
                      'Within the company network, you may need the no-proxy option due to proxy policies.'
                    )}
                  </p>
                </div>
              </div>

              {/* Step 2-3: Use Skills */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  {t('2-3. 스킬 활용하기', '2-3. Use Skills')}
                </h3>
                <p className="text-base text-gray-600 mb-3">
                  {t(
                    'Agent Card의 skills 정보를 참고하여 적절한 프롬프트를 작성하세요:',
                    'Reference the skills information in the Agent Card to write appropriate prompts:'
                  )}
                </p>

                <div className="space-y-3">
                  {exampleAgentCard.skills.map((skill, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{skill.name}</p>
                          <p className="text-xs text-gray-600 mt-1">{skill.description}</p>
                        </div>
                        <code className="text-xs bg-brand-100 text-brand-700 px-2 py-1 rounded font-mono">
                          {skill.id}
                        </code>
                      </div>
                      {skill.examples && skill.examples.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs font-medium text-gray-700 mb-2">
                            {t('예시 프롬프트:', 'Example Prompts:')}
                          </p>
                          <ul className="space-y-1">
                            {skill.examples.map((example, i) => (
                              <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                                <span className="text-brand-500 mt-0.5">→</span>
                                <span className="italic">"{example}"</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="mt-3 flex flex-wrap gap-1">
                        {skill.tags.map((tag, i) => (
                          <span key={i} className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 font-medium mb-2">
                  💡 {t('추가 정보', 'Additional Information')}
                </p>
                <ul className="text-xs text-blue-700 space-y-1 ml-4 list-disc">
                  <li>
                    {t(
                      'capabilities.streaming이 true인 경우 message/stream 메서드로 실시간 스트리밍 응답을 받을 수 있습니다',
                      'If capabilities.streaming is true, you can receive real-time streaming responses via message/stream method'
                    )}
                  </li>
                  <li>
                    {t(
                      'defaultInputModes와 defaultOutputModes를 확인하여 지원되는 MIME 타입을 파악하세요',
                      'Check defaultInputModes and defaultOutputModes to understand supported MIME types'
                    )}
                  </li>
                  <li>
                    {t(
                      '각 스킬의 inputModes와 outputModes를 확인하여 특정 스킬에 맞는 데이터 형식을 사용하세요',
                      'Check inputModes and outputModes of each skill to use appropriate data formats'
                    )}
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Part 3: Deleting Agents */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-2 mb-6">
              <Trash2 className="h-6 w-6 text-brand-500" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t('3. 에이전트 삭제하기', '3. Deleting Your Agent')}
              </h2>
            </div>

            <div className="space-y-6">
              {/* Overview */}
              <div>
                <p className="text-base text-gray-700 mb-4">
                  {t(
                    'Registry에서 에이전트를 삭제하려면 AgentCard 소유권을 증명해야 합니다. AgentCard URL을 제어할 수 있는 사람만 에이전트를 삭제할 수 있습니다.',
                    'To delete your agent from the registry, you must prove ownership of the AgentCard. Only those who control the AgentCard URL can delete the agent.'
                  )}
                </p>
              </div>

              {/* Step-by-step guide */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {t('삭제 절차', 'Deletion Process')}
                </h3>
                <ol className="list-decimal list-inside space-y-3 text-gray-700">
                  <li>
                    <span className="font-medium text-gray-900">
                      {t('AgentCard에 x-registry 필드 추가', 'Add x-registry field to AgentCard')}
                    </span>
                    <p className="ml-6 mt-2 text-base">
                      {t(
                        'AgentCard JSON 파일에 x-registry.allowDelete 필드를 추가하고 true로 설정하세요:',
                        'Add the x-registry.allowDelete field to your AgentCard JSON and set it to true:'
                      )}
                    </p>
                    <div className="ml-6 mt-2 bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <pre className="text-sm text-gray-800 overflow-x-auto">
{`{
  "protocolVersion": "0.3.0",
  "name": "your-agent",
  ...
  "x-registry": {
    "allowDelete": true
  }
}`}
                      </pre>
                    </div>
                  </li>
                  <li>
                    <span className="font-medium text-gray-900">
                      {t('Registry에서 Refresh', 'Refresh in Registry')}
                    </span>
                    <p className="ml-6 mt-2 text-base">
                      {t(
                        'Registry UI에서 해당 에이전트의 상세 페이지로 이동하여 초록색 "Refresh" 버튼을 클릭하세요. Registry가 최신 AgentCard를 다시 가져옵니다.',
                        'Go to the agent detail page in the Registry UI and click the green "Refresh" button. The registry will fetch the latest AgentCard.'
                      )}
                    </p>
                  </li>
                  <li>
                    <span className="font-medium text-gray-900">
                      {t('Delete 버튼 클릭', 'Click Delete button')}
                    </span>
                    <p className="ml-6 mt-2 text-base">
                      {t(
                        'Refresh 후 빨간색 "Delete" 버튼이 나타나면 클릭하여 에이전트를 삭제할 수 있습니다.',
                        'After refresh, the red "Delete" button will appear. Click it to delete your agent.'
                      )}
                    </p>
                  </li>
                </ol>
              </div>

              {/* Important notes */}
              <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">
                  {t('⚠️ 중요 사항', '⚠️ Important Notes')}
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
                  <li>
                    {t(
                      'x-registry.allowDelete가 false이거나 없으면 Delete 버튼이 비활성화됩니다',
                      'Delete button will be disabled if x-registry.allowDelete is false or missing'
                    )}
                  </li>
                  <li>
                    {t(
                      'AgentCard URL을 제어할 수 없으면 삭제할 수 없습니다 (소유권 증명)',
                      'Cannot delete if you do not control the AgentCard URL (ownership proof)'
                    )}
                  </li>
                  <li>
                    {t(
                      '삭제는 되돌릴 수 없으므로 신중하게 진행하세요',
                      'Deletion is irreversible, proceed with caution'
                    )}
                  </li>
                </ul>
              </div>

              {/* Why x-registry field? */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {t('x-registry 확장 필드란?', 'What is x-registry extension field?')}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t(
                    'x-registry는 Registry 관리를 위한 확장 필드입니다. A2A 프로토콜 스펙에 포함되지 않는 Registry 전용 설정을 위해 사용됩니다:',
                    'x-registry is an extension field for Registry management. It is used for registry-specific settings not included in the A2A protocol specification:'
                  )}
                </p>

                {/* x-registry Fields Table */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden mb-4">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-4 py-2 font-semibold text-gray-900">
                          {t('필드', 'Field')}
                        </th>
                        <th className="text-left px-4 py-2 font-semibold text-gray-900">
                          {t('설명', 'Description')}
                        </th>
                        <th className="text-left px-4 py-2 font-semibold text-gray-900">
                          {t('예시', 'Example')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-3 font-mono text-xs text-brand-600">allowDelete</td>
                        <td className="px-4 py-3 text-gray-700">
                          {t('삭제 허용 여부 (true/false)', 'Allow deletion (true/false)')}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-600">false</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-xs text-brand-600">contact</td>
                        <td className="px-4 py-3 text-gray-700">
                          {t('담당자 이메일 주소', 'Contact email address')}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-600">
                          agent-owner@example.com
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-xs text-brand-600">owner</td>
                        <td className="px-4 py-3 text-gray-700">
                          {t('소유자 ID', 'Owner ID')}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-600">knoxid</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-xs text-brand-600">department</td>
                        <td className="px-4 py-3 text-gray-700">
                          {t('소속 부서', 'Department')}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-600">AI Research Team</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-xs text-brand-600">homepage</td>
                        <td className="px-4 py-3 text-gray-700">
                          {t('에이전트 홈페이지 URL (Confluence 링크, Frontend Web UI 등 자유롭게 기술)', 'Agent homepage URL (Confluence link, Frontend Web UI, etc. - flexible description)')}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-600">http://example.com/agent</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-xs text-brand-600">usageDescription</td>
                        <td className="px-4 py-3 text-gray-700">
                          {t('사용 방법 설명', 'Usage description')}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-600">
                          "Send JSONRPC requests..."
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Example */}
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto mb-4">
                  <pre className="text-xs text-gray-100 font-mono">
{`{
  "protocolVersion": "0.3.0",
  "name": "your-agent",
  ...
  "x-registry": {
    "allowDelete": false,
    "contact": "agent-owner@example.com",
    "owner": "knoxid",
    "department": "AI Research Team",
    "homepage": "http://example.com/your-agent",
    "usageDescription": "Send JSONRPC 2.0 requests to this endpoint"
  }
}`}
                  </pre>
                </div>

                <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                  <li>
                    <span className="font-medium">
                      {t('소유권 증명:', 'Ownership Proof:')}
                    </span>{' '}
                    {t(
                      'AgentCard URL 접근 권한 = 에이전트 소유권',
                      'AgentCard URL access = agent ownership'
                    )}
                  </li>
                  <li>
                    <span className="font-medium">
                      {t('연락처 정보:', 'Contact Information:')}
                    </span>{' '}
                    {t(
                      '사용자가 에이전트 문제 발생 시 담당자에게 연락 가능',
                      'Users can contact the owner when issues occur'
                    )}
                  </li>
                  <li>
                    <span className="font-medium">
                      {t('사용 가이드:', 'Usage Guide:')}
                    </span>{' '}
                    {t(
                      'usageDescription 필드로 에이전트 호출 방법을 명확히 제공',
                      'Provide clear instructions on how to call the agent via usageDescription field'
                    )}
                  </li>
                  <li>
                    <span className="font-medium">
                      {t('확장성:', 'Extensibility:')}
                    </span>{' '}
                    {t(
                      'x- 접두사는 A2A 스펙에서 확장 필드로 권장하는 방식',
                      'x- prefix is the recommended way for extension fields in A2A spec'
                    )}
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
