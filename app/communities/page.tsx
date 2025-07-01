'use client'

import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserProvider } from '../landing/UserContext';
import { useUser } from '../landing/UserContext';
export default function CommunityEventsPage(){

  const account = useCurrentAccount();
  const { user, login, logout } = useUser();
  

  const [showDropdown, setShowDropdown] = useState(false);

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
  
    
  const events = [
    {
      id: 1,
      title: "SUI Community Ghana",
      description: "Join our vibrant community in Ghana where we explore the latest developments in blockchain technology, share knowledge, and build connections with fellow enthusiasts.",
      image: "https://i.ibb.co/LDDGGYdF/Screenshot-2025-06-24-141355.png",
      category: "Community",
      link: '/communities/ghana'
    },
    
    {
      id: 2,
      title: "SUI Community India",
      description: "Join our vibrant community in India where we explore the latest developments in blockchain technology, share knowledge, and build connections with fellow enthusiasts.",
      image: "/cOMMUNITY CARD (1).png",
      category: "Community",
      link: '/communities/ghana'
    },
    {
      id: 3,
      title: "SUI Community Korea",
      description: "Join our vibrant community in Korea where we explore the latest developments in blockchain technology, share knowledge, and build connections with fellow enthusiasts.",
      image: "/cOMMUNITY CARD.png",
      category: "Community",
      link: '/communities/ghana'
    },
    {
      id: 4,
      title: "SUI Community Kenya",
      description: "The Kenyan chapter of our global community brings together developers, entrepreneurs, and blockchain enthusiasts to collaborate and learn together.",
      image: "https://i.ibb.co/YBvqHqsp/Screenshot-2025-06-24-030451.png",
      category: "Community",
      link: '/communities/kenya'
    },
    {
      id: 5,
      title: "SUI Community Nigeria",
      description: "Nigeria's largest blockchain community focused on SUI ecosystem development, education, and creating opportunities for local developers and entrepreneurs.",
      image: "https://i.ibb.co/W4zMd77q/Screenshot-2025-06-24-030948.png",
      category: "Community",
      link: '/communities/nigeria'
    },
    {
      id: 6,
      title: "SUI Gaming Africa",
      description: "A dedicated space for gamers and blockchain enthusiasts to enjoy themselves and share their passion for gaming.",
      image: "https://i.ibb.co/1fmbwkSM/Screenshot-2025-06-24-141856.png",
      category: "Development",
      link: '/communities/gaming-africa'
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}

      <header className="bg-white/95 backdrop-blur-sm border-b sticky top-0 z-50">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                <Link href="/landing" className="flex items-center space-x-3 ">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                  <Image 
                    src="https://i.ibb.co/PZHSkCVG/Suilens-Logo-Mark-Suilens-Black.png" 
                    alt="Suilens Logo" 
                    width={60}
                    height={60}
                    className="object-contain"
                  />
                </div>
                <span className="text-2xl font-bold text-[#020B15]">Suilens</span>
                </Link>
      
                <nav className="hidden lg:flex text-sm font-inter items-center space-x-8">
                  <Link href='/' className="text-gray-800 font-semibold "></Link>
                  {["Communities", "Discover", "Dashboard","Bounties"].map((item) => (
                    <Link
                      key={item}
                      href={`/${item.toLowerCase().replace(' ', '-')}`}
                      className="text-gray-600  font-medium transition-colors"
                    >
                      {item}
                    </Link>
                  ))}
                </nav>
      
                <div className="flex text-sm items-center space-x-4">                                    
                  <Link href='/create'>
                    <Button className="bg-[#4DA2FF] hover:bg-blue-500 transition-colors text-white px-6 rounded-xl">
                    Create Event
                    </Button>
                  </Link>
                  {/* Only show ConnectButton if not logged in */}
                  {!user ? (
                    <ConnectButton />
                  ) : (
                    <Link href="/profile">
                      <img
                        src={user.avatarUrl || "https://via.placeholder.com/100"}
                        alt="Profile"
                        className="w-10 h-10 rounded-full border-2 border-blue-500 cursor-pointer"
                      />
                    </Link>
                  )}
                </div>
              </div>
            </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="my-8 w-9/12 h-12 flex justify-center">
          <div className="absolute max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by country..."
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Events Grid */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => (
            <div key={event.id} className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group cursor-pointer min-h-[400px]">
              {/* Image */}
              <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute top-4 left-4">
                  <span className="bg-white bg-opacity-90 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                    {event.category}
                  </span>
                </div>
                {/* Placeholder for actual event image */}
                <div className="w-full h-full flex items-center justify-center relative">
                {/* Background image */}
                <Image 
                  src={event.image} 
                  alt={event.title} 
                  fill
                  className="object-cover"
                />
                 
              </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-medium text-[#101928] mb-2">
                  {event.title}
                </h3>
                <p className="text-[#8A94A5] text-xs mb-6 leading-relaxed">
                  {event.description}
                </p>

                {/* Action Button */}
                <Link 
                  href={event.link}
                  className="inline-flex items-center font-medium text-sm"
                >
                  <Button className='text-[#101928] bg-gray-100 rounded-xl border-[#101928] hover:bg-slate-100 border'>
                    View community events
                  </Button>
                  
                  
                </Link>
              </div>
            </div>
          ))}
        
          </div>
        </div>
        </div>
      </main>
    </div>
  )
}

