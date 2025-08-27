'use client';

import { useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User, Wallet } from 'lucide-react';
import { GoogleLogin } from './GoogleLogin';
import { useZkLoginAuth } from '@/context/EnokiZkLogin';
import { useZkLogin, useEnokiFlow } from '@mysten/enoki/react';
import Link from 'next/link';
import { useSessionPersistence } from '@/hooks/useSessionPersistence';

export function WalletConnect() {
  const [mounted, setMounted] = useState(false);
  const currentAccount = useCurrentAccount();
  const { user, setUser, logout } = useUser();
  const { mutate: disconnect } = useDisconnectWallet();
  const { user: zkLoginUser, isLoading: zkLoginLoading } = useZkLoginAuth();
  const { address: enokiAddress } = useZkLogin();
  const enokiFlow = useEnokiFlow();
  const router = useRouter();
  const { clearSession } = useSessionPersistence();

  // Prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update user context when traditional wallet connects or when zkLogin user data is available
  useEffect(() => {
    if (currentAccount?.address && !enokiAddress && (!user || user.walletAddress !== currentAccount.address)) {
      console.log('Traditional wallet connected:', currentAccount);
      
      setUser({
        walletAddress: currentAccount.address,
        name: currentAccount.label || 'Wallet User',
        email: '',
        emails: [],
        isEnoki: false,
        avatarUrl: user?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=SuiLens',
      });
    } else if (!currentAccount && enokiAddress) {
      console.log('Attempting to connect Enoki wallet...');
      // For Enoki wallets, we need to use the Enoki flow to connect
      // The autoConnect should handle this, but we'll log the attempt
      console.log('Enoki address detected but wallet not connected. AutoConnect should handle this.');
    }
  }, [currentAccount, enokiAddress, setUser, user]);

  // Update user context when zkLogin user data is available
  useEffect(() => {
    // Don't update if zkLogin is still loading or if user already exists with same address
    if (!zkLoginLoading && enokiAddress && zkLoginUser && (!user || user.walletAddress !== enokiAddress)) {
      console.log('Enoki session restored - address:', enokiAddress);
      console.log('zkLogin user data:', zkLoginUser);
      
      setUser({
        walletAddress: enokiAddress,
        name: zkLoginUser.name || zkLoginUser.given_name || zkLoginUser.email?.split('@')[0] || 'Google User',
        email: zkLoginUser.email || '',
        emails: zkLoginUser.email ? [{ address: zkLoginUser.email, primary: true, verified: true }] : [],
        isEnoki: true,
        avatarUrl: zkLoginUser.picture || 'https://api.dicebear.com/7.x/avataaars/svg?seed=SuiLens',
        picture: zkLoginUser.picture,
      });
    }
  }, [enokiAddress, zkLoginUser, zkLoginLoading, user?.walletAddress, setUser]);

  const handleLogout = () => {
    if (enokiAddress) {
      // Logout from Enoki
      enokiFlow.logout();
      clearSession(); // Clear stored session
    } else {
      // Disconnect traditional wallet
      disconnect();
    }
    logout();
    router.push('/');
  };


  const displayAddress = currentAccount?.address || enokiAddress || user?.walletAddress;
  // Always show profile icon if user is authenticated (user exists)
  const isConnected = !!user;

  const handleCopyAddress = () => {
    if (displayAddress) {
      navigator.clipboard.writeText(displayAddress);
    }
  };

  // Don't render until mounted to prevent hydration errors
  if (!mounted) {
    return (
      <Button variant="default" className="flex items-center gap-2">
        <span>Loading...</span>
      </Button>
    );
  }

  if (isConnected && user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 bg-white text-black hover:bg-gray-100">
            <Avatar className="h-6 w-6">
              <AvatarImage src={user.picture || user.avatarUrl} />
              <AvatarFallback className="bg-gray-200 text-black">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:inline">
              {user.name || 'Google User'}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 bg-white">
          <DropdownMenuLabel className="text-black">My Account</DropdownMenuLabel>
          {user.email && (
            <div className="px-2 py-1">
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile" className="flex items-center gap-2 text-black hover:bg-gray-100 cursor-pointer">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleCopyAddress}
            className="flex items-center justify-between gap-2 text-black hover:bg-gray-100 cursor-pointer"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Wallet className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs truncate">
                {displayAddress?.slice(0, 6)}...{displayAddress?.slice(-4)}
              </span>
            </div>
            <span className="text-xs text-gray-500">Click to copy</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            <span>Disconnect</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // When not authenticated, don't render anything
  return null;
}