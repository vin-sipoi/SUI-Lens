'use client'
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
// @ts-ignore
import QRCode from "qrcode.react";
import { isMobile } from "react-device-detect";

export default function CheckinPage() {
  const { id } = useParams();
  const [checkedIn, setCheckedIn] = useState(false);
  const [mobileDeepLink, setMobileDeepLink] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const account = useCurrentAccount();

  // Generate mobile deep link for QR code (for desktop users)
  useEffect(() => {
    if (!account && !isMobile) {
      const baseUrl = window.location.origin;
      const mobileRedirectUrl = `${baseUrl}/connect-mobile?eventId=${id}`;
      setMobileDeepLink(mobileRedirectUrl);
    }
  }, [account, id]);

  // Handle mobile deep link redirect (for mobile users)
  useEffect(() => {
    if (isMobile && !account) {
      const deepLink = `slush://connect?eventId=${id}&dapp=checkin&returnUrl=${encodeURIComponent(window.location.href)}`;
      window.location.href = deepLink;
      setTimeout(() => {
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        const appStoreUrl = isIOS
          ? "https://apps.apple.com/app/slush-a-sui-wallet/id1660851379"
          : "https://play.google.com/store/apps/details?id=com.slush.app";
        if (document.visibilityState === 'visible') {
          window.location.href = appStoreUrl;
        }
      }, 2000);
    }
  }, [account, id]);

  // Check if already checked in
  useEffect(() => {
    const checkAlreadyCheckedIn = async () => {
      if (!id || !account) return;
      setChecking(true);
      const q = query(
        collection(db, `events/${id}/attendees`),
        where("address", "==", account.address)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) setCheckedIn(true);
      setChecking(false);
    };
    checkAlreadyCheckedIn();
  }, [id, account]);

  const handleCheckIn = async () => {
    if (!id || Array.isArray(id) || !account) {
      alert("Please connect your wallet.");
      return;
    }
    setChecking(true);
    try {
      // Prevent duplicate check-in
      const q = query(
        collection(db, `events/${id}/attendees`),
        where("address", "==", account.address)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setCheckedIn(true);
        setChecking(false);
        return;
      }
      await addDoc(collection(db, `events/${id}/attendees`), {
        address: account.address,
        checkedInAt: new Date().toISOString(),
      });
      setCheckedIn(true);
    } catch (error) {
      console.error("Check-in failed:", error);
      alert("Failed to check in. Please try again.");
    }
    setChecking(false);
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
        <Button onClick={handleCheckIn} className="mt-4" disabled={checking}>
          {checking ? "Checking in..." : "Check In with Wallet"}
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