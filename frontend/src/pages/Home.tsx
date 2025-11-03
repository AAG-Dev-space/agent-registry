import { Link } from 'react-router-dom';
import { Search, PlusCircle, Zap, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            A2A Agent Registry
          </h1>
          <p className="text-xl text-slate-400 mb-8">
            Production-Ready Agent Discovery Platform
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/agents"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Search size={20} />
              Browse Agents
            </Link>
            <Link
              to="/register"
              className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
            >
              <PlusCircle size={20} />
              Register Agent
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
              <Search className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Agent Discovery
            </h3>
            <p className="text-slate-400 text-sm">
              Find agents by capabilities, skills, and protocol version
            </p>
          </div>

          <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
              <PlusCircle className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Easy Registration
            </h3>
            <p className="text-slate-400 text-sm">
              Register agents with comprehensive metadata and capabilities
            </p>
          </div>

          <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
              <Zap className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Multi-Protocol
            </h3>
            <p className="text-slate-400 text-sm">
              JSON-RPC, REST, GraphQL, and gRPC support
            </p>
          </div>

          <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
            <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
              <Shield className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Vector Search
            </h3>
            <p className="text-slate-400 text-sm">
              Semantic search with sentence transformers and FAISS
            </p>
          </div>
        </div>

        {/* Protocol Info */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            A2A Protocol v0.3.0
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Supported Protocols
              </h3>
              <ul className="space-y-2 text-slate-400">
                <li>• JSON-RPC 2.0 (Primary)</li>
                <li>• REST API</li>
                <li>• GraphQL</li>
                <li>• gRPC (Experimental)</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Key Features
              </h3>
              <ul className="space-y-2 text-slate-400">
                <li>• Agent card management</li>
                <li>• Capability-based discovery</li>
                <li>• Extension system</li>
                <li>• Trust level management</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
