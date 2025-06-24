"use client"
import React from "react";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { useUser } from "../landing/UserContext";

export default function Profile() {
  const { user } = useUser();
  const account = useCurrentAccount();

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-[#18151f]">
      <div className="bg-white dark:bg-[#23202b] rounded-xl shadow-lg p-6 w-80 text-center">
        <img
          src={user?.avatarUrl || "https://via.placeholder.com/100"}
          alt="Profile Picture"
          className="w-24 h-24 rounded-full mx-auto mb-4"
        />
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">{user?.name || "POPE"}</h2>
        <ConnectButton />
        <div className="my-4">
          {account ? (
            <div className="text-gray-600 dark:text-gray-400 text-sm break-all">
              Connected to {account.address}
            </div>
          ) : (
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              No wallet connected
            </div>
          )}
        </div>
        <div className="space-y-4 mt-4">
          <div className="text-left">
            <label className="text-gray-600 dark:text-gray-400 text-sm">Name</label>
            <input
              type="text"
              value={user?.name || ""}
              readOnly
              className="w-full p-2 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#18151f] rounded mt-1 text-gray-800 dark:text-white"
            />
          </div>
          <div className="text-left">
            <label className="text-gray-600 dark:text-gray-400 text-sm">Email Address</label>
            <input
              type="email"
              value={user?.email || ""}
              readOnly
              className="w-full p-2 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#18151f] rounded mt-1 text-gray-800 dark:text-white"
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