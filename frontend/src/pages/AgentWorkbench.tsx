import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workbenchApi, agentApi, type ChatSession, type ChatMessage } from '../api/client';
import type { AgentCard } from '../types/agent';
import { useLanguage } from '../contexts/LanguageContext';

export default function AgentWorkbench() {
  const { agentName } = useParams<{ agentName: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const [agent, setAgent] = useState<AgentCard | null>(null);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load agent info and create session
  useEffect(() => {
    if (!agentName) {
      navigate('/');
      return;
    }

    const init = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load agent card
        const agentData = await agentApi.getAgent(agentName);
        setAgent(agentData);

        // Create chat session
        const sessionData = await workbenchApi.createSession(agentName);
        setSession(sessionData);
      } catch (err) {
        console.error('Failed to initialize workbench:', err);
        setError(
          language === 'ko'
            ? '워크벤치 초기화에 실패했습니다. Agent가 실행 중인지 확인해주세요.'
            : 'Failed to initialize workbench. Please check if the agent is running.'
        );
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [agentName, navigate, language]);

  const sendMessage = async () => {
    if (!input.trim() || !session || loading) return;

    const userMessage = input;
    setInput('');
    setError(null);

    // Create temporary user message to show immediately
    const tempUserMsg: ChatMessage = {
      message_id: `temp-${Date.now()}`,
      session_id: session.session_id,
      role: 'user',
      content: { text: userMessage },
      created_at: new Date().toISOString(),
    };

    // Add user message immediately
    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const [userMsg, agentMsg] = await workbenchApi.sendMessage(session.session_id, userMessage);
      // Replace temp message with real messages
      setMessages((prev) => {
        const filtered = prev.filter(m => m.message_id !== tempUserMsg.message_id);
        return [...filtered, userMsg, agentMsg];
      });
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(
        language === 'ko'
          ? '메시지 전송에 실패했습니다.'
          : 'Failed to send message.'
      );
      // Remove temp message and re-add to input
      setMessages((prev) => prev.filter(m => m.message_id !== tempUserMsg.message_id));
      setInput(userMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading && !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {language === 'ko' ? '워크벤치를 준비하고 있습니다...' : 'Preparing workbench...'}
          </p>
        </div>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">{language === 'ko' ? '오류' : 'Error'}</h3>
            <p className="mt-2 text-gray-600">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              {language === 'ko' ? '홈으로 돌아가기' : 'Go Home'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {agent?.name || agentName}
                </h1>
                <p className="text-sm text-gray-600">
                  {language === 'ko' ? 'Agent 플레이그라운드' : 'Agent Playground'}
                </p>
              </div>
            </div>
            {agent && (
              <div className="text-sm text-gray-600">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                  {language === 'ko' ? '실행 중' : 'Running'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Messages */}
          <div className="h-[600px] overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="mt-4 text-gray-600">
                  {language === 'ko'
                    ? 'Agent와 대화를 시작해보세요!'
                    : 'Start a conversation with the agent!'}
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.message_id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : message.content.error
                      ? 'bg-red-100 text-red-900'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap break-words">{message.content.text}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}

            {loading && messages.length > 0 && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            {error && messages.length > 0 && (
              <div className="mb-3 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>
            )}
            <div className="flex space-x-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  language === 'ko'
                    ? '메시지를 입력하세요... (Enter로 전송)'
                    : 'Type a message... (Press Enter to send)'
                }
                disabled={loading}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
