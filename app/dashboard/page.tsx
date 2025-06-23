"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, MapPin, Users, Plus, Settings, BarChart3 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { EmptyStateIllustration } from "@/components/empty-state-illustration"

const myEvents = [
  {
    id: 1,
    title: "Tech Startup Networking Night",
    date: "Dec 20, 2024",
    location: "San Francisco, CA",
    attendees: 45,
    capacity: 100,
    status: "published",
    image: "/placeholder.svg?height=150&width=200",
  },
  {
    id: 2,
    title: "Digital Marketing Workshop",
    date: "Dec 22, 2024",
    location: "New York, NY",
    attendees: 32,
    capacity: 50,
    status: "published",
    image: "/placeholder.svg?height=150&width=200",
  },
  {
    id: 3,
    title: "Holiday Art Exhibition",
    date: "Dec 24, 2024",
    location: "Los Angeles, CA",
    attendees: 0,
    capacity: 80,
    status: "draft",
    image: "/placeholder.svg?height=150&width=200",
  },
]

const registeredEvents = [
  {
    id: 4,
    title: "New Year Coding Bootcamp",
    date: "Jan 2, 2025",
    location: "Austin, TX",
    organizer: "CodeAcademy",
    image: "/placeholder.svg?height=150&width=200",
  },
  {
    id: 5,
    title: "Food & Wine Tasting",
    date: "Jan 5, 2025",
    location: "Portland, OR",
    organizer: "Wine Society",
    image: "/placeholder.svg?height=150&width=200",
  },
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("my-events")

  return (
    <div className="min-h-screen" style={{ background: "#201a28" }}>
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-orb floating-orb-1 w-32 h-32 top-20 left-10 animate-float-elegant"></div>
        <div
          className="floating-orb floating-orb-2 w-24 h-24 top-40 right-20 animate-float-elegant"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="floating-orb floating-orb-3 w-40 h-40 bottom-40 left-20 animate-float-elegant"
          style={{ animationDelay: "4s" }}
        ></div>
        <div
          className="floating-orb floating-orb-4 w-28 h-28 bottom-20 right-10 animate-float-elegant"
          style={{ animationDelay: "6s" }}
        ></div>
      </div>

      {/* Header */}
      <header className="border-b border-white/10 glass-dark">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 suilens-gradient-blue rounded-2xl flex items-center justify-center shadow-lg animate-glow-pulse">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-3xl font-bold gradient-text">Suilens</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/discover" className="text-white/70 hover:text-white transition-colors">
              Discover
            </Link>
            <Link href="/dashboard" className="text-blue-400 font-semibold relative">
              Dashboard
              <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-400 rounded-full"></div>
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/create">
              <Button className="base-button-primary">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-white/70">Manage your events and registrations</p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="overflow-hidden border-0 shadow-xl suilens-gradient-blue text-white rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Events</p>
                  <p className="text-3xl font-bold">3</p>
                  <p className="text-blue-100 text-xs mt-1">+2 this month</p>
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
                  <p className="text-3xl font-bold">77</p>
                  <p className="text-green-100 text-xs mt-1">+12 this week</p>
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
                  <p className="text-3xl font-bold">2</p>
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
                  <p className="text-3xl font-bold">5</p>
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
          <TabsList className="mb-6 glass-dark rounded-2xl p-2 border border-white/10">
            <TabsTrigger
              value="my-events"
              className="rounded-xl data-[state=active]:bg-white/15 data-[state=active]:text-white text-white/70 font-semibold"
            >
              My Events
            </TabsTrigger>
            <TabsTrigger
              value="registered"
              className="rounded-xl data-[state=active]:bg-white/15 data-[state=active]:text-white text-white/70 font-semibold"
            >
              Registered Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-events" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">My Events</h2>
              <Link href="/create">
                <Button className="base-button-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Event
                </Button>
              </Link>
            </div>

            {myEvents.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myEvents.map((event) => (
                  <Card
                    key={event.id}
                    className="base-card-light group overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 rounded-3xl"
                  >
                    <div className="relative overflow-hidden">
                      <Image
                        src={event.image || "/placeholder.svg"}
                        alt={event.title}
                        width={200}
                        height={150}
                        className="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <Badge
                        className={`absolute top-3 right-3 font-semibold px-3 py-1 rounded-full shadow-lg ${
                          event.status === "published" ? "bg-green-500 text-white" : "bg-yellow-500 text-white"
                        }`}
                      >
                        {event.status === "published" ? "🟢 Live" : "🟡 Draft"}
                      </Badge>
                    </div>

                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {event.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          <Calendar className="w-4 h-4 mr-2" />
                          {event.date}
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          <MapPin className="w-4 h-4 mr-2" />
                          {event.location}
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                          <Users className="w-4 h-4 mr-2" />
                          {event.attendees} / {event.capacity} registered
                        </div>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="suilens-gradient-blue h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(event.attendees / event.capacity) * 100}%` }}
                        ></div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Link href={`/events/${event.id}`} className="flex-1">
                          <Button className="base-button-primary w-full">View Event</Button>
                        </Link>
                        <Button className="base-button-secondary">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
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
                    <Image
                      src={event.image || "/placeholder.svg"}
                      alt={event.title}
                      width={200}
                      height={150}
                      className="w-full h-40 object-cover"
                    />

                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {event.date}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          {event.location}
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          Organized by {event.organizer}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Link href={`/events/${event.id}`} className="flex-1">
                          <Button className="base-button-primary w-full">View Event</Button>
                        </Link>
                        <Button className="base-button-secondary">Cancel</Button>
                      </div>
                    </CardContent>
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
