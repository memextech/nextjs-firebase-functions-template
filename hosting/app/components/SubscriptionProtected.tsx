'use client';

import { getAuth } from 'firebase/auth';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export function SubscriptionProtected({ children }: { children: React.ReactNode }) {
  const [hasSubscription, setHasSubscription] = useState(false);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    return auth.onIdTokenChanged(async (user) => {
      if (user) {
        const token = await user.getIdTokenResult();
        setHasSubscription(!!token.claims.demo_subscription);
      } else {
        setHasSubscription(false);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!hasSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Subscription Required</h2>
          <p className="text-gray-600 mb-4">
            You need an active subscription to access this content.
          </p>
          <Link href="/dashboard/subscription"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
          >
            Get Subscription
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}