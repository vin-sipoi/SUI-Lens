'use client'

import { useParams } from "next/navigation";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";

export default function CheckinPage() {
  const { id } = useParams();
  const [checkedIn, setCheckedIn] = useState(false);

  // Replace with real wallet connect logic
  const handleCheckIn = async () => {
    if (!id || Array.isArray(id)) {
      throw new Error("Invalid event id");
    }
    const fakeWalletAddress = "0x123...abc";
    await addDoc(collection(db, "events", id, "attendees"), {
      address: fakeWalletAddress,
      checkedInAt: new Date(),
    });
    setCheckedIn(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1>Event Check-In</h1>
      {!checkedIn ? (
        <Button onClick={handleCheckIn}>
          Connect Wallet & Check In
        </Button>
      ) : (
        <p>Checked in! Enjoy the event.</p>
      )}
    </div>
  );
}