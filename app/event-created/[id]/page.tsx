'use client'

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Copy, Check, Send as Telegram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getEventById } from "@/lib/getEventById";

const EventSuccessPage = () => {
  const { id } = useParams();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [registrationUrl, setRegistrationUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [event, setEvent] = useState<any>(null);

  useEffect(() => {
    if (id) {
      getEventById(id as string).then((eventData) => {
        setEvent(eventData);

        if (eventData?.poap) {
          const checkinUrl = `https://sui-lens-7ofh.vercel.app/events/${id}/checkin`;
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(checkinUrl)}`;
          setQrCodeDataUrl(qrUrl);
        } else {
          setQrCodeDataUrl("");
        }
        const regUrl = `https://sui-lens-7ofh.vercel.app/events/${id}/register`;
        setRegistrationUrl(regUrl);
      });
    }
  }, [id]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(registrationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  };

  const downloadQrCode = async () => {
    if (!qrCodeDataUrl) return;
    try {
      const response = await fetch(qrCodeDataUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `event-${id}-checkin-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Failed to download QR code.");
    }
  };

  // Share on X (Twitter)
  const shareOnX = () => {
    const text = encodeURIComponent(
      `Join my event on Suilens! Register here: ${registrationUrl}`
    );
    const url = `https://x.com/intent/tweet?text=${text}`;
    window.open(url, "_blank");
  };

  // Share on Telegram
  const shareOnTelegram = () => {
    const text = encodeURIComponent(
      `Join my event on Suilens! Register here: ${registrationUrl}`
    );
    const url = `https://t.me/share/url?url=${encodeURIComponent(registrationUrl)}&text=${text}`;
    window.open(url, "_blank");
  };

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading event...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-inter">
      <main className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Your Event Is Live
          </h1>
          <p className="text-[#747474] font-normal text-lg mb-8">
            You&apos;ve successfully created your event on Suilens.<br />
            Now let&apos;s make it a success.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <button
              onClick={copyLink}
              className="flex items-center px-6 py-3 border text-[#566773] border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 mr-2 text-green-600" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? "Copied!" : "Copy link"}
            </button>
            <button
              className="flex items-center px-6 py-3 border text-[#566773] border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              onClick={shareOnX}
            >
              {/* Inline SVG for X icon */}
              <svg
                className="w-4 h-4 mr-2"
                viewBox="0 0 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 110L110 10M10 10l100 100"
                  stroke="black"
                  strokeWidth="16"
                  strokeLinecap="round"
                />
              </svg>
              Share on X
            </button>
            <button
              className="flex items-center px-6 py-3 border text-[#566773] border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              onClick={shareOnTelegram}
            >
              <Telegram className="w-4 h-4 mr-2" />
              Share on Telegram
            </button>
          </div>
          {event.poap && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-[#2C2C2C] mb-6">
                SAVE YOUR POAP IMAGE
              </h2>
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="bg-white p-8 rounded-xl shadow-lg border mb-4">
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt="Event Check-In QR Code"
                      className="w-48 h-48 mx-auto"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Loading QR Code...</p>
                    </div>
                  )}
                </div>
                {qrCodeDataUrl && (
                  <Button onClick={downloadQrCode} variant="outline">
                    Download image
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EventSuccessPage;