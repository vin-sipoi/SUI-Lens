"use client";

import { useEffect, useRef } from 'react';
import { useCurrentAccount, useWallets } from '@mysten/dapp-kit';
import { useUser } from '@/context/UserContext';

export function WalletConnectionManager() {
  const currentAccount = useCurrentAccount();
  const wallets = useWallets();
  const { user, login, logout } = useUser();
  const logoutCalledRef = useRef(false);

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
    
    // When wallet disconnects, logout user (but only if not already logged out)
    if (!currentAccount && user && user.walletAddress && !logoutCalledRef.current) {
      logoutCalledRef.current = true;
      logout();
      // Reset the ref after a short delay to allow the state update to complete
      setTimeout(() => {
        logoutCalledRef.current = false;
      }, 100);
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
