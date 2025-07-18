"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Calendar, MapPin, Users, Plus, BarChart3, Menu, X, Home, Users as UsersIcon, FileText, BarChart2, Target } from "lucide-react"
import Link from "next/link"
import { EmptyStateIllustration } from "@/components/empty-state-illustration"
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit"
import { useEventStore } from "@/store/EventStore"
import Image from "next/image"
import GuestList from "@/components/GuestList"
import { useUser } from "../landing/UserContext"
import { ProfileDropdown } from "../landing/ProfileDropDown"
import { useSuiContracts } from "@/hooks/useSuiContracts"

export default function DashboardPage() {
  type Event = {
    id: string
    attendees?: number
  }
  const myEvents = useEventStore((state) => state.myEvents)
  const [blockchainEvents, setBlockchainEvents] = useState<any[]>([])
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([])
  const [activeTab, setActiveTab] = useState("my-events")
  const [sidebarSection, setSidebarSection] = useState<string>("overview")
  const { user, logout, login } = useUser()
  const currentAccount = useCurrentAccount()
  const { getUserEvents } = useSuiContracts()
  const [showDropdown, setShowDropdown] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)

  // Auto-login is now handled by WalletConnectionManager

  // Fetch events from blockchain when wallet is connected
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    
    const fetchEvents = async () => {
      if (currentAccount?.address && isMounted) {
        setIsLoadingEvents(true);
        try {
          const events = await getUserEvents(currentAccount.address);
          if (isMounted) {
            console.log('Fetched user events from blockchain:', events);
            setBlockchainEvents(events);
          }
        } catch (error) {
          console.error('Error fetching events:', error);
          // Don't retry on network errors to prevent infinite loops
          if (error instanceof TypeError && error.message === 'Failed to fetch') {
            console.log('Network error, skipping retry');
          }
        } finally {
          if (isMounted) {
            setIsLoadingEvents(false);
          }
        }
      }
    };
    
    // Add a delay to prevent immediate re-fetching
    timeoutId = setTimeout(() => {
      fetchEvents();
    }, 1000);
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [currentAccount?.address, getUserEvents]);

  // Handle responsive behavior
  useEffect(() => {
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

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-b from-blue-400 via-blue-100 to-blue-50 relative">
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)} 
        className="lg:hidden fixed bottom-6 right-6 z-30 w-12 h-12 rounded-full bg-[#4DA2FF] hover:bg-blue-500 text-white flex items-center justify-center shadow-xl hover:scale-105 transition-all"
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside 
        id="sidebar"
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } fixed lg:static top-0 left-0 z-20 w-64 min-h-screen bg-white/95 backdrop-blur-sm border-r border-gray-200 py-6 px-4 flex flex-col gap-6 transition-transform duration-300 ease-in-out shadow-xl`}
      >
        <div className="flex items-center mb-8">
          <Image src="https://i.ibb.co/PZHSkCVG/Suilens-Logo-Mark-Suilens-Black.png" alt="Suilens Logo" width={24} height={24} unoptimized />
          <span className="ml-2 text-lg font-bold text-[#020B15]">Suilens</span>
        </div>
        <nav className="flex-1 flex flex-col gap-4">
          <button
            onClick={() => {
              setSidebarSection("overview");
              if (isMobile) setSidebarOpen(false);
            }}
            className={`flex items-center gap-2 font-medium transition-all duration-200 px-3 py-2 rounded-xl hover:bg-blue-100 ${sidebarSection === "overview" ? "text-[#4DA2FF] bg-blue-100 shadow-md" : "text-gray-600 hover:text-[#4DA2FF]"}`}
          >
            <svg width="20" height="20" fill="none">
              <rect width="20" height="20" rx="4" fill="#fff" fillOpacity="0.1" />
              <rect x="4" y="4" width="4" height="4" rx="1" fill="#fff" />
              <rect x="12" y="4" width="4" height="4" rx="1" fill="#fff" />
              <rect x="4" y="12" width="4" height="4" rx="1" fill="#fff" />
              <rect x="12" y="12" width="4" height="4" rx="1" fill="#fff" />
            </svg>
            Overview
          </button>
          <button
            onClick={() => {
              setSidebarSection("guests");
              if (isMobile) setSidebarOpen(false);
            }}
            className={`flex items-center gap-2 font-medium transition-all duration-200 px-3 py-2 rounded-xl hover:bg-blue-100 ${sidebarSection === "guests" ? "text-[#4DA2FF] bg-blue-100 shadow-md" : "text-gray-600 hover:text-[#4DA2FF]"}`}
          >
            <svg width="20" height="20" fill="none">
              <path d="M10 10a3 3 0 100-6 3 3 0 000 6zM10 12c-3.314 0-6 1.343-6 3v1a1 1 0 001 1h10a1 1 0 001-1v-1c0-1.657-2.686-3-6-3z" fill="currentColor" />
            </svg>
            Guests
          </button>
          <button
            onClick={() => {
              setSidebarSection("registration");
              if (isMobile) setSidebarOpen(false);
            }}
            className="flex items-center gap-2 text-gray-600 hover:text-[#4DA2FF] transition-all duration-200 px-3 py-2 rounded-xl hover:bg-blue-100"
          >
            <svg width="20" height="20" fill="none">
              <rect x="3" y="7" width="14" height="10" rx="2" fill="currentColor" fillOpacity=".2" />
              <rect x="7" y="3" width="6" height="4" rx="1" fill="currentColor" />
            </svg>
            Registration
          </button>
          <button
            onClick={() => {
              setSidebarSection("blast");
              if (isMobile) setSidebarOpen(false);
            }}
            className="flex items-center gap-2 text-gray-600 hover:text-[#4DA2FF] transition-all duration-200 px-3 py-2 rounded-xl hover:bg-blue-100"
          >
            <svg width="20" height="20" fill="none">
              <rect x="3" y="7" width="14" height="10" rx="2" fill="currentColor" fillOpacity=".2" />
              <rect x="7" y="3" width="6" height="4" rx="1" fill="currentColor" />
            </svg>
            Blast
          </button>
          <div className="mt-6">
            <span className="text-gray-500 text-xs mb-2 block">Insight</span>
            <button 
              onClick={() => {
                if (isMobile) setSidebarOpen(false);
              }}
              className="flex items-center gap-2 text-gray-400 hover:text-white mb-2"
            >
              <svg width="20" height="20" fill="none">
                <rect x="3" y="3" width="14" height="14" rx="2" fill="currentColor" fillOpacity=".2" />
                <rect x="7" y="7" width="6" height="6" rx="1" fill="currentColor" />
              </svg>
              Statistics
            </button>
            <Link 
              href="/bounties" 
              className="flex items-center gap-2 text-gray-600 hover:text-[#4DA2FF] transition-all duration-200 px-3 py-2 rounded-xl hover:bg-blue-100"
              onClick={() => {
                if (isMobile) setSidebarOpen(false);
              }}
            >
              <svg width="20" height="20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
                <rect x="8" y="8" width="4" height="4" rx="1" fill="currentColor" />
              </svg>
              Bounties
            </Link>
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
      <div className="flex-1 flex flex-col">
        {/* Top Nav */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 bg-white overflow-x-auto">
          {/* Navigation Links - Scrollable on mobile */}
          <nav className="flex items-center gap-3 sm:gap-6">
            {["Home", "Communities", "Discover Events", "Bounties", "Dashboard"].map((item) => (
              <Link
                key={item}
                href={
                  item === "Home"
                    ? "/landing"
                    : item === "Discover Events"
                    ? "/discover"
                    : `/${item.toLowerCase().replace(/ /g, "")}`
                }
                className={`whitespace-nowrap text-xs sm:text-sm font-medium ${item === "Dashboard" ? "text-black font-bold" : "text-gray-500 hover:text-black"} transition-colors`}
              >
                {item}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/create">
              <Button className="bg-[#4DA2FF] hover:bg-blue-500 text-white px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm rounded-xl transition-colors">Create Event</Button>
            </Link>
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown((v) => !v)}
                  className="focus:outline-none"
                  aria-label="Open profile menu"
                >
                  <Image
                    src={user.avatarUrl || "/placeholder-user.jpg"}
                    alt="User"
                    width={32}
                    height={32}
                    className="rounded-full cursor-pointer border-2 border-blue-500 hover:scale-105 transition-transform shadow-md"
                  />
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 z-50">
                    <ProfileDropdown
                      walletAddress={user.walletAddress ?? ""}
                      avatarUrl={user.avatarUrl}
                      onLogout={() => {
                        setShowDropdown(false)
                        logout()
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </header>
        
        {/* Main Dashboard Content */}
        <main className="flex-1 p-4 sm:p-6">
          {sidebarSection === "guests" ? (
            <div className="pt-4 sm:pt-8">
              <GuestList />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <Card className="overflow-hidden border-0 shadow-xl bg-[#4DA2FF] text-white rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-xs font-medium mb-2">Total Events</p>
                      <p className="text-2xl font-bold">{blockchainEvents.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="overflow-hidden border-0 shadow-xl bg-blue-500 text-white rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-xs font-medium mb-2">Total Attendees</p>
                      <p className="text-2xl font-bold">
                        {blockchainEvents.reduce((sum, e) => sum + Number(e.registered_attendees?.length || 0), 0)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="overflow-hidden border-0 shadow-xl bg-blue-600 text-white rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-xs font-medium mb-2">Registered For</p>
                      <p className="text-2xl font-bold">{registeredEvents.length}</p>
                      <p className="text-blue-100 text-xs mt-1">Upcoming events</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="overflow-hidden border-0 shadow-xl bg-blue-400 text-white rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-xs font-medium mb-2">This Month</p>
                      <p className="text-2xl font-bold">0</p>
                      <p className="text-blue-100 text-xs mt-1">Events attended</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="my-events" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">My Events</h2>
              </div>
              {isLoadingEvents ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading events from blockchain...</p>
                  </div>
                </div>
              ) : blockchainEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {blockchainEvents.map((event) => (
                    <Card
                      key={event.id}
                      className="bg-white group overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 rounded-2xl border"
                    >
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                        
                        <div className="space-y-2 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>{event.start_date ? new Date(event.start_date).toLocaleDateString() : 'TBD'}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span className="truncate">{event.location}</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            <span>{event.registered_attendees?.length || 0} attendees</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            {event.category || 'General'}
                          </span>
                          <Button 
                            size="sm" 
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                            onClick={() => window.location.href = `/events/${event.id}`}
                          >
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-4">
                  <EmptyStateIllustration
                    type="no-created-events"
                    title="No events created yet"
                    description="Start creating amazing events and connect with your audience. Your first event is just a click away!"
                    actionText="Create Your First Event"
                    onAction={() => (window.location.href = "/create")}
                  />
                </div>
              )}
            </TabsContent>
            <TabsContent value="registered" className="space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Registered Events</h2>
              {registeredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {registeredEvents.map((event) => (
                    <Card key={event.id} className="bg-white overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 rounded-2xl border">
                      {/* ...registered event card rendering... */}
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-4">
                  <EmptyStateIllustration
                    type="no-registered-events"
                    title="No registered events"
                    description="Discover exciting events happening around you and register to join the fun!"
                    actionText="Explore Events"
                    onAction={() => (window.location.href = "/discover")}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}