import { Map, ChevronDown, ChevronUp, CheckCircle2, Circle, Github } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageToggle from '../../components/LanguageToggle';
import { useState } from 'react';

export default function Roadmap() {
  const { t } = useLanguage();
  const [isVisionExpanded, setIsVisionExpanded] = useState(false);

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
              'Agent Registry의 개발 계획 및 비전',
              'Development plan and vision for Agent Registry'
            )}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Agent Registry Vision */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-xl font-semibold text-gray-900">
                {t('Agent Registry 비전', 'Agent Registry Vision')}
              </h2>
              <button
                onClick={() => setIsVisionExpanded(!isVisionExpanded)}
                className="flex items-center gap-2 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg text-sm font-medium transition-colors"
              >
                {isVisionExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    <span>{t('접기', 'Collapse')}</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    <span>{t('자세히 보기', 'Read More')}</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-sm text-gray-700">
              {t(
                'AI 에이전트 간의 효율적인 협업과 상호 운용성을 실현하는 중앙 레지스트리',
                'A central registry enabling efficient collaboration and interoperability between AI agents'
              )}
            </p>

            {isVisionExpanded && (
              <div className="mt-4 space-y-5 pt-4 border-t border-gray-200">
                {/* Why */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <span className="text-lg">🔍</span>
                    {t('왜 Agent Registry가 필요한가?', 'Why Agent Registry?')}
                  </h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>
                        {t(
                          '다중 에이전트 시스템(Multi-Agent System)에서 각 에이전트를 효율적으로 검색하고 선택',
                          'Efficiently discover and select agents in multi-agent systems'
                        )}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>
                        {t(
                          '표준화된 인터페이스로 에이전트 간 통신 복잡성 감소',
                          'Reduce communication complexity with standardized interfaces'
                        )}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>
                        {t(
                          '에이전트 메타데이터 중앙 관리로 운영 비용 절감',
                          'Cut operational costs through centralized metadata management'
                        )}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>
                        {t(
                          '확장 가능하고 안전하며 상호 운용 가능한 에이전트 생태계 구축',
                          'Build scalable, secure, and interoperable agent ecosystems'
                        )}
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Where */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <h3 className="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <span className="text-lg">🧩</span>
                    {t('어디에 사용되는가?', 'Use Cases')}
                  </h3>
                  <ul className="space-y-2 text-sm text-green-800">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>
                        {t(
                          '기능 기반 에이전트 검색 및 자동 라우팅 - 특정 스킬을 가진 에이전트 발견',
                          'Capability-based agent discovery and automatic routing - Find agents with specific skills'
                        )}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>
                        {t(
                          '에이전트 상태 모니터링 및 라이프사이클 관리 - 가용성, 버전, 기능 변경 추적',
                          'Agent status monitoring and lifecycle management - Track availability, versions, and capability changes'
                        )}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>
                        {t(
                          '보안 및 신뢰성 강화 - 에이전트 위장 및 보안 위협 방지',
                          'Security and reliability enhancement - Prevent agent impersonation and security threats'
                        )}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>
                        {t(
                          '도메인별 전문 에이전트 생태계 구성 - 새로운 에이전트 쉽게 온보딩',
                          'Build domain-specific expert agent ecosystems - Easy onboarding of new agents'
                        )}
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Research References */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-xs font-semibold text-gray-700 mb-3">
                    {t('📚 연구 참고 문헌', '📚 Research References')}
                  </h3>
                  <ul className="space-y-2 text-xs">
                    <li>
                      <a
                        href="https://microsoft.github.io/multi-agent-reference-architecture/docs/agent-registry/Agent-Registry.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-600 hover:text-brand-700 hover:underline flex items-start gap-1"
                      >
                        <span>•</span>
                        <span>{t('Microsoft - 다중 에이전트 레퍼런스 아키텍처 (Agent Registry)', 'Microsoft - Multi-agent Reference Architecture (Agent Registry)')}</span>
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://arxiv.org/pdf/2508.03095"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-600 hover:text-brand-700 hover:underline flex items-start gap-1"
                      >
                        <span>•</span>
                        <span>arXiv - Evolution of AI Agent Registry Solutions: Centralized, Enterprise, and Distributed</span>
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://arxiv.org/abs/2504.19951"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-600 hover:text-brand-700 hover:underline flex items-start gap-1"
                      >
                        <span>•</span>
                        <span>arXiv - Securing GenAI Multi-Agent Systems Against Tool Squatting</span>
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://arxiv.org/abs/2505.10609"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-600 hover:text-brand-700 hover:underline flex items-start gap-1"
                      >
                        <span>•</span>
                        <span>arXiv - Agent Name Service (ANS): Universal Directory for AI Agents</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </section>

          {/* Version Roadmap */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {t('버전 및 로드맵', 'Version Roadmap')}
            </h2>

            <div className="space-y-4">
              {/* v0.1 */}
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-success-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">v0.1</h3>
                    <span className="text-xs bg-success-100 text-success-700 px-2 py-0.5 rounded-full">
                      {t('완료', 'Completed')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {t(
                      '기본 기능 구현 (에이전트 등록, 삭제, 조회, 검색)',
                      'Core features (agent registration, deletion, retrieval, search)'
                    )}
                  </p>
                </div>
              </div>

              {/* v0.2 */}
              <div className="flex items-start gap-3">
                <Circle className="h-5 w-5 text-brand-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">v0.2</h3>
                    <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                      {t('진행 중', 'In Progress')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {t(
                      '사용성 개선 및 가이드 추가, 버그 수정',
                      'Usability improvements, documentation updates, bug fixes'
                    )}
                  </p>
                </div>
              </div>

              {/* v0.3 */}
              <div className="flex items-start gap-3">
                <Circle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">v0.3</h3>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {t('예정', 'Planned')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {t(
                      '간단한 통계 기능 구현',
                      'Basic analytics implementation'
                    )}
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1 ml-4">
                    <li>• {t('어떤 에이전트가 사용되는지', 'Which agents are being used')}</li>
                    <li>• {t('어떤 스킬이 인기 있는지', 'Which skills are popular')}</li>
                    <li>• {t('어떤 부서에서 활용하는지', 'Which departments are utilizing agents')}</li>
                  </ul>
                </div>
              </div>

              {/* v1.0 */}
              <div className="flex items-start gap-3">
                <Circle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">v1.0</h3>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                      {t('1차 릴리스', 'First Release')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {t(
                      '안정화 및 프로덕션 준비 완료',
                      'Stabilization and production-ready'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Feedback */}
          <section className="rounded-2xl border-2 border-brand-200 bg-gradient-to-br from-brand-50 to-white p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {t('피드백 & 제안', 'Feedback & Suggestions')}
            </h2>
            <p className="text-sm text-gray-700 mb-4">
              {t(
                '개선 아이디어나 버그 리포트가 있으시면 GitHub에서 이슈로 등록해 주세요.',
                'If you have improvement ideas or bug reports, please submit them as GitHub issues.'
              )}
            </p>
            <a
              href="https://github.samsungds.net/aiagent/agent-registry/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Github className="h-4 w-4" />
              {t('GitHub에서 이슈 제출', 'Submit Issue on GitHub')}
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
