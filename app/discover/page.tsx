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
  Menu,
  X
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ConnectButton } from "@mysten/dapp-kit"

const EventDashboard: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const events = [
    {
      title: 'Game Night',
      type: 'Sub Community Meetup',
      date: 'June 24, 2025, 6:10 PM EAT',
      image: 'https://i.ibb.co/mrLgZcFz/Whats-App-Image-2025-04-27-at-2-43-18-PM.jpg',
      category: 'community'
    },
    {
      title: 'CONTENT CREATORS BOOTCAMP',
      type: 'Content Creators Bootcamp',
      date: 'June 25, 2025, 6:00 PM',
      image: 'https://via.placeholder.com/300x200?text=Content+Creators+Bootcamp',
      category: 'creators'
    },
    {
      title: 'Sui Community Meetup',
      type: 'Sub Community Meetup',
      date: 'June 25, 2025, 6:00 PM',
      image: 'https://via.placeholder.com/300x200?text=Sui+Community+Meetup',
      category: 'community'
    },
    {
      title: 'Developers Night',
      type: 'Developers Night',
      date: 'June 25, 2025, 6:00 PM',
      image: 'https://via.placeholder.com/300x200?text=Developers+Night',
      category: 'developers'
    },
    {
      title: 'Sui Community Meetup',
      type: 'Sub Community Meetup',
      date: 'June 24, 2025, 6:10 PM EAT',
      image: 'https://via.placeholder.com/300x200?text=Sui+Community+Meetup',
      category: 'community'
    },
    {
      title: 'Developer Meetup',
      type: 'Developers Night',
      date: 'June 26, 2025, 6:00 PM',
      image: 'https://via.placeholder.com/300x200?text=Developer+Meetup',
      category: 'developers'
    },
    {
      title: 'Developers Night',
      type: 'Developers Night',
      date: 'June 25, 2025, 6:00 PM',
      image: 'https://via.placeholder.com/300x200?text=Developers+Night',
      category: 'developers'
    },
    {
      title: 'CONTENT CREATORS BOOTCAMP',
      type: 'Content Creators Bootcamp',
      date: 'June 26, 2025, 6:00 PM',
      image: 'https://via.placeholder.com/300x200?text=Content+Creators+Bootcamp',
      category: 'creators'
    },
  ];
  
  const filteredEvents = selectedCategory === "all" 
    ? events 
    : events.filter(event => event.category === selectedCategory);
    
  const categories = [
    { id: "all", label: "All Events" },
    { id: "community", label: "Community" },
    { id: "developers", label: "Developers" },
    { id: "creators", label: "Content Creators" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/landing" className="flex items-center space-x-2 sm:space-x-3 group z-20">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Image 
                src="https://i.ibb.co/PZHSkCVG/Suilens-Logo-Mark-Suilens-Black.png" 
                alt="Suilens Logo" 
                width={60}
                height={60}
                className="object-contain"
              />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-gray-800">Suilens</span>
          </Link>
 
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <Link
              href="/landing"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              href="/communities"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Communities
            </Link>
            <Link
              href="/discover"
              className="text-gray-900 font-bold transition-colors"
            >
              Discover Events
            </Link>
            <Link
              href="/bounties"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Bounties
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Dashboard
            </Link>
          </nav>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 focus:outline-none z-20"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-10 bg-white pt-16 pb-6 px-4">
            <nav className="flex flex-col space-y-6">
              <Link
                href="/landing"
                className="text-lg font-medium text-gray-900 py-2 border-b border-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/communities"
                className="text-lg font-medium text-gray-900 py-2 border-b border-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Communities
              </Link>
              <Link
                href="/discover"
                className="text-lg font-bold text-blue-600 py-2 border-b border-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Discover Events
              </Link>
              <Link
                href="/bounties"
                className="text-lg font-medium text-gray-900 py-2 border-b border-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Bounties
              </Link>
              <Link
                href="/dashboard"
                className="text-lg font-medium text-gray-900 py-2 border-b border-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Search and Filter Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          {/* Search Bar */}
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search for community or event..."
              className="w-full pl-10 py-2 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Filter Button - Only on mobile */}
          <Button className="sm:hidden w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
        
        {/* Category Pills */}
        <div className="flex flex-nowrap overflow-x-auto pb-2 gap-2 sm:gap-3 hide-scrollbar">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium ${
                selectedCategory === category.id
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Event Grid */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredEvents.map((event, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 relative overflow-hidden">
                <img 
                  src={event.image} 
                  alt={event.title} 
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-300" 
                />
                <div className="absolute top-2 right-2">
                  <button className="p-1.5 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white">
                    <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-2">
                  <Badge variant="outline" className="text-xs font-medium text-blue-600 bg-blue-50 border-blue-200">
                    {event.type}
                  </Badge>
                </div>
                <h3 className="text-lg font-bold line-clamp-1">{event.title}</h3>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <Calendar className="h-3 w-3" />
                  <span className="truncate">{event.date}</span>
                </div>
                <Button className="mt-4 w-full bg-blue-600 text-white hover:bg-blue-700 py-2 rounded-lg text-sm">
                  Register
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Add custom CSS for hiding scrollbars but allowing scrolling */}
      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari and Opera */
        }
      `}</style>
    </div>
  );
};

export default EventDashboard;