import { BookOpen, Network, Code2, Link2, Shield, CheckCircle2 } from 'lucide-react';
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

            <p className="text-sm text-gray-600 mb-4">
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
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>{t('HTTPS 필수:', 'HTTPS Required:')}</strong>{' '}
                      {t('모든 통신은 HTTP(S) 위에서 이루어지며, 프로덕션 환경에서는 HTTPS가 필수입니다.', 'All communication occurs over HTTP(S), with HTTPS mandatory in production.')}
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
                <p className="text-sm text-gray-600 mb-2">
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

              {/* Streaming */}
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <h3 className="font-semibold text-gray-900 mb-2">
                  3. {t('스트리밍/푸시 (Streaming/Push)', 'Streaming/Push')}
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>
                      <strong>JSON-RPC/REST:</strong> SSE (Server-Sent Events, <code className="bg-gray-100 px-1 rounded">text/event-stream</code>) 사용
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>
                      <strong>gRPC:</strong> {t('서버 스트리밍 사용', 'Use server streaming')}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>
                      {t('스트리밍 제공 시 AgentCard에 ', 'When providing streaming, declare in AgentCard: ')}
                      <code className="bg-gray-100 px-1 rounded">capabilities.streaming: true</code>
                    </span>
                  </li>
                </ul>
              </div>

              {/* Security */}
              <div className="border-l-4 border-red-500 pl-4 py-2">
                <h3 className="font-semibold text-gray-900 mb-2">
                  4. {t('보안 (Security)', 'Security')}
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>TLS(HTTPS) 필수:</strong> {t('최신 TLS(권장 1.3+) 구성, 서버 신원(TLS 인증서) 검증 권장', 'Latest TLS (1.3+ recommended), server identity (TLS certificate) verification recommended')}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>{t('인증/인가:', 'Authentication/Authorization:')}</strong>{' '}
                      {t('전송 계층에서 처리 (A2A 페이로드에 ID를 싣지 않음)', 'Handled at transport layer (do not embed ID in A2A payload)')}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* AgentCard Requirements */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="h-6 w-6 text-brand-500" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t('AgentCard 요구사항', 'AgentCard Requirements')}
              </h2>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              {t(
                'AgentCard는 에이전트의 메타데이터를 기술하는 JSON 문서로, 모든 A2A 에이전트는 반드시 제공해야 합니다.',
                'AgentCard is a JSON document describing agent metadata. All A2A agents must provide it.'
              )}
            </p>

            <div className="space-y-4">
              {/* Discovery Path */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                  {t('발견 경로 (Discovery Path)', 'Discovery Path')}
                </h3>
                <p className="text-sm text-blue-800 mb-2">
                  <strong>{t('권장 경로:', 'Recommended path:')}</strong>{' '}
                  <code className="bg-blue-100 px-2 py-1 rounded">https://&#123;domain&#125;/.well-known/agent-card.json</code>
                </p>
                <p className="text-xs text-blue-700">
                  {t('RFC 8615 원칙을 따르며, 레지스트리/카탈로그/직접 설정도 허용됩니다.', 'Follows RFC 8615 principles. Registry/catalog/direct configuration also allowed.')}
                </p>
              </div>

              {/* Core Schema Elements */}
              <div className="border-l-4 border-brand-500 pl-4 py-2">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {t('핵심 스키마 요소', 'Core Schema Elements')}
                </h3>
                <div className="space-y-3">
                  <div className="bg-red-50 rounded-lg p-3 border-2 border-red-300">
                    <p className="text-sm font-bold text-red-900 mb-2">⚠️ {t('필수 필드 (MUST):', 'Required Fields (MUST):')}</p>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• <code className="bg-red-100 px-1 rounded font-semibold">name</code> - {t('에이전트 이름', 'Agent name')}</li>
                      <li>• <code className="bg-red-100 px-1 rounded font-semibold">description</code> - {t('에이전트 설명', 'Agent description')}</li>
                      <li>• <code className="bg-red-100 px-1 rounded font-semibold">url</code> - {t('메인 엔드포인트 URL', 'Main endpoint URL')}</li>
                      <li>• <code className="bg-red-100 px-1 rounded font-semibold">version</code> - {t('에이전트 버전', 'Agent version')}</li>
                      <li>• <code className="bg-red-100 px-1 rounded font-semibold">preferredTransport</code> - {t('메인 URL의 전송 프로토콜', 'Transport protocol for main URL')} (JSONRPC/gRPC/REST)</li>
                      <li>• <code className="bg-red-100 px-1 rounded font-semibold">capabilities</code> - {t('지원 기능 선언', 'Supported capabilities declaration')} (streaming, pushNotifications 등)</li>
                      <li>• <code className="bg-red-100 px-1 rounded font-semibold">defaultInputModes</code> - {t('기본 입력 MIME 타입 배열', 'Default input MIME types array')}</li>
                      <li>• <code className="bg-red-100 px-1 rounded font-semibold">defaultOutputModes</code> - {t('기본 출력 MIME 타입 배열', 'Default output MIME types array')}</li>
                      <li>• <code className="bg-red-100 px-1 rounded font-semibold">skills</code> - {t('에이전트 스킬 목록', 'Agent skills array')}</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <p className="text-sm font-medium text-blue-900 mb-2">{t('권장 필드 (SHOULD):', 'Recommended Fields (SHOULD):')}</p>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• <code className="bg-blue-100 px-1 rounded">protocolVersion</code> - {t('A2A 프로토콜 버전 (기본값 "0.3.0")', 'A2A protocol version (defaults to "0.3.0")')}</li>
                      <li>• <code className="bg-blue-100 px-1 rounded">provider</code> - {t('에이전트 제공자 정보', 'Agent provider information')}</li>
                      <li>• <code className="bg-blue-100 px-1 rounded">documentationUrl</code> - {t('문서 URL', 'Documentation URL')}</li>
                      <li>• <code className="bg-blue-100 px-1 rounded">iconUrl</code> - {t('아이콘 URL', 'Icon URL')}</li>
                      <li>• <code className="bg-blue-100 px-1 rounded">securitySchemes</code> - {t('인증 방식 선언', 'Security schemes declaration')}</li>
                      <li>• <code className="bg-blue-100 px-1 rounded">security</code> - {t('보안 요구사항', 'Security requirements')}</li>
                      <li>• <code className="bg-blue-100 px-1 rounded">additionalInterfaces</code> - {t('추가 전송 인터페이스', 'Additional transport interfaces')}</li>
                      <li>• <code className="bg-blue-100 px-1 rounded">supportsAuthenticatedExtendedCard</code> - {t('인증된 확장 카드 지원 여부', 'Supports authenticated extended card')}</li>
                      <li>• <code className="bg-blue-100 px-1 rounded">signatures</code> - {t('JWS 서명', 'JWS signatures')}</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Validation Rules */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">
                  ⚠️ {t('검증 규칙', 'Validation Rules')}
                </h3>
                <ul className="space-y-1 text-sm text-yellow-800">
                  <li>• {t('메인 url과 preferredTransport는 반드시 일치해야 함', 'Main url and preferredTransport must match')}</li>
                  <li>• {t('additionalInterfaces는 메인 URL/전송을 포괄해야 함 (완전성)', 'additionalInterfaces must encompass main URL/transport (completeness)')}</li>
                  <li>• {t('같은 URL에 서로 다른 전송 방식을 선언하면 안됨 (상충 금지)', 'Cannot declare different transports for the same URL (no conflicts)')}</li>
                  <li>• {t('민감정보(평문 키 등)를 포함하면 안됨', 'Must not contain sensitive information (plaintext keys, etc.)')}</li>
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
              <p className="text-sm text-gray-700">
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
                <ul className="space-y-2 text-sm text-gray-700">
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
                <p className="text-sm text-gray-700">
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

              {/* Operations */}
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <h3 className="font-semibold text-gray-900 mb-2">
                  4. {t('운영/가용성', 'Operations/Availability')}
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>
                      {t('(선택) 상태 점검 URL을 메타데이터로 받아 가용성 필터링 지원', '(Optional) Accept health check URLs as metadata to support availability filtering')}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>
                      {t('(선택) 사내 정책에 맞는 승인/버전 정책 및 폐기(디리스트) 관리', '(Optional) Manage approval/versioning policies and deprecation (delist) per internal policies')}
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
