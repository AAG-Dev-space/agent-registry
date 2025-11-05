import { BookOpen, PlusCircle, Terminal, Copy, Check } from 'lucide-react';
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
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exampleAgentCard = {
    protocolVersion: "0.3.0",
    name: "chatbot-assistant",
    description: "A general-purpose conversational AI assistant that can help with various tasks including answering questions, providing information, and engaging in natural dialogue",
    url: "https://api.example.com/chatbot",
    version: "1.2.0",
    preferredTransport: "JSONRPC",
    capabilities: {
      streaming: true,
      pushNotifications: false,
      stateTransitionHistory: true
    },
    defaultInputModes: ["text/plain"],
    defaultOutputModes: ["text/plain"],
    skills: [
      {
        id: "conversation",
        name: "Conversation",
        description: "Natural language conversation and dialogue",
        tags: ["conversation", "chat", "dialogue", "NLP"],
        inputModes: ["text/plain"],
        outputModes: ["text/plain"],
        examples: [
          "Let's talk about the weather",
          "Tell me a joke"
        ]
      },
      {
        id: "question-answering",
        name: "Question Answering",
        description: "Answer factual questions across various domains",
        tags: ["QA", "knowledge", "information-retrieval"],
        inputModes: ["text/plain"],
        outputModes: ["text/plain"],
        examples: [
          "What is the capital of France?",
          "How does photosynthesis work?"
        ]
      }
    ]
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
              <p className="text-sm text-gray-600">
                {t(
                  'Agent Registry는 URL 기반 등록 방식을 사용합니다. AgentCard JSON 파일을 작성하여 웹 서버에 호스팅한 후, 해당 URL을 레지스트리에 제출하세요.',
                  'Agent Registry uses a URL-based registration method. Create an AgentCard JSON file, host it on your web server, then submit the URL to the registry.'
                )}
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 font-medium mb-2">
                  {t('등록 절차:', 'Registration Process:')}
                </p>
                <ol className="text-sm text-blue-800 space-y-2 ml-4 list-decimal">
                  <li>{t('AgentCard JSON 파일 작성', 'Create AgentCard JSON file')}</li>
                  <li>{t('웹 서버에 정적 파일로 호스팅', 'Host as static file on web server')}</li>
                  <li>{t('URL이 공개적으로 접근 가능한지 확인', 'Verify URL is publicly accessible')}</li>
                  <li>
                    <a href="/register" className="text-brand-600 hover:underline font-medium">
                      {t('레지스트리에 URL 제출', 'Submit URL to registry')}
                    </a>
                  </li>
                </ol>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-900 mb-2">
                  {t('권장 URL 형식:', 'Recommended URL format:')}
                </p>
                <code className="text-sm bg-white border border-gray-300 px-3 py-2 rounded text-brand-600 block">
                  https://myagent.company.com/.well-known/agent-card.json
                </code>
              </div>

              <p className="text-sm text-gray-600">
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
                  <p className="text-sm text-gray-600 mb-2">
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
                  <p className="text-sm text-gray-600 mb-2">
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
                  <p className="text-sm text-gray-600 mb-2">
                    {t(
                      '에이전트 서비스의 기본 엔드포인트 URL입니다. 클라이언트가 이 URL로 요청을 보냅니다.',
                      'Base endpoint URL of your agent service. Clients will send requests to this URL.'
                    )}
                  </p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                    {t('예시:', 'Example:')} https://api.example.com/chatbot
                  </code>
                </div>

                {/* Version */}
                <div className="border-l-4 border-brand-500 pl-4 py-2">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {t('버전', 'Version')} <span className="text-error-500">*</span>
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {t(
                      '에이전트의 현재 버전입니다. Semantic Versioning (major.minor.patch) 형식을 권장합니다.',
                      'Current version of your agent. Semantic Versioning (major.minor.patch) format is recommended.'
                    )}
                  </p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                    {t('예시:', 'Example:')} 1.2.0, 2.0.1
                  </code>
                </div>

                {/* Preferred Transport */}
                <div className="border-l-4 border-brand-500 pl-4 py-2">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {t('전송 프로토콜', 'Preferred Transport')} <span className="text-error-500">*</span>
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {t(
                      '에이전트가 사용하는 통신 프로토콜입니다. A2A v0.3.0에서 지원하는 3가지 중 하나를 선택하세요.',
                      'Communication protocol your agent uses. Choose one of the 3 protocols supported by A2A v0.3.0.'
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <code className="text-xs bg-blue-100 px-2 py-1 rounded text-blue-700 font-semibold">JSONRPC</code>
                    <code className="text-xs bg-green-100 px-2 py-1 rounded text-green-700 font-semibold">gRPC</code>
                    <code className="text-xs bg-purple-100 px-2 py-1 rounded text-purple-700 font-semibold">REST</code>
                  </div>
                </div>

                {/* Capabilities */}
                <div className="border-l-4 border-brand-500 pl-4 py-2">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {t('기능 선언', 'Capabilities')} <span className="text-error-500">*</span>
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {t(
                      '에이전트가 지원하는 선택적 기능을 선언합니다. 필수 필드이며, 각 기능을 지원하지 않을 경우 false로 설정하세요.',
                      'Declare optional capabilities your agent supports. This is a required field; set to false if not supported.'
                    )}
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                    <li><strong>streaming:</strong> {t('실시간 스트리밍 응답 지원', 'Real-time streaming responses')}</li>
                    <li><strong>pushNotifications:</strong> {t('클라이언트에 푸시 알림 전송 가능', 'Can send push notifications to clients')}</li>
                    <li><strong>stateTransitionHistory:</strong> {t('상태 전환 이력 추적', 'Tracks state transition history')}</li>
                  </ul>
                </div>

                {/* Input/Output Modes */}
                <div className="border-l-4 border-brand-500 pl-4 py-2">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {t('입출력 MIME 타입', 'Default Input/Output Modes')} <span className="text-error-500">*</span>
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {t(
                      '에이전트가 지원하는 기본 입력/출력 MIME 타입 배열입니다. 모든 스킬에 공통으로 적용됩니다.',
                      'Array of default input/output MIME types supported by the agent. Applies to all skills.'
                    )}
                  </p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                    {t('예시:', 'Example:')} ["text/plain"], ["application/json"], ["image/png"]
                  </code>
                </div>

                {/* Protocol Version */}
                <div className="border-l-4 border-gray-400 pl-4 py-2">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {t('프로토콜 버전', 'Protocol Version')} <span className="text-gray-400 text-sm">{t('(권장)', '(Recommended)')}</span>
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {t(
                      '에이전트가 지원하는 A2A 프로토콜 버전입니다. 생략 시 기본값 "0.3.0"이 사용됩니다.',
                      'A2A protocol version your agent supports. Defaults to "0.3.0" if omitted.'
                    )}
                  </p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                    {t('예시:', 'Example:')} 0.3.0
                  </code>
                </div>

                {/* Skills */}
                <div className="border-l-4 border-brand-500 pl-4 py-2">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {t('스킬', 'Skills')} <span className="text-error-500">*</span>
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
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
              </div>

              {/* AgentCard Example */}
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {t('AgentCard JSON 예시:', 'AgentCard JSON Example:')}
                </h3>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto max-h-96">
                  <pre className="text-xs text-gray-100 font-mono">
                    {JSON.stringify(exampleAgentCard, null, 2)}
                  </pre>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {t(
                    '이 JSON 파일을 웹 서버의 /.well-known/agent-card.json 경로에 호스팅하세요.',
                    'Host this JSON file at /.well-known/agent-card.json on your web server.'
                  )}
                </p>
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
              <Terminal className="h-6 w-6 text-brand-500" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t('2. 등록된 에이전트 사용하기', '2. Using Registered Agents')}
              </h2>
            </div>

            <div className="space-y-6">
              <p className="text-sm text-gray-600">
                {t(
                  '레지스트리에 등록된 에이전트를 실제로 호출하여 사용하는 방법입니다.',
                  'How to actually call and use agents registered in the registry.'
                )}
              </p>

              {/* Step 1: Get Agent Card */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  {t('Step 1: 에이전트 카드 가져오기', 'Step 1: Get Agent Card')}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
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
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto max-h-96">
                    <pre className="text-xs text-gray-100 font-mono">
                      {JSON.stringify(exampleAgentCard, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Registry API Note */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <strong>{t('참고:', 'Note:')}</strong> {t(
                      'Registry API는 등록된 AgentCard를 반환합니다. 실제 에이전트 호출은 AgentCard의 url 필드를 사용하세요.',
                      'The Registry API returns the registered AgentCard. Use the url field in the AgentCard to make actual agent calls.'
                    )}
                  </p>
                </div>
              </div>

              {/* Step 2: Call Agent */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  {t('Step 2: 에이전트 호출하기', 'Step 2: Call the Agent')}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
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
{`curl -X POST https://api.example.com/chatbot \\
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
                        const cmd = `curl -X POST https://api.example.com/chatbot \\
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
              </div>

              {/* Step 3: Use Skills */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  {t('Step 3: 스킬 활용하기', 'Step 3: Use Skills')}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
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
                  <li>
                    {t(
                      'A2A v0.3.0은 tasks/get, tasks/cancel 메서드도 제공하여 작업 상태 조회 및 취소가 가능합니다',
                      'A2A v0.3.0 also provides tasks/get and tasks/cancel methods for task status queries and cancellation'
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
