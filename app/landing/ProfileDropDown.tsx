"use client"
import Link from "next/link";
import { Settings, LogOut, User } from "lucide-react";
import { useWallets } from "@mysten/dapp-kit";

export function ProfileDropdown({ walletAddress, onLogout }: { walletAddress: string, onLogout: () => void }) {
  const wallets = useWallets();

  const handleLogout = () => {
    // Implement disconnect logic here if available, otherwise just call onLogout
    onLogout();
  };

  return (
    <div className="min-w-[220px] bg-[#23202b] border border-white/10 rounded-xl shadow-lg p-4">
      <div className="flex flex-col items-center mb-4">
        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold mb-1">
          <User className="w-8 h-8" />
        </div>
        <div className="text-xs text-gray-400 break-all text-center">{walletAddress}</div>
      </div>
      <div className="flex flex-col">
        <Link
          href="/profile"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/80 hover:bg-blue-500/10 hover:text-white transition"
        >
          <User className="w-4 h-4" />
          Profile
        </Link>
        <Link
          href="/settings"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/80 hover:bg-blue-500/10 hover:text-white transition"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-500 transition mt-2"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}