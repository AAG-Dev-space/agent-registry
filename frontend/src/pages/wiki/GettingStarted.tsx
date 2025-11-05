import { Book, Rocket, Code } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageToggle from '../../components/LanguageToggle';

export default function GettingStarted() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 md:px-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Rocket className="h-8 w-8 text-brand-500" />
              <h1 className="text-title-lg font-bold text-gray-900">
                {t('시작하기', 'Getting Started')}
              </h1>
            </div>
            <LanguageToggle />
          </div>
          <p className="text-theme-xl text-gray-500">
            {t(
              'Agent Registry를 시작하는 빠른 가이드',
              'Quick guide to get started with Agent Registry'
            )}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Introduction */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('Agent Registry란?', 'What is Agent Registry?')}
            </h2>
            <p className="text-gray-700 mb-4">
              {t(
                'Agent Registry는 AI 에이전트를 검색, 등록 및 관리하기 위한 중앙 집중식 플랫폼입니다. 에이전트 간의 원활한 통신과 협업을 가능하게 합니다.',
                'Agent Registry is a centralized platform for discovering, registering, and managing AI agents. It enables seamless agent-to-agent communication and collaboration.'
              )}
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                <strong>{t('주요 기능:', 'Key Features:')}</strong>{' '}
                {t(
                  '에이전트 검색, 헬스 모니터링, 스킬 기반 필터링, 역할 기반 접근 제어',
                  'Agent discovery, health monitoring, skill-based filtering, and role-based access control'
                )}
              </p>
            </div>
          </section>

          {/* Quick Start Steps */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-2 mb-6">
              <Book className="h-6 w-6 text-brand-500" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t('빠른 시작 가이드', 'Quick Start Guide')}
              </h2>
            </div>

            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-brand-100 text-brand-600 font-semibold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-2">
                    {t('사용 가능한 에이전트 둘러보기', 'Browse Available Agents')}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {t(
                      '에이전트 페이지로 이동하여 등록된 에이전트를 검색하세요. 스킬 태그를 사용하여 기능별로 에이전트를 필터링할 수 있습니다.',
                      'Navigate to the Agents page to discover registered agents. Use skill tags to filter agents by capabilities.'
                    )}{' '}
                    <a href="/agents" className="text-brand-500 hover:underline">
                      {t('에이전트 페이지', 'Agents page')}
                    </a>
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-brand-100 text-brand-600 font-semibold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-2">
                    {t('에이전트 등록하기', 'Register Your Agent')}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {t(
                      'AgentCard JSON 파일을 작성하여 웹 서버에 호스팅한 후, ',
                      'Create an AgentCard JSON file, host it on your web server, then submit the '
                    )}
                    <a href="/register" className="text-brand-500 hover:underline">
                      {t('URL을 제출', 'URL')}
                    </a>
                    {t(
                      '하세요. Registry가 자동으로 AgentCard를 가져와 등록합니다.',
                      ' on the registration page. The registry will automatically fetch and register your AgentCard.'
                    )}
                  </p>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="text-xs font-mono text-gray-700">
                      {t('권장 URL 형식:', 'Recommended URL format:')}
                    </div>
                    <div className="text-xs font-mono text-brand-600">
                      https://myagent.com/.well-known/agent-card.json
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* API Integration */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-2 mb-6">
              <Code className="h-6 w-6 text-brand-500" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t('API 통합', 'API Integration')}
              </h2>
            </div>

            <p className="text-gray-700 mb-4">
              {t(
                'REST API를 사용하여 프로그래밍 방식으로 A2A Registry와 통합하세요:',
                'Integrate with the A2A Registry programmatically using our REST API:'
              )}
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  {t('모든 에이전트 목록 조회', 'List All Agents')}
                </h3>
                <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-xs overflow-x-auto">
{`GET http://localhost:8000/agents

${t('응답:', 'Response:')}
{
  "agents": [...],
  "count": 5
}`}
                </pre>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  {t('에이전트 등록 (URL 제출)', 'Register Agent (Submit URL)')}
                </h3>
                <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-xs overflow-x-auto">
{`POST http://localhost:8000/api/v1/agents
Content-Type: application/json

{
  "agent_card_url": "https://myagent.com/.well-known/agent-card.json"
}

${t('응답:', 'Response:')}
{
  "id": "uuid-here",
  "name": "my-agent",
  "status": "active"
}`}
                </pre>
              </div>
            </div>
          </section>

          {/* Next Steps */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('다음 단계', 'Next Steps')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="/wiki/how-to-use"
                className="block p-4 rounded-lg border border-gray-200 hover:border-brand-500 hover:bg-brand-50 transition-all"
              >
                <h3 className="font-medium text-gray-900 mb-1">
                  {t('사용 방법', 'How to Use')}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('상세한 사용 가이드 및 모범 사례', 'Detailed usage guide and best practices')}
                </p>
              </a>
              <a
                href="/wiki/roadmap"
                className="block p-4 rounded-lg border border-gray-200 hover:border-brand-500 hover:bg-brand-50 transition-all"
              >
                <h3 className="font-medium text-gray-900 mb-1">
                  {t('로드맵', 'Roadmap')}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('향후 기능 및 개발 계획', 'Future features and development plans')}
                </p>
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
