"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">🪁</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          CopilotKit Workbench
        </h1>
        <p className="text-gray-600 mb-6">
          A2A Agent Registry - Testing Interface
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Navigate to /workbench/[agentName] to start chatting with an agent
        </p>
        <button
          onClick={() => router.push("/workbench/secure_coding_consultant")}
          className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
        >
          Try Example Agent
        </button>
      </div>
    </div>
  );
}
