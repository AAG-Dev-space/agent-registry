import { Link, Outlet, useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function Layout() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Navigation */}
      <header className="sticky top-0 flex w-full bg-white border-b border-gray-200 z-99999">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Title */}
            <Link to="/" className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-brand-500" />
              <span className="text-lg font-semibold text-gray-900">A2A Agent Registry</span>
            </Link>

            {/* Navigation Links */}
            <nav className="flex items-center gap-6 lg:gap-8">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors ${
                  isActive('/') ? 'text-gray-900' : 'text-gray-700 hover:text-brand-500'
                }`}
              >
                Home
              </Link>
              <Link
                to="/agents"
                className={`text-sm font-medium transition-colors ${
                  isActive('/agents') ? 'text-gray-900' : 'text-gray-700 hover:text-brand-500'
                }`}
              >
                Agents
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-colors"
              >
                Submit Agent
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
