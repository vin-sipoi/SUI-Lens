"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Calendar, MapPin, Users, Plus, BarChart3 } from "lucide-react"
import Link from "next/link"
import { EmptyStateIllustration } from "@/components/empty-state-illustration"
import { ConnectButton } from "@mysten/dapp-kit"
import { useEventStore } from "@/store/EventStore"

export default function DashboardPage() {
  // Define an Event type

  type Event = {
    id: string
    attendees?: number
    // Add other properties as needed
  }
  const myEvents = useEventStore((state) => state.myEvents)
  // State for events (initially empty)
 
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([])
  const [activeTab, setActiveTab] = useState("my-events")

  return (
    <div className="min-h-screen" style={{ background: "#201a28" }}>
            <header className="border-b border-white/10 glass-dark sticky top-0 z-50">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-3">
                  <div className="w-10 h-10 suilens-gradient-blue rounded-2xl flex items-center justify-center shadow-lg animate-glow-pulse">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                  <span className="text-3xl font-bold gradient-text">Suilens</span>
                </Link>
      
                <nav className="hidden lg:flex items-center space-x-8">
                  <Link href="/dashboard" className="text-blue-400 font-semibold relative">
                    Dashboard
                    <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-400 rounded-full"></div>
                  </Link>
                  {["Bounties", "Discover"].map((item) => (
                    <Link
                      key={item}
                      href={`/${item.toLowerCase().replace(" ", "")}`}
                      className="text-white/70 hover:text-white font-medium transition-colors"
                    >
                      {item}
                    </Link>
                  ))}
                </nav>
      
                <div className="flex items-center space-x-3">
          
                </div>
              </div>
            </header>
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Enhanced Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="overflow-hidden border-0 shadow-xl suilens-gradient-blue text-white rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Events</p>
                  <p className="text-3xl font-bold">{myEvents.length}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden border-0 shadow-xl suilens-gradient-emerald text-white rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Attendees</p>
                  <p className="text-3xl font-bold">
                    {myEvents.reduce((sum, e) => sum + Number(e.attendees || 0), 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden border-0 shadow-xl suilens-gradient-purple text-white rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Registered For</p>
                  <p className="text-3xl font-bold">{registeredEvents.length}</p>
                  <p className="text-purple-100 text-xs mt-1">Upcoming events</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <MapPin className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden border-0 shadow-xl suilens-gradient-amber text-white rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">This Month</p>
                  <p className="text-3xl font-bold">0</p>
                  <p className="text-orange-100 text-xs mt-1">Events attended</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="my-events" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">My Events</h2>
              
            </div>
            {myEvents.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myEvents.map((event) => (
                  <Card
                    key={event.id}
                    className="base-card-light group overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 rounded-3xl"
                  >
                    {/* ...event card rendering... */}
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyStateIllustration
                type="no-created-events"
                title="No events created yet"
                description="Start creating amazing events and connect with your audience. Your first event is just a click away!"
                actionText="Create Your First Event"
                onAction={() => (window.location.href = "/create")}
              />
            )}
          </TabsContent>
          <TabsContent value="registered" className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Registered Events</h2>
            {registeredEvents.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {registeredEvents.map((event) => (
                  <Card key={event.id} className="base-card-light overflow-hidden rounded-3xl">
                    {/* ...registered event card rendering... */}
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyStateIllustration
                type="no-registered-events"
                title="No registered events"
                description="Discover exciting events happening around you and register to join the fun!"
                actionText="Explore Events"
                onAction={() => (window.location.href = "/discover")}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}