'use client'

import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import Image from 'next/image'
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useUser } from '../../context/UserContext';
import {  Search } from 'lucide-react';
import Header from '../components/Header';
import { events } from '@/lib/community';

export default function CommunityEventsPage(){
  const account = useCurrentAccount();
  const { user, login } = useUser();
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
  
  // Filter events based on search query
  const filteredEvents = searchQuery
    ? events.filter(event => 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : events;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Search Bar */}
        <div className="mb-8 w-full sm:w-9/12 md:w-2/3 mx-auto">
          <div className="relative flex items-center">
            <Search className="absolute left-3 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by country..."
              className="block w-full pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-lg bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Events Grid */}
        <div className="container mx-auto px-0 sm:px-6 lg:px-8 bg-gray-100 rounded-2xl py-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-stretch">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 transition-shadow group cursor-pointer flex flex-col h-full"
                >
                  {/* Inner wrapper: adds padding and border so image and text align */}
                  <div className="p-4 sm:p-6 border border-gray-200 rounded-xl bg-white flex flex-col h-full">
                    {/* Image Section: fixed height so all cards line up */}
                    <div className="relative w-full h-40 sm:h-48 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.title}
                        width={400}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Content Section */}
                    <div className="mt-4 flex-1 flex flex-col">
                      {/* Header with title and flag */}
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg sm:text-xl font-semibold text-[#101928] flex-1 mr-3">
                          {event.title}
                        </h3>
                      </div>

                      {/* Description */}
                      <p className="text-[#8A94A5] text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed flex-1">
                        {event.description}
                      </p>

                      {/* Action Row: Button & Flag - stick to bottom */}
                      <div className="flex items-center justify-between mt-auto">
                        <div className="block w-full max-w-[80%] mr-2">
                          <button 
                            className='w-auto text-sm font-normal p-2.5 bg-gray-100 text-gray-500 border-2 border-gray-300 rounded-full flex items-center justify-center cursor-not-allowed opacity-60'
                            disabled
                          >
                            View Community Events  
                          </button>
                        </div>
                        <div className="flex-shrink-0 ml-2">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg sm:text-xl">
                            <Image 
                              src={event.flagIcon} 
                              alt={`${event.title} Flag`} 
                              width={64} 
                              height={64} 
                              className="object-contain"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Show message if no results found */}
            {filteredEvents.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No communities found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search query to find what you're looking for.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}