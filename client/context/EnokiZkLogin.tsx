'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useZkLoginSession } from '@mysten/enoki/react';
import { jwtDecode } from 'jwt-decode';

interface ZkLoginUser {
  email?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  name?: string;
}

interface ZkLoginContextType {
  jwt?: string;
  user?: ZkLoginUser;
  isLoading: boolean;
}

const ZkLoginContext = createContext<ZkLoginContextType>({
  isLoading: false,
});

export const useZkLoginAuth = () => useContext(ZkLoginContext);

export function ZkLoginProvider({ children }: { children: React.ReactNode }) {
  const zkLoginSession = useZkLoginSession();
  const [user, setUser] = useState<ZkLoginUser>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      setIsLoading(true);
      console.log('🔍 ZkLoginProvider: Checking zkLogin session:', zkLoginSession);
      
      // Check localStorage for any stored session data
      const storedSession = typeof window !== 'undefined' ? localStorage.getItem('enoki-session') : null;
      console.log('   • Stored session in localStorage:', storedSession ? 'Found' : 'Not found');
      
      if (zkLoginSession?.jwt) {
        try {
          const decodedJwt: any = jwtDecode(zkLoginSession.jwt);
          console.log('   • Decoded JWT from zkLogin session:', decodedJwt);
          
          // Check if JWT is still valid
          const currentTime = Date.now() / 1000;
          if (decodedJwt.exp && decodedJwt.exp > currentTime) {
            setUser({
              email: decodedJwt.email,
              given_name: decodedJwt.given_name,
              family_name: decodedJwt.family_name,
              picture: decodedJwt.picture,
              name: decodedJwt.name,
            });
            console.log('✅ zkLogin session is valid and restored');
          } else {
            console.log('❌ zkLogin JWT has expired');
            // Clear expired session from localStorage
            if (typeof window !== 'undefined') {
              localStorage.removeItem('enoki-session');
            }
          }
        } catch (error) {
          console.error('❌ Failed to decode JWT:', error);
          // Clear invalid session data
          if (typeof window !== 'undefined') {
            localStorage.removeItem('enoki-session');
          }
        }
      } else {
        console.log('❌ No active zkLogin session found');
        // If we have stored session but no active session, it might indicate a sync issue
        if (storedSession) {
          console.log('⚠️ Stored session exists but no active session - possible sync issue');
        }
      }
      
      setIsLoading(false);
    };
    
    checkSession();
  }, [zkLoginSession]);

  return (
    <ZkLoginContext.Provider value={{ jwt: zkLoginSession?.jwt, user, isLoading }}>
      {children}
    </ZkLoginContext.Provider>
  );
}