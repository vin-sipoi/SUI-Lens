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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
                <Link href="/" className="text-black font-semibold">
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
                <Link href="/dashboard">Dashboard</Link>
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
                  <img
                    src={user.avatarUrl || '/placeholder-user.jpg'}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border border-gray-200"
                  />
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
                        <img
                          src={user.avatarUrl || '/placeholder-user.jpg'}
                          alt="Profile"
                          className="w-6 h-6 rounded-full border border-gray-200"
                        />
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
            sidebarOpen ? 'translate-x-0 w-24' : '-translate-x-full lg:translate-x-0'
          } fixed lg:static top-0 left-0 z-20 w-72 min-h-screen bg-[#0B1620] py-6 px-4 flex flex-col gap-6 transition-transform duration-300 ease-in-out`}
        >
          <nav className="flex-1 flex flex-col p-6 gap-4">
            <button 
              onClick={() => {
                setSidebarSection("overview");
                if (isMobile) setSidebarOpen(false);
              }}
              className={`flex m-2 items-center gap-4 font-medium text-xl hover:text-gray-300 ${sidebarSection === "overview" ? "text-white" : "text-gray-400 font-normal text-xl"}`}
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
              className={`flex items-center gap-4 m-2 font-medium text-lg hover:text-white ${sidebarSection === "guests" ? "text-white" : "text-gray-400"}`}
            >
              <Image src="/mdi_people.png" alt = "guesticon" width={20} height={20}/>
              Guests
            </button>
            <button
              onClick={() => {
                setSidebarSection("registration");
                if (isMobile) setSidebarOpen(false);
              }}
              className="flex items-center font-medium text-lg gap-4 m-2 text-gray-400 hover:text-white"
            >
             <Image src="/Vector (1).png" alt ="reg" width={20} height={20}/>
              Registration
            </button>
            <button
              onClick={() => {
                setSidebarSection("blast");
                if (isMobile) setSidebarOpen(false);
              }}
              className="flex items-center gap-4 m-3 font-medium text-lg text-gray-400 hover:text-white"
            >
              <Image src="/Vector (1).png" alt ="reg" width={20} height={20}/>
              Blast
            </button>
            <div className="p-6 m-3">
              <span className="text-gray-500 font-normal text-xl mb-2 block">Insight</span>
              <button 
                onClick={() => {
                  if (isMobile) setSidebarOpen(false);
                }}
                className="flex items-center font-medium text-lg gap-4 m-2 p-2 text-gray-400 hover:text-white mb-2"
              >
                <Image src="/bxs_chart.png" alt="" width={20} height={20}/>
                Statistics
              </button>
              <Link 
                href="/bounties" 
                className="flex items-center font-medium text-lg m-2 p-2 gap-2 text-gray-400 hover:text-white"
                onClick={() => {
                  if (isMobile) setSidebarOpen(false);
                }}
              >
                <Image src="/Vector (2).png" alt="" width={20} height={20}/>
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
        <div className="flex-1 w-full min-w-0">
          {/* Main Dashboard Content */}
          <main className="w-full p-4 sm:p-6 lg:p-8">
            {sidebarSection === "guests" ? (
              <div className="pt-4 sm:pt-8 w-full">
                <GuestList />
              </div>
            ) : (
              <div className="w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <Card className="overflow-hidden border-0 shadow-xl bg-[#4DA2FF] text-white rounded-2xl">
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
                  <Card className="overflow-hidden border-0 shadow-xl bg-[#4DA2FF] text-white rounded-2xl">
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
                  <Card className="overflow-hidden border-0 shadow-xl bg-[#4DA2FF] text-white rounded-2xl">
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
                  <Card className="overflow-hidden border-0 shadow-xl bg-[#4DA2FF] text-white rounded-2xl">
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
              </div>
            )}
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsContent value="my-events" className="space-y-6 w-full">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">My Events</h2>
                </div>
                {myEvents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full">
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
                  <div className="p-4 w-full">
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
              <TabsContent value="registered" className="space-y-6 w-full">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Registered Events</h2>
                {registeredEvents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full">
                    {registeredEvents.map((event) => (
                      <Card key={event.id} className="base-card-light overflow-hidden rounded-2xl">
                        {/* ...registered event card rendering... */}
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 w-full">
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
    </div>
  )
}