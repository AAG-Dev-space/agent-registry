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
              'Agent Registry의 향후 계획 및 개발 로드맵',
              'Future plans and development roadmap for Agent Registry'
            )}
          </p>
        </div>

        {/* A2A Protocol Vision */}
        <section className="rounded-2xl border-2 border-brand-200 bg-gradient-to-br from-brand-50 to-white p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            {t('프로젝트 비전', 'Project Vision')}
          </h2>
          <p className="text-sm text-gray-700 mb-4">
            {t(
              'SSAI Agent Registry는 A2A (Agent-to-Agent) 프로토콜을 기반으로 하는 에이전트 검색 및 관리 플랫폼입니다. 본 프로젝트는 분산 AI 에이전트 생태계에서 에이전트 간 상호 운용성과 협업을 가능하게 하는 것을 목표로 합니다.',
              'SSAI Agent Registry is an agent discovery and management platform based on the A2A (Agent-to-Agent) protocol. This project aims to enable interoperability and collaboration between agents in a distributed AI agent ecosystem.'
            )}
          </p>
          <div className="bg-white rounded-lg p-4 border border-brand-100">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">
              {t('A2A Protocol 장기 방향성', 'A2A Protocol Long-term Vision')}
            </h3>
            <ul className="space-y-1.5 text-xs text-gray-600">
              <li>• {t('150개 이상의 조직이 참여하는 Linux Foundation 오픈소스 프로젝트', 'Linux Foundation open-source project with 150+ organizations')}</li>
              <li>• {t('서로 다른 프레임워크, 플랫폼, 공급업체 간 에이전트 상호운용성', 'Agent interoperability across frameworks, platforms, and vendors')}</li>
              <li>• {t('엔터프라이즈 보안, 컴플라이언스, 책임성을 유지하면서 확장', 'Enterprise scalability with security, compliance, and accountability')}</li>
              <li>• {t('A2A Inspector, TCK를 통한 에이전트 검증 및 호환성 보장', 'Agent validation and compatibility via A2A Inspector and TCK')}</li>
            </ul>
          </div>
        </section>

        {/* Content */}
        <div className="space-y-6">
          {/* Version 1.0 - Current */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-6 w-6 text-success-500" />
              <h2 className="text-xl font-semibold text-gray-900">
                Version 1.0 - {t('기본 Registry 기능', 'Basic Registry Features')} ✓
              </h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {t(
                '목적: 에이전트 인벤토리 관리 및 기본 검색 기능',
                'Purpose: Agent inventory management and basic discovery'
              )}
            </p>

            <div className="bg-brand-50 rounded-lg p-4 mb-4 border border-brand-100">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">
                {t('현재 상태', 'Current Status')}
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-600">{t('등록된 에이전트', 'Registered Agents')}:</span>
                  <span className="ml-2 font-semibold text-brand-700">5개</span>
                </div>
                <div>
                  <span className="text-gray-600">{t('프로토콜 버전', 'Protocol Version')}:</span>
                  <span className="ml-2 font-semibold text-brand-700">A2A v0.3.0</span>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xs text-gray-600 mb-1">{t('샘플 에이전트', 'Sample Agents')}:</p>
                <ul className="text-xs text-gray-600 space-y-0.5 ml-4">
                  <li>• Weather Assistant (v1.0.0)</li>
                  <li>• Translation Agent (v2.1.0)</li>
                  <li>• Code Assistant (v3.0.1)</li>
                  <li>• Database Query Agent (v1.5.2)</li>
                  <li>• Image Generation Agent (v2.0.0)</li>
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 text-sm mb-2">
                {t('구현 완료 기능', 'Implemented Features')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{t('에이전트 등록', 'Agent Registration')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{t('에이전트 검색', 'Agent Search')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{t('헬스 체크', 'Health Monitoring')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{t('스킬 필터링', 'Skill Filtering')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{t('다중 프로토콜 지원', 'Multi-Protocol Support')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{t('REST API', 'REST API')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{t('Docker 배포', 'Docker Deployment')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{t('웹 UI', 'Web UI')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{t('JWT 인증', 'JWT Authentication')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{t('파일 기반 저장소', 'File-Based Storage')}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Version 2.0 - Analytics */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-2 mb-4">
              <Circle className="h-6 w-6 text-brand-500" />
              <h2 className="text-xl font-semibold text-gray-900">
                Version 2.0 - {t('에이전트 효율성 분석', 'Agent Effectiveness Analysis')}
              </h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {t(
                '목적: 에이전트 사용성 및 효과성 모니터링',
                'Purpose: Monitoring agent usability and effectiveness'
              )}
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                <div className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full border-2 border-brand-500 bg-white"></div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {t('에이전트 사용 통계', 'Agent Usage Statistics')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t(
                      '에이전트별 호출 횟수, 응답 시간, 성공률, 인기 스킬 분석',
                      'Call counts, response times, success rates, and popular skills analysis per agent'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                <div className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full border-2 border-brand-500 bg-white"></div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {t('성능 메트릭', 'Performance Metrics')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t(
                      '평균 응답 시간, 에러율, 가용성 지표(Uptime), SLA 준수율 추적',
                      'Average response time, error rate, uptime metrics, and SLA compliance tracking'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                <div className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full border-2 border-brand-500 bg-white"></div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {t('사용자 피드백 시스템', 'User Feedback System')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t(
                      '에이전트 평가(별점), 사용 후기, 댓글, 추천 알고리즘',
                      'Agent ratings (stars), reviews, comments, and recommendation algorithms'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full border-2 border-brand-500 bg-white"></div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {t('실시간 모니터링 대시보드', 'Real-time Monitoring Dashboard')}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {t(
                      '통계 시각화, 이상 탐지 알림, WebSocket 기반 실시간 업데이트',
                      'Statistics visualization, anomaly detection alerts, WebSocket-based real-time updates'
                    )}
                  </p>
                  <div className="text-xs text-gray-500">
                    {t('기술 스택', 'Tech Stack')}: Prometheus/Grafana, PostgreSQL/MongoDB, WebSocket
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Version 3.0 - Autonomous Collaboration */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-6 w-6 text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900">
                Version 3.0 - {t('에이전트 간 자율 협업', 'Autonomous Agent Collaboration')}
              </h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {t(
                '목적: 에이전트가 능동적으로 다른 에이전트를 발견하고 활용',
                'Purpose: Agents proactively discover and utilize other agents'
              )}
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                <Circle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {t('자율 에이전트 발견', 'Autonomous Agent Discovery')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t(
                      '에이전트가 Registry API를 통해 필요한 다른 에이전트 검색, 스킬 기반 자동 매칭, 런타임 발견 및 바인딩',
                      'Agents search for needed agents via Registry API, skill-based auto-matching, runtime discovery and binding'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                <Circle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {t('에이전트 간 직접 통신', 'Direct Agent-to-Agent Communication')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t(
                      'A2A Protocol 기반 직접 통신, 메시지 라우팅, 비동기 태스크 위임',
                      'A2A Protocol-based direct communication, message routing, async task delegation'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                <Circle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {t('워크플로우 오케스트레이션', 'Workflow Orchestration')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t(
                      '다중 에이전트 체인 구성, 조건부 라우팅, 에러 핸들링 및 재시도',
                      'Multi-agent chain composition, conditional routing, error handling and retry logic'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                <Circle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {t('신뢰 및 평판 시스템', 'Trust & Reputation System')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t(
                      '에이전트 신뢰 점수, 검증된 에이전트 인증, 보안 정책 관리',
                      'Agent trust scores, verified agent certification, security policy management'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Circle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {t('지능형 부하 분산', 'Intelligent Load Balancing')}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {t(
                      '동일 기능 에이전트 간 로드 밸런싱, 지역 기반 라우팅, 비용 최적화',
                      'Load balancing across same-capability agents, geo-based routing, cost optimization'
                    )}
                  </p>
                  <div className="text-xs text-gray-500">
                    {t('기술 스택', 'Tech Stack')}: RabbitMQ/Kafka, Service Mesh (Istio), Temporal/Airflow, mTLS
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Todo List */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('단기 Todo 목록', 'Short-term Todo List')}
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <input type="checkbox" className="mt-1" disabled />
                <div>
                  <h3 className="font-medium text-gray-900">
                    {t('실제 에이전트 연결 테스트', 'Test with Real Agent Integration')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t('실제 동작하는 A2A 에이전트 구축 및 End-to-end 시나리오 검증', 'Build working A2A agent and verify end-to-end scenarios')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <input type="checkbox" className="mt-1" disabled />
                <div>
                  <h3 className="font-medium text-gray-900">
                    {t('HTTPS 적용', 'Apply HTTPS')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t('SSL/TLS 인증서 구성, 프로덕션 도메인 설정, 보안 헤더 적용', 'SSL/TLS certificate setup, production domain, security headers')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <input type="checkbox" className="mt-1" disabled />
                <div>
                  <h3 className="font-medium text-gray-900">
                    {t('데이터베이스 전환', 'Database Migration')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t('File-based storage에서 PostgreSQL로 마이그레이션 및 성능 최적화', 'Migrate from file-based storage to PostgreSQL with performance optimization')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <input type="checkbox" className="mt-1" disabled />
                <div>
                  <h3 className="font-medium text-gray-900">
                    {t('사용자 인증 개선', 'Improve User Authentication')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t('Email 토큰 기반 인증 시스템 구현 및 보안 강화', 'Implement email token-based authentication and enhance security')}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Feedback */}
          <section className="rounded-2xl border border-brand-200 bg-brand-50 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {t('피드백이나 제안이 있으신가요?', 'Have Feedback or Suggestions?')}
            </h2>
            <p className="text-sm text-gray-700 mb-4">
              {t(
                'Agent Registry를 개선하기 위한 여러분의 아이디어를 듣고 싶습니다! 여러분의 피드백은 기능 우선순위를 정하고 더 나은 플랫폼을 구축하는 데 도움이 됩니다.',
                "We'd love to hear your ideas for improving the Agent Registry! Your feedback helps us prioritize features and build a better platform."
              )}
            </p>
            <a
              href="https://github.samsungds.net/aiagent/agent-registry/issues"
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
