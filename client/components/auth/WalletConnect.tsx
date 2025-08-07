'use client';

import { useCurrentAccount, useDisconnectWallet, useWallets, useConnectWallet } from '@mysten/dapp-kit';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';
import { useEffect } from 'react';
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
import { FcGoogle } from 'react-icons/fc';

export function WalletConnect() {
  const currentAccount = useCurrentAccount();
  const { user, setUser, logout } = useUser();
  const { mutate: disconnect } = useDisconnectWallet();
  const wallets = useWallets();
  const { mutate: connect } = useConnectWallet();

  // Find the Google wallet
  const googleWallet = wallets.find(wallet => 
    wallet.name.toLowerCase().includes('google')
  );

  // Update user context when wallet connects
  useEffect(() => {
    if (currentAccount?.address) {
      // Check if this is a Google/Enoki wallet
      const isGoogleWallet = currentAccount.label?.toLowerCase().includes('google');
      
      console.log('Current account:', currentAccount); // Debug log
      console.log('Setting wallet address:', currentAccount.address); // Debug log
      
      setUser({
        walletAddress: currentAccount.address,
        name: currentAccount.label || 'Google User',
        email: '',
        emails: [],
        isEnoki: isGoogleWallet,
        avatarUrl: user?.avatarUrl || 'https://via.placeholder.com/100',
      });
    }
  }, [currentAccount, setUser]);

  const handleGoogleLogin = () => {
    if (googleWallet) {
      connect({ wallet: googleWallet });
    }
  };

  const handleLogout = () => {
    disconnect();
    logout();
  };

  const displayAddress = currentAccount?.address;
  const isConnected = !!(displayAddress);

  const handleCopyAddress = () => {
    if (displayAddress) {
      navigator.clipboard.writeText(displayAddress);
      // You could add a toast notification here if you want
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

  return (
    <Button 
      onClick={handleGoogleLogin}
      variant="default"
      className="flex items-center gap-2"
    >
      <FcGoogle className="w-5 h-5" />
      Sign in with Google
    </Button>
  );
}