import { useEffect, useState, useMemo } from 'react';
import { agentApi } from '../api/client';
import type { AgentCard } from '../types/agent';

export default function Dashboard() {
  const [agents, setAgents] = useState<AgentCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const data = await agentApi.listAgents();
      setAgents(data);
    } catch (err) {
      setError('Failed to load agents');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics from existing data
  const stats = useMemo(() => {
    const total = agents.length;
    const active = agents.filter(a => a.health_status?.status === 'active').length;
    const inactive = agents.filter(a => a.health_status?.status === 'inactive').length;
    const deprecated = agents.filter(a => a.health_status?.status === 'deprecated').length;

    // Recent additions (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const recentAgents = agents
      .filter(a => {
        if (!a.created_at) return false;
        const createdAt = new Date(a.created_at);
        return createdAt > weekAgo;
      })
      .sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });

    // Calculate average uptime (agents with no failures)
    const healthyAgents = agents.filter(a =>
      a.health_status?.failure_count === 0 && a.health_status?.status === 'active'
    ).length;
    const uptimePercentage = total > 0 ? (healthyAgents / total) * 100 : 0;

    return {
      total,
      active,
      inactive,
      deprecated,
      uptimePercentage,
      recentCount: recentAgents.length,
      recentAgents: recentAgents.slice(0, 10),
    };
  }, [agents]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    return `${diffDays}일 전`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Registry Statistics */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            📊 Registry Statistics
          </h1>
          <div className="space-y-3 text-gray-700">
            <div className="flex items-start gap-3">
              <span className="text-gray-400">├─</span>
              <div className="flex items-center gap-2">
                <span>📈 총 Agent 수:</span>
                <span className="font-semibold text-blue-600">{stats.total}</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-gray-400">├─</span>
              <div className="flex items-center gap-2">
                <span>✅ Active:</span>
                <span className="font-semibold text-green-600">{stats.active}</span>
                <span className="text-sm text-gray-500">
                  ({stats.total > 0 ? ((stats.active / stats.total) * 100).toFixed(1) : 0}%)
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-gray-400">├─</span>
              <div className="flex items-center gap-2">
                <span>❌ Inactive:</span>
                <span className="font-semibold text-red-600">{stats.inactive}</span>
                <span className="text-sm text-gray-500">
                  ({stats.total > 0 ? ((stats.inactive / stats.total) * 100).toFixed(1) : 0}%)
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-gray-400">├─</span>
              <div className="flex items-center gap-2">
                <span>📊 평균 가동률:</span>
                <span className="font-semibold text-purple-600">{stats.uptimePercentage.toFixed(1)}%</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-gray-400">└─</span>
              <div className="flex items-center gap-2">
                <span>🔥 최근 7일 신규:</span>
                <span className="font-semibold text-orange-600">{stats.recentCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            ⚡ 최근 활동
          </h2>
          {stats.recentAgents.length > 0 ? (
            <div className="space-y-3 text-gray-700">
              {stats.recentAgents.map((agent, index) => (
                <div key={agent.name} className="flex items-start gap-3">
                  <span className="text-gray-400">
                    {index === stats.recentAgents.length - 1 ? '└─' : '├─'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{agent.name}</span>
                    <span className="text-gray-500">등록됨</span>
                    <span className="text-sm text-gray-400">
                      ({agent.created_at ? formatTimeAgo(agent.created_at) : '방금 전'})
                    </span>
                    {agent.health_status?.status === 'active' ? (
                      <span className="text-green-600 text-sm">✅</span>
                    ) : (
                      <span className="text-gray-400 text-sm">⚠️</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-start gap-3 text-gray-500">
              <span className="text-gray-400">└─</span>
              <span>No recent activity</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
