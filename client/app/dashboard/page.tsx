"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Calendar, MapPin, Users, Plus, BarChart3, Menu, X, Home, Users as UsersIcon, FileText, BarChart2, Target } from "lucide-react"
import Link from "next/link"
import { EmptyStateIllustration } from "@/components/empty-state-illustration"
import { ConnectButton } from "@mysten/dapp-kit"
import Image from "next/image"
import GuestList from "@/components/GuestList"
import { useUser } from "../../context/UserContext"
import { useEventContext } from "@/context/EventContext"

export default function DashboardPage() {
  
  type Event = {
    id: string
   
  }

  const { events } = useEventContext()
  
  const { user, logout } = useUser()

  const myEvents = events.filter(event => 
    event.creator === user?.walletAddress ||
    event.organizer?.name === user?.walletAddress || 
    event.organizer?.name === user?.name
  )
  
  
  const userEvents = myEvents // For compatibility with the template
  const [activeTab, setActiveTab] = useState("my-events")
  const [sidebarSection, setSidebarSection] = useState<string>("overview")
  const [showDropdown, setShowDropdown] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false)
  const [showUpcoming, setShowUpcoming] = useState(true)
  const [loading, setLoading] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [selectedEventTitle, setSelectedEventTitle] = useState<string>("")
  const [mounted, setMounted] = useState(false)

  const registeredEvents = events.filter(event => 
    event.rsvps?.includes(user?.walletAddress || '')
  )

  // Helper function to check if event is upcoming
  const isUpcoming = (event: any) => {
    const now = new Date()
    now.setHours(0, 0, 0, 0) // Set to start of today for consistent comparison
    
    // Use timestamp if available (more reliable), otherwise parse date string
    let eventDate: Date
    if (event.startTimestamp) {
      eventDate = new Date(event.startTimestamp)
    } else if (event.date) {
      // Handle various date formats that might come from toLocaleDateString()
      eventDate = new Date(event.date)
    } else {
      return false
    }
    
    eventDate.setHours(0, 0, 0, 0) // Set to start of day for comparison
    return eventDate >= now // Include today and future dates
  }

  // Filter events for display - use single consistent logic
  const filteredEventsForDisplay = myEvents.filter(event => {
    if (showUpcoming) {
      return isUpcoming(event)
    } else {
      return !isUpcoming(event)
    }
  });


  // Handle responsive behavior
  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    // Check on initial load
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && sidebarOpen) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && !sidebar.contains(event.target as Node)) {
          setSidebarOpen(false);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, sidebarOpen]);

  // Simulate loading when toggle changes
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500); // 500ms loading simulation
    
    return () => clearTimeout(timer);
  }, [showUpcoming]);

  return (
    <div className="min-h-screen w-full flex flex-col bg-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 z-20">
            <Image
              src="https://i.ibb.co/PZHSkCVG/Suilens-Logo-Mark-Suilens-Black.png"
              alt="Suilens Logo"
              width={28}
              height={28}
              className="object-contain"
            />
            <span className="text-lg font-semibold text-[#020B15]">
              Suilens
            </span>
          </Link>

          {/* Center Nav - Desktop Only */}
          <nav className="hidden md:flex flex-1 justify-center">
            <ul className="flex gap-4 lg:gap-8 text-sm font-medium text-gray-500">
              <li>
                <Link href="/">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/communities">Communities</Link>
              </li>
              <li>
                <Link href="/discover">Discover Events</Link>
              </li>
              <li>
                <Link href="/bounties">Bounties</Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-black font-semibold">Dashboard</Link>
              </li>
            </ul>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 focus:outline-none z-20"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>

          {/* Right Side - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {!user && (
              <>
                <Link href="/auth/signin">
                  <Button className="bg-transparent text-blue-500 hover:bg-blue-100 border border-blue-500 px-4 py-2 rounded-lg">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
            {user && (
              <>
                <Link href="/create">
                  <Button className="bg-[#4DA2FF] hover:bg-blue-500 transition-colors text-white px-6 rounded-xl">
                    Create Event
                  </Button>
                </Link>
                <Link href="/profile">
                  {mounted ? (
                    <img
                      src={user.avatarUrl || '/placeholder-user.jpg'}
                      alt="Profile"
                      className="w-8 h-8 rounded-full border border-gray-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full border border-gray-200 bg-gray-200 animate-pulse" />
                  )}
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-10 bg-white pt-16 pb-6 px-4">
            <nav className="flex flex-col space-y-6">
              <Link
                href="/"
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
                className="text-lg font-medium text-gray-900 py-2 border-b border-gray-100"
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

              {/* Mobile Auth Buttons */}
              <div className="flex flex-col space-y-4 pt-4">
                {!user ? (
                  <>
                    <Link
                      href="/auth/signin"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button className="w-full bg-transparent text-blue-500 hover:bg-blue-100 border border-blue-500 py-2 rounded-lg">
                        Login
                      </Button>
                    </Link>
                    
                  </>
                ) : (
                  <>
                    <Link
                      href="/create"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button className="w-full bg-[#4DA2FF] hover:bg-blue-500 transition-colors text-white py-2 rounded-xl">
                        Create Event
                      </Button>
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button className="w-full bg-transparent text-gray-700 hover:bg-gray-100 border border-gray-300 py-2 rounded-lg flex items-center justify-center gap-2">
                        {mounted ? (
                          <img
                            src={user.avatarUrl || '/placeholder-user.jpg'}
                            alt="Profile"
                            className="w-6 h-6 rounded-full border border-gray-200"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full border border-gray-200 bg-gray-200 animate-pulse" />
                        )}
                        My Profile
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Layout Container */}
      <div className="flex flex-1 w-full">
        {/* Mobile Sidebar Toggle */}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)} 
          className="lg:hidden fixed bottom-6 right-6 z-30 w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg"
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Sidebar */}
        <aside 
          id="sidebar"
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } fixed lg:static top-0 left-0 z-20 w-64 lg:w-64 min-h-screen bg-[#F6FBFF] text-[#0B1620] py-6 flex flex-col transition-transform duration-300 ease-in-out`}
        >
          <nav className="flex-1 flex flex-col px-4 gap-2">
            <button 
              onClick={() => {
                setSidebarSection("overview");
                if (isMobile) setSidebarOpen(false);
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-base transition-colors ${
                sidebarSection === "overview" 
                  ? "text-white bg-[#1A2332]" 
                  : "text-gray-400 hover:text-white hover:bg-[#1A2332]"
              }`}
            >
              <Image src="/material-symbols_dashboard-rounded.svg" alt="overviewicon" width={20} height={20} className="flex-shrink-0"/>
              Overview
            </button>
            
            <button
              onClick={() => {
                setSidebarSection("guests");
                if (isMobile) setSidebarOpen(false);
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-base transition-colors ${
                sidebarSection === "guests" 
                  ? "text-white bg-[#1A2332]" 
                  : "text-gray-400 hover:text-white hover:bg-[#1A2332]"
              }`}
            >
              <Image src="/Vector (2).svg" alt="guesticon" width={20} height={20} className="flex-shrink-0"/>
              Guests
            </button>
            
            <button
              onClick={() => {
                setSidebarSection("registrations");
                if (isMobile) setSidebarOpen(false);
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-base transition-colors ${
                sidebarSection === "registrations" 
                  ? "text-white bg-[#1A2332]" 
                  : "text-gray-400 hover:text-white hover:bg-[#1A2332]"
              }`}
            >
              <Image src="/Vector (3).png" alt="reg" width={20} height={20} className="flex-shrink-0"/>
              Registration
            </button>
            
            <button
              onClick={() => {
                setSidebarSection("blast");
                if (isMobile) setSidebarOpen(false);
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-base transition-colors ${
                sidebarSection === "blast" 
                  ? "text-white bg-[#1A2332]" 
                  : "text-gray-400 hover:text-white hover:bg-[#1A2332]"
              }`}
            >
              <Image src="/Vector (1).svg" alt="reg" width={20} height={20} className="flex-shrink-0"/>
              Blast
            </button>

            <button
              onClick={() => {
                setSidebarSection("mynfts");
                if (isMobile) setSidebarOpen(false);
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-base transition-colors ${
                sidebarSection === "mynfts" 
                  ? "text-white bg-[#1A2332]" 
                  : "text-gray-400 hover:text-white hover:bg-[#1A2332]"
              }`}
            >
              <Image src="/mynfts.svg" alt="reg" width={20} height={20} className="flex-shrink-0"/>
              My NFTs
            </button>
              
            <div className="mt-6">

              <span className="text-gray-500 font-medium text-base uppercase tracking-wider px-4 mb-3 block">INSIGHTS</span>

              <button 
                onClick={() => {
                  if (isMobile) setSidebarOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm text-gray-400 hover:text-white hover:bg-[#1A2332] transition-colors w-full"
              >
                <Image src="/Vector (3).svg" alt="" width={20} height={20} className="flex-shrink-0"/>
                Statistics
              </button>
              <button 
                onClick={() => {
                  if (isMobile) setSidebarOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm text-gray-400 hover:text-white hover:bg-[#1A2332] transition-colors w-full">
                  <Link 
                    href="/bounties" 
                    className="flex items-center gap-3 w-full"
                    
                    onClick={() => {
                      if (isMobile) setSidebarOpen(false);
                    }}
                  >
                    <Image src="/Vector (4).svg" alt="" width={20} height={20} className="flex-shrink-0"/>
                    Bounties
                  </Link>
                </button>  
            </div>

         
          </nav>
        </aside>

        {/* Overlay for mobile when sidebar is open */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-10"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Main Content */}
        <div className="flex-1 w-full min-w-0">
          {/* Main Dashboard Content */}
          <main className="w-full p-4 sm:p-6 lg:p-8">
            {sidebarSection === "guests" ? (
              <div className="pt-4 sm:pt-8 w-full">
                <GuestList />
              </div>
            ) : (
              <div className="space-y-6">
                <h1 className="text-[#000000] font-semibold text-4xl">My Overall Stats</h1>
                {/* Analytics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="overflow-hidden border-2 border-[#667185] shadow-xl bg-white text-[#667185] rounded-2xl">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[#667185] text-xs font-medium">Total Events</p>
                          <div className="flex flex-col">
                            <p className=" text-2xl text-[#000000] font-medium my-3">
                              {myEvents.length}
                            </p>
                           <p className="text-[#667185] text-xs font-medium" >Compared to last month</p>
                          </div>                          
                        </div>
                        <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center m-4">
                          <Calendar className="w-5 h-5"/>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="overflow-hidden border-2 border-[#667185] shadow-xl bg-white text-[#667185] rounded-2xl">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[#667185] text-xs font-medium">Registration</p>
                          <div className="flex flex-col">
                            <p className=" text-2xl text-[#000000] font-medium my-3">
                            {registeredEvents.reduce((acc, event) => acc + (event.registered || 0), 0)}
                            </p>
                           <p className="text-[#667185] text-xs font-medium" >Compared to last month</p>
                          </div>                          
                        </div>
                        <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center m-4">
                          <div className="w-5 h-5">
                            <img src="/registration.svg" alt="people" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="overflow-hidden border-2 border-[#667185] shadow-xl bg-white text-[#667185] rounded-2xl">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[#667185] text-xs font-medium">Total Attendees</p>
                          <div className="flex flex-col">
                            <p className=" text-2xl text-[#000000] font-medium my-3">
                            {registeredEvents.reduce((acc, event) => acc + (event.registered || 0), 0)}
                            </p>
                           <p className="text-[#667185] text-xs font-medium" >Compared to last month</p>
                          </div>                          
                        </div>
                        <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center m-4">
                          <div className="w-5 h-5">
                            <img src="/people.svg" alt="people" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="overflow-hidden border-2 border-[#667185] shadow-xl bg-white text-[#667185] rounded-2xl">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[#667185] text-xs font-medium">Events Attended</p>
                          <div className="flex flex-col">
                            <p className=" text-2xl text-[#000000] font-medium my-3">
                            0
                            </p>
                           <p className="text-[#667185] text-xs font-medium" >Compared to last month</p>
                          </div>                          
                        </div>
                        <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center m-4">
                          <BarChart2 className="w-5 h-5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>                  
                </div>
              </div>
            )}
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsContent value="my-events" className="space-y-6 w-full">
                <div className="flex flex-row justify-between items-center">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900">My Events</h2>
                      
                      <div className="flex items-center gap-4">
                        <span className={showUpcoming ? "font-normal text-[#667185]" : "text-[#667185]"}>Upcoming</span>
                        <Switch 
                          checked={!showUpcoming}
                          onCheckedChange={() => setShowUpcoming(!showUpcoming)}
                          aria-label="Toggle past/Upcoming events"
                        />
                        <span className={!showUpcoming ? "font-normal text-[#667185]" : "text-[#667185]"}>Past</span>
                      </div>
                    </div>
                {loading && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="bg-gray-100 h-40 rounded-xl animate-pulse" />
                    ))}
                  </div>
                )}
                {!loading && filteredEventsForDisplay.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full">
                    {filteredEventsForDisplay.map((event) => (
                      <div 
                        key={event.id} 
                        className={`cursor-pointer transition-all duration-200 ${
                          selectedEventId === event.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                        }`}
                        onClick={() => {
                          setSelectedEventId(event.id);
                          setSelectedEventTitle(event.title);
                          // Auto-switch to guests section when event is selected
                          if (sidebarSection === 'overview') {
                            setSidebarSection('guests');
                          }
                        }}
                      >
                        <Card
                          className="base-card-light group overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 rounded-2xl"
                        >
                          <Link href={`/event/${event.id}/admin`}>
                            <div className="h-40 bg-gray-100 relative overflow-hidden">
                              {event.bannerUrl ? (
                                <img 
                                  src={event.bannerUrl} 
                                  alt={event.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600" />
                              )}
                              <div className="absolute top-2 right-2">
                                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                                  Creator
                                </span>
                              </div>
                            </div>
                            <CardContent className="p-4">
                              <h3 className="font-semibold text-lg mb-2 line-clamp-1">{event.title}</h3>
                              <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  <span>{event.date}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  <span className="line-clamp-1">{event.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4" />
                                  <span>{event.rsvps?.length || 0} registered</span>
                                </div>
                              </div>
                              <div className="mt-3 pt-3 border-t">
                                <Button variant="outline" size="sm" className="w-full text-blue-600 hover:bg-blue-50">
                                  Manage Event →
                                </Button>
                              </div>
                            </CardContent>
                          </Link>
                        </Card>
                      </div>
                    ))}
                  </div>
                )}
                {!loading && filteredEventsForDisplay.length === 0 && myEvents.length > 0 && (
                  <div className="text-center py-16">
                    <h2 className="text-xl font-semibold mb-2">
                      No {showUpcoming ? 'upcoming' : 'past'} events found.
                    </h2>
                    <p className="mb-4">
                      {showUpcoming 
                        ? 'You don\'t have any upcoming events.' 
                        : 'You don\'t have any past events yet.'
                      }
                    </p>
                  </div>
                )}
                {!loading && myEvents.length === 0 && (
                  <div className="p-4 w-full">
                    <EmptyStateIllustration
                      title="Nothing here yet"
                      

                    />
                  </div>
                )}
              </TabsContent>
              <TabsContent value="registered" className="space-y-6 w-full">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Registered Events</h2>
                {registeredEvents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full">
                    {registeredEvents.map((event) => (
                      <Card key={event.id} className="base-card-light overflow-hidden rounded-2xl">
                        <Link href={`/event/${event.id}`}>
                          <div className="h-40 bg-gray-100 relative overflow-hidden">
                            {event.bannerUrl ? (
                              <img 
                                src={event.bannerUrl} 
                                alt={event.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-green-500 to-teal-600" />
                            )}
                            <div className="absolute top-2 right-2">
                              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                Registered
                              </span>
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-lg mb-2 line-clamp-1">{event.title}</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{event.date}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span className="line-clamp-1">{event.location}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Link>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 w-full">
                    <EmptyStateIllustration
                      title="No registered events"   
                    />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </div>
  )
}