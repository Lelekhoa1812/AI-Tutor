'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { FaGraduationCap, FaBook, FaRobot, FaSignOutAlt } from 'react-icons/fa';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800">
            Welcome back, {session?.user?.name}!
          </h1>
          <button
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Learning Progress */}
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaGraduationCap className="text-2xl text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Learning Progress</h2>
            </div>
            <p className="text-gray-600">Track your learning journey and see your improvements over time.</p>
          </div>

          {/* Study Materials */}
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FaBook className="text-2xl text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Study Materials</h2>
            </div>
            <p className="text-gray-600">Access your personalized study materials and resources.</p>
          </div>

          {/* AI Tutor */}
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FaRobot className="text-2xl text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">AI Tutor</h2>
            </div>
            <p className="text-gray-600">Get help from your AI tutor anytime, anywhere.</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left">
              <h3 className="font-medium text-gray-800">Start a New Session</h3>
              <p className="text-sm text-gray-600">Begin a new learning session with your AI tutor</p>
            </button>
            <button className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left">
              <h3 className="font-medium text-gray-800">Review Progress</h3>
              <p className="text-sm text-gray-600">Check your learning progress and achievements</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
