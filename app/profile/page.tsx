"use client"
import React from "react";
import { useUser } from "../landing/UserContext";
import { useCurrentAccount } from "@mysten/dapp-kit";

export default function Profile() {
  const { user } = useUser();
  const account = useCurrentAccount();
  const walletAddress = account?.address || user?.walletAddress || "";

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-[#18151f]">
      <div className="bg-white dark:bg-[#23202b] rounded-xl shadow-lg p-6 w-80 text-center">
        <img
          src={user?.avatarUrl || "https://via.placeholder.com/100"}
          alt="Profile Picture"
          className="w-24 h-24 rounded-full mx-auto mb-4"
        />
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">{user?.username || "Username"}</h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 break-all">
          {walletAddress || "No wallet connected"}
        </p>
        <div className="space-y-4">
          <div className="text-left">
            <label className="text-gray-600 dark:text-gray-400 text-sm">Name</label>
            <input
              type="text"
              value={user?.name || ""}
              readOnly
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded mt-1 text-gray-800 dark:text-white bg-white dark:bg-[#18151f]"
            />
          </div>
          <div className="text-left">
            <label className="text-gray-600 dark:text-gray-400 text-sm">Email Address</label>
            <input
              type="email"
              value={user?.email || ""}
              readOnly
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded mt-1 text-gray-800 dark:text-white bg-white dark:bg-[#18151f]"
            />
          </div>
        </div>
        <div className="flex justify-around mt-6">
          <div className="bg-gray-200 dark:bg-gray-800 p-3 rounded-lg">
            <p className="text-lg font-semibold text-gray-800 dark:text-white">5</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">POAPs collected</p>
          </div>
          <div className="bg-gray-200 dark:bg-gray-800 p-3 rounded-lg">
            <p className="text-lg font-semibold text-gray-800 dark:text-white">9</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Events Attended</p>
          </div>
        </div>
      </div>
    </div>
  );
}