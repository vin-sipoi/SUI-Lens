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

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    x: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !account) return;
    await addDoc(collection(db, "events", id, "registrations"), {
      address: account.address,
      registeredAt: new Date(),
      name: form.name,
      mobile: form.mobile,
      email: form.email,
      x: form.x,
    });
    setRegistered(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md border border-blue-400">
        <h1 className="text-3xl font-semibold text-center mb-8">Register</h1>
        <ConnectButton />
        {account && (
          <div className="mb-6 text-sm text-gray-600 text-center">
            Connected wallet: <span className="font-mono">{account.address}</span>
          </div>
        )}
        {!account ? null : !registered ? (
          <form className="space-y-5" onSubmit={handleRegister}>
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