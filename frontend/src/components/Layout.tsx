import { Link, Outlet } from 'react-router-dom';
import { Home, PlusCircle, Search, Activity } from 'lucide-react';

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold text-white">A2A Registry</h1>
          <p className="text-sm text-slate-400 mt-1">Agent Discovery Platform</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Home size={20} />
            <span>Home</span>
          </Link>

          <Link
            to="/agents"
            className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Search size={20} />
            <span>Browse Agents</span>
          </Link>

          <Link
            to="/register"
            className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <PlusCircle size={20} />
            <span>Register Agent</span>
          </Link>

          <Link
            to="/health"
            className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Activity size={20} />
            <span>Server Health</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="text-xs text-slate-400">
            <p>Version 0.1.5</p>
            <p className="mt-1">A2A Protocol v0.3.0</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
