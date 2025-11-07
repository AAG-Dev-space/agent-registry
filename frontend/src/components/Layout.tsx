import { Link, Outlet, useLocation } from 'react-router-dom';
import { Sparkles, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const location = useLocation();
  const [wikiDropdownOpen, setWikiDropdownOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isWikiActive = () => {
    return location.pathname.startsWith('/wiki');
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
              <span className="text-lg font-semibold text-gray-900">Agent Registry</span>
            </Link>

            {/* Navigation Links */}
            <nav className="flex items-center gap-6 lg:gap-8">
              <Link
                to="/agents"
                className={`text-sm font-medium transition-colors ${
                  isActive('/agents') || isActive('/') ? 'text-gray-900' : 'text-gray-700 hover:text-brand-500'
                }`}
              >
                Agents
              </Link>
              <Link
                to="/dashboard"
                className={`text-sm font-medium transition-colors ${
                  isActive('/dashboard') ? 'text-gray-900' : 'text-gray-700 hover:text-brand-500'
                }`}
              >
                Dashboard
              </Link>

              {/* Wiki Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setWikiDropdownOpen(!wikiDropdownOpen)}
                  className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                    isWikiActive() ? 'text-gray-900' : 'text-gray-700 hover:text-brand-500'
                  }`}
                >
                  Wiki
                  <ChevronDown className={`h-4 w-4 transition-transform ${wikiDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {wikiDropdownOpen && (
                  <>
                    {/* Backdrop to close dropdown when clicking outside */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setWikiDropdownOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                      <Link
                        to="/wiki/getting-started"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-500 transition-colors"
                        onClick={() => setWikiDropdownOpen(false)}
                      >
                        Getting Started
                      </Link>
                      <Link
                        to="/wiki/terms-and-specs"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-500 transition-colors"
                        onClick={() => setWikiDropdownOpen(false)}
                      >
                        Terms & Specs
                      </Link>
                      <Link
                        to="/wiki/roadmap"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-500 transition-colors"
                        onClick={() => setWikiDropdownOpen(false)}
                      >
                        Roadmap
                      </Link>
                    </div>
                  </>
                )}
              </div>
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-theme-xs hover:text-brand-600 transition-colors"
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
