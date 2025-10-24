import { useEffect, useState } from 'react';
import { Activity, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import axios from 'axios';

// Use /api for Docker deployment (proxied by nginx)
// Set VITE_API_URL environment variable for different backends
const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

interface HealthStatus {
  status: string;
  timestamp?: string;
  error?: string;
}

export default function Health() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/health`, {
        timeout: 5000,
      });
      setHealth({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        ...response.data,
      });
    } catch (err: any) {
      setHealth({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: err.message || 'Failed to connect to server',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Server Health</h1>
          <p className="text-slate-400">
            Monitor the status of the A2A Registry server
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                loading ? 'bg-slate-700' :
                health?.status === 'healthy' ? 'bg-green-600' : 'bg-red-600'
              }`}>
                {loading ? (
                  <Loader2 className="animate-spin text-white" size={32} />
                ) : health?.status === 'healthy' ? (
                  <CheckCircle className="text-white" size={32} />
                ) : (
                  <XCircle className="text-white" size={32} />
                )}
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white">
                  {loading ? 'Checking...' :
                   health?.status === 'healthy' ? 'Server is Healthy' : 'Server is Down'}
                </h2>
                {health?.timestamp && (
                  <p className="text-slate-400 text-sm mt-1">
                    Last checked: {new Date(health.timestamp).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={checkHealth}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white rounded-lg transition-colors"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {health?.error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
              <p className="text-red-400 font-medium">Error Details:</p>
              <p className="text-red-300 text-sm mt-1">{health.error}</p>
            </div>
          )}
        </div>

        {/* Server Information */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="text-blue-400" size={24} />
              <h3 className="text-lg font-semibold text-white">Server Info</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Base URL:</span>
                <span className="text-white font-mono">{API_BASE_URL}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Protocol:</span>
                <span className="text-white">A2A v0.3.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Version:</span>
                <span className="text-white">0.1.5</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="text-green-400" size={24} />
              <h3 className="text-lg font-semibold text-white">Available Endpoints</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="text-slate-300">
                <span className="text-blue-400">GET</span> /agents
              </div>
              <div className="text-slate-300">
                <span className="text-green-400">POST</span> /agents
              </div>
              <div className="text-slate-300">
                <span className="text-blue-400">GET</span> /agents/:id
              </div>
              <div className="text-slate-300">
                <span className="text-orange-400">POST</span> /agents/search
              </div>
              <div className="text-slate-300">
                <span className="text-red-400">DELETE</span> /agents/:id
              </div>
            </div>
          </div>
        </div>

        {/* Connection Tips */}
        {health?.status !== 'healthy' && (
          <div className="mt-6 bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              Troubleshooting Tips
            </h3>
            <ul className="space-y-2 text-slate-300 text-sm">
              <li>• Make sure the backend server is running: <code className="text-blue-400">a2a-registry serve</code></li>
              <li>• Check if the server is accessible at <code className="text-blue-400">{API_BASE_URL}</code></li>
              <li>• Verify the CORS settings allow requests from this origin</li>
              <li>• Check the server logs for any errors</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
