'use client'

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getEventById } from "@/lib/getEventById";
import { getAttendeeAddresses } from "@/lib/getAttendeeAddresses";
import { Button } from "@/components/ui/button";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

export default function AdminMintPOAPPage() {
  const { id } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [minting, setMinting] = useState(false);
  const [status, setStatus] = useState("");
  const [recipients, setRecipients] = useState<string[]>([]);
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  // Replace with your actual values
  const PACKAGE_ID = "0xb215837735334cb0dd737efd367157328c5f39d27bd4d9657b18f7883e8b786c"; // Your Move package address
  const MODULE = "poap";

  useEffect(() => {
    if (id && typeof id === 'string') {
      getEventById(id).then(setEvent);
      getAttendeeAddresses(id).then(setRecipients);
    }
  }, [id]);

  const handleMintPOAPs = async () => {
    if (!account) {
      setStatus("Please connect your wallet");
      setMinting(false);
      return;
    }
    if (!id || typeof id !== 'string') {
      setStatus("Invalid event ID");
      setMinting(false);
      return;
    }
    if (!event?.poap) {
      setStatus("No POAP configured for this event.");
      setMinting(false);
      return;
    }
    if (!recipients.length) {
      setStatus("No attendees to mint POAPs for.");
      setMinting(false);
      return;
    }

    // Validate addresses
    const validRecipients = recipients.filter(addr => /^0x[a-fA-F0-9]{64}$/.test(addr));
    if (validRecipients.length !== recipients.length) {
      setStatus("Some addresses are invalid");
      setMinting(false);
      return;
    }

    setMinting(true);
    setStatus(`Minting POAPs for ${validRecipients.length} attendees...`);

    try {
      const eventName = event.poap.name;
      // Combine date and time, fallback to current timestamp if missing
      const eventDate = event.date && event.time
        ? Math.floor(Date.parse(`${event.date}T${event.time}`) / 1000)
        : Math.floor(Date.now() / 1000);
      const description = event.poap.description;

      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE}::batch_mint_and_transfer`,
        arguments: [
          tx.pure.string(eventName), // Move string type
          tx.pure.u64(eventDate), // Move u64 type
          tx.pure.string(description), // Move string type
          tx.makeMoveVec({
            type: 'address',
            elements: validRecipients.map(addr => tx.pure.address(addr)), // Correctly format vector of addresses
          }),
        ],
      });


      const result = await signAndExecuteTransaction({
        transaction: tx,
        account,
      });

      setStatus(`POAPs minted successfully! Transaction: ${result.digest}`);
    } catch (e: any) {
      console.error(e);
      setStatus(`Minting failed: ${e.message || 'Unknown error'}`);
    } finally {
      setMinting(false);
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
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold mb-4">POAP Admin Panel</h1>
        {event.poap ? (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">POAP Details</h2>
              <p><strong>Name:</strong> {event.poap.name}</p>
              <p><strong>Description:</strong> {event.poap.description}</p>
              <p>
                <strong>Date:</strong>{" "}
                {event.date && event.time
                  ? `${event.date} ${event.time}`
                  : event.date || "N/A"}
              </p>
            </div>
            <div className="mb-6">
              <Button
                onClick={handleMintPOAPs}
                disabled={minting || !account}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {minting ? "Minting..." : "Mint POAPs to Attendees"}
              </Button>
              <div className="mt-4 text-sm text-gray-700">{status}</div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Attendees ({recipients.length})</h3>
              <ul className="text-xs bg-white rounded p-2 max-h-40 overflow-auto border">
                {recipients.map(addr => (
                  <li key={addr}>{addr}</li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <div className="text-red-600 font-medium">
            No POAP configured for this event.
          </div>
        )}
      </main>
    </div>
  );
}