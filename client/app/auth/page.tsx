'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthCallback, useZkLogin, useZkLoginSession } from '@mysten/enoki/react';
import { useUser } from '@/context/UserContext';
import { jwtDecode } from 'jwt-decode';
import { useSessionPersistence } from '@/hooks/useSessionPersistence';

export default function AuthPage() {
  const { handled } = useAuthCallback();
  const zkLoginSession = useZkLoginSession();
  const { address: enokiAddress } = useZkLogin();
  const { setUser } = useUser();
  const router = useRouter();
  useSessionPersistence(); // Automatically saves session when available

  useEffect(() => {
    if (zkLoginSession?.jwt) {
      try {
        const decodedJwt: any = jwtDecode(zkLoginSession.jwt);
        console.log('Decoded JWT in auth callback:', decodedJwt);
        
        // Set user data with email
        setUser({
          walletAddress: enokiAddress || '',
          name: decodedJwt.given_name || decodedJwt.name || decodedJwt.email?.split('@')[0] || 'Google User',
          email: decodedJwt.email,
          emails: decodedJwt.email ? [{ address: decodedJwt.email, primary: true, verified: true }] : [],
          isEnoki: true,
          avatarUrl: decodedJwt.picture || 'https://api.dicebear.com/7.x/avataaars/svg?seed=SuiLens',
          picture: decodedJwt.picture,
        });
      } catch (error) {
        console.error('Failed to decode JWT:', error);
      }
    }
  }, [zkLoginSession, enokiAddress, setUser]);

  useEffect(() => {
    if (handled) {
      // Redirect to landing page after successful authentication
      setTimeout(() => {
        router.push('/landing');
      }, 500);
    }
  }, [handled, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Authenticating...</h2>
        <p className="text-gray-600">Please wait while we sign you in with Google.</p>
      </div>
    </div>
  );
}