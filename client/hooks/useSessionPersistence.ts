'use client';

import { useEffect } from 'react';
import { useZkLogin, useZkLoginSession, useEnokiFlow } from '@mysten/enoki/react';
import { jwtDecode } from 'jwt-decode';

const SESSION_STORAGE_KEY = 'enoki_session';

interface StoredSession {
  jwt: string;
  address: string;
  expiresAt: number;
}

export function useSessionPersistence() {
  const zkLoginSession = useZkLoginSession();
  const { address } = useZkLogin();
  const enokiFlow = useEnokiFlow();

  // Save session to localStorage when it changes
  useEffect(() => {
    if (zkLoginSession?.jwt && address) {
      try {
        const decodedJwt: any = jwtDecode(zkLoginSession.jwt);
        const session: StoredSession = {
          jwt: zkLoginSession.jwt,
          address: address,
          expiresAt: decodedJwt.exp * 1000, // Convert to milliseconds
        };
        
        // Store in both localStorage and sessionStorage for redundancy
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
        
        console.log('Enoki session saved to storage');
      } catch (error) {
        console.error('Failed to save session:', error);
      }
    }
  }, [zkLoginSession, address]);

  // Check for stored session on mount
  useEffect(() => {
    const checkStoredSession = () => {
      try {
        // Try localStorage first, then sessionStorage
        const storedData = localStorage.getItem(SESSION_STORAGE_KEY) || 
                          sessionStorage.getItem(SESSION_STORAGE_KEY);
        
        if (storedData) {
          const session: StoredSession = JSON.parse(storedData);
          
          // Check if session is still valid
          if (session.expiresAt > Date.now()) {
            console.log('Found valid stored Enoki session:', session);
            return session;
          } else {
            console.log('Stored Enoki session has expired');
            // Clear expired session
            localStorage.removeItem(SESSION_STORAGE_KEY);
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error('Failed to check stored session:', error);
      }
      return null;
    };

    const storedSession = checkStoredSession();
    if (storedSession && !zkLoginSession?.jwt) {
      // Session exists in storage but not in context
      console.log('Attempting to restore Enoki session from storage');
      console.log('Current zkLoginSession:', zkLoginSession);
      console.log('Stored session JWT exists:', !!storedSession.jwt);
      console.log('Stored session address:', storedSession.address);
      
      // The autoConnect feature should handle session restoration automatically
      // If it's not working, there might be an issue with the Enoki configuration
      console.log('Session restoration should be handled by autoConnect');
    }
  }, [enokiFlow]);

  // Clear session on logout
  const clearSession = () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    console.log('Enoki session cleared from storage');
  };

  return {
    clearSession,
  };
}