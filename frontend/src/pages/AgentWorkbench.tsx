import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workbenchApi, agentApi, type ChatSession, type ChatMessage } from '../api/client';
import type { AgentCard } from '../types/agent';
import { useLanguage } from '../contexts/LanguageContext';

export default function AgentWorkbench() {
  const { agentName } = useParams<{ agentName: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [agent, setAgent] = useState<AgentCard | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load agent and sessions
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

        // Load existing sessions (filter empty sessions and limit to 10 most recent)
        const sessionsData = await workbenchApi.listSessions(agentName);
        const nonEmptySessions = sessionsData
          .filter(session => session.message_count > 0)
          .slice(0, 10);
        setSessions(nonEmptySessions);
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

  const createNewSession = async () => {
    if (!agentName) return;

    try {
      setLoading(true);
      const newSession = await workbenchApi.createSession(agentName);
      // Don't add to sessions list yet - will be added after first message
      setCurrentSession(newSession);
      setMessages([]);
      setError(null);
    } catch (err) {
      console.error('Failed to create session:', err);
      setError(
        language === 'ko'
          ? '새 세션 생성에 실패했습니다.'
          : 'Failed to create new session.'
      );
    } finally {
      setLoading(false);
    }
  };

  const loadSession = async (session: ChatSession) => {
    try {
      setLoading(true);
      setCurrentSession(session);
      const historyData = await workbenchApi.getHistory(session.session_id);
      setMessages(historyData.messages || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load session:', err);
      setError(
        language === 'ko'
          ? '세션 불러오기에 실패했습니다.'
          : 'Failed to load session.'
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!confirm(language === 'ko' ? '이 세션을 삭제하시겠습니까?' : 'Delete this session?')) {
      return;
    }

    try {
      await workbenchApi.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.session_id !== sessionId));
      if (currentSession?.session_id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
      setError(
        language === 'ko'
          ? '세션 삭제에 실패했습니다.'
          : 'Failed to delete session.'
      );
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !currentSession || loading) return;

    const userMessage = input;
    setInput('');
    setError(null);

    // Create temporary user message
    const tempUserMsg: ChatMessage = {
      message_id: `temp-${Date.now()}`,
      session_id: currentSession.session_id,
      role: 'user',
      content: { text: userMessage },
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const [userMsg, agentMsg] = await workbenchApi.sendMessage(currentSession.session_id, userMessage);
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.message_id !== tempUserMsg.message_id);
        return [...filtered, userMsg, agentMsg];
      });

      // Update session in list or add if it's a new session with first message
      setSessions((prev) => {
        const existingSessionIndex = prev.findIndex(s => s.session_id === currentSession.session_id);
        if (existingSessionIndex >= 0) {
          // Update existing session
          return prev.map((s) =>
            s.session_id === currentSession.session_id
              ? { ...s, last_message_at: agentMsg.created_at, message_count: s.message_count + 2 }
              : s
          );
        } else {
          // Add new session to the list (first message sent)
          const newSessionInList = {
            ...currentSession,
            last_message_at: agentMsg.created_at,
            message_count: 2,
            first_message_preview: userMessage.slice(0, 100),
          };
          // Keep only 10 most recent sessions
          return [newSessionInList, ...prev].slice(0, 10);
        }
      });
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(
        language === 'ko'
          ? '메시지 전송에 실패했습니다.'
          : 'Failed to send message.'
      );
      setMessages((prev) => prev.filter((m) => m.message_id !== tempUserMsg.message_id));
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return language === 'ko' ? '오늘' : 'Today';
    } else if (days === 1) {
      return language === 'ko' ? '어제' : 'Yesterday';
    } else if (days < 7) {
      return language === 'ko' ? `${days}일 전` : `${days} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading && !agent) {
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

  if (error && !agent) {
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
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="text-gray-600 hover:text-gray-900 lg:hidden"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
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
              <div className="flex items-center space-x-3">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm">
                  {language === 'ko' ? '실행 중' : 'Running'}
                </span>
                <button
                  onClick={createNewSession}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
                >
                  {language === 'ko' ? '+ 새 세션' : '+ New Session'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex max-w-7xl mx-auto">
        {/* Session Sidebar */}
        {showSidebar && (
          <div className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              {language === 'ko' ? '대화 세션' : 'Chat Sessions'}
            </h2>
            <div className="space-y-2">
              {sessions.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">
                  {language === 'ko' ? '세션이 없습니다' : 'No sessions'}
                </p>
              )}
              {sessions.map((session) => (
                <div
                  key={session.session_id}
                  className={`p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${
                    currentSession?.session_id === session.session_id
                      ? 'bg-indigo-50 border border-indigo-200'
                      : 'bg-white border border-gray-200'
                  }`}
                  onClick={() => loadSession(session)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">
                        {formatDate(session.created_at)}
                      </p>
                      {session.first_message_preview && (
                        <p className="text-sm font-medium text-gray-900 mt-1 truncate">
                          {session.first_message_preview}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {session.message_count} {language === 'ko' ? '메시지' : 'messages'}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.session_id);
                      }}
                      className="text-gray-400 hover:text-red-500 ml-2 flex-shrink-0"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          {!currentSession ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <svg
                className="mx-auto h-16 w-16 text-gray-400"
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
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {language === 'ko' ? '세션을 선택하거나 새로 만드세요' : 'Select or create a new session'}
              </h3>
              <p className="mt-2 text-gray-600">
                {language === 'ko'
                  ? '왼쪽 사이드바에서 기존 세션을 선택하거나 새 세션을 만들어 대화를 시작하세요.'
                  : 'Select an existing session from the sidebar or create a new one to start chatting.'}
              </p>
              <button
                onClick={createNewSession}
                className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                {language === 'ko' ? '+ 새 세션 시작하기' : '+ Start New Session'}
              </button>
            </div>
          ) : (
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

                <div ref={messagesEndRef} />
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
          )}
        </div>
      </div>
    </div>
  );
}
