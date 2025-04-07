'use client';

import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '../firebase';
import { SubscriptionProtected } from '../components/SubscriptionProtected';
import Link from 'next/link';

export default function NewsletterPage() {
  const { user } = useAuth();
  const router = useRouter();
  const auth = getAuth(app);

  // If user is not authenticated, redirect to signin page
  useEffect(() => {
    if (!user) {
      router.push('/signin');
    }
  }, [user, router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <SubscriptionProtected>
      <div className="min-h-screen bg-gray-100">
        {/* Page Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-indigo-600 mr-10">
                SaaS Template
              </Link>
              <nav className="hidden md:flex space-x-8">
                <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
                <Link href="/dashboard/subscription" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">Subscription</Link>
                <Link href="/newsletter" className="text-indigo-600 hover:text-indigo-800 px-3 py-2 rounded-md text-sm font-medium">Newsletter</Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* Newsletter Content */}
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold text-gray-900">Premium Newsletter</h1>
              <p className="mt-2 text-sm text-gray-700">
                Welcome to our exclusive newsletter content. This content is only available to subscribers.
              </p>
            </div>

            {/* Newsletter Articles */}
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Article 1 */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900">Industry Insights: May 2025</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Our latest analysis of industry trends and predictions for the coming quarter.
                  </p>
                  <div className="mt-4">
                    <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Read more &rarr;</a>
                  </div>
                </div>
              </div>
              
              {/* Article 2 */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900">New Feature Spotlight</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Exclusive preview of upcoming features and how they'll improve your workflow.
                  </p>
                  <div className="mt-4">
                    <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Read more &rarr;</a>
                  </div>
                </div>
              </div>
              
              {/* Article 3 */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900">Expert Interview: Cloud Security</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    An in-depth conversation with leading security experts about best practices.
                  </p>
                  <div className="mt-4">
                    <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Read more &rarr;</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SubscriptionProtected>
  );
}