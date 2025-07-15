"use client";

import { useEffect } from 'react';
import { useCurrentAccount, useWallets } from '@mysten/dapp-kit';
import { useUser } from '@/app/landing/UserContext';

export function WalletConnectionManager() {
  const currentAccount = useCurrentAccount();
  const wallets = useWallets();
  const { user, login, logout } = useUser();

  useEffect(() => {
    // When wallet connects, auto-login if no user
    if (currentAccount && !user) {
      login({
        name: 'Sui User',
        email: '',
        emails: [{ address: '', primary: true, verified: false }],
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${currentAccount.address.slice(0, 8)}`,
        walletAddress: currentAccount.address,
      });
    }
    
    // When wallet disconnects, logout user
    if (!currentAccount && user && user.walletAddress) {
      logout();
    }
  }, [currentAccount, user, login, logout]);

  // Log wallet connection status for debugging
  useEffect(() => {
    console.log('Wallet connection status:', {
      connected: !!currentAccount,
      address: currentAccount?.address,
      userLoggedIn: !!user,
      availableWallets: wallets.length,
    });
  }, [currentAccount, user, wallets]);

  return null; // This component doesn't render anything
}