// app/connect-mobile/page.tsx
'use client'
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function ConnectMobilePage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const eventId = searchParams.get('eventId');
    
    if (eventId) {
      // Create the deep link to Slush wallet
      const deepLink = `slush://connect?eventId=${eventId}&dapp=checkin&returnUrl=${encodeURIComponent(window.location.origin + '/checkin/' + eventId)}`;
      
      // Detect if it's iOS or Android
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      const isAndroid = /Android/i.test(navigator.userAgent);
      
      if (isIOS || isAndroid) {
        // Try to open the Slush app
        window.location.href = deepLink;
        
        // Fallback to app store after a delay
        setTimeout(() => {
          const appStoreUrl = isIOS
            ? "https://apps.apple.com/app/slush-a-sui-wallet/id1660851379"
            : "https://play.google.com/store/apps/details?id=com.slush.app";
          
          // Only redirect if still visible (app didn't open)
          if (document.visibilityState === 'visible') {
            window.location.href = appStoreUrl;
          }
        }, 2500);
      } else {
        // Desktop user - redirect back to main page
        window.location.href = `/checkin/${eventId}`;
      }
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Opening Slush Wallet...</h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600 mb-4">
          We're redirecting you to the Slush wallet app.
        </p>
        <p className="text-sm text-gray-500">
          If the app doesn't open automatically, you'll be redirected to download it.
        </p>
      </div>
    </div>
  );
}