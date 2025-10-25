import { BookOpen, Network, Shield, Zap, FileJson, Code2, Link2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageToggle from '../../components/LanguageToggle';

export default function TermsAndSpecs() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 md:px-6 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-brand-500" />
              <h1 className="text-title-lg font-bold text-gray-900">
                {t('A2A 프로토콜 용어 및 스펙', 'A2A Protocol Terms & Specifications')}
              </h1>
            </div>
            <LanguageToggle />
          </div>
          <p className="text-theme-xl text-gray-500">
            {t(
              'Agent-to-Agent 프로토콜의 핵심 개념과 기술 사양',
              'Core concepts and technical specifications of the Agent-to-Agent protocol'
            )}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* What is A2A? */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <Network className="h-6 w-6 text-brand-500" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t('A2A 프로토콜이란?', 'What is the A2A Protocol?')}
              </h2>
            </div>
            <p className="text-gray-700 mb-4">
              {t(
                'A2A (Agent-to-Agent) 프로토콜은 서로 다른 프레임워크로 구축된 AI 에이전트 간의 통신과 상호 운용성을 가능하게 하는 오픈 프로토콜입니다. Apache 2.0 라이선스로 제공되며, Google LLC에서 개발했습니다.',
                'The A2A (Agent-to-Agent) Protocol is an open protocol enabling communication and interoperability between AI agents built on different frameworks. Licensed under Apache 2.0, it is developed by Google LLC.'
              )}
            </p>
            <div className="bg-brand-50 border border-brand-200 rounded-lg p-4">
              <p className="text-sm text-brand-700">
                <strong>{t('핵심 목표:', 'Core Mission:')}</strong>{' '}
                {t(
                  '다양한 플랫폼과 회사의 AI 에이전트들이 독립적인 에이전트로서 협업할 수 있도록 공통 언어를 제공합니다.',
                  'Provide a shared language for AI agents from diverse companies and platforms to collaborate as independent agents.'
                )}
              </p>
            </div>
          </section>

          {/* Protocol Version */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <Code2 className="h-6 w-6 text-brand-500" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t('프로토콜 버전', 'Protocol Version')}
              </h2>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t('현재 버전', 'Current Version')}</p>
                  <p className="text-2xl font-bold text-gray-900">0.3.0</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-1">{t('통신 표준', 'Communication Standard')}</p>
                  <p className="text-lg font-semibold text-gray-900">JSON-RPC 2.0</p>
                </div>
              </div>
            </div>
          </section>

          {/* Core Concepts */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {t('핵심 개념', 'Core Concepts')}
            </h2>

            <div className="space-y-6">
              {/* AgentCard */}
              <div className="border-l-4 border-brand-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('에이전트 카드 (AgentCard)', 'AgentCard')}
                </h3>
                <p className="text-gray-700 mb-3">
                  {t(
                    '에이전트의 기능과 연결 정보를 상세히 기술하는 JSON 메타데이터 문서입니다. 에이전트 검색과 능력 협상을 가능하게 합니다.',
                    'A JSON metadata document detailing an agent\'s capabilities and connection information. Enables agent discovery and capability negotiation.'
                  )}
                </p>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">{t('주요 필드:', 'Key Fields:')}</p>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• <code className="text-xs bg-gray-200 px-1 rounded">name</code> - {t('에이전트 고유 식별자', 'Unique agent identifier')}</li>
                    <li>• <code className="text-xs bg-gray-200 px-1 rounded">description</code> - {t('에이전트 설명', 'Agent description')}</li>
                    <li>• <code className="text-xs bg-gray-200 px-1 rounded">url</code> - {t('기본 엔드포인트', 'Primary endpoint')}</li>
                    <li>• <code className="text-xs bg-gray-200 px-1 rounded">version</code> - {t('에이전트 버전', 'Agent version')}</li>
                    <li>• <code className="text-xs bg-gray-200 px-1 rounded">protocol_version</code> - {t('A2A 프로토콜 버전 (0.3.0)', 'A2A protocol version (0.3.0)')}</li>
                    <li>• <code className="text-xs bg-gray-200 px-1 rounded">capabilities</code> - {t('에이전트 능력', 'Agent capabilities')}</li>
                    <li>• <code className="text-xs bg-gray-200 px-1 rounded">skills</code> - {t('스킬 배열', 'Skills array')}</li>
                    <li>• <code className="text-xs bg-gray-200 px-1 rounded">preferred_transport</code> - {t('선호 전송 프로토콜', 'Preferred transport protocol')}</li>
                  </ul>
                </div>
                <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700">
                    <strong>{t('권장 위치:', 'Recommended Location:')}</strong>{' '}
                    <code className="text-xs bg-blue-100 px-1 rounded">https://&#123;domain&#125;/.well-known/agent-card.json</code>
                    {' '}(RFC 8615)
                  </p>
                </div>
              </div>

              {/* Skills */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('스킬 (Skills)', 'Skills')}
                </h3>
                <p className="text-gray-700 mb-3">
                  {t(
                    '에이전트가 수행할 수 있는 구체적인 능력의 단위입니다. 각 스킬은 고유 ID, 이름, 설명, 태그, 예시를 포함합니다.',
                    'Distinct units of capability that an agent can perform. Each skill includes a unique ID, name, description, tags, and examples.'
                  )}
                </p>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">{t('스킬 구조:', 'Skill Structure:')}</p>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• <code className="text-xs bg-gray-200 px-1 rounded">id</code> - {t('고유 식별자 (예: "get_weather")', 'Unique identifier (e.g., "get_weather")')}</li>
                    <li>• <code className="text-xs bg-gray-200 px-1 rounded">name</code> - {t('사람이 읽을 수 있는 이름', 'Human-readable name')}</li>
                    <li>• <code className="text-xs bg-gray-200 px-1 rounded">description</code> - {t('상세 설명', 'Detailed description')}</li>
                    <li>• <code className="text-xs bg-gray-200 px-1 rounded">tags</code> - {t('분류 태그 배열', 'Categorical tags array')}</li>
                    <li>• <code className="text-xs bg-gray-200 px-1 rounded">examples</code> - {t('사용 예시', 'Usage examples')}</li>
                    <li>• <code className="text-xs bg-gray-200 px-1 rounded">input_modes</code> - {t('입력 MIME 타입', 'Input MIME types')}</li>
                    <li>• <code className="text-xs bg-gray-200 px-1 rounded">output_modes</code> - {t('출력 MIME 타입', 'Output MIME types')}</li>
                  </ul>
                </div>
              </div>

              {/* Capabilities */}
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('능력 (Capabilities)', 'Capabilities')}
                </h3>
                <p className="text-gray-700 mb-3">
                  {t(
                    '에이전트가 지원하는 기술적 기능을 정의합니다. 클라이언트가 에이전트와 상호작용하는 방법을 이해하는 데 도움을 줍니다.',
                    'Define the technical features an agent supports. Help clients understand how to interact with the agent.'
                  )}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      {t('스트리밍', 'Streaming')}
                    </p>
                    <p className="text-xs text-gray-600">
                      {t('실시간 응답 스트리밍 지원', 'Real-time response streaming')}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      {t('푸시 알림', 'Push Notifications')}
                    </p>
                    <p className="text-xs text-gray-600">
                      {t('클라이언트로 업데이트 전송', 'Send updates to clients')}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      {t('상태 이력', 'State History')}
                    </p>
                    <p className="text-xs text-gray-600">
                      {t('작업 상태 변경 추적', 'Track task state changes')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Transport Protocols */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="h-6 w-6 text-brand-500" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t('전송 프로토콜', 'Transport Protocols')}
              </h2>
            </div>
            <p className="text-gray-700 mb-4">
              {t(
                'A2A는 세 가지 핵심 전송 프로토콜을 동등하게 지원합니다. 에이전트는 최소 하나의 프로토콜을 구현해야 합니다.',
                'A2A supports three core transport protocols with equal status. Agents must implement at least one.'
              )}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">JSON-RPC 2.0</h3>
                <p className="text-sm text-blue-700 mb-2">
                  {t('HTTP(S) 위의 JSON-RPC 2.0', 'JSON-RPC 2.0 over HTTP(S)')}
                </p>
                <p className="text-xs text-blue-600">
                  {t('메소드 패턴:', 'Method pattern:')} <code className="bg-blue-100 px-1 rounded">&#123;category&#125;/&#123;action&#125;</code>
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-900 mb-2">gRPC</h3>
                <p className="text-sm text-purple-700 mb-2">
                  {t('Protocol Buffers v3 직렬화', 'Protocol Buffers v3 serialization')}
                </p>
                <p className="text-xs text-purple-600">
                  {t('정의:', 'Definition:')} <code className="bg-purple-100 px-1 rounded">a2a.proto</code>
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h3 className="text-lg font-semibold text-green-900 mb-2">HTTP+JSON</h3>
                <p className="text-sm text-green-700 mb-2">
                  {t('REST 스타일 리소스 기반', 'REST-style resource-based')}
                </p>
                <p className="text-xs text-green-600">
                  {t('표준 HTTP 동사 사용', 'Standard HTTP verbs')}
                </p>
              </div>
            </div>
          </section>

          {/* Interaction Modes */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileJson className="h-6 w-6 text-brand-500" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t('상호작용 모드', 'Interaction Modes')}
              </h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="bg-blue-100 rounded p-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {t('동기식 요청/응답', 'Synchronous Request/Response')}
                  </p>
                  <p className="text-xs text-gray-600">
                    {t('즉각적인 응답이 필요한 짧은 작업에 적합', 'Suitable for short tasks requiring immediate responses')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="bg-purple-100 rounded p-2">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {t('스트리밍 (SSE)', 'Streaming (SSE)')}
                  </p>
                  <p className="text-xs text-gray-600">
                    {t('Server-Sent Events를 통한 실시간 데이터 스트림', 'Real-time data stream via Server-Sent Events')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="bg-green-100 rounded p-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {t('비동기 푸시 알림', 'Asynchronous Push Notifications')}
                  </p>
                  <p className="text-xs text-gray-600">
                    {t('장기 실행 작업의 업데이트를 능동적으로 전송', 'Proactively send updates for long-running tasks')}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Security & Authentication */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-6 w-6 text-brand-500" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t('보안 및 인증', 'Security & Authentication')}
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  {t('전송 보안', 'Transport Security')}
                </h3>
                <p className="text-sm text-gray-700">
                  {t('프로덕션 환경에서는 HTTPS/TLS 필수', 'HTTPS/TLS required for production')}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  {t('인증 방식', 'Authentication Methods')}
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• {t('Bearer 토큰', 'Bearer tokens')}</li>
                  <li>• {t('API 키', 'API keys')}</li>
                  <li>• {t('OAuth 2.0', 'OAuth 2.0')}</li>
                  <li>• {t('커스텀 HTTP 헤더', 'Custom HTTP headers')}</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  {t('보안 스킴', 'Security Schemes')}
                </h3>
                <p className="text-sm text-gray-700">
                  {t(
                    'AgentCard의 securitySchemes 필드에 OpenAPI 3.0 패턴을 따라 정의',
                    'Defined in AgentCard securitySchemes field following OpenAPI 3.0 patterns'
                  )}
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>{t('중요:', 'Important:')}</strong>{' '}
                  {t(
                    '모든 요청은 인증되어야 하며, 실패 시 401/403 상태 코드를 반환해야 합니다.',
                    'Every request must be authenticated and return 401/403 status codes on failure.'
                  )}
                </p>
              </div>
            </div>
          </section>

          {/* Key Data Objects */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('주요 데이터 객체', 'Key Data Objects')}
            </h2>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-base font-semibold text-gray-900 mb-1">Task</h3>
                <p className="text-sm text-gray-700">
                  {t(
                    '고유 ID, 컨텍스트 ID, 상태, 메시지 이력, 아티팩트를 포함하는 작업의 상태 단위',
                    'Stateful unit of work with unique ID, context ID, status, message history, and artifacts'
                  )}
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="text-base font-semibold text-gray-900 mb-1">Message</h3>
                <p className="text-sm text-gray-700">
                  {t(
                    'role("user" 또는 "agent")과 하나 이상의 Parts를 포함하는 통신 턴',
                    'Communication turn with role ("user" or "agent") containing one or more Parts'
                  )}
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="text-base font-semibold text-gray-900 mb-1">Parts</h3>
                <p className="text-sm text-gray-700">
                  {t(
                    'TextPart, FilePart, DataPart로 구성된 메시지/아티팩트 내의 컴포넌트',
                    'Components within messages/artifacts: TextPart, FilePart, or DataPart'
                  )}
                </p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4">
                <h3 className="text-base font-semibold text-gray-900 mb-1">Artifact</h3>
                <p className="text-sm text-gray-700">
                  {t(
                    'Parts로 구성된 에이전트가 생성한 출력',
                    'Output generated by agent, composed of Parts'
                  )}
                </p>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="text-base font-semibold text-gray-900 mb-1">TaskStatus</h3>
                <p className="text-sm text-gray-700">
                  {t(
                    '현재 상태 열거형 (pending, running, completed, failed 등) 및 설명 메시지',
                    'Current state enum (pending, running, completed, failed, etc.) with descriptive message'
                  )}
                </p>
              </div>
            </div>
          </section>

          {/* External Resources */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <Link2 className="h-6 w-6 text-brand-500" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t('외부 리소스', 'External Resources')}
              </h2>
            </div>
            <div className="space-y-3">
              <a
                href="https://github.com/a2aproject/A2A"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-brand-500 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {t('A2A 프로젝트 GitHub', 'A2A Project GitHub')}
                  </p>
                  <p className="text-xs text-gray-600">github.com/a2aproject/A2A</p>
                </div>
              </a>

              <a
                href="https://a2a-protocol.org/latest/specification/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-brand-500 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center">
                    <FileJson className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {t('공식 스펙 문서', 'Official Specification')}
                  </p>
                  <p className="text-xs text-gray-600">a2a-protocol.org/latest/specification/</p>
                </div>
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
