import { BookOpen } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function GettingStarted() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 md:px-6 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-8 w-8 text-brand-500" />
            <h1 className="text-3xl font-bold text-gray-900">
              {t('시작하기', 'Getting Started')}
            </h1>
          </div>
          <p className="text-gray-600">
            {t('Agent Registry 사용 가이드', 'Agent Registry Usage Guide')}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Docker Images로 Agent 시작 */}
          <section className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('1. Docker Images에서 Agent 시작', '1. Start Agent from Docker Images')}
            </h2>
            <ol className="space-y-3 text-gray-700">
              <li className="flex gap-2">
                <span className="font-semibold">1.</span>
                <span>{t('상단 메뉴에서 "Docker Images" 클릭', 'Click "Docker Images" in the top menu')}</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">2.</span>
                <span>{t('시작할 이미지의 태그에서 "시작" 버튼 클릭', 'Click "Start" button on the desired image tag')}</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">3.</span>
                <span>{t('LLM 설정 입력 (Model, API Base, API Key)', 'Enter LLM settings (Model, API Base, API Key)')}</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">4.</span>
                <span>{t('Agent가 자동으로 시작되고 Agent 목록에 등록됨', 'Agent starts automatically and is registered in the agent list')}</span>
              </li>
            </ol>
          </section>

          {/* Agent 사용 */}
          <section className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('2. Agent 사용하기', '2. Using Agents')}
            </h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold mb-2">{t('Playground에서 테스트', 'Test in Playground')}</h3>
                <p>{t('Agent 카드의 "Playground" 버튼을 클릭하여 실시간 대화 테스트', 'Click "Playground" button on agent card to test real-time conversation')}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">{t('API로 호출', 'Call via API')}</h3>
                <p>{t('Agent Detail 페이지에서 Agent URL과 전송 프로토콜 확인 후 직접 호출', 'Check Agent URL and transport protocol in Agent Detail page, then call directly')}</p>
              </div>
            </div>
          </section>

          {/* Agent 관리 */}
          <section className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('3. Agent 관리', '3. Managing Agents')}
            </h2>
            <div className="space-y-3 text-gray-700">
              <div>
                <span className="font-semibold">{t('인스턴스 확인:', 'View Instances:')}</span>{' '}
                <span>{t('Agent Detail 페이지에서 실행 중인 Docker 컨테이너 확인', 'Check running Docker containers in Agent Detail page')}</span>
              </div>
              <div>
                <span className="font-semibold">{t('인스턴스 삭제:', 'Delete Instances:')}</span>{' '}
                <span>{t('"모든 인스턴스 삭제" 버튼으로 일괄 삭제', 'Delete all at once with "Delete All Instances" button')}</span>
              </div>
              <div>
                <span className="font-semibold">{t('통계 확인:', 'View Statistics:')}</span>{' '}
                <span>{t('상단 메뉴 "Statistics"에서 전체 Agent 현황 확인', 'Check overall agent status in "Statistics" menu')}</span>
              </div>
            </div>
          </section>

          {/* 외부 Agent 등록 (API) */}
          <section className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('4. 외부 Agent 등록 (API)', '4. Register External Agent (API)')}
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                {t('외부에 호스팅된 Agent를 등록하려면 AgentCard URL을 통해 등록:', 'To register externally hosted agents, register via AgentCard URL:')}
              </p>
              <div className="bg-gray-900 rounded p-4">
                <pre className="text-xs text-gray-100 font-mono overflow-x-auto">
{`curl -X POST http://localhost:7601/api/v1/agents/register-by-url \\
  -H "Content-Type: application/json" \\
  -d '{
    "agent_card_url": "http://your-domain/.well-known/agent-card.json"
  }'`}
                </pre>
              </div>
              <p className="text-sm text-gray-600">
                {t('AgentCard는 A2A Protocol v0.3.0을 따라야 하며, 필수 필드를 포함해야 합니다.', 'AgentCard must follow A2A Protocol v0.3.0 and include required fields.')}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
