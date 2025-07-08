"use client"

import { useState } from "react"

type GuestStatus = "New Member" | "Existing Member";

const statusStyles: Record<GuestStatus, string> = {
  "New Member": "bg-green-50 text-green-700 border border-green-100",
  "Existing Member": "bg-yellow-50 text-yellow-700 border border-yellow-100"
};

interface Guest {
  name: string;
  email: string;
  status: GuestStatus;
  date: string;
}

const initialGuests: Guest[] = [
  { name: "Cameron Williamson", email: "CameronWilliamson@gmail.com", status: "New Member", date: "May 11" },
  { name: "Cameron Williamson", email: "CameronWilliamson@gmail.com", status: "Existing Member", date: "May 11" },
  { name: "Cameron Williamson", email: "CameronWilliamson@gmail.com", status: "New Member", date: "May 11" },
  { name: "Cameron Williamson", email: "CameronWilliamson@gmail.com", status: "Existing Member", date: "May 11" },
  { name: "Cameron Williamson", email: "CameronWilliamson@gmail.com", status: "Existing Member", date: "May 11" },
  { name: "Cameron Williamson", email: "CameronWilliamson@gmail.com", status: "New Member", date: "May 11" },
]

export default function GuestList() {
  const [guests] = useState<Guest[]>(initialGuests);

  return (
    <div className="max-w-4xl mx-auto pt-20">
      <h1 className="text-4xl font-bold mb-10 text-[#0B1620]">Guest List</h1>
      <div className="space-y-4">
        {guests.map((guest: Guest, idx: number) => (
          <div key={idx} className="flex items-center justify-between bg-white rounded-2xl px-8 py-5 shadow-sm border border-gray-100">
            <span className="text-gray-900 font-medium w-1/3">{guest.name}</span>
            <span className="text-gray-500 w-1/3">{guest.email}</span>
            <span className={`px-3 py-1 rounded-lg text-xs font-semibold w-1/6 text-center ${statusStyles[guest.status]}`}>{guest.status}</span>
            <span className="text-gray-400 w-1/12 text-right">{guest.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
