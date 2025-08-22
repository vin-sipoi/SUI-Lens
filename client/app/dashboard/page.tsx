"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Calendar, MapPin, Users, Plus, BarChart3 } from "lucide-react"
import Link from "next/link"
import { EmptyStateIllustration } from "@/components/empty-state-illustration"
import { ConnectButton } from "@mysten/dapp-kit"
import Image from "next/image"
import GuestList from "@/components/GuestList"
import Sidebar from "@/components/Sidebar"
import { useUser } from "../../context/UserContext"
import { useEventContext } from "@/context/EventContext"
import Header from "../components/Header"

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

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

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
      <Header />

      {/* Main Layout Container */}
      <div className="flex flex-1 w-full">
        {/* Sidebar */}
        <Sidebar 
          activeSection={sidebarSection} 
          onSectionChange={setSidebarSection}
        />
        
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="overflow-hidden border-2 border-[#667185] bg-white text-[#667185] rounded-2xl">
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
                  <Card className="overflow-hidden border-2 border-[#667185] bg-white text-[#667185] rounded-2xl">
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
                  <Card className="overflow-hidden border-2 border-[#667185] bg-white text-[#667185] rounded-2xl">
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
                  <Card className="overflow-hidden border-2 border-[#667185] bg-white text-[#667185] rounded-2xl">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="bg-gray-100 h-40 rounded-xl animate-pulse" />
                    ))}
                  </div>
                )}
                {!loading && filteredEventsForDisplay.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
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
                          className="base-card-light group overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 rounded-2xl"
                        >
                          <Link href={`/event/${event.id}/admin`}>
                            <div className="h-32 bg-gray-100 relative overflow-hidden">
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
                            <CardContent className="p-3">
                              <h3 className="font-semibold text-sm mb-2 line-clamp-1">{event.title}</h3>
                              <div className="space-y-1 text-xs text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{event.date}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span className="line-clamp-1">{event.location}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  <span>{event.rsvps?.length || 0} registered</span>
                                </div>
                              </div>
                              <div className="mt-2 pt-2 border-t">
                                <Button variant="outline" size="sm" className="w-full text-blue-600 hover:bg-blue-50 text-xs h-7">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
                    {registeredEvents.map((event) => (
                      <Card key={event.id} className="base-card-light overflow-hidden rounded-2xl">
                        <Link href={`/event/${event.id}`}>
                          <div className="h-32 bg-gray-100 relative overflow-hidden">
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
                          <CardContent className="p-3">
                            <h3 className="font-semibold text-sm mb-2 line-clamp-1">{event.title}</h3>
                            <div className="space-y-1 text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{event.date}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
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