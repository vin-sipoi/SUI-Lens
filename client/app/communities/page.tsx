'use client'

import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useUser } from '../../context/UserContext';
import { Menu, X, Search } from 'lucide-react';

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
  
  const events = [
    {
      id: 1,
      title: "Sui Community Ghana",
      description: "Join our vibrant community in Ghana where we explore the latest developments in blockchain technology, share knowledge, and build connections with fellow enthusiasts.",
      image: "https://i.ibb.co/LDDGGYdF/Screenshot-2025-06-24-141355.png",
      category: "Community",
      link: '/communities/ghana', // Updated to use dynamic route
      flagIcon: "/Ghana (GH).svg",
      slug: "ghana"
    },
    {
      id: 2,
      title: "Sui Community India",
      description: "Join our vibrant community in India where we explore the latest developments in blockchain technology, share knowledge, and build connections with fellow enthusiasts.",
      image: "https://i.ibb.co/5hdNKtFT/Screenshot-2025-07-28-235207.png",
      category: "Community",
      link: '/communities/india', // Updated to use dynamic route
      flagIcon: "/Portugal (PT) (3).svg",
      slug: "india"
    },
    {
      id: 3,
      title: "Sui Community Korea",
      description: "Join our vibrant community in Korea where we explore the latest developments in blockchain technology, share knowledge, and build connections with fellow enthusiasts.",
      image: "/cOMMUNITY CARD.png",
      category: "Community",
      link: '/communities/korea', // Updated to use dynamic route
      flagIcon: "/Portugal (PT).svg",
      slug: "korea"
    },
    {
      id: 4,
      title: "Sui Community Kenya",
      description: "The Kenyan chapter of our global community brings together developers, entrepreneurs, and blockchain enthusiasts to collaborate and learn together.",
      image: "https://i.ibb.co/YBvqHqsp/Screenshot-2025-06-24-030451.png",
      category: "Community",
      link: '/communities/kenya', // Updated to use dynamic route
      flagIcon: "/Portugal (PT) (1).svg",
      slug: "kenya"
    },
    {
      id: 5,
      title: "Sui Community Nigeria",
      description: "Nigeria's largest blockchain community focused on SUI ecosystem development, education, and creating opportunities for local developers and entrepreneurs.",
      image: "https://i.ibb.co/0jzvvMmY/Screenshot-2025-07-28-234111.png",
      category: "Community",
      link: '/communities/nigeria', // Updated to use dynamic route
      flagIcon: "/Nigeria (NG).svg",
      slug: "nigeria"
    },
    {
      id: 6,
      title: "SUI Pakistan",
      description: "A dedicated space for gamers and blockchain enthusiasts to enjoy themselves and share their passion for gaming.",
      image: "https://i.ibb.co/QjjYs0rH/Screenshot-2025-07-28-232824.png",
      category: "Development",
      link: '/communities/pakistan', // Updated to use dynamic route
      flagIcon: "/Pakistan (PK).svg",
      slug: "pakistan"
    },
    {
      id: 7,
      title: "SUI Community Vietnam",
      description: "A dedicated space for gamers and blockchain enthusiasts to enjoy themselves and share their passion for gaming.",
      image: "https://i.ibb.co/NgpSDJMW/Screenshot-2025-07-28-233205.png",
      category: "Development",
      link: '/communities/vietnam', // Updated to use dynamic route
      flagIcon: "/Vietnam (VN).svg",
      slug: "vietnam"
    },
    {
      id: 8,
      title: "SUI Community Portugal",
      description: "A dedicated space for gamers and blockchain enthusiasts to enjoy themselves and share their passion for gaming.",
      image:"https://i.ibb.co/Y4k6M6p1/Screenshot-2025-07-28-235104.png",
      category: "Development",
      link: '/communities/portugal', // Updated to use dynamic route
      flagIcon: "/Portugal (PT) (2).svg",
      slug: "portugal"
    },
    {
      id: 9,
      title: "SUI Community Turkiye",
      description: "A dedicated space for gamers and blockchain enthusiasts to enjoy themselves and share their passion for gaming.",
      image: "https://i.ibb.co/Jjf3bj6M/Screenshot-2025-07-28-234949.png",
      category: "Development",
      link: '/communities/turkiye', // Updated to use dynamic route
      flagIcon: "/Portugal (PT) (4).svg",
      slug: "turkiye"
    },
    {
      id: 10,
      title: "SUI Community Japan",
      description: "A dedicated space for gamers and blockchain enthusiasts to enjoy themselves and share their passion for gaming.",
      image: "https://i.ibb.co/M58pNWTd/Screenshot-2025-07-28-234306.png",
      category: "Development",
      link: '/communities/japan', // Updated to use dynamic route
      flagIcon: "/Portugal (PT) (5).svg",
      slug: "japan"
    },
    {
      id: 11,
      title: "SUI Community China",
      description: "A dedicated space for gamers and blockchain enthusiasts to enjoy themselves and share their passion for gaming.",
      image: "https://i.ibb.co/cXJkR8pz/Screenshot-2025-07-28-234503.png",
      category: "Development",
      link: '/communities/china', // Updated to use dynamic route
      flagIcon: "/Portugal (PT) (6).svg",
      slug: "china"
    },
    {
      id: 12,
      title: "SUI Community Uganda",
      description: "A dedicated space for gamers and blockchain enthusiasts to enjoy themselves and share their passion for gaming.",
      image: "https://i.ibb.co/5gcT3VTc/Screenshot-2025-07-28-233947.png",
      category: "Development",
      link: '/communities/uganda', // Updated to use dynamic route
      flagIcon: "/Portugal (PT) (7).svg",
      slug: "uganda"
    },
    {
      id: 13,
      title: "SUI Community Philippines",
      description: "A dedicated space for gamers and blockchain enthusiasts to enjoy themselves and share their passion for gaming.",
      image: "https://i.ibb.co/8LR9KvLg/Screenshot-2025-07-28-233810.png",
      category: "Development",
      link: '/communities/philippines', // Updated to use dynamic route
      flagIcon: "/Portugal (PT) (8).svg",
      slug: "philippines"
    },
    {
      id: 15,
      title: "SUI Community Indonesia",
      description: "A dedicated space for gamers and blockchain enthusiasts to enjoy themselves and share their passion for gaming.",
      image: "https://i.ibb.co/zHGXK8DM/Screenshot-2025-07-28-233403.png",
      category: "Development",
      link: '/communities/indonesia', // Updated to use dynamic route
      flagIcon: "/Uganda (UG).svg",
      slug: "indonesia"
    },
    {
      id: 16,
      title: "SUI Community France",
      description: "A dedicated space for gamers and blockchain enthusiasts to enjoy themselves and share their passion for gaming.",
      image: "https://i.ibb.co/pjRM3qg1/Screenshot-2025-07-28-235342.png",
      category: "Development",
      link: '/communities/france', // Updated to use dynamic route
      flagIcon: "/Uganda (UG) (1).svg",
      slug: "france"
    },
  ]
  
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-300 transition-shadow group cursor-pointer"
                >
                  {/* Image Section */}
                  <div className="relative h-32 sm:h-40 bg-gradient-to-br from-blue-50 to-purple-50">
                    <div className="w-full h-full relative">
                      <img 
                        src={event.image} 
                        alt={event.title} 
                        width={400}
                        height={200}
                        className="w-full h-full object-cover rounded-t-2xl"
                        
                      />
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-4 sm:p-6">
                    {/* Header with title and flag */}
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg sm:text-xl font-semibold text-[#101928] flex-1 mr-3">
                        {event.title}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-[#8A94A5] text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed ">
                      {event.description}
                    </p>

                    {/* Action Row: Button & Flag */}
                    <div className="flex items-center justify-between mt-4">
                      <Link 
                        href={event.link}
                        className="block w-full max-w-[80%] mr-2"
                      >
                        
                      <button className='w-auto text-sm font-normal p-2.5 bg-gray-100 text-black border-2 border-black rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors'
                      disabled>
                        View Community Events  
                      </button>

                      </Link>
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