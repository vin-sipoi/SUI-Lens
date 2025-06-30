'use client'

import { useParams } from "next/navigation";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";

export default function CheckinPage() {
  const { id } = useParams();
  const [checkedIn, setCheckedIn] = useState(false);
  const account = useCurrentAccount();

  const handleCheckIn = async () => {
    if (!id || Array.isArray(id) || !account) {
      alert("Please connect your wallet.");
      return;
    }
    await addDoc(collection(db, "events", id, "attendees"), {
      address: account.address,
      checkedInAt: new Date(),
    });
    setCheckedIn(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1>Event Check-In</h1>
      <ConnectButton />
      {account && (
        <div className="mb-4 text-sm text-gray-600">
          Connected wallet: <span className="font-mono">{account.address}</span>
        </div>
      )}
      {!account ? null : !checkedIn ? (
        <Button onClick={handleCheckIn}>
          Check In with Wallet
        </Button>
      ) : (
        <p>Checked in! Enjoy the event.</p>
      )}
    </div>
  );