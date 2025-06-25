"use client"

import React from "react"
import { ProfileDropdown } from "./ProfileDropDown"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Wallet, Award, Coins, ArrowRight, Play, Calendar, MapPin, Users, Clock, Mail, Shield } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { useUser } from "./UserContext";

type Event = {
  id: number
  title: string
  description: string
  date: string
  location: string
  attendees: number
  category: string
}

export default function HomePage() {
  const { login, user, logout } = useUser();
  const account = useCurrentAccount();

  const [events, setEvents] = useState<Event[]>([])
  const [email, setEmail] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)

  // When wallet connects, log in with wallet address
  useEffect(() => {
    if (account && !user) {
      login({
        name: "Sui User",
        email: "",
        emails: [{ address: "", primary: true, verified: false }],
        avatarUrl: "https://via.placeholder.com/100",
        walletAddress: account.address,
      });
    }
  }, [account, login, user]);

  useEffect(() => {
    if (!user) setShowDropdown(false);
  }, [user]);

  // Function to add a new event (you can call this from elsewhere in your app)
  const addEvent = (newEvent: Omit<Event, "id">) => {
    setEvents(prevEvents => [...prevEvents, { ...newEvent, id: Date.now() }])
  }

  // Function to remove an event
  const removeEvent = (eventId: number): void => {
    setEvents((prevEvents: Event[]) => prevEvents.filter((event: Event) => event.id !== eventId))
  }

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter subscription
    console.log("Newsletter subscription:", email)
    setEmail("")
  }

  const communities = [
    {
      name: "SuiKenya",
      image: "https://i.ibb.co/YBvqHqsp/Screenshot-2025-06-24-030451.png",
      
    },
    {
      name: "SuiGhana", 
      image: "https://i.ibb.co/8gBCzdmq/Screenshot-2025-06-24-030632.png",
     
    },
    {
      name: "SuiNigeria",
      image: "https://i.ibb.co/W4zMd77q/Screenshot-2025-06-24-030948.png", 
      
    },
    {
      name: "Sui in Paris",
      image: "https://i.ibb.co/ZpKnvQQ1/Screenshot-2025-06-24-031327.png",
      
    }
  ]

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
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
            {["Communities", "Explore", "Dashboard"].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase().replace(' ', '-')}`}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                {item}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4 relative">
            <Link href='/create'>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                Start Creating
              </Button>
            </Link>
            {/* Only show ConnectButton if not logged in */}
            {!user ? (
              <ConnectButton />
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown((v) => !v)}
                  className="focus:outline-none"
                  aria-label="Open profile menu"
                >
                  <img
                    src={user.avatarUrl || "https://via.placeholder.com/100"}
                    alt="Profile"
                    className="w-10 h-10 rounded-full border-2 border-blue-500 cursor-pointer"
                  />
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 z-50">
                    <ProfileDropdown
                      walletAddress={user.walletAddress ?? ""}
                      onLogout={() => {
                        setShowDropdown(false);
                        logout();
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 sm:py-32 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight">
                Discover, Create,
                <br />
                and Share Events
                <br />
                on Sui
              </h1>
              <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                From small meetups to large programs, Suilens makes it easy to find community events, host your own, and connect with the Sui community.
              </p>
            </div>

            <div className="pt-4">
              <Button className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 text-lg font-semibold rounded-lg shadow-lg">
                Start Exploring
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Community Events Grid */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {communities.map((community, index) => (
                <div key={community.name} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group cursor-pointer">
                  <div className="h-48 relative overflow-hidden">
                    <img 
                      src={community.image} 
                      alt={`${community.name} community event`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                        {community.name}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{community.name} Meetup</h3>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Recent Community Event</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* View More Button */}
            <div className="text-center">
              <Button className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-3 text-lg font-semibold rounded-lg shadow-lg">
                View More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* POAPs Section */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* POAP Card */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 text-white">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Add POAPs to Your Events</h3>
                    <p className="text-blue-100 leading-relaxed">
                      Reward your attendees with Proof of Attendance Protocol tokens. Create memorable digital collectibles for your community events.
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center ml-4 flex-shrink-0">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                </div>
                <Button className="bg-white text-blue-600 hover:bg-gray-50 px-6 py-3 font-semibold rounded-lg">
                  Learn More
                </Button>
              </div>

              {/* Bounty Card */}
              <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-3xl p-8 text-white">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Bounty & Grant Tracking for Leads</h3>
                    <p className="text-yellow-100 leading-relaxed">
                      Track and manage bounties and grants efficiently. Perfect for community leads managing multiple programs and initiatives.
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center ml-4 flex-shrink-0">
                    <Coins className="w-8 h-8 text-white" />
                  </div>
                </div>
                <Button className="bg-white text-orange-600 hover:bg-gray-50 px-6 py-3 font-semibold rounded-lg">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Subscribe to our Newsletter</h2>
            <p className="text-gray-600 mb-8">Stay updated with the latest Sui community events and announcements</p>
            
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 py-3 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 font-semibold">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-200 text-black py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <Link href="/" className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className=" font-bold text-lg">S</span>
                  </div>
                  <span className="text-2xl font-bold ">Suilens</span>
                </Link>
                <p className=" mb-4 max-w-md">
                  Connecting the Sui community through events, bounties, and POAPs. Build, learn, and grow together.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Platform</h4>
                <ul className="space-y-2 ">
                  <li><Link href="/discover">Discover Events</Link></li>
                  <li><Link href="/communities">Communities</Link></li>
                  <li><Link href="/bounties" >Bounties</Link></li>
                  <li><Link href="/poaps" >POAPs</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <ul className="space-y-2 ">
                  <li><Link href="/help" >Help Center</Link></li>
                  <li><Link href="/contact" >Contact Us</Link></li>
                  <li><Link href="/privacy" >Privacy Policy</Link></li>
                  <li><Link href="/terms" >Terms of Service</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 Suilens. All rights reserved. Built for the Sui community.</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Dynamic Events Section (Hidden when no events, preserving functionality) */}
      {events.length > 0 && (
        <section className="py-16 relative bg-white/10 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Your Events</h2>
                  <p className="text-white/80">Manage your created events</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {event.description}
                        </p>
                      </div>
                      <Button
                        onClick={() => removeEvent(event.id)}
                        className="text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded"
                        variant="ghost"
                        size="sm"
                      >
                        ×
                      </Button>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-gray-600 text-sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Users className="w-4 h-4 mr-2" />
                        <span>{event.attendees} attendees</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        {event.category}
                      </span>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg">
                        View Event
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}