'use client';

import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '../../firebase';
import Link from 'next/link';
import { getFunctions, httpsCallable } from 'firebase/functions';

declare global {
  interface Window {
    createLemonSqueezy: any;
    LemonSqueezy: {
      Url: {
        Open: (url: string) => void;
      };
    };
  }
}

export default function SubscriptionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const auth = getAuth(app);
  const functions = getFunctions(app);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Load Lemon Squeezy JS
    const script = document.createElement('script');
    script.src = 'https://app.lemonsqueezy.com/js/lemon.js';
    script.defer = true;
    document.head.appendChild(script);
    
    // Initialize Lemon.js after the script has loaded
    script.onload = () => {
      if (typeof window !== 'undefined' && window.createLemonSqueezy) {
        window.createLemonSqueezy();
      }
    };
    
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    // Check subscription status using the latest token
    const checkSubscriptionStatus = async () => {
      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult();
          setIsSubscribed(!!idTokenResult.claims.demo_subscription);
        } catch (error) {
          console.error('Error checking subscription status:', error);
        }
      }
    };
    
    checkSubscriptionStatus();
  }, [user]);

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

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      // Redirect to homepage after checkout
      const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/` : '';
      
      const lemonSqueezyCreateCheckoutFunction = httpsCallable<{redirectUrl?: string}, any>(functions, 'lemonSqueezyCreateCheckout');
      const result = await lemonSqueezyCreateCheckoutFunction({ redirectUrl });
      const { data }: any = result.data;
      
      if (data?.checkoutUrl) {
        // Open the checkout overlay directly using LemonSqueezy.Url.Open
        if (typeof window !== 'undefined') {
          // Make sure Lemon.js is initialized
          if (window.createLemonSqueezy) {
            window.createLemonSqueezy();
          }
          
          // Use the documented method to open the checkout overlay
          if (window.LemonSqueezy) {
            window.LemonSqueezy.Url.Open(data.checkoutUrl);
          } else {
            // Fallback if LemonSqueezy is not available
            window.location.href = data.checkoutUrl;
          }
        }
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Dashboard Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-indigo-600 mr-10">
              SaaS Template
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
              <Link href="/dashboard/subscription" className="text-indigo-600 hover:text-indigo-800 px-3 py-2 rounded-md text-sm font-medium">Subscription</Link>
              {isSubscribed && (
                <Link href="/newsletter" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">Newsletter</Link>
              )}
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

      {/* Subscription Content */}
      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold text-gray-900">Subscription</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage your subscription and access premium content.
            </p>
          </div>

          <div className="mt-8">
            {isSubscribed ? (
              <div className="bg-white overflow-hidden shadow rounded-lg p-6">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-gray-900">You're subscribed!</h2>
                  <p className="mt-2 text-gray-600">
                    You have full access to all premium content including our newsletter.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/newsletter"
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      View Newsletter
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-semibold text-gray-900">Premium Newsletter Subscription</h2>
                    <p className="mt-2 text-gray-600 mb-8">
                      Get access to our exclusive newsletter with industry insights and expert interviews.
                    </p>
                    
                    <div className="max-w-md mx-auto bg-gray-50 rounded-lg overflow-hidden shadow-lg">
                      <div className="px-6 py-8">
                        <div className="flex justify-center">
                          <span className="text-3xl font-bold text-gray-900">$20</span>
                          <span className="text-xl text-gray-600 self-end">/month</span>
                        </div>
                        
                        <ul className="mt-6 space-y-4">
                          <li className="flex items-start">
                            <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="ml-3 text-base text-gray-700">Exclusive industry insights</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="ml-3 text-base text-gray-700">Expert interviews</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="ml-3 text-base text-gray-700">Early access to new features</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="ml-3 text-base text-gray-700">Premium support</span>
                          </li>
                        </ul>
                        
                        <div className="mt-8">
                          <button
                            onClick={handleSubscribe}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400"
                          >
                            {isLoading ? 'Processing...' : 'Subscribe Now - $20/month'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}