"use client"
import React, { useState } from "react";
import { useUser } from "../landing/UserContext";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Copy, Calendar } from "lucide-react";
import Header from "../components/Header";

export default function Profile() {
  const { user } = useUser();
  const account = useCurrentAccount();
  const [copied, setCopied] = useState(false);

  const walletAddress = account?.address || user?.walletAddress || "";
  const primaryEmail = user?.emails?.find(e => e.primary)?.address || user?.email || "";
  const name = user?.name || "No Name";
  const username = user?.username || "Sui User";
  const poaps = user?.poapsCollected ?? 5;
  const events = user?.eventsAttended ?? 9;

  const copyToClipboard = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <Header />
      <div className="flex justify-center items-start w-full px-2 sm:px-0">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-8">
          {/* Top gray section with avatar overlapping */}
          <div className="bg-gray-200 h-20 relative">
            {/* Avatar positioned to overlap both sections */}
            <div className="absolute left-1/2 top-full transform -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="relative">
                <img
                  src={user?.avatarUrl || "https://via.placeholder.com/100"}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                  style={{
                    boxShadow: "0 2px 8px 0 rgba(0,0,0,0.08)",
                    background: "#fff"
                  }}
                />
                {/* Active Status Indicator */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-white shadow-md"></div>
              </div>
              {/* Username below avatar */}
              <div className="w-full mt-3">
                <h2 className="text-center text-gray-900 font-semibold text-base tracking-wide">{username}</h2>
              </div>
            </div>
          </div>

          {/* Content section with white background */}
          <div className="px-4 py-6 space-y-6 pt-12">
            {/* Wallet Address Section */}
            <div>
              <div className="text-gray-500 text-xs font-medium mb-3 uppercase tracking-wider">
                Wallet Address
              </div>
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                <span className="text-gray-700 text-sm font-mono flex-1 truncate pr-2">
                  {walletAddress || "No wallet connected"}
                </span>
                <button 
                  onClick={copyToClipboard}
                  className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                  title="Copy address"
                  disabled={!walletAddress}
                >
                  <Copy className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              {copied && (
                <p className="text-green-600 text-xs mt-2">Address copied!</p>
              )}
            </div>

            {/* Separator line */}
            <div className="border-t border-gray-100"></div>

            {/* Name Section - inline layout */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-gray-500 text-xs font-medium">Name</span>
              <div className="bg-gray-50 rounded-md px-4 py-2 border border-gray-200">
                <span className="text-gray-800 text-sm font-medium">{name}</span>
              </div>
            </div>

            {/* Separator line */}
            <div className="border-t border-gray-100"></div>

            {/* Email Section - inline layout */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-gray-500 text-sm font-medium">Email Address</span>
              <div className="bg-gray-50 rounded-md px-4 py-2 border border-gray-200">
                <span className="text-gray-800 text-sm font-medium">{primaryEmail || "No email"}</span>
              </div>
            </div>

            {/* Separator line */}
            <div className="border-t border-gray-100"></div>

            {/* Stats Section */}
            <div className="flex justify-around pt-2 gap-3 flex-wrap">
              <div className="flex-1 min-w-[120px]">
                <div className="bg-amber-50/30 rounded-xl border border-amber-100/20 flex flex-col items-center py-4 px-2 shadow-sm">
                  <div className="w-10 h-10 bg-amber-100/30 rounded-full flex items-center justify-center mb-2">
                    <div className="w-5 h-5 bg-amber-200/30 rounded-full"></div>
                  </div>
                  <div className="text-2xl font-bold text-black mb-1">{poaps}</div>
                  <div className="text-black text-xs font-medium text-center">POAPs collected</div>
                </div>
              </div>
              <div className="flex-1 min-w-[120px]">
                <div className="bg-amber-50/30 rounded-xl border border-amber-100/20 flex flex-col items-center py-4 px-2 shadow-sm">
                  <div className="w-10 h-10 bg-amber-100/30 rounded-full flex items-center justify-center mb-2">
                    <Calendar className="w-5 h-5 text-amber-200/40" />
                  </div>
                  <div className="text-2xl font-bold text-black mb-1">{events}</div>
                  <div className="text-black text-xs font-medium text-center">Events Attended</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}