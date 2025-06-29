"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  Users,
  Award,
  Coins,
  Wallet,
  TrendingUp,
  Globe,
  Star,
  ArrowRight,
  Heart,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ConnectButton } from "@mysten/dapp-kit"

const EventDashboard: React.FC = () => {
  const events = [
    {
      title: 'Game Night',
      type: 'Sub Community Meetup',
      date: 'June 24, 2025, 6:10 PM EAT',
      image: 'https://i.ibb.co/mrLgZcFz/Whats-App-Image-2025-04-27-at-2-43-18-PM.jpg',
    },
    {
      title: 'CONTENT CREATORS BOOTCAMP',
      type: 'Content Creators Bootcamp',
      date: 'June 25, 2025, 6:00 PM',
      image: 'https://via.placeholder.com/300x200?text=Content+Creators+Bootcamp',
    },
    {
      title: 'Sui Community Meetup',
      type: 'Sub Community Meetup',
      date: 'June 25, 2025, 6:00 PM',
      image: 'https://via.placeholder.com/300x200?text=Sui+Community+Meetup',
    },
    {
      title: 'Developers Night',
      type: 'Developers Night',
      date: 'June 25, 2025, 6:00 PM',
      image: 'https://via.placeholder.com/300x200?text=Developers+Night',
    },
    {
      title: 'Sui Community Meetup',
      type: 'Sub Community Meetup',
      date: 'June 24, 2025, 6:10 PM EAT',
      image: 'https://via.placeholder.com/300x200?text=Sui+Community+Meetup',
    },
    {
      title: 'Developer Meetup',
      type: 'Developers Night',
      date: 'June 26, 2025, 6:00 PM',
      image: 'https://via.placeholder.com/300x200?text=Developer+Meetup',
    },
    {
      title: 'Developers Night',
      type: 'Developers Night',
      date: 'June 25, 2025, 6:00 PM',
      image: 'https://via.placeholder.com/300x200?text=Developers+Night',
    },
    {
      title: 'CONTENT CREATORS BOOTCAMP',
      type: 'Content Creators Bootcamp',
      date: 'June 26, 2025, 6:00 PM',
      image: 'https://via.placeholder.com/300x200?text=Content+Creators+Bootcamp',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
       {/* Header */}
       <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
         <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
           <Link href="/landing" className="flex items-center space-x-3 group">
           <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
             <Image 
               src="https://i.ibb.co/PZHSkCVG/Suilens-Logo-Mark-Suilens-Black.png" 
               alt="Suilens Logo" 
               width={60}
               height={60}
               className="object-contain"
             />
           </div>
           <span className="text-2xl font-bold text-gray-800">Suilens</span>
           </Link>
 
           <nav className="hidden lg:flex items-center space-x-8">
             {["Home", "Communities",].map((item) => (
               <Link
                 key={item}
                 href={`/${item.toLowerCase().replace(' ', '-')}`}
                 className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
               >
                 {item}
               </Link>
             ))}
           </nav>
         </div>
       </header>

      {/* Search Bar */}
      <div className="p-6">
        <input
          type="text"
          placeholder="Search for community or event..."
          className="w-full max-w-xl p-2 border rounded"
        />
      </div>

      {/* Event Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
        {events.map((event, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img src={event.image} alt={event.title} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="text-lg font-bold">{event.title}</h3>
              <p className="text-sm text-gray-600">{event.type}</p>
              <p className="text-sm text-gray-500">{event.date}</p>
              <button className="mt-2 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                Register
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventDashboard;