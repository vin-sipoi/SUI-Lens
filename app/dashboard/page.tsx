"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Calendar, MapPin, Users, Plus, BarChart3, Menu, X, Home, Users as UsersIcon, FileText, BarChart2, Target } from "lucide-react"
import Link from "next/link"
import { EmptyStateIllustration } from "@/components/empty-state-illustration"
import { ConnectButton } from "@mysten/dapp-kit"
import { useEventStore } from "@/store/EventStore"
import Image from "next/image"
import GuestList from "@/components/GuestList"
import { useUser } from "../landing/UserContext"
import { ProfileDropdown } from "../landing/ProfileDropDown"

export default function DashboardPage() {
  type Event = {
    id: string
    attendees?: number
  }
  const myEvents = useEventStore((state) => state.myEvents)
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([])
  const [activeTab, setActiveTab] = useState("my-events")
  const [sidebarSection, setSidebarSection] = useState<string>("overview")
  const { user, logout } = useUser()
  const [showDropdown, setShowDropdown] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

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
    <div className="min-h-screen flex flex-col lg:flex-row bg-white relative">
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
        } fixed lg:static top-0 left-0 z-20 w-64 min-h-screen bg-[#0B1620] py-6 px-4 flex flex-col gap-6 transition-transform duration-300 ease-in-out`}
      >
        <div className="flex items-center mb-8">
          <Image src="https://i.ibb.co/PZHSkCVG/Suilens-Logo-Mark-Suilens-Black.png" alt="Suilens Logo" width={24} height={24} unoptimized />
          <span className="ml-2 text-lg font-bold text-white">Suilens</span>
        </div>
        <nav className="flex-1 flex flex-col gap-4">
          <button
            onClick={() => {
              setSidebarSection("overview");
              if (isMobile) setSidebarOpen(false);
            }}
            className={`flex items-center gap-2 font-medium hover:text-gray-300 ${sidebarSection === "overview" ? "text-white" : "text-gray-400"}`}
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
            className={`flex items-center gap-2 font-medium hover:text-white ${sidebarSection === "guests" ? "text-white" : "text-gray-400"}`}
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
            className="flex items-center gap-2 text-gray-400 hover:text-white"
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
            className="flex items-center gap-2 text-gray-400 hover:text-white"
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
              className="flex items-center gap-2 text-gray-400 hover:text-white"
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
        <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 overflow-x-auto">
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
              <Button className="bg-[#56A8FF] text-white px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm rounded-full">Create Event</Button>
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
                    className="rounded-full cursor-pointer border-2 border-blue-500"
                  />
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 z-50">
                    <ProfileDropdown
                      walletAddress={user.walletAddress ?? ""}
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
              <Card className="overflow-hidden border-0 shadow-xl bg-[#56A8FF] text-white rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-xs font-medium">Total Events</p>
                      <p className="text-xl font-bold">{myEvents.length}</p>
                    </div>
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="overflow-hidden border-0 shadow-xl bg-[#10B981] text-white rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-xs font-medium">Total Attendees</p>
                      <p className="text-xl font-bold">
                        {myEvents.reduce((sum, e) => sum + Number(e.attendees || 0), 0)}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="overflow-hidden border-0 shadow-xl bg-[#8B5CF6] text-white rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-xs font-medium">Registered For</p>
                      <p className="text-xl font-bold">{registeredEvents.length}</p>
                      <p className="text-purple-100 text-xs mt-1">Upcoming events</p>
                    </div>
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="overflow-hidden border-0 shadow-xl bg-[#F59E0B] text-white rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-xs font-medium">This Month</p>
                      <p className="text-xl font-bold">0</p>
                      <p className="text-orange-100 text-xs mt-1">Events attended</p>
                    </div>
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-5 h-5" />
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
              {myEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {myEvents.map((event) => (
                    <Card
                      key={event.id}
                      className="base-card-light group overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 rounded-2xl"
                    >
                      {/* ...event card rendering... */}
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
                    <Card key={event.id} className="base-card-light overflow-hidden rounded-2xl">
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