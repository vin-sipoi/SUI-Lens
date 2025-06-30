'use client'

import { useParams } from "next/navigation";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";

export default function RegisterPage() {
  const params = useParams();
  const id =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
      ? params.id[0]
      : undefined;
  const [registered, setRegistered] = useState(false);
  const account = useCurrentAccount();

  const handleRegister = async () => {
    if (!id || !account) return;
    await addDoc(collection(db, "events", id, "registrations"), {
      address: account.address,
      registeredAt: new Date(),
    });
    setRegistered(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1>Register for Event</h1>
      <ConnectButton /> {/* Always show for switching */}
      {account && (
        <div className="mb-4 text-sm text-gray-600">
          Connected wallet: <span className="font-mono">{account.address}</span>
        </div>
      )}
      {!account ? null : !registered ? (
        <Button onClick={handleRegister}>
          Register with Wallet
        </Button>
      ) : (
        <p>Registered! Thank you.</p>
      )}
    </div>
  );
}