import { BookOpen, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function TermsAndSpecs() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 md:px-6 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-8 w-8 text-brand-500" />
            <h1 className="text-3xl font-bold text-gray-900">
              {t('용어 및 스펙', 'Terms & Specs')}
            </h1>
          </div>
          <p className="text-gray-600">
            {t('A2A Protocol 핵심 개념', 'A2A Protocol Core Concepts')}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* A2A Protocol */}
          <section className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('A2A Protocol이란?', 'What is A2A Protocol?')}
            </h2>
            <p className="text-gray-700 mb-4">
              {t(
                'AI 에이전트 간 통신을 위한 오픈 프로토콜입니다. 서로 다른 프레임워크로 구축된 Agent들이 협업할 수 있도록 공통 언어를 제공합니다.',
                'An open protocol for AI agent communication. Provides a common language for agents built on different frameworks to collaborate.'
              )}
            </p>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">{t('현재 버전:', 'Current Version:')}</span>
              <span className="font-bold text-lg text-gray-900">v0.3.0</span>
              <a
                href="https://a2a-protocol.org/v0.3.0/specification/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700"
              >
                <span>{t('스펙 보기', 'View Spec')}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </section>

          {/* AgentCard */}
          <section className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('AgentCard', 'AgentCard')}
            </h2>
            <p className="text-gray-700 mb-4">
              {t('Agent의 메타데이터를 담은 JSON 문서입니다. 모든 Agent는 AgentCard를 제공해야 합니다.', 'A JSON document containing agent metadata. All agents must provide an AgentCard.')}
            </p>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('필수 필드', 'Required Fields')}</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• <code className="bg-gray-100 px-1 rounded">name</code> - {t('Agent 이름', 'Agent name')}</li>
                  <li>• <code className="bg-gray-100 px-1 rounded">description</code> - {t('설명', 'Description')}</li>
                  <li>• <code className="bg-gray-100 px-1 rounded">url</code> - {t('엔드포인트 URL', 'Endpoint URL')}</li>
                  <li>• <code className="bg-gray-100 px-1 rounded">preferredTransport</code> - {t('전송 프로토콜', 'Transport protocol')} (JSONRPC, REST, gRPC)</li>
                  <li>• <code className="bg-gray-100 px-1 rounded">skills</code> - {t('Agent 스킬 목록', 'Agent skills list')}</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('권장 경로', 'Recommended Path')}</h3>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  /.well-known/agent-card.json
                </code>
              </div>
            </div>
          </section>

          {/* Transport */}
          <section className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('전송 프로토콜 (Transport)', 'Transport Protocol')}
            </h2>
            <p className="text-gray-700 mb-4">
              {t('Agent 간 통신 방식입니다. 최소 1개 이상 구현해야 합니다.', 'Communication method between agents. At least one must be implemented.')}
            </p>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex gap-2">
                <span className="font-semibold">•</span>
                <div>
                  <span className="font-semibold">JSON-RPC 2.0:</span> {t('JSON 기반 원격 프로시저 호출', 'JSON-based remote procedure call')}
                </div>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">•</span>
                <div>
                  <span className="font-semibold">REST (HTTP+JSON):</span> {t('HTTP 메서드 기반 통신', 'HTTP method-based communication')}
                </div>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">•</span>
                <div>
                  <span className="font-semibold">gRPC:</span> {t('Protocol Buffers 기반 고성능 통신', 'Protocol Buffers-based high-performance communication')}
                </div>
              </li>
            </ul>
          </section>

          {/* Core Methods */}
          <section className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('핵심 메서드', 'Core Methods')}
            </h2>
            <p className="text-gray-700 mb-4">
              {t('모든 Agent가 구현해야 하는 필수 메서드입니다.', 'Required methods that all agents must implement.')}
            </p>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>
                <code className="bg-gray-100 px-2 py-1 rounded font-mono">message/send</code>{' '}
                - {t('작업 시작 및 메시지 전송', 'Start task and send message')}
              </li>
              <li>
                <code className="bg-gray-100 px-2 py-1 rounded font-mono">tasks/get</code>{' '}
                - {t('작업 상태 및 결과 조회', 'Get task status and results')}
              </li>
              <li>
                <code className="bg-gray-100 px-2 py-1 rounded font-mono">tasks/cancel</code>{' '}
                - {t('작업 취소', 'Cancel task')}
              </li>
            </ul>
          </section>

          {/* Skills */}
          <section className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('스킬 (Skills)', 'Skills')}
            </h2>
            <p className="text-gray-700 mb-4">
              {t('Agent가 수행할 수 있는 구체적인 작업입니다. 각 스킬은 고유 ID, 이름, 설명, 태그를 포함합니다.', 'Specific tasks an agent can perform. Each skill includes unique ID, name, description, and tags.')}
            </p>
            <div className="bg-gray-900 rounded p-4">
              <pre className="text-xs text-gray-100 font-mono overflow-x-auto">
{`{
  "id": "conversation",
  "name": "Basic Conversation",
  "description": "General conversation capability",
  "tags": ["chat", "nlp"]
}`}
              </pre>
            </div>
          </section>

          {/* Registry Extension */}
          <section className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('x-registry 확장 필드', 'x-registry Extension')}
            </h2>
            <p className="text-gray-700 mb-4">
              {t('Registry 관리를 위한 커스텀 필드입니다. 이 Registry에서는 필수입니다.', 'Custom fields for Registry management. Required in this Registry.')}
            </p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <code className="bg-gray-100 px-1 rounded">contact</code> - {t('담당자 이메일', 'Contact email')}</li>
              <li>• <code className="bg-gray-100 px-1 rounded">owner</code> - {t('소유자 ID', 'Owner ID')}</li>
              <li>• <code className="bg-gray-100 px-1 rounded">department</code> - {t('소속 부서', 'Department')}</li>
              <li>• <code className="bg-gray-100 px-1 rounded">homepage</code> - {t('Agent 홈페이지 URL', 'Agent homepage URL')}</li>
              <li>• <code className="bg-gray-100 px-1 rounded">usageDescription</code> - {t('사용 방법', 'Usage instructions')}</li>
              <li>• <code className="bg-gray-100 px-1 rounded">allowDelete</code> - {t('삭제 허용 여부', 'Allow deletion')} (true/false)</li>
            </ul>
          </section>

          {/* External Link */}
          <section className="bg-brand-50 border border-brand-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              {t('더 알아보기', 'Learn More')}
            </h2>
            <a
              href="https://a2a-protocol.org/v0.3.0/specification/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium"
            >
              <span>{t('A2A Protocol v0.3.0 공식 스펙', 'A2A Protocol v0.3.0 Official Specification')}</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
