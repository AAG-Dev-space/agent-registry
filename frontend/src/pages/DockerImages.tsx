import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Play, Loader2, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { dockerRegistryApi, agentLoaderApi } from '../api/client';

interface DockerImage {
  repository: string;
  tags: string[];
  image_count: number;
}

interface StartConfig {
  repository: string;
  tag: string;
  env_vars: {
    AGENT_MODEL: string;
    AGENT_API_BASE: string;
    AGENT_API_KEY: string;
  };
}

export default function DockerImages() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [images, setImages] = useState<DockerImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Start modal state
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ repository: string; tag: string } | null>(null);
  const [startingAgent, setStartingAgent] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [startSuccess, setStartSuccess] = useState(false);

  // Environment variables
  const [envVars, setEnvVars] = useState({
    AGENT_MODEL: 'gemini/gemini-2.5-flash',
    AGENT_API_BASE: 'http://host.docker.internal:4444',
    AGENT_API_KEY: 'sk-4444'
  });

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dockerRegistryApi.listImages();
      setImages(data);
    } catch (err: any) {
      console.error('Failed to load Docker images:', err);
      setError(err.response?.data?.detail || 'Failed to load Docker images');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadImages();
    setRefreshing(false);
  };

  const openStartModal = (repository: string, tag: string) => {
    setSelectedImage({ repository, tag });
    setShowStartModal(true);
    setStartError(null);
    setStartSuccess(false);
  };

  const closeStartModal = () => {
    setShowStartModal(false);
    setSelectedImage(null);
    setStartError(null);
    setStartSuccess(false);
  };

  const handleStartAgent = async () => {
    if (!selectedImage) return;

    try {
      setStartingAgent(true);
      setStartError(null);

      // Use harbor.local:5100 for Harbor (mapped via extra_hosts)
      const dockerImage = `harbor.local:5100/${selectedImage.repository}:${selectedImage.tag}`;

      await agentLoaderApi.startInstance({
        docker_image: dockerImage,
        env_vars: envVars,
      });

      setStartSuccess(true);

      // Redirect to agents list after 2 seconds
      setTimeout(() => {
        closeStartModal();
        navigate('/agents');
      }, 2000);
    } catch (err: any) {
      console.error('Failed to start agent:', err);
      setStartError(err.response?.data?.detail || 'Failed to start agent');
    } finally {
      setStartingAgent(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="animate-spin text-brand-500" size={40} />
          <span className="text-lg text-gray-500">
            {language === 'ko' ? 'Docker 이미지 로딩 중...' : 'Loading Docker images...'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-title-md font-bold text-gray-900 mb-2">
                {language === 'ko' ? 'Docker 이미지 목록' : 'Docker Images'}
              </h1>
              <p className="text-gray-500">
                {language === 'ko'
                  ? 'Private Docker Registry에서 이미지를 선택하여 Agent를 시작하세요'
                  : 'Select an image from the Private Docker Registry to start an Agent'}
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 disabled:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {language === 'ko' ? '새로고침' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-2xl border border-error-200 bg-error-50 p-6 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-error-500" size={20} />
              <div>
                <p className="text-error-700 font-medium">{error}</p>
                <p className="text-error-600 text-sm mt-1">
                  {language === 'ko'
                    ? 'Harbor Registry가 실행 중인지 확인하세요 (http://localhost:5100)'
                    : 'Make sure Harbor Registry is running (http://localhost:5100)'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Images Grid */}
        {images.length === 0 && !error ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {language === 'ko' ? '등록된 이미지가 없습니다' : 'No images found'}
            </h3>
            <p className="text-gray-600">
              {language === 'ko'
                ? 'Docker Registry에 이미지를 push하세요'
                : 'Push images to your Docker Registry'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <div
                key={image.repository}
                className="rounded-2xl border border-gray-200 bg-white p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{image.repository}</h3>
                      <p className="text-sm text-gray-500">
                        {image.image_count} {language === 'ko' ? '개 태그' : 'tags'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {language === 'ko' ? '사용 가능한 태그:' : 'Available Tags:'}
                  </p>
                  {image.tags.slice(0, 5).map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <code className="text-sm text-gray-900 font-mono">{tag}</code>
                      <button
                        onClick={() => openStartModal(image.repository, tag)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors"
                      >
                        <Play className="h-3 w-3" />
                        {language === 'ko' ? '시작' : 'Start'}
                      </button>
                    </div>
                  ))}
                  {image.tags.length > 5 && (
                    <p className="text-xs text-gray-500 text-center pt-2">
                      +{image.tags.length - 5} {language === 'ko' ? '개 더 보기' : 'more'}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Start Agent Modal */}
        {showStartModal && selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Play className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {language === 'ko' ? 'Agent 시작' : 'Start Agent'}
                </h3>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  {language === 'ko'
                    ? 'Docker 이미지를 pull하고 Agent를 시작합니다.'
                    : 'Pull Docker image and start the agent.'}
                </p>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {language === 'ko' ? '선택한 이미지:' : 'Selected Image:'}
                  </p>
                  <code className="text-sm text-gray-900 font-mono break-all">
                    localhost:5100/{selectedImage.repository}:{selectedImage.tag}
                  </code>
                </div>

                {/* Environment Variables */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LLM Model
                    </label>
                    <input
                      type="text"
                      value={envVars.AGENT_MODEL}
                      onChange={(e) => setEnvVars({ ...envVars, AGENT_MODEL: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="gemini/gemini-2.0-flash-exp"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Base URL
                    </label>
                    <input
                      type="text"
                      value={envVars.AGENT_API_BASE}
                      onChange={(e) => setEnvVars({ ...envVars, AGENT_API_BASE: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="http://host.docker.internal:4444/"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Key
                    </label>
                    <input
                      type="password"
                      value={envVars.AGENT_API_KEY}
                      onChange={(e) => setEnvVars({ ...envVars, AGENT_API_KEY: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="sk-xxxx"
                    />
                  </div>
                </div>
              </div>

              {/* Success Message */}
              {startSuccess && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <p className="font-medium">
                      {language === 'ko' ? 'Agent가 성공적으로 시작되었습니다!' : 'Agent started successfully!'}
                    </p>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    {language === 'ko' ? 'Agent 목록으로 이동 중...' : 'Redirecting to agents list...'}
                  </p>
                </div>
              )}

              {/* Error Message */}
              {startError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    <p className="font-medium">{startError}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={closeStartModal}
                  disabled={startingAgent || startSuccess}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  {language === 'ko' ? '취소' : 'Cancel'}
                </button>
                <button
                  onClick={handleStartAgent}
                  disabled={startingAgent || startSuccess}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {startingAgent ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {language === 'ko' ? '시작 중...' : 'Starting...'}
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      {language === 'ko' ? '시작' : 'Start'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
