import { BookOpen, Search, PlusCircle, Activity, Shield, Tag } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageToggle from '../../components/LanguageToggle';

export default function HowToUse() {
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
                {t('사용 방법', 'How to Use')}
              </h1>
            </div>
            <LanguageToggle />
          </div>
          <p className="text-theme-xl text-gray-500">
            {t(
              'A2A Agent Registry 사용을 위한 종합 가이드',
              'Comprehensive guide for using the A2A Agent Registry'
            )}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Discovering Agents */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-2 mb-6">
              <Search className="h-6 w-6 text-brand-500" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t('에이전트 검색', 'Discovering Agents')}
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  {t('모든 에이전트 둘러보기', 'Browse All Agents')}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {t(
                    '등록된 에이전트를 보려면',
                    'Visit the'
                  )}{' '}
                  <a href="/agents" className="text-brand-500 hover:underline">
                    {t('에이전트', 'Agents')}
                  </a>{' '}
                  {t(
                    '페이지를 방문하세요. 각 카드에는 다음이 표시됩니다:',
                    'page to see all registered agents. Each card displays:'
                  )}
                </p>
                <ul className="text-sm text-gray-600 space-y-2 ml-6 list-disc">
                  <li>
                    <strong>{t('에이전트 이름', 'Agent Name')}</strong>:{' '}
                    {t('고유 식별자', 'Unique identifier')}
                  </li>
                  <li>
                    <strong>{t('설명', 'Description')}</strong>:{' '}
                    {t('에이전트가 수행하는 작업', 'What the agent does')}
                  </li>
                  <li>
                    <strong>{t('스킬', 'Skills')}</strong>:{' '}
                    {t('기능 및 특징', 'Capabilities and features')}
                  </li>
                  <li>
                    <strong>{t('헬스 상태', 'Health Status')}</strong>:{' '}
                    {t('활성, 비활성 또는 알 수 없음', 'Active, Inactive, or Unknown')}
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  {t('스킬로 필터링', 'Filter by Skills')}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {t(
                    '스킬 태그를 사용하여 기능별로 에이전트를 필터링하세요. 스킬 태그를 클릭하면 해당 스킬을 가진 에이전트만 표시됩니다.',
                    'Use skill tags to filter agents by their capabilities. Click on any skill tag to see only agents with that skill.'
                  )}
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="h-4 w-4 text-gray-600" />
                    <span className="text-xs font-medium text-gray-700">
                      {t('예시 태그:', 'Example Tags:')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-md text-xs font-medium bg-gray-200 text-gray-700">
                      data-analysis
                    </span>
                    <span className="px-3 py-1 rounded-md text-xs font-medium bg-gray-200 text-gray-700">
                      machine-learning
                    </span>
                    <span className="px-3 py-1 rounded-md text-xs font-medium bg-gray-200 text-gray-700">
                      conversation
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  {t('에이전트 세부 정보 보기', 'View Agent Details')}
                </h3>
                <p className="text-sm text-gray-600">
                  {t(
                    '에이전트 카드를 클릭하여 버전, 프로토콜, 전송 방법 및 전체 스킬 목록을 포함한 자세한 정보를 확인하세요.',
                    'Click on any agent card to view detailed information including version, protocol, transport method, and full skill list.'
                  )}
                </p>
              </div>
            </div>
          </section>

          {/* Registering Agents */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-2 mb-6">
              <PlusCircle className="h-6 w-6 text-brand-500" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t('에이전트 등록하기', 'Registering Your Agent')}
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  {t('기본 정보', 'Basic Information')}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {t(
                    '필수 항목을',
                    'Fill in the required fields on the'
                  )}{' '}
                  <a href="/register" className="text-brand-500 hover:underline">
                    {t('에이전트 제출', 'Submit Agent')}
                  </a>{' '}
                  {t(
                    '페이지에서 입력하세요:',
                    'page:'
                  )}
                </p>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-gray-700 min-w-[140px]">
                      {t('에이전트 이름:', 'Agent Name:')}
                    </span>
                    <span className="text-gray-600">
                      {t('고유 식별자 (예: my-awesome-agent)', 'Unique identifier (e.g., my-awesome-agent)')}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-gray-700 min-w-[140px]">
                      {t('설명:', 'Description:')}
                    </span>
                    <span className="text-gray-600">
                      {t('에이전트가 수행하는 작업', 'What your agent does')}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-gray-700 min-w-[140px]">
                      {t('에이전트 URL:', 'Agent URL:')}
                    </span>
                    <span className="text-gray-600">
                      {t('에이전트 서비스의 기본 URL', 'Base URL of your agent service')}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-gray-700 min-w-[140px]">
                      {t('버전:', 'Version:')}
                    </span>
                    <span className="text-gray-600">
                      {t('에이전트 버전 (예: 1.0.0)', 'Your agent version (e.g., 1.0.0)')}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-gray-700 min-w-[140px]">
                      {t('프로토콜 버전:', 'Protocol Version:')}
                    </span>
                    <span className="text-gray-600">
                      {t('A2A 프로토콜 버전 (예: 0.3.0)', 'A2A protocol version (e.g., 0.3.0)')}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-gray-700 min-w-[140px]">
                      {t('전송:', 'Transport:')}
                    </span>
                    <span className="text-gray-600">
                      {t('JSONRPC, REST, GRPC 또는 GraphQL', 'JSONRPC, REST, GRPC, or GraphQL')}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  {t('스킬 추가하기', 'Adding Skills')}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {t(
                    '스킬은 다른 사람들이 에이전트의 기능을 발견하는 데 도움이 됩니다:',
                    'Skills help others discover your agent\'s capabilities:'
                  )}
                </p>
                <ol className="text-sm text-gray-600 space-y-2 ml-6 list-decimal">
                  <li>
                    {t('스킬 ID를 입력하세요 (예: "data-analysis", "weather-forecast")', 'Enter a skill ID (e.g., "data-analysis", "weather-forecast")')}
                  </li>
                  <li>
                    {t('이 스킬이 수행하는 작업에 대한 설명을 제공하세요', 'Provide a description of what this skill does')}
                  </li>
                  <li>
                    {t('"스킬 추가"를 클릭하여 에이전트에 추가하세요', 'Click "Add Skill" to add it to your agent')}
                  </li>
                  <li>
                    {t('추가 스킬에 대해 반복하세요', 'Repeat for additional skills')}
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  {t('헬스 체크 구성', 'Health Check Configuration')}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {t(
                    '선택 사항이지만 모니터링을 위해 권장됩니다:',
                    'Optional but recommended for monitoring:'
                  )}
                </p>
                <ul className="text-sm text-gray-600 space-y-2 ml-6 list-disc">
                  <li>
                    {t('"헬스 체크 활성화" 스위치를 토글하세요', 'Toggle "Enable Health Check" switch')}
                  </li>
                  <li>
                    {t('에이전트의 헬스 체크 엔드포인트 URL을 입력하세요', 'Enter your agent\'s health check endpoint URL')}
                  </li>
                  <li>
                    {t('타임아웃 설정 (기본값: 10초)', 'Set timeout (default: 10 seconds)')}
                  </li>
                  <li>
                    {t('예상 HTTP 상태 코드 설정 (기본값: 200)', 'Set expected HTTP status code (default: 200)')}
                  </li>
                </ul>
                <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-700">
                    <strong>{t('참고:', 'Note:')}</strong>{' '}
                    {t(
                      '헬스 체크가 3회 연속 실패하면 에이전트가 비활성으로 표시됩니다.',
                      'If health checks fail 3 times consecutively, your agent will be marked as inactive.'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Health Monitoring */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="h-6 w-6 text-brand-500" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t('헬스 모니터링', 'Health Monitoring')}
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  {t('작동 방식', 'How It Works')}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {t(
                    '레지스트리는 5분마다 자동으로 에이전트 헬스를 모니터링합니다:',
                    'The registry automatically monitors agent health every 5 minutes:'
                  )}
                </p>
                <ol className="text-sm text-gray-600 space-y-2 ml-6 list-decimal">
                  <li>
                    {t('시스템이 헬스 체크 URL로 HTTP GET 요청을 전송합니다', 'System sends HTTP GET request to your health check URL')}
                  </li>
                  <li>
                    {t(
                      '응답 상태가 예상 코드와 일치하면 → 에이전트가',
                      'If response status matches expected code → Agent stays'
                    )}{' '}
                    <strong>{t('활성', 'Active')}</strong>{' '}
                    {t('상태를 유지합니다', '')}
                  </li>
                  <li>
                    {t('요청이 실패하면 → 실패 횟수가 증가합니다', 'If request fails → Failure count increases')}
                  </li>
                  <li>
                    {t(
                      '3회 연속 실패 후 → 에이전트가',
                      'After 3 consecutive failures → Agent marked'
                    )}{' '}
                    <strong>{t('비활성', 'Inactive')}</strong>{' '}
                    {t('으로 표시됩니다', '')}
                  </li>
                  <li>
                    {t('헬스 체크가 통과되면 → 실패 횟수가 0으로 재설정됩니다', 'Once health check passes → Failure count resets to 0')}
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  {t('헬스 상태 배지', 'Health Status Badges')}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-success-50 text-success-700">
                      {t('✓ 활성', '✓ Active')}
                    </span>
                    <span className="text-sm text-gray-600">
                      {t('에이전트가 정상이며 응답 중입니다', 'Agent is healthy and responding')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-error-50 text-error-700">
                      {t('✗ 비활성', '✗ Inactive')}
                    </span>
                    <span className="text-sm text-gray-600">
                      {t('에이전트가 3회 이상 헬스 체크에 실패했습니다', 'Agent failed 3+ health checks')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
                      {t('? 알 수 없음', '? Unknown')}
                    </span>
                    <span className="text-sm text-gray-600">
                      {t('헬스 체크가 구성되지 않았습니다', 'No health check configured')}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  {t('모범 사례', 'Best Practices')}
                </h3>
                <ul className="text-sm text-gray-600 space-y-2 ml-6 list-disc">
                  <li>
                    {t('간단하고 가벼운 헬스 엔드포인트를 사용하세요 (예: /health 또는 /healthz)', 'Use a simple, lightweight health endpoint (e.g., /health or /healthz)')}
                  </li>
                  <li>
                    {t('서비스가 정상일 때 HTTP 200을 반환하세요', 'Return HTTP 200 when your service is healthy')}
                  </li>
                  <li>
                    {t('헬스 체크 응답을 빠르게 유지하세요 (타임아웃 제한 이내)', 'Keep health check responses fast (under timeout limit)')}
                  </li>
                  <li>
                    {t('헬스 체크에서 비용이 많이 드는 작업을 수행하지 마세요', 'Don\'t perform expensive operations in health checks')}
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Access Control */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="h-6 w-6 text-brand-500" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t('접근 제어 및 역할', 'Access Control')}
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  {t('사용자 역할', 'User Roles')}
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                        {t('사용자', 'User')}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {t('일반 사용자', 'Standard User')}
                      </span>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                      <li>{t('모든 에이전트 보기', 'View all agents')}</li>
                      <li>{t('새 에이전트 등록', 'Register new agents')}</li>
                      <li>{t('에이전트 세부 정보 보기', 'View agent details')}</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-brand-100 text-brand-700">
                        {t('관리자', 'Admin')}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {t('관리자', 'Administrator')}
                      </span>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                      <li>{t('모든 사용자 권한', 'All User permissions')}</li>
                      <li>{t('에이전트 삭제', 'Delete agents')}</li>
                      <li>{t('레지스트리 관리', 'Manage registry')}</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  {t('인증', 'Authentication')}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {t(
                    '관리 기능에 액세스하려면 로그인하세요:',
                    'Login to access management features:'
                  )}
                </p>
                <ol className="text-sm text-gray-600 space-y-2 ml-6 list-decimal">
                  <li>
                    {t('탐색 모음에서 "로그인"을 클릭하세요', 'Click "Login" in the navigation bar')}
                  </li>
                  <li>
                    {t('사용자 이름과 비밀번호를 입력하세요', 'Enter your username and password')}
                  </li>
                  <li>
                    {t('JWT 토큰이 브라우저에 안전하게 저장됩니다', 'JWT token is stored securely in browser')}
                  </li>
                  <li>
                    {t('토큰은 API 요청에 자동으로 포함됩니다', 'Token is automatically included in API requests')}
                  </li>
                </ol>
              </div>
            </div>
          </section>

          {/* Best Practices */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('모범 사례', 'Best Practices')}
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-semibold">
                  1
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    {t('설명적인 이름 사용', 'Use Descriptive Names')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t(
                      '에이전트와 스킬에 명확하고 설명적인 이름을 선택하세요',
                      'Choose clear, descriptive names for your agents and skills'
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-semibold">
                  2
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    {t('적절하게 태그 지정', 'Tag Appropriately')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t(
                      '에이전트를 검색 가능하게 만들기 위해 관련 스킬을 추가하세요',
                      'Add relevant skills to make your agent discoverable'
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-semibold">
                  3
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    {t('헬스 체크 활성화', 'Enable Health Checks')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t(
                      '프로덕션 에이전트의 경우 항상 헬스 모니터링을 구성하세요',
                      'Always configure health monitoring for production agents'
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-semibold">
                  4
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    {t('정보를 최신 상태로 유지', 'Keep Information Updated')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t(
                      '기능이 변경되면 에이전트 세부 정보를 업데이트하세요',
                      'Update your agent details when capabilities change'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
