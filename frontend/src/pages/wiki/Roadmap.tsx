import { Map, CheckCircle2, Circle, Clock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageToggle from '../../components/LanguageToggle';

export default function Roadmap() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 md:px-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Map className="h-8 w-8 text-brand-500" />
              <h1 className="text-title-lg font-bold text-gray-900">
                {t('로드맵', 'Roadmap')}
              </h1>
            </div>
            <LanguageToggle />
          </div>
          <p className="text-theme-xl text-gray-500">
            {t(
              'A2A Agent Registry의 향후 계획 및 개발 로드맵',
              'Future plans and development roadmap for A2A Agent Registry'
            )}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Completed Features */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle2 className="h-6 w-6 text-success-500" />
              <h2 className="text-xl font-semibold text-gray-900">
                ✓ {t('완료', 'Completed')}
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                <CheckCircle2 className="h-5 w-5 text-success-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {t('에이전트 등록 및 검색', 'Agent Registration & Discovery')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t(
                      '상세한 메타데이터로 에이전트를 등록하고 탐색할 수 있는 핵심 기능',
                      'Core functionality for registering and browsing agents with detailed metadata'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                <CheckCircle2 className="h-5 w-5 text-success-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {t('헬스 모니터링 시스템', 'Health Monitoring System')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t(
                      '5분마다 자동 헬스 체크 및 장애 추적, 상태 배지 제공',
                      'Automatic health checking every 5 minutes with failure tracking and status badges'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                <CheckCircle2 className="h-5 w-5 text-success-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {t('스킬 기반 필터링', 'Skill-Based Filtering')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t(
                      '쉬운 에이전트 검색을 위한 태그 기반 분류 및 필터링',
                      'Tag-based categorization and filtering for easy agent discovery'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                <CheckCircle2 className="h-5 w-5 text-success-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {t('JWT 인증', 'JWT Authentication')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t(
                      '역할 기반 접근 제어(관리자/사용자)를 갖춘 보안 인증 시스템',
                      'Secure authentication system with role-based access control (Admin/User)'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-success-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {t('파일 기반 저장소', 'File-Based Storage')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t(
                      '에이전트, 사용자 및 헬스 상태를 위한 JSON 파일 기반 영구 저장소',
                      'Persistent storage with JSON files for agents, users, and health status'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* In Progress */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-2 mb-6">
              <Circle className="h-6 w-6 text-brand-500" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t('진행 중', 'In Progress')}
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                <div className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full border-2 border-brand-500 bg-white"></div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {t('고급 검색 및 필터링', 'Advanced Search & Filtering')}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {t(
                      '에이전트 이름, 설명, 스킬에 대한 전체 텍스트 검색',
                      'Full-text search across agent names, descriptions, and skills'
                    )}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-brand-100 text-brand-700">
                      {t('2025년 1분기', 'Q1 2025')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full border-2 border-brand-500 bg-white"></div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {t('에이전트 버전 관리', 'Agent Versioning')}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {t(
                      '버전 히스토리와 함께 동일한 에이전트의 여러 버전 지원',
                      'Support for multiple versions of the same agent with version history'
                    )}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-brand-100 text-brand-700">
                      {t('2025년 1분기', 'Q1 2025')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Planned Features */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="h-6 w-6 text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t('계획됨', 'Planned')}
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                <Circle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {t('데이터베이스 통합', 'Database Integration')}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {t(
                      '프로덕션 배포를 위한 PostgreSQL 및 MySQL 지원',
                      'Support for PostgreSQL and MySQL for production deployments'
                    )}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                      {t('2025년 2분기', 'Q2 2025')}
                    </span>
                    <span className="text-xs text-gray-500">
                      • {t('높은 우선순위', 'High Priority')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                <Circle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {t('분석 대시보드', 'Analytics Dashboard')}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {t(
                      '사용 통계, 헬스 체크 기록 및 에이전트 인기 지표',
                      'Usage statistics, health check history, and agent popularity metrics'
                    )}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                      {t('2025년 2분기', 'Q2 2025')}
                    </span>
                    <span className="text-xs text-gray-500">
                      • {t('중간 우선순위', 'Medium Priority')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                <Circle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {t('웹훅 알림', 'Webhook Notifications')}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {t(
                      '에이전트 상태 변경 또는 새 에이전트 등록 시 실시간 알림',
                      'Real-time notifications when agent status changes or new agents are registered'
                    )}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                      {t('2025년 2분기', 'Q2 2025')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                <Circle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {t('API 키 관리', 'API Key Management')}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {t(
                      '프로그래밍 방식 접근을 위한 JWT 외 API 키 지원',
                      'Support for API keys in addition to JWT for programmatic access'
                    )}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                      {t('2025년 3분기', 'Q3 2025')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                <Circle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {t('에이전트 평가 및 리뷰', 'Agent Rating & Reviews')}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {t(
                      '에이전트에 대한 커뮤니티 기반 평가 및 리뷰',
                      'Community-driven ratings and reviews for agents'
                    )}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                      {t('2025년 3분기', 'Q3 2025')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                <Circle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {t('페이지네이션 및 무한 스크롤', 'Pagination & Infinite Scroll')}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {t(
                      '많은 수의 에이전트를 효율적으로 처리',
                      'Efficient handling of large numbers of agents'
                    )}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                      {t('2025년 3분기', 'Q3 2025')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                <Circle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {t('에이전트 카테고리', 'Agent Categories')}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {t(
                      '더 나은 구성을 위한 계층적 분류 (AI, 도구, 서비스 등)',
                      'Hierarchical categorization for better organization (AI, Tools, Services, etc.)'
                    )}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                      {t('2025년 3분기', 'Q3 2025')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Circle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {t('감사 로그', 'Audit Logging')}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {t(
                      '모든 레지스트리 작업의 완전한 감사 추적',
                      'Complete audit trail of all registry operations'
                    )}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                      {t('2025년 4분기', 'Q4 2025')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Future Considerations */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('향후 고려 사항', 'Future Considerations')}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {t(
                '향후 릴리스에서 고려 중인 기능 (일정 미정):',
                'Features being considered for future releases (timeline TBD):'
              )}
            </p>
            <ul className="space-y-2 text-sm text-gray-600 ml-6 list-disc">
              <li>{t('다국어 지원 (i18n)', 'Multi-language support (i18n)')}</li>
              <li>{t('에이전트 의존성 그래프 시각화', 'Agent dependency graph visualization')}</li>
              <li>{t('에이전트 호환성을 위한 자동화된 테스트 프레임워크', 'Automated testing framework for agent compatibility')}</li>
              <li>{t('Docker 및 Kubernetes 배포 템플릿', 'Docker & Kubernetes deployment templates')}</li>
              <li>{t('GraphQL API 엔드포인트', 'GraphQL API endpoint')}</li>
              <li>{t('실시간 협업 기능', 'Real-time collaboration features')}</li>
              <li>{t('에이전트 마켓플레이스 통합', 'Agent marketplace integration')}</li>
              <li>{t('커스텀 헬스 체크 프로토콜 (gRPC, WebSocket)', 'Custom health check protocols (gRPC, WebSocket)')}</li>
            </ul>
          </section>

          {/* Feedback */}
          <section className="rounded-2xl border border-brand-200 bg-brand-50 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {t('피드백이나 제안이 있으신가요?', 'Have Feedback or Suggestions?')}
            </h2>
            <p className="text-sm text-gray-700 mb-4">
              {t(
                'A2A Agent Registry를 개선하기 위한 여러분의 아이디어를 듣고 싶습니다! 여러분의 피드백은 기능 우선순위를 정하고 더 나은 플랫폼을 구축하는 데 도움이 됩니다.',
                "We'd love to hear your ideas for improving the A2A Agent Registry! Your feedback helps us prioritize features and build a better platform."
              )}
            </p>
            <a
              href="https://github.com/palendy/ssai_agent_registry/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {t('GitHub에서 피드백 제출', 'Submit Feedback on GitHub')}
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
