import { BookOpen, Network, Code2, Link2, Shield, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageToggle from '../../components/LanguageToggle';

export default function TermsAndSpecs() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 md:px-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-brand-500" />
              <h1 className="text-title-lg font-bold text-gray-900">
                {t('A2A 프로토콜 스펙 v0.3.0', 'A2A Protocol Specification v0.3.0')}
              </h1>
            </div>
            <LanguageToggle />
          </div>
          <p className="text-theme-xl text-gray-500">
            {t(
              'Agent-to-Agent 프로토콜 v0.3.0의 핵심 구현 사항',
              'Core implementation requirements for A2A Protocol v0.3.0'
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
                {t('A2A 프로토콜이란?', 'What is A2A Protocol?')}
              </h2>
            </div>

            <p className="text-gray-700 mb-4">
              {t(
                'A2A (Agent-to-Agent) 프로토콜은 서로 다른 프레임워크로 구축된 AI 에이전트 간의 통신과 상호 운용성을 가능하게 하는 오픈 프로토콜입니다.',
                'The A2A (Agent-to-Agent) Protocol is an open protocol enabling communication and interoperability between AI agents built on different frameworks.'
              )}
            </p>

            <div className="bg-brand-50 border border-brand-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-brand-700">
                <strong>{t('핵심 목표:', 'Core Mission:')}</strong>{' '}
                {t(
                  '다양한 플랫폼과 회사의 AI 에이전트들이 독립적인 에이전트로서 협업할 수 있도록 공통 언어를 제공합니다.',
                  'Provide a shared language for AI agents from diverse companies and platforms to collaborate as independent agents.'
                )}
              </p>
            </div>

            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div>
                <p className="text-sm text-gray-500 mb-1">{t('현재 버전', 'Current Version')}</p>
                <p className="text-2xl font-bold text-gray-900">0.3.0</p>
              </div>
              <a
                href="https://a2a-protocol.org/v0.3.0/specification/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <span>{t('공식 스펙 보기', 'View Specification')}</span>
                <Link2 className="h-4 w-4" />
              </a>
            </div>
          </section>

          {/* Agent Implementation Requirements */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <Code2 className="h-6 w-6 text-brand-500" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t('에이전트 구현 요구사항', 'Agent Implementation Requirements')}
              </h2>
            </div>

            <p className="text-base text-gray-600 mb-4">
              {t(
                'A2A 프로토콜을 준수하는 에이전트가 반드시 구현해야 하는 사항들입니다.',
                'Requirements that agents must implement to comply with the A2A protocol.'
              )}
            </p>

            <div className="space-y-4">
              {/* Transport */}
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <h3 className="font-semibold text-gray-900 mb-2">
                  1. {t('전송 프로토콜 (Transport)', 'Transport Protocol')}
                </h3>
                <ul className="space-y-2 text-base text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>{t('HTTP(S) 사용:', 'HTTP(S) Usage:')}</strong>{' '}
                      {t('모든 통신은 HTTP(S) 위에서 이루어지며, 프로덕션 환경에서는 HTTPS가 권장됩니다. (현재 사내에서는 편의를 위해 HTTP를 사용합니다)', 'All communication occurs over HTTP(S), with HTTPS recommended in production. (Currently using HTTP internally for convenience)')}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>{t('3가지 전송 방식 중 최소 1개 구현:', 'Implement at least 1 of 3 transports:')}</strong>{' '}
                      JSON-RPC 2.0, gRPC, HTTP+JSON (REST)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>{t('기능적 등가성:', 'Functional Equivalence:')}</strong>{' '}
                      {t('복수 전송을 지원하는 경우, 모든 전송에서 기능/동작/에러/인증이 동등해야 합니다.', 'If supporting multiple transports, all must provide equivalent functionality, behavior, errors, and authentication.')}
                    </span>
                  </li>
                </ul>
              </div>

              {/* Core Methods */}
              <div className="border-l-4 border-purple-500 pl-4 py-2">
                <h3 className="font-semibold text-gray-900 mb-2">
                  2. {t('핵심 메서드 (Core Methods)', 'Core Methods')}
                </h3>
                <p className="text-base text-gray-600 mb-2">
                  {t('다음 3가지 메서드는 필수로 구현해야 합니다:', 'The following 3 methods are mandatory:')}
                </p>
                <div className="bg-purple-50 rounded-lg p-3 mb-2">
                  <ul className="space-y-1 text-sm text-purple-900">
                    <li>• <code className="bg-purple-100 px-1 rounded">message/send</code> - {t('작업 시작 및 대화', 'Start task and conversation')}</li>
                    <li>• <code className="bg-purple-100 px-1 rounded">tasks/get</code> - {t('상태 및 결과 조회', 'Query status and results')}</li>
                    <li>• <code className="bg-purple-100 px-1 rounded">tasks/cancel</code> - {t('작업 취소', 'Cancel task')}</li>
                  </ul>
                </div>
                <p className="text-xs text-gray-500">
                  {t('선택 사항: 스트리밍/푸시 관련 메서드 (message/stream, tasks/resubscribe 등)', 'Optional: Streaming/push-related methods (message/stream, tasks/resubscribe, etc.)')}
                </p>
              </div>

              {/* Transport Declaration */}
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <h3 className="font-semibold text-gray-900 mb-2">
                  3. {t('전송 방식 선언 및 AgentCard 발견 경로', 'Transport Declaration and AgentCard Discovery Path')}
                </h3>
                <p className="text-base text-gray-700 mb-3">
                  {t(
                    'Agent는 Agent Card를 제공해야 하고, Agent Card 내에서 preferredTransport 및 additionalInterfaces 필드를 통해 자신이 지원하는 전송 방식을 선언해야 합니다.',
                    'Agents must provide an Agent Card and declare their supported transport methods through preferredTransport and additionalInterfaces fields in the Agent Card.'
                  )}
                </p>
                <div className="bg-green-50 rounded-lg p-3 mt-2">
                  <p className="text-sm font-semibold text-green-900 mb-2">
                    {t('AgentCard 발견 경로:', 'AgentCard Discovery Path:')}
                  </p>
                  <p className="text-sm text-green-800 mb-2">
                    {t(
                      '작성한 AgentCard JSON 파일을 공개적으로 접근 가능한 URL에 호스팅하세요.',
                      'Host your AgentCard JSON file at a publicly accessible URL.'
                    )}
                  </p>
                  <p className="text-sm text-green-800">
                    <strong>{t('권장 경로:', 'Recommended Path:')}</strong>{' '}
                    <code className="bg-green-100 px-1 rounded">/.well-known/agent-card.json</code>
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    {t(
                      '예: https://your-domain.com/.well-known/agent-card.json',
                      'Example: https://your-domain.com/.well-known/agent-card.json'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* AgentCard Requirements */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="h-6 w-6 text-brand-500" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t('AgentCard 작성', 'AgentCard Creation')}
              </h2>
            </div>

            <p className="text-base text-gray-600 mb-4">
              {t(
                'AgentCard는 에이전트의 메타데이터를 기술하는 JSON 문서로, 모든 A2A 에이전트는 반드시 제공해야 합니다.',
                'AgentCard is a JSON document describing agent metadata. All A2A agents must provide it.'
              )}
            </p>

            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-900 font-bold mb-2">
                📋 {t('이 Registry의 정책', 'This Registry Policy')}
              </p>
              <p className="text-sm text-blue-800 mb-2">
                {t(
                  '이 Registry는 A2A 프로토콜 v0.3.0을 참조하되, 등록 절차를 단순화하기 위해 다음과 같은 정책을 적용합니다:',
                  'This Registry references A2A Protocol v0.3.0 but applies the following policy to simplify registration:'
                )}
              </p>
              <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
                <li>{t('필수 필드를 최소화하고, 선택 필드에 대해 합리적인 기본값을 제공합니다.', 'Minimize required fields and provide reasonable defaults for optional fields.')}</li>
                <li>{t('Registry 관리를 위한 x-registry 확장 필드를 필수로 요구합니다.', 'Require x-registry extension fields for Registry management.')}</li>
              </ul>
            </div>

            <div className="space-y-4">
              {/* Required Fields */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  1. {t('필수 필드', 'Required Fields')}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {t(
                    '다음 필드들은 반드시 포함되어야 합니다:',
                    'The following fields are mandatory:'
                  )}
                </p>
                <div className="space-y-3">
                  <div>
                    <p className="text-base font-semibold text-gray-900 mb-2">{t('기본 정보:', 'Basic Information:')}</p>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span><code className="bg-gray-100 px-1 rounded font-semibold">name</code> - {t('에이전트 이름', 'Agent name')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span><code className="bg-gray-100 px-1 rounded font-semibold">description</code> - {t('에이전트 설명', 'Agent description')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span><code className="bg-gray-100 px-1 rounded font-semibold">url</code> - {t('메인 엔드포인트 URL', 'Main endpoint URL')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span><code className="bg-gray-100 px-1 rounded font-semibold">preferredTransport</code> - {t('전송 프로토콜 (JSONRPC, REST, gRPC)', 'Transport protocol (JSONRPC, REST, gRPC)')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span><code className="bg-gray-100 px-1 rounded font-semibold">skills</code> - {t('에이전트 스킬 목록 (최소 1개)', 'Agent skills array (at least 1)')}</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-gray-900 mb-2">{t('x-registry 확장 필드:', 'x-registry Extension Fields:')}</p>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span><code className="bg-gray-100 px-1 rounded font-semibold">x-registry.contact</code> - {t('담당자 이메일', 'Contact email')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span><code className="bg-gray-100 px-1 rounded font-semibold">x-registry.owner</code> - {t('소유자 ID', 'Owner ID')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span><code className="bg-gray-100 px-1 rounded font-semibold">x-registry.department</code> - {t('소속 부서', 'Department')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span><code className="bg-gray-100 px-1 rounded font-semibold">x-registry.homepage</code> - {t('에이전트 홈페이지 URL (Confluence 링크, Frontend Web UI 등 자유롭게 기술)', 'Agent homepage URL (Confluence link, Frontend Web UI, etc. - flexible description)')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span><code className="bg-gray-100 px-1 rounded font-semibold">x-registry.usageDescription</code> - {t('사용 방법 설명', 'Usage description')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span><code className="bg-gray-100 px-1 rounded font-semibold">x-registry.allowDelete</code> - {t('삭제 허용 여부', 'Allow deletion')} (true/false)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Optional Fields */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  2. {t('선택 필드 (기본값 자동 할당)', 'Optional Fields (Auto-assigned Defaults)')}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {t(
                    '다음 필드들은 생략할 수 있으며, 생략 시 Registry가 자동으로 기본값을 할당합니다:',
                    'The following fields can be omitted, and the Registry will automatically assign default values:'
                  )}
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span><code className="bg-gray-100 px-1 rounded">protocolVersion</code> → <code className="text-xs">"0.3.0"</code></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span><code className="bg-gray-100 px-1 rounded">version</code> → <code className="text-xs">"0.0"</code></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span><code className="bg-gray-100 px-1 rounded">capabilities</code> → <code className="text-xs">{'{streaming: false, pushNotifications: false, stateTransitionHistory: false}'}</code></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span><code className="bg-gray-100 px-1 rounded">defaultInputModes</code> → <code className="text-xs">["text/plain"]</code></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span><code className="bg-gray-100 px-1 rounded">defaultOutputModes</code> → <code className="text-xs">["text/plain"]</code></span>
                  </li>
                </ul>
              </div>

              {/* A2A Spec Reference */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  3. {t('A2A 스펙 참조 (권장 필드)', 'A2A Spec Reference (Recommended)')}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {t(
                    'A2A v0.3.0 스펙에서는 다음 필드들도 권장합니다. 필요에 따라 추가할 수 있습니다:',
                    'A2A v0.3.0 spec also recommends the following fields. You may add them as needed:'
                  )}
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-gray-500 mt-0.5">•</span>
                    <span><code className="bg-gray-100 px-1 rounded">provider</code>, <code className="bg-gray-100 px-1 rounded">documentationUrl</code>, <code className="bg-gray-100 px-1 rounded">iconUrl</code></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-500 mt-0.5">•</span>
                    <span><code className="bg-gray-100 px-1 rounded">securitySchemes</code>, <code className="bg-gray-100 px-1 rounded">security</code></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-500 mt-0.5">•</span>
                    <span><code className="bg-gray-100 px-1 rounded">additionalInterfaces</code>, <code className="bg-gray-100 px-1 rounded">signatures</code></span>
                  </li>
                </ul>
              </div>

              {/* Validation Rules */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">
                  ⚠️ {t('검증 규칙 (Registry 정책)', 'Validation Rules (Registry Policy)')}
                </h3>
                <ul className="space-y-1 text-sm text-yellow-800">
                  <li>• {t('필수 필드 누락 시 등록 거부됨', 'Registration rejected if required fields are missing')}</li>
                  <li>• {t('선택 필드 누락 시 자동으로 기본값이 할당됨', 'Optional fields automatically assigned defaults if omitted')}</li>
                  <li>• {t('AgentCard URL이 공개적으로 접근 가능해야 함', 'AgentCard URL must be publicly accessible')}</li>
                  <li>• {t('x-registry 필드는 모두 필수 (contact, owner, department, homepage, usageDescription, allowDelete)', 'All x-registry fields are required (contact, owner, department, homepage, usageDescription, allowDelete)')}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Registry Implementation */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <Network className="h-6 w-6 text-brand-500" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t('Agent Registry 구현 권장사항', 'Agent Registry Implementation Recommendations')}
              </h2>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <p className="text-base text-gray-700">
                {t(
                  'A2A 스펙은 레지스트리를 의무 사양으로 정의하지 않지만, "발견 메커니즘" 중 하나로 카탈로그/레지스트리를 명시합니다. 엔터프라이즈 환경에서 다음 기능들을 구현하는 것을 권장합니다.',
                  'The A2A spec does not mandate registries but lists catalogs/registries as discovery mechanisms. The following features are recommended for enterprise environments.'
                )}
              </p>
            </div>

            <div className="space-y-4">
              {/* Indexing & Discovery */}
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <h3 className="font-semibold text-gray-900 mb-2">
                  1. {t('인덱싱 & 디스커버리', 'Indexing & Discovery')}
                </h3>
                <ul className="space-y-2 text-base text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>
                      {t('AgentCard를 수집하고 검증하여 검색 기능 제공 (이름/설명/태그/스킬/전송/기능 기반)', 'Collect and validate AgentCards to provide search (by name/description/tags/skills/transport/capabilities)')}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>
                      {t('AgentCard 검증 규칙 자동 체크 (메인 URL-전송 일치, 상충 금지 등)', 'Automatically check AgentCard validation rules (main URL-transport match, no conflicts, etc.)')}
                    </span>
                  </li>
                </ul>
              </div>

              {/* Routing Hints */}
              <div className="border-l-4 border-purple-500 pl-4 py-2">
                <h3 className="font-semibold text-gray-900 mb-2">
                  2. {t('전송·기능 기반 라우팅 힌트', 'Transport & Capability-based Routing Hints')}
                </h3>
                <p className="text-base text-gray-700">
                  {t(
                    'preferredTransport, additionalInterfaces, capabilities, skills 기준으로 호출 전략(예: 스트리밍 지원 여부, 푸시 지원 여부)을 클라이언트에 노출합니다.',
                    'Expose calling strategies (e.g., streaming support, push support) to clients based on preferredTransport, additionalInterfaces, capabilities, and skills.'
                  )}
                </p>
              </div>

              {/* Security & Governance */}
              <div className="border-l-4 border-red-500 pl-4 py-2">
                <h3 className="font-semibold text-gray-900 mb-2">
                  3. {t('보안/거버넌스', 'Security/Governance')}
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>
                      {t('AgentCard 내 securitySchemes를 해석하여 호출 전 인증 요건 안내', 'Parse securitySchemes in AgentCard to guide authentication requirements before calling')}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>
                      {t('(선택) 서명된 AgentCard(JWS)를 검증하여 신뢰도 향상', '(Optional) Verify signed AgentCards (JWS) to improve trust')}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* External Resources */}
          <section className="rounded-2xl border-2 border-brand-200 bg-gradient-to-br from-brand-50 to-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <Link2 className="h-6 w-6 text-brand-500" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t('참고 자료', 'References')}
              </h2>
            </div>
            <div className="space-y-3">
              <a
                href="https://a2a-protocol.org/v0.3.0/specification/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-brand-500 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {t('A2A Protocol v0.3.0 공식 스펙', 'A2A Protocol v0.3.0 Official Specification')}
                  </p>
                  <p className="text-xs text-gray-600">a2a-protocol.org/v0.3.0/specification/</p>
                </div>
              </a>

              <a
                href="https://github.com/a2aproject/A2A"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-brand-500 transition-colors"
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
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
