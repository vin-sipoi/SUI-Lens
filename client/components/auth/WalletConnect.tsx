'use client';

import { useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';
import { useEffect } from 'react';
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

export function WalletConnect() {
  const currentAccount = useCurrentAccount();
  const { user, setUser, logout } = useUser();
  const { mutate: disconnect } = useDisconnectWallet();
  const { user: zkLoginUser } = useZkLoginAuth();
  const { address: enokiAddress } = useZkLogin();
  const enokiFlow = useEnokiFlow();
  const router = useRouter();

  // Update user context when traditional wallet connects
  useEffect(() => {
    if (currentAccount?.address && !enokiAddress) {
      console.log('Traditional wallet connected:', currentAccount);
      
      setUser({
        walletAddress: currentAccount.address,
        name: currentAccount.label || 'Wallet User',
        email: '',
        emails: [],
        isEnoki: false,
        avatarUrl: user?.avatarUrl || 'https://via.placeholder.com/100',
      });
    }
  }, [currentAccount, enokiAddress, setUser]);

  // Update user context when zkLogin user data is available
  useEffect(() => {
    if (enokiAddress && zkLoginUser) {
      console.log('Enoki address:', enokiAddress);
      console.log('zkLogin user data:', zkLoginUser);
      
      setUser({
        walletAddress: enokiAddress,
        name: zkLoginUser.name || zkLoginUser.given_name || zkLoginUser.email?.split('@')[0] || 'Google User',
        email: zkLoginUser.email || '',
        emails: zkLoginUser.email ? [{ address: zkLoginUser.email, primary: true, verified: true }] : [],
        isEnoki: true,
        avatarUrl: zkLoginUser.picture || 'https://via.placeholder.com/100',
        picture: zkLoginUser.picture,
      });
    }
  }, [enokiAddress, zkLoginUser, setUser]);

  const handleLogout = () => {
    if (enokiAddress) {
      // Logout from Enoki
      enokiFlow.logout();
    } else {
      // Disconnect traditional wallet
      disconnect();
    }
    logout();
    router.push('/');
  };

  const displayAddress = currentAccount?.address || enokiAddress;
  const isConnected = !!(displayAddress);

  const handleCopyAddress = () => {
    if (displayAddress) {
      navigator.clipboard.writeText(displayAddress);
    }
  };

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
          <DropdownMenuItem className="flex items-center gap-2 text-black hover:bg-gray-100">
            <User className="h-4 w-4" />
            <span>Profile</span>
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

  return <GoogleLogin />;
}