'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { app } from '../firebase';

const auth = getAuth(app);

interface AuthContextType {
  user: User | null;
  refreshToken: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({ 
  user: null,
  refreshToken: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to refresh the token and get latest claims
  const refreshToken = async () => {
    if (user) {
      try {
        await user.getIdToken(true);
        console.log('Token refreshed successfully');
      } catch (error) {
        console.error('Error refreshing token:', error);
      }
    }
  };
  
  useEffect(() => {
    // Check for return from payment flow
    if (typeof window !== 'undefined' && user) {
      const urlParams = new URLSearchParams(window.location.search);
      const isReturningFromCheckout = urlParams.has('lemon_squeezy_success') || 
                                    urlParams.has('lemon_squeezy_canceled');
      
      if (isReturningFromCheckout) {
        console.log('Detected return from payment flow, refreshing token...');
        refreshToken().then(() => {
          // Clean up URL params after processing
          window.history.replaceState({}, document.title, window.location.pathname);
        });
      }
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Always refresh token when user signs in or auth state changes
        try {
          await currentUser.getIdToken(true);
        } catch (error) {
          console.error('Error refreshing initial token:', error);
        }
      }
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Set up periodic token refresh (every 30 minutes)
  useEffect(() => {
    if (!user) return;
    
    const tokenRefreshInterval = setInterval(() => {
      refreshToken();
    }, 30 * 60 * 1000); // 30 minutes
    
    return () => clearInterval(tokenRefreshInterval);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, refreshToken }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 