"use client"
import Link from "next/link";
import Image from "next/image";
import { useUser } from "../landing/UserContext";
import { ConnectButton } from "@mysten/dapp-kit";
import { useState } from "react";
import { ProfileDropdown } from "../landing/ProfileDropDown";
import { useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit";

export default function Header() {
  const { user, logout } = useUser();
  const [showDropdown, setShowDropdown] = useState(false);
  const account = useCurrentAccount();
  const disconnectWallet = useDisconnectWallet();

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/landing" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Image 
              src="https://i.ibb.co/PZHSkCVG/Suilens-Logo-Mark-Suilens-Black.png" 
              alt="Suilens Logo" 
              width={60}
              height={60}
              className="object-contain"
            />
          </div>
          <span className="text-2xl font-bold text-gray-800">Suilens</span>
        </Link>
        <nav className="hidden lg:flex items-center space-x-8">
          {["Home", "Communities", "Explore", "Dashboard"].map((item) => (
            <Link
              key={item}
              href={item === "Home" ? "/" : `/${item.toLowerCase().replace(' ', '-')}`}
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              {item}
            </Link>
          ))}
        </nav>
        <div className="flex items-center space-x-4 relative">
          {!account?.address ? (
            <ConnectButton />
          ) : (
            // Always show profile dropdown when wallet is connected
            <div className="relative">
              <button
                onClick={() => setShowDropdown((v) => !v)}
                className="focus:outline-none"
                aria-label="Open profile menu"
              >
                <img
                  src={user?.avatarUrl || "https://via.placeholder.com/100"}
                  alt="Profile"
                  className="w-10 h-10 rounded-full border-2 border-blue-500 cursor-pointer"
                />
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 z-50">
                  <ProfileDropdown
                    walletAddress={user?.walletAddress ?? account.address ?? ""}
                    avatarUrl={user?.avatarUrl}
                    onLogout={() => {
                      setShowDropdown(false);
                      disconnectWallet.mutate();
                      logout?.();
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}