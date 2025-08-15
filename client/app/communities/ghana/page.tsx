'use client'

import React, { useState } from 'react';
import Image from 'next/image'; 
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { ConnectButton } from '@mysten/dapp-kit';
import {useUser} from '@/context/UserContext';

const EventPage: React.FC = () => {

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {user} = useUser();

  const mainEvent = {
    title: 'Game Night in Ghana',
    image: 'https://i.ibb.co/8DGCTXfs/Go-Qzp-CXYAAgop4.jpg',
    description: 'Join the vibrant Sui community in Ghana for networking, learning, and building together. Connect with local developers, creators, and blockchain enthusiasts.',
    date: 'June 24, 2025, 02:23 PM EAT',
  };

  const otherEvents = [
    {
      title: 'Developer Meetup',
      image: 'https://i.ibb.co/Ghana01/developer-meetup.jpg',
      type: 'Bootcamp',
    },
    {
      title: 'CONTENT CREATORS BOOTCAMP',
      image: 'https://i.ibb.co/Ghana02/content-creators.jpg',
      type: 'Bootcamp',
    },
    {
      title: 'Sui Community Meetup',
      image: 'https://i.ibb.co/Ghana03/community-meetup.jpg',
      type: 'Meetup',
    },
    {
      title: 'Developers Night',
      image: 'https://i.ibb.co/Ghana04/developers-night.jpg',
      type: 'Night',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/landing" className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center">
                <Image 
                  src="https://i.ibb.co/PZHSkCVG/Suilens-Logo-Mark-Suilens-Black.png" 
                  alt="Suilens Logo" 
                  width={60}
                  height={60}
                  className="object-contain"
                />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-[#020B15]">Suilens</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex text-sm font-inter items-center space-x-8">
              {["Communities", "Discover", "Dashboard","Bounties"].map((item) => (
                <Link
                  key={item}
                  href={`/${item.toLowerCase().replace(' ', '-')}`}
                  className="text-gray-600 font-medium hover:text-gray-900 transition-colors"
                >
                  {item}
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex text-sm items-center space-x-4">                                    
              <Link href='/create'>
                <Button className="bg-[#4DA2FF] hover:bg-blue-500 transition-colors text-white px-6 rounded-xl">
                  Create Event
                </Button>
              </Link>
              {!user ? (
                <ConnectButton />
              ) : (
                <Link href="/profile">
                  <img
                    src={user.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=SuiLens"}
                    alt="Profile"
                    className="w-10 h-10 rounded-full border-2 border-blue-500 cursor-pointer"
                  />
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-2">
              {!user ? (
                <ConnectButton />
              ) : (
                <Link href="/profile">
                  <img
                    src={user.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=SuiLens"}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border-2 border-blue-500 cursor-pointer"
                  />
                </Link>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <nav className="lg:hidden mt-4 pb-4 border-t pt-4">
              <div className="flex flex-col space-y-3">
                {["Communities", "Discover", "Dashboard","Bounties"].map((item) => (
                  <Link
                    key={item}
                    href={`/${item.toLowerCase().replace(' ', '-')}`}
                    className="text-gray-600 font-medium hover:text-gray-900 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item}
                  </Link>
                ))}
                <Link href='/create' onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="bg-[#4DA2FF] hover:bg-blue-500 transition-colors text-white px-6 rounded-xl w-full mt-2">
                    Create Event
                  </Button>
                </Link>
              </div>
            </nav>
          )}
        </div>
      </header>


      {/* Main Event Section */}
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden"
        style={{ backgroundImage: `url(${mainEvent.image})`, height: '700px', backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}>
          
          <div className=" top-0 pl-6 m-6 text-white relative">
            <h1 className="text-5xl font-medium">{mainEvent.title}</h1>
            <p className="text-white-600 mt-2">{mainEvent.description}</p>
            <p className="text-sm text-white-500 mt-2">{mainEvent.date}</p>
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Register Now
            </button>
          </div>
        </div>

        {/* Other Events Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Other Sui Events in Ghana</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {otherEvents.map((event, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img src={event.image} alt={event.title} className="w-full h-40 object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-bold">{event.title}</h3>
                  <p className="text-sm text-gray-600">{event.type}</p>
                  <button className="mt-2 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                    Register
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventPage;