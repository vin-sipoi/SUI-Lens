'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useZkLoginSession } from '@mysten/enoki/react';
import { jwtDecode } from 'jwt-decode';
import { getSessionStorage, setSessionStorage, removeSessionStorage, STORAGE_KEYS, AuthSessionData } from '@/utils/storage';

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

  // Save session to storage when it changes
  useEffect(() => {
    if (zkLoginSession?.jwt) {
      try {
        const decodedJwt: any = jwtDecode(zkLoginSession.jwt);
        
        // Check if JWT is still valid
        const currentTime = Date.now() / 1000;
        if (decodedJwt.exp && decodedJwt.exp > currentTime) {
          const userData = {
            email: decodedJwt.email,
            given_name: decodedJwt.given_name,
            family_name: decodedJwt.family_name,
            picture: decodedJwt.picture,
            name: decodedJwt.name,
          };
          
          setUser(userData);
          
          // Save to sessionStorage
          const sessionData: AuthSessionData = {
            jwt: zkLoginSession.jwt,
            user: userData,
            timestamp: Date.now(),
          };
          
          setSessionStorage(STORAGE_KEYS.AUTH_SESSION, sessionData);
          console.log('zkLogin session saved to storage');
        } else {
          console.log('zkLogin JWT has expired, clearing storage');
          removeSessionStorage(STORAGE_KEYS.AUTH_SESSION);
        }
      } catch (error) {
        console.error('Failed to decode JWT:', error);
        removeSessionStorage(STORAGE_KEYS.AUTH_SESSION);
      }
    } else {
      // No session, clear storage
      removeSessionStorage(STORAGE_KEYS.AUTH_SESSION);
    }
  }, [zkLoginSession]);

  // Check for existing session on mount
  useEffect(() => {
    const checkStoredSession = async () => {
      setIsLoading(true);
      
      const storedSession = getSessionStorage<AuthSessionData>(STORAGE_KEYS.AUTH_SESSION);
      
      if (storedSession) {
        try {
          // Validate stored JWT
          const decodedJwt: any = jwtDecode(storedSession.jwt);
          const currentTime = Date.now() / 1000;
          
          if (decodedJwt.exp && decodedJwt.exp > currentTime) {
            setUser(storedSession.user);
            console.log('Session restored from storage');
          } else {
            console.log('Stored JWT has expired');
            removeSessionStorage(STORAGE_KEYS.AUTH_SESSION);
          }
        } catch (error) {
          console.error('Failed to validate stored JWT:', error);
          removeSessionStorage(STORAGE_KEYS.AUTH_SESSION);
        }
      }
      
      setIsLoading(false);
    };
    
    checkStoredSession();
  }, []);

  return (
    <ZkLoginContext.Provider value={{ jwt: zkLoginSession?.jwt, user, isLoading }}>
      {children}
    </ZkLoginContext.Provider>
  );
}