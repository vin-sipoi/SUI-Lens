'use client'

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

// You need to implement this function to fetch event data from Firestore
import { getEventById } from "@/lib/getEventById";

const EventSuccessPage = () => {
  const { id } = useParams();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [registrationUrl, setRegistrationUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [event, setEvent] = useState<any>(null);
  const downloadRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    if (id) {
      // Fetch event data to check if POAP exists
      getEventById(id as string).then((eventData) => {
        setEvent(eventData);

        // Only set QR and registration URLs if POAP exists
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

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading event...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-inter bg-gray-50">
      <main className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-medium text-gray-900 mb-4">
            Your Event Is Live
          </h1>
          <p className="text-[#747474] font-normal text-2xl mb-8">
            You've successfully created your event on Suilens.<br />
            Now share the registration link{event.poap && " or QR code"} with your attendees.
          </p>
          <div className="flex flex-wrap text-base justify-center gap-4 mb-12">
            <button
              onClick={copyLink}
              className="flex items-center px-6 py-3 border text-[#566773] border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 mr-2 text-green-600" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? "Copied!" : "Copy registration link"}
            </button>
          </div>
          {event.poap ? (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-[#2C2C2C] mb-6">
                SHARE THIS QR CODE (FOR EVENT CHECK-IN/POAP)
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
                    Download QR Code
                  </Button>
                )}
              </div>
              <p className="text-gray-500 text-sm">
                Attendees must scan this QR code at the event to check in and be eligible for POAPs.
              </p>
            </div>
          ) : (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-[#2C2C2C] mb-6">
                No POAP for this event
              </h2>
              <p className="text-gray-500 text-sm">
                This event does not require QR check-in for POAPs.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EventSuccessPage;