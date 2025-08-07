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
    if (zkLoginSession?.jwt) {
      try {
        const decodedJwt: any = jwtDecode(zkLoginSession.jwt);
        console.log('Decoded JWT from zkLogin session:', decodedJwt);
        
        setUser({
          email: decodedJwt.email,
          given_name: decodedJwt.given_name,
          family_name: decodedJwt.family_name,
          picture: decodedJwt.picture,
          name: decodedJwt.name,
        });
      } catch (error) {
        console.error('Failed to decode JWT:', error);
      }
    }
    setIsLoading(false);
  }, [zkLoginSession]);

  return (
    <ZkLoginContext.Provider value={{ jwt: zkLoginSession?.jwt, user, isLoading }}>
      {children}
    </ZkLoginContext.Provider>
  );
}