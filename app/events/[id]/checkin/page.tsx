'use client'

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
// @ts-ignore
import QRCode from "qrcode.react";
import { isMobile } from "react-device-detect";

export default function CheckinPage() {
  const { id } = useParams();
  const [checkedIn, setCheckedIn] = useState(false);
  const [walletConnectUri, setWalletConnectUri] = useState<string | null>(null);
  const account = useCurrentAccount();

  // Generate WalletConnect URI or Slush deep link for QR code
  useEffect(() => {
    if (!account && !isMobile) {
      // Placeholder for WalletConnect URI generation
      // Replace with actual WalletConnect integration or Slush deep link
      const generateWalletConnectUri = async () => {
        try {
          // Hypothetical WalletConnect URI (verify with Slush documentation)
          const uri = `wc:connect@2?eventId=${id}&dapp=checkin`;
          // Alternative: Slush deep link (verify format with Slush support)
          // const uri = `slush://connect?eventId=${id}&dapp=checkin`;
          setWalletConnectUri(uri);
        } catch (error) {
          console.error("Failed to generate connection URI:", error);
        }
      };
      generateWalletConnectUri();
    }
  }, [account, id]);

  // Handle mobile deep link redirect
  useEffect(() => {
    if (isMobile && !account) {
      // Attempt to open Slush wallet app
      const deepLink = `slush://connect?eventId=${id}&dapp=checkin`; // Verify format with Slush
      window.location.href = deepLink;
      // Fallback to app store if Slush app is not installed
      setTimeout(() => {
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        window.location.href = isIOS
          ? "https://apps.apple.com/app/slush-a-sui-wallet/id1660851379"
          : "https://play.google.com/store/apps/details?id=com.slush.app";
      }, 1000);
    }
  }, [account, id]);

  const handleCheckIn = async () => {
    if (!id || Array.isArray(id) || !account) {
      alert("Please connect your wallet.");
      return;
    }
    try {
      await addDoc(collection(db, "events", id, "attendees"), {
        address: account.address,
        checkedInAt: new Date(),
      });
      setCheckedIn(true);
    } catch (error) {
      console.error("Check-in failed:", error);
      alert("Failed to check in. Please try again.");
    }
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
      {!account && !isMobile && walletConnectUri && (
        <div className="my-4">
          <p>Scan with Slush wallet app to connect:</p>
          <QRCode value={walletConnectUri} size={256} />
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
}