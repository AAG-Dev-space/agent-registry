import { Book, Rocket, Code, CheckCircle } from 'lucide-react';
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
              'A2A Agent Registry를 시작하는 빠른 가이드',
              'Quick guide to get started with A2A Agent Registry'
            )}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Introduction */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('A2A Agent Registry란?', 'What is A2A Agent Registry?')}
            </h2>
            <p className="text-gray-700 mb-4">
              {t(
                'A2A Agent Registry는 AI 에이전트를 검색, 등록 및 관리하기 위한 중앙 집중식 플랫폼입니다. 에이전트 간의 원활한 통신과 협업을 가능하게 합니다.',
                'A2A Agent Registry is a centralized platform for discovering, registering, and managing AI agents. It enables seamless agent-to-agent communication and collaboration.'
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
                    <a href="/register" className="text-brand-500 hover:underline">
                      {t('에이전트 제출', 'Submit Agent')}
                    </a>{' '}
                    {t(
                      '을 클릭하여 자신의 에이전트를 등록하세요. 기본 정보, 스킬 및 선택적 헬스 체크 구성을 제공합니다.',
                      'to register your own agent. Provide basic information, skills, and optional health check configuration.'
                    )}
                  </p>
                  <div className="bg-gray-50 rounded-lg p-3 text-xs font-mono text-gray-700">
                    {t(
                      '필수 항목: 이름, 설명, URL, 버전, 프로토콜 버전',
                      'Required: Name, Description, URL, Version, Protocol Version'
                    )}
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-brand-100 text-brand-600 font-semibold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-2">
                    {t('헬스 체크 구성 (선택 사항)', 'Configure Health Checks (Optional)')}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {t(
                      '헬스 체크 엔드포인트를 제공하여 자동 헬스 모니터링을 활성화하세요. 시스템은 5분마다 에이전트의 상태를 확인합니다.',
                      'Enable automatic health monitoring by providing a health check endpoint. The system will check your agent\'s status every 5 minutes.'
                    )}
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                    <li>
                      {t('헬스 체크 URL: 에이전트의 헬스 엔드포인트', 'Health Check URL: Your agent\'s health endpoint')}
                    </li>
                    <li>{t('타임아웃: 요청 타임아웃 (기본값: 10초)', 'Timeout: Request timeout (default: 10s)')}</li>
                    <li>
                      {t('예상 상태: HTTP 상태 코드 (기본값: 200)', 'Expected Status: HTTP status code (default: 200)')}
                    </li>
                  </ul>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-brand-100 text-brand-600 font-semibold">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-2">
                    {t('접근 제어 관리', 'Manage Access Control')}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {t(
                      '자격 증명으로 로그인하여 관리 기능에 액세스하세요. 관리자 사용자는 에이전트를 삭제하고 레지스트리를 관리할 수 있습니다.',
                      'Login with your credentials to access management features. Admin users can delete agents and manage the registry.'
                    )}
                  </p>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{t('사용자: 에이전트 보기 및 등록', 'User: View and register agents')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{t('관리자: 삭제를 포함한 전체 제어', 'Admin: Full control including deletion')}</span>
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
                  {t('에이전트 등록', 'Register Agent')}
                </h3>
                <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-xs overflow-x-auto">
{`POST http://localhost:8000/agents
Content-Type: application/json

{
  "agent_card": {
    "name": "my-agent",
    "description": "${t('설명', 'Description')}",
    "url": "https://my-agent.com",
    "version": "1.0.0",
    "protocol_version": "0.3.0",
    "preferred_transport": "JSONRPC",
    "skills": [
      {"id": "skill-name", "description": "${t('스킬 설명', 'Skill desc')}"}
    ]
  }
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
