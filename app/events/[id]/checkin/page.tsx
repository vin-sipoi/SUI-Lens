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
  const [mobileDeepLink, setMobileDeepLink] = useState<string | null>(null);
  const account = useCurrentAccount();

  // Generate mobile deep link for QR code
  // In your checkin page at app/events/[id]/checkin/page.tsx
useEffect(() => {
  if (!account && !isMobile) {
    const baseUrl = window.location.origin;
    const mobileRedirectUrl = `${baseUrl}/connect-mobile?eventId=${id}`;
    setMobileDeepLink(mobileRedirectUrl);
  }
}, [account, id]);
  // Handle mobile deep link redirect (when user is already on mobile)
  useEffect(() => {
    if (isMobile && !account) {
      // Attempt to open Slush wallet app directly
      const deepLink = `slush://connect?eventId=${id}&dapp=checkin&returnUrl=${encodeURIComponent(window.location.href)}`;
      
      // Try to open the app immediately
      window.location.href = deepLink;
      
      // Fallback to app store if Slush app is not installed
      setTimeout(() => {
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        const appStoreUrl = isIOS
          ? "https://apps.apple.com/app/slush-a-sui-wallet/id1660851379"
          : "https://play.google.com/store/apps/details?id=com.slush.app";
        
        // Only redirect to app store if still on the page (app didn't open)
        if (document.visibilityState === 'visible') {
          window.location.href = appStoreUrl;
        }
      }, 2000);
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
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">Event Check-In</h1>
      
      <div className="mb-6">
        <ConnectButton />
      </div>

      {account && (
        <div className="mb-4 text-sm text-gray-600 text-center max-w-md break-all">
          Connected wallet: <span className="font-mono">{account.address}</span>
        </div>
      )}

      {!account && !isMobile && mobileDeepLink && (
        <div className="my-6 text-center">
          <p className="mb-4 text-lg">Scan with your mobile device to connect with Slush wallet:</p>
          <div className="bg-white p-4 rounded-lg shadow-lg inline-block">
            <QRCode value={mobileDeepLink} size={256} />
          </div>
          <p className="mt-4 text-sm text-gray-600 max-w-md">
            This QR code will open on your mobile device and redirect to the Slush wallet app
          </p>
        </div>
      )}

      {account && !checkedIn && (
        <Button onClick={handleCheckIn} className="mt-4">
          Check In with Wallet
        </Button>
      )}

      {checkedIn && (
        <div className="text-center mt-4">
          <p className="text-green-600 font-semibold">✅ Checked in! Enjoy the event.</p>
        </div>
      )}
    </div>
  );
}