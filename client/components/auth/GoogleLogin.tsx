'use client';

import { useEnokiFlow } from '@mysten/enoki/react';
import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';
import { useRouter } from 'next/navigation';

export function GoogleLogin(props: { className?: string }) {
  const { className } = props;
  const enokiFlow = useEnokiFlow();
  const router = useRouter();

  const handleGoogleLogin = () => {
    const protocol = window.location.protocol;
    const host = window.location.host;
    const redirectUrl = `${protocol}//${host}/auth`;

    enokiFlow
      .createAuthorizationURL({
        provider: 'google',
        network: 'mainnet',
        clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        redirectUrl,
        extraParams: {
          scope: ['openid', 'email', 'profile'],
        },
      })
      .then((url) => {
        window.location.href = url;
      })
      .catch((error) => {
        console.error('Failed to create authorization URL:', error);
      });
  };

  return (
    <Button
      onClick={handleGoogleLogin}
      variant="default"
      className={className ?? 'bg-[#D0D5DD] flex items-center gap-2'}
    >
      <FcGoogle className="w-5 h-5" />
       Continue with Google
    </Button>
  );
}