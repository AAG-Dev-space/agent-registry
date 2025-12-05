"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ChatSession {
  session_id: string;
  agent_name: string;
  created_at: string;
  last_message_at: string;
  message_count: number;
  first_message_preview?: string;
}

export default function WorkbenchPage() {
  const params = useParams();
  const router = useRouter();
  const agentName = params.agentName as string;

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentThreadId, setCurrentThreadId] = useState<string | undefined>(undefined);
  const [historyMessages, setHistoryMessages] = useState<any[]>([]);

  const loadSessions = async () => {
    try {
      // Use relative URL - will be proxied by Next.js rewrites
      const response = await fetch(`/api/backend/v1/workbench/agents/${encodeURIComponent(agentName)}/sessions`);
      if (response.ok) {
        const data = await response.json();
        // Filter non-empty sessions and limit to 5 most recent
        const nonEmptySessions = data
          .filter((s: ChatSession) => s.message_count > 0)
          .slice(0, 5);
        setSessions(nonEmptySessions);
      }
    } catch (error) {
      console.error("Failed to load sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/backend/v1/workbench/sessions/${sessionId}/history`);
      if (response.ok) {
        const data = await response.json();
        // Convert backend messages to CopilotKit format
        const messages = data.messages.map((msg: any) => ({
          id: msg.message_id,
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content.text || '',
        }));
        setHistoryMessages(messages);
      }
    } catch (error) {
      console.error("Failed to load history:", error);
      setHistoryMessages([]);
    }
  };

  // Load existing sessions
  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentName]);

  // Load history when threadId changes
  useEffect(() => {
    if (currentThreadId) {
      loadHistory(currentThreadId);
    } else {
      setHistoryMessages([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentThreadId]);

  const deleteSession = async (sessionId: string) => {
    if (!confirm("Delete this session?")) return;

    try {
      // Use relative URL - will be proxied by Next.js rewrites
      const response = await fetch(`/api/backend/v1/workbench/sessions/${sessionId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setSessions((prev) => prev.filter((s) => s.session_id !== sessionId));
      }
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  // If in iframe, send message to parent
                  if (window.parent !== window) {
                    window.parent.postMessage({ type: 'CLOSE_WORKBENCH' }, '*');
                  } else {
                    // If standalone window, close it
                    window.close();
                  }
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Go back"
              >
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {decodeURIComponent(agentName)}
                </h1>
                <p className="text-sm text-gray-600">CopilotKit Workbench</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                AG-UI Protocol
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex container mx-auto h-[calc(100vh-88px)]">
        {/* Session Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700">
                Recent Sessions
              </h2>
            </div>
            <button
              onClick={() => setCurrentThreadId(undefined)}
              className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              + New Chat
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              </div>
            ) : sessions.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No sessions yet
              </p>
            ) : (
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div
                    key={session.session_id}
                    onClick={() => setCurrentThreadId(session.session_id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      currentThreadId === session.session_id
                        ? 'bg-purple-50 border-purple-300'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
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
                          {session.message_count} messages
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
            )}
          </div>
        </div>

        {/* CopilotKit Chat */}
        <div className="flex-1 flex flex-col px-4 py-6">
          {/* History Messages Display */}
          {currentThreadId && historyMessages.length > 0 && (
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 pb-4">
              {historyMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CopilotKit Chat */}
          <div
            className={currentThreadId && historyMessages.length > 0 ? 'h-auto' : 'h-full'}
            key={currentThreadId || 'new'}
          >
            <CopilotKit
              runtimeUrl={`/api/copilotkit?agent=${encodeURIComponent(agentName)}`}
              agent="a2aAgent"
              showDevConsole={false}
              threadId={currentThreadId}
            >
              <CopilotChat
                labels={{
                  title: decodeURIComponent(agentName),
                  initial: "Hello! How can I help you today?",
                  placeholder: "Type a message...",
                }}
                className="h-full"
                onSubmitMessage={() => {
                  // Reload sessions after sending a message
                  setTimeout(() => loadSessions(), 1000);
                }}
              />
            </CopilotKit>
          </div>
        </div>
      </div>
    </div>
  );
}
