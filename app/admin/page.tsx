"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Users,
  Award,
  Coins,
  TrendingUp,
  Calendar,
  MapPin,
  Search,
  Filter,
  Download,
  Eye,
  Settings,
  BarChart3,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Star,
  FileText,
} from "lucide-react"
import Link from "next/link"
import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"

const eventReviews = [
  {
    id: 1,
    eventId: 1,
    user: "0x1234...5678",
    rating: 5,
    comment: "Amazing event! Great speakers and networking opportunities.",
    upvotes: 24,
    downvotes: 2,
    date: "Dec 26, 2024",
  },
  {
    id: 2,
    eventId: 1,
    user: "0x9876...4321",
    rating: 4,
    comment: "Well organized but could use better venue logistics.",
    upvotes: 18,
    downvotes: 5,
    date: "Dec 26, 2024",
  },
  {
    id: 3,
    eventId: 3,
    user: "0x5555...7777",
    rating: 5,
    comment: "Incredible hackathon with great bounty rewards!",
    upvotes: 31,
    downvotes: 1,
    date: "Jan 6, 2025",
  },
]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const generateEventReport = (eventId: string) => {
    // Generate comprehensive event report
    console.log(`Generating report for event ${eventId}`)
  }

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true)
      const eventsSnapshot = await getDocs(collection(db, "events"))
      const eventsData = await Promise.all(
        eventsSnapshot.docs.map(async (doc) => {
          const eventId = doc.id
          const eventData = doc.data()

          // Fetch registrations
          const registrationsSnapshot = await getDocs(collection(db, "events", eventId, "registrations"))
          const registrations = registrationsSnapshot.docs.map((d) => d.data())

          // Fetch check-ins
          const checkinsSnapshot = await getDocs(collection(db, "events", eventId, "attendees"))
          const checkins = checkinsSnapshot.docs.map((d) => d.data())

          return {
            id: eventId,
            ...eventData,
            totalRegistered: registrations.length,
            actualAttendees: checkins.length,
            registrations,
            checkins,
          }
        })
      )
      setEvents(eventsData)
      setLoading(false)
    }

    fetchEvents()
  }, [])

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
          <Link href="/landing" className="flex items-center space-x-3">
            <div className="w-10 h-10 suilens-gradient-blue rounded-2xl flex items-center justify-center shadow-lg animate-glow-pulse">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-3xl font-bold gradient-text">Suilens Admin</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Badge className="bg-green-500/20 text-green-300 border border-green-400/30 rounded-full">
              🟢 Connected to Sui Mainnet
            </Badge>
            <Button className="base-button-secondary">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Admin Dashboard</h1>
          <p className="text-xl text-white/70">
            Monitor events, track POAPs, manage bounties, and analyze community feedback
          </p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="overflow-hidden border-0 shadow-xl suilens-gradient-blue text-white rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Events</p>
                  <p className="text-4xl font-bold">{loading ? "--" : events.length}</p>
                  <p className="text-blue-100 text-xs mt-1">+3 this month</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center">
                  <Calendar className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-0 shadow-xl suilens-gradient-emerald text-white rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">POAPs Issued</p>
                  <p className="text-4xl font-bold">--</p>
                  <p className="text-green-100 text-xs mt-1">+720 this week</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center">
                  <Award className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-0 shadow-xl suilens-gradient-purple text-white rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Bounties Paid</p>
                  <p className="text-4xl font-bold">--</p>
                  <p className="text-purple-100 text-xs mt-1">+2,550 this week</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center">
                  <Coins className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-0 shadow-xl suilens-gradient-amber text-white rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Avg Rating</p>
                  <p className="text-4xl font-bold">--</p>
                  <p className="text-orange-100 text-xs mt-1">+0.2 vs last month</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center">
                  <Star className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8 glass-dark rounded-2xl p-2 border border-white/10">
            <TabsTrigger
              value="overview"
              className="rounded-xl data-[state=active]:bg-white/15 data-[state=active]:text-white text-white/70 font-semibold"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="events"
              className="rounded-xl data-[state=active]:bg-white/15 data-[state=active]:text-white text-white/70 font-semibold"
            >
              Events
            </TabsTrigger>
            <TabsTrigger
              value="poaps"
              className="rounded-xl data-[state=active]:bg-white/15 data-[state=active]:text-white text-white/70 font-semibold"
            >
              POAPs
            </TabsTrigger>
            <TabsTrigger
              value="bounties"
              className="rounded-xl data-[state=active]:bg-white/15 data-[state=active]:text-white text-white/70 font-semibold"
            >
              Bounties
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-xl data-[state=active]:bg-white/15 data-[state=active]:text-white text-white/70 font-semibold"
            >
              Reviews
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="rounded-xl data-[state=active]:bg-white/15 data-[state=active]:text-white text-white/70 font-semibold"
            >
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="base-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    Recent Event Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loading ? (
                      <div className="text-white/60">Loading...</div>
                    ) : (
                      events.slice(0, 3).map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-4 glass-dark rounded-2xl">
                          <div>
                            <h4 className="font-semibold text-sm text-white">{event.title}</h4>
                            <p className="text-xs text-white/60">{event.date}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-white">
                              {event.actualAttendees}/{event.totalRegistered}
                            </div>
                            <div className="text-xs text-white/60">
                              {event.totalRegistered > 0
                                ? Math.round((event.actualAttendees / event.totalRegistered) * 100)
                                : 0}
                              % attendance
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="base-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <MessageSquare className="w-5 h-5 text-green-400" />
                    Recent Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {eventReviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="p-4 glass-dark rounded-2xl">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < review.rating ? "text-yellow-400 fill-current" : "text-white/30"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-white/60">{review.user}</span>
                          </div>
                          <span className="text-xs text-white/50">{review.date}</span>
                        </div>
                        <p className="text-sm text-white/80 mb-2">{review.comment}</p>
                        <div className="flex items-center gap-3 text-xs text-white/50">
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" />
                            {review.upvotes}
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsDown className="w-3 h-3" />
                            {review.downvotes}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-white">Event Management</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                  <Input placeholder="Search events..." className="base-input pl-9 w-64" />
                </div>
                <Button className="base-button-secondary">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="text-white/60">Loading events...</div>
              ) : (
                events.map((event) => (
                  <Card key={event.id} className="base-card overflow-hidden">
                    <CardContent className="p-6">
                      <div className="grid lg:grid-cols-7 gap-4 items-center">
                        <div className="lg:col-span-2">
                          <h3 className="font-bold text-lg mb-1 text-white">{event.title}</h3>
                          <div className="flex items-center text-sm text-white/60 mb-2">
                            <Calendar className="w-4 h-4 mr-1" />
                            {event.date}
                          </div>
                          <div className="flex items-center text-sm text-white/60">
                            <MapPin className="w-4 h-4 mr-1" />
                            {event.location}
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">{event.actualAttendees}</div>
                          <div className="text-xs text-white/60">Attended</div>
                          <div className="text-xs text-white/50">of {event.totalRegistered}</div>
                        </div>

                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">--</div>
                          <div className="text-xs text-white/60">POAPs</div>
                          <div className="text-xs text-white/50">Issued</div>
                        </div>

                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-400">--</div>
                          <div className="text-xs text-white/60">Bounties</div>
                          <div className="text-xs text-white/50">of --</div>
                        </div>

                        <div className="text-center">
                          <Badge
                            variant={event.status === "completed" ? "default" : "secondary"}
                            className={`${event.status === "completed" ? "bg-green-500" : "bg-yellow-500"} text-white rounded-full`}
                          >
                            {event.status || "unknown"}
                          </Badge>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            className="base-button-secondary"
                            size="sm"
                            onClick={() => generateEventReport(event.id)}
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                          <Button className="base-button-secondary" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button className="base-button-secondary" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* ...other tabs remain unchanged... */}
        </Tabs>
      </div>
    </div>
  )
}