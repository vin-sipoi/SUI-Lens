"use client"
import Link from "next/link";
import { Settings, LogOut, User, Copy } from "lucide-react";
import { useWallets } from "@mysten/dapp-kit";
import { useState } from "react";

export function ProfileDropdown({ walletAddress, onLogout, avatarUrl, email }: { walletAddress: string, onLogout: () => void, avatarUrl?: string, email?: string }) {
  const wallets = useWallets();
  const [copied, setCopied] = useState(false);

  console.log('ProfileDropdown received wallet address:', walletAddress); // Debug log

  const handleLogout = () => {
    // Implement disconnect logic here if available, otherwise just call onLogout
    onLogout();
  };

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return 'No address';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-w-[280px] bg-white border border-gray-200 rounded-xl shadow-lg p-4">
      <div className="flex flex-col items-center mb-4">
        <img
          src={avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=SuiLens"}
          alt="Profile"
          className="w-12 h-12 rounded-full object-cover border-2 border-gray-300 mb-3"
        />
        
        {email && (
          <div className="text-sm text-gray-700 font-medium mb-2">
            {email}
          </div>
        )}
        
        <div 
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer group transition-colors"
          onClick={handleCopyAddress}
          title="Click to copy full address"
        >
          <span className="font-mono text-sm text-gray-700 font-medium">
            {formatAddress(walletAddress)}
          </span>
          <Copy className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors" />
        </div>
        {copied && (
          <span className="text-xs text-green-600 mt-2 font-medium">
            ✓ Copied to clipboard
          </span>
        )}
      </div>
      <div className="flex flex-col">
        <Link
          href="/profile"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
        >
          <User className="w-4 h-4" />
          Profile
        </Link>
        <Link
          href="/settings"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition mt-2"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}