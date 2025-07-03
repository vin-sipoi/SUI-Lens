"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";

function isMobileDevice() {
  if (typeof navigator === "undefined") return false;
  return /android|iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isSlushInAppBrowser() {
  if (typeof navigator === "undefined") return false;
  return /Slush/i.test(navigator.userAgent);
}

export default function RegisterPage() {
  const params = useParams();
  const id =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
      ? params.id[0]
      : undefined;
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const account = useCurrentAccount();
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    x: "",
  });

  // Copy current URL to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!id || !account) {
      setError("Please connect your wallet.");
      return;
    }
    try {
      await addDoc(collection(db, "events", id, "registrations"), {
        address: account.address,
        registeredAt: new Date(),
        name: form.name,
        mobile: form.mobile,
        email: form.email,
        x: form.x,
      });
      setRegistered(true);
    } catch (err) {
      setError("Failed to register. Please try again.");
      console.error("Registration error:", err);
    }
  };

  // Show instructions if on mobile and not in Slush browser
  if (isMobileDevice() && !isSlushInAppBrowser()) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg border border-blue-400 text-center">
          <h1 className="text-3xl font-bold mb-6 text-blue-700">Register</h1>
          <p className="mb-4 text-lg font-semibold text-gray-800">
            📱 To register on mobile:
          </p>
          <ol className="mb-4 text-base text-gray-700 text-left mx-auto max-w-xs list-decimal list-inside">
            <li>
              <span className="font-bold text-blue-600">Tap "Copy Link"</span> below.
            </li>
            <li>
              <span className="font-bold text-blue-600">Open the Slush wallet app</span> on your phone.
            </li>
            <li>
              Go to the <span className="font-bold text-blue-600">Browser</span> tab and paste the link.
            </li>
          </ol>
          <Button
            onClick={handleCopyLink}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded mb-2 text-lg"
          >
            {copied ? "✅ Link Copied!" : "Copy Link"}
          </Button>
          <p className="text-xs text-gray-500 mt-4">
            This ensures you can connect your wallet and register seamlessly.
          </p>
        </div>
      </div>
    );
  }

  // Normal flow (desktop or in-app browser)
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg border border-blue-400">
        <h1 className="text-3xl font-semibold text-center mb-6">Register</h1>
        <ConnectButton />
        {error && (
          <p className="text-center text-red-600 font-medium mt-2">{error}</p>
        )}
        {!account ? (
          <div className="text-center text-gray-500 mt-4">
            <p>Connect your wallet to register for this event.</p>
            <p className="mt-2 text-xs">
              On mobile? Install a Sui wallet app like{" "}
              <a
                href="https://apps.apple.com/app/slush-a-sui-wallet/id1660851379"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                Slush
              </a>
              ,{" "}
              <a
                href="https://apps.apple.com/app/suiet/id6446209466"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                Suiet
              </a>
              , or{" "}
              <a
                href="https://play.google.com/store/apps/details?id=com.surf.wallet"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                Surf
              </a>
              .
            </p>
          </div>
        ) : !registered ? (
          <form className="space-y-4 mt-6" onSubmit={handleRegister}>
            <div>
              <label className="block text-sm mb-1 font-medium">Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                className="w-full border rounded px-3 py-2 bg-gray-50"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1 font-medium">Mobile Number</label>
              <input
                type="tel"
                name="mobile"
                className="w-full border rounded px-3 py-2 bg-gray-50"
                value={form.mobile}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1 font-medium">Email Address</label>
              <input
                type="email"
                name="email"
                className="w-full border rounded px-3 py-2 bg-gray-50"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1 font-medium">X username (optional)</label>
              <input
                type="text"
                name="x"
                className="w-full border rounded px-3 py-2 bg-gray-50"
                value={form.x}
                onChange={handleChange}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded mt-2"
            >
              Register
            </Button>
          </form>
        ) : (
          <p className="text-center text-green-600 font-medium mt-6">Registered! Thank you.</p>
        )}
      </div>
    </div>
  );
}