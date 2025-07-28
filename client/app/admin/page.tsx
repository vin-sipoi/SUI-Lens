"use client"

import { useState } from "react"
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

const events = [
  {
    id: 1,
    title: "Sui Developer Conference 2024",
    date: "Dec 25, 2024",
    location: "San Francisco, CA",
    totalRegistered: 500,
    actualAttendees: 450,
    poapsIssued: 445,
    bountyPool: "1000 SUI",
    bountysClaimed: "750 SUI",
    status: "completed",
    rating: 4.8,
    reviews: 127,
  },
  {
    id: 2,
    title: "DeFi on Sui Workshop",
    date: "Dec 28, 2024",
    location: "New York, NY",
    totalRegistered: 150,
    actualAttendees: 0,
    poapsIssued: 0,
    bountyPool: "500 SUI",
    bountysClaimed: "0 SUI",
    status: "upcoming",
    rating: 0,
    reviews: 0,
  },
  {
    id: 3,
    title: "NFT Marketplace Hackathon",
    date: "Jan 5, 2025",
    location: "Austin, TX",
    totalRegistered: 300,
    actualAttendees: 280,
    poapsIssued: 275,
    bountyPool: "2000 SUI",
    bountysClaimed: "1800 SUI",
    status: "completed",
    rating: 4.6,
    reviews: 89,
  },
]

const bounties = [
  {
    id: 1,
    title: "Build a Sui DApp Tutorial",
    event: "Sui Developer Conference 2024",
    reward: "200 SUI",
    status: "completed",
    claimedBy: "0x1234...5678",
    submissionDate: "Dec 26, 2024",
  },
  {
    id: 2,
    title: "Create Move Smart Contract",
    event: "DeFi on Sui Workshop",
    reward: "300 SUI",
    status: "active",
    claimedBy: null,
    submissionDate: null,
  },
  {
    id: 3,
    title: "Design NFT Collection",
    event: "NFT Marketplace Hackathon",
    reward: "500 SUI",
    status: "completed",
    claimedBy: "0x9876...4321",
    submissionDate: "Jan 6, 2025",
  },
]

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

  const generateEventReport = (eventId: number) => {
    // Generate comprehensive event report
    console.log(`Generating report for event ${eventId}`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top Navigation */}
      <header className="w-full bg-white border-b border-gray-100 flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-4">
          <img src="/placeholder-logo.svg" alt="Suilens" className="h-7 w-auto" />
        </div>
        <nav className="flex-1 flex justify-center">
          <ul className="flex gap-8 text-sm font-medium text-gray-500">
            <li><a href="/" className="text-black font-semibold">Home</a></li>
            <li><a href="/communities">Communities</a></li>
            <li><a href="/discover">Discover Events</a></li>
            <li><a href="/bounties">Bounties</a></li>
            <li><a href="/dashboard">Dashboard</a></li>
          </ul>
        </nav>
        <div className="flex items-center gap-4">
          <a href="/create" className="bg-blue-400 hover:bg-blue-500 text-white px-5 py-2 rounded-full font-medium text-sm transition">Create Event</a>
          <img src="/placeholder-user.jpg" alt="User" className="h-8 w-8 rounded-full border border-gray-200" />
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside className="w-72 bg-[#0B1620] h-full min-h-screen flex flex-col py-10 px-8">
          <div className="mb-10">
            <img src="/placeholder-logo.svg" alt="Suilens" className="h-7 w-auto mb-8" />
          </div>
          <nav className="flex-1">
            <ul className="space-y-2 text-gray-400 text-base">
              <li className="mb-4">
                <span className="flex items-center gap-3 font-semibold text-white">
                  <span className="inline-block w-5 text-center">▦</span> Overview
                </span>
              </li>
              <li>
                <span className="flex items-center gap-3">
                  <span className="inline-block w-5 text-center">👥</span> Guests
                </span>
              </li>
              <li>
                <span className="flex items-center gap-3">
                  <span className="inline-block w-5 text-center">🧾</span> Registration
                </span>
              </li>
              <li>
                <span className="flex items-center gap-3">
                  <span className="inline-block w-5 text-center">🧾</span> Blast
                </span>
              </li>
              <li className="mt-8 mb-2 text-xs text-gray-500 uppercase tracking-widest">Insight</li>
              <li>
                <span className="flex items-center gap-3">
                  <span className="inline-block w-5 text-center">🖼️</span> Statistics
                </span>
              </li>
              <li>
                <span className="flex items-center gap-3">
                  <span className="inline-block w-5 text-center">🪙</span> Bounties
                </span>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white min-h-screen">
          <div className="px-10 py-10">
            {/* Dashboard Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-xl text-gray-500">
                Monitor events, track POAPs, manage bounties, and analyze community feedback
              </p>
            </div>

            {/* Enhanced Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card className="overflow-hidden border-0 shadow-xl bg-blue-50 text-blue-900 rounded-3xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-400 text-sm font-medium">Total Events</p>
                      <p className="text-4xl font-bold">24</p>
                      <p className="text-blue-400 text-xs mt-1">+3 this month</p>
                    </div>
                    <div className="w-16 h-16 bg-blue-100 rounded-3xl flex items-center justify-center">
                      <Calendar className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="overflow-hidden border-0 shadow-xl bg-green-50 text-green-900 rounded-3xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-400 text-sm font-medium">POAPs Issued</p>
                      <p className="text-4xl font-bold">12,450</p>
                      <p className="text-green-400 text-xs mt-1">+720 this week</p>
                    </div>
                    <div className="w-16 h-16 bg-green-100 rounded-3xl flex items-center justify-center">
                      <Award className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="overflow-hidden border-0 shadow-xl bg-purple-50 text-purple-900 rounded-3xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-400 text-sm font-medium">Bounties Paid</p>
                      <p className="text-4xl font-bold">85,500 SUI</p>
                      <p className="text-purple-400 text-xs mt-1">+2,550 this week</p>
                    </div>
                    <div className="w-16 h-16 bg-purple-100 rounded-3xl flex items-center justify-center">
                      <Coins className="w-8 h-8 text-purple-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="overflow-hidden border-0 shadow-xl bg-yellow-50 text-yellow-900 rounded-3xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-400 text-sm font-medium">Avg Rating</p>
                      <p className="text-4xl font-bold">4.7</p>
                      <p className="text-yellow-400 text-xs mt-1">+0.2 vs last month</p>
                    </div>
                    <div className="w-16 h-16 bg-yellow-100 rounded-3xl flex items-center justify-center">
                      <Star className="w-8 h-8 text-yellow-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-8 bg-gray-50 rounded-2xl p-2 border border-gray-200">
                <TabsTrigger
                  value="overview"
                  className="rounded-xl data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 text-gray-500 font-semibold"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="events"
                  className="rounded-xl data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 text-gray-500 font-semibold"
                >
                  Events
                </TabsTrigger>
                <TabsTrigger
                  value="poaps"
                  className="rounded-xl data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 text-gray-500 font-semibold"
                >
                  POAPs
                </TabsTrigger>
                <TabsTrigger
                  value="bounties"
                  className="rounded-xl data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 text-gray-500 font-semibold"
                >
                  Bounties
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="rounded-xl data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 text-gray-500 font-semibold"
                >
                  Reviews
                </TabsTrigger>
                <TabsTrigger
                  value="reports"
                  className="rounded-xl data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 text-gray-500 font-semibold"
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
                    {events.slice(0, 3).map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-4 glass-dark rounded-2xl">
                        <div>
                          <h4 className="font-semibold text-sm text-white">{event.title}</h4>
                          <p className="text-xs text-white/60">{event.date}</p>
                          {event.rating > 0 && (
                            <div className="flex items-center mt-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-white/60 ml-1">
                                {event.rating} ({event.reviews} reviews)
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-white">
                            {event.actualAttendees}/{event.totalRegistered}
                          </div>
                          <div className="text-xs text-white/60">
                            {Math.round((event.actualAttendees / event.totalRegistered) * 100)}% attendance
                          </div>
                        </div>
                      </div>
                    ))}
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
              {events.map((event) => (
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
                        {event.rating > 0 && (
                          <div className="flex items-center mt-2">
                            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                            <span className="text-sm font-semibold text-white">{event.rating}</span>
                            <span className="text-xs text-white/50 ml-1">({event.reviews} reviews)</span>
                          </div>
                        )}
                      </div>

                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">{event.actualAttendees}</div>
                        <div className="text-xs text-white/60">Attended</div>
                        <div className="text-xs text-white/50">of {event.totalRegistered}</div>
                      </div>

                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">{event.poapsIssued}</div>
                        <div className="text-xs text-white/60">POAPs</div>
                        <div className="text-xs text-white/50">Issued</div>
                      </div>

                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-400">{event.bountysClaimed}</div>
                        <div className="text-xs text-white/60">Bounties</div>
                        <div className="text-xs text-white/50">of {event.bountyPool}</div>
                      </div>

                      <div className="text-center">
                        <Badge
                          variant={event.status === "completed" ? "default" : "secondary"}
                          className={`${event.status === "completed" ? "bg-green-500" : "bg-yellow-500"} text-white rounded-full`}
                        >
                          {event.status}
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
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-white">Event Reviews & Feedback</h2>
              <Button className="base-button-primary">
                <MessageSquare className="w-4 h-4 mr-2" />
                Moderate Reviews
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <Card className="base-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Star className="w-5 h-5 text-yellow-400" />
                    Average Rating
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-yellow-400 mb-2">4.7</div>
                  <p className="text-sm text-white/60">Based on 216 reviews</p>
                </CardContent>
              </Card>

              <Card className="base-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <ThumbsUp className="w-5 h-5 text-green-400" />
                    Positive Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-green-400 mb-2">89%</div>
                  <p className="text-sm text-white/60">4+ star ratings</p>
                </CardContent>
              </Card>

              <Card className="base-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                    Total Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-blue-400 mb-2">216</div>
                  <p className="text-sm text-white/60">+24 this week</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              {eventReviews.map((review) => (
                <Card key={review.id} className="base-card">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 suilens-gradient-blue rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {review.user.slice(2, 4).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-white">{review.user}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating ? "text-yellow-400 fill-current" : "text-white/30"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-white/50">{review.date}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-white/80 mb-4">{review.comment}</p>
                        <div className="flex items-center gap-4">
                          <Button className="base-button-secondary" size="sm">
                            <ThumbsUp className="w-4 h-4 mr-2" />
                            {review.upvotes}
                          </Button>
                          <Button className="base-button-secondary" size="sm">
                            <ThumbsDown className="w-4 h-4 mr-2" />
                            {review.downvotes}
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-2">
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
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-white">Event Reports & Analytics</h2>
              <Button className="base-button-primary">
                <FileText className="w-4 h-4 mr-2" />
                Generate Custom Report
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {events
                .filter((e) => e.status === "completed")
                .map((event) => (
                  <Card key={event.id} className="base-card">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-white">
                        <span>{event.title}</span>
                        <Badge className="bg-green-500 text-white rounded-full">Completed</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-white/60">Attendance Rate</p>
                          <p className="text-2xl font-bold text-blue-400">
                            {Math.round((event.actualAttendees / event.totalRegistered) * 100)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-white/60">POAP Success</p>
                          <p className="text-2xl font-bold text-green-400">
                            {Math.round((event.poapsIssued / event.actualAttendees) * 100)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-white/60">Bounty Claimed</p>
                          <p className="text-2xl font-bold text-purple-400">
                            {Math.round(
                              (Number.parseInt(event.bountysClaimed.split(" ")[0]) /
                                Number.parseInt(event.bountyPool.split(" ")[0])) *
                                100,
                            )}
                            %
                          </p>
                        </div>
                        <div>
                          <p className="text-white/60">Avg Rating</p>
                          <p className="text-2xl font-bold text-yellow-400">{event.rating}/5</p>
                        </div>
                      </div>
                      <Button className="base-button-primary w-full" onClick={() => generateEventReport(event.id)}>
                        <FileText className="w-4 h-4 mr-2" />
                        Generate Full Report
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          {/* POAPs Tab - UI update for consistency */}
          <TabsContent value="poaps" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-white">POAP Management</h2>
              <Button className="base-button-primary">
                <Award className="w-4 h-4 mr-2" />
                Bulk Issue POAPs
              </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <Card className="base-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Award className="w-5 h-5 text-green-400" />
                    Total Issued
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-green-400 mb-2">12,450</div>
                  <p className="text-sm text-white/60">Across all events</p>
                </CardContent>
              </Card>
              <Card className="base-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                    Success Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-blue-400 mb-2">94.1%</div>
                  <p className="text-sm text-white/60">Successful mints</p>
                </CardContent>
              </Card>
              <Card className="base-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Users className="w-5 h-5 text-purple-400" />
                    Unique Holders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-purple-400 mb-2">8,920</div>
                  <p className="text-sm text-white/60">Individual wallets</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bounties Tab - Tweaked to match dashboard design */}
          <TabsContent value="bounties" className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold gradient-text">Bounty Management</h2>
              <Button className="base-button-primary flex items-center gap-2">
                <Coins className="w-4 h-4" />
                <span>Create Bounty</span>
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {bounties.map((bounty) => (
                <Card key={bounty.id} className="base-card overflow-hidden shadow-lg rounded-2xl glass-dark border border-white/10">
                  <CardContent className="p-6 flex flex-col h-full justify-between">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-white mb-1">{bounty.title}</h3>
                        <p className="text-sm text-white/60">{bounty.event}</p>
                      </div>
                      <Badge
                        variant={bounty.status === "completed" ? "default" : "secondary"}
                        className={`${bounty.status === "completed" ? "bg-green-500" : "bg-blue-500"} text-white rounded-full px-3 py-1 text-xs font-semibold`}
                      >
                        {bounty.status.charAt(0).toUpperCase() + bounty.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex flex-col items-start">
                        <span className="text-xs text-white/50 mb-1">Reward</span>
                        <span className="text-2xl font-bold text-purple-400">{bounty.reward}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-white/50 mb-1">Claimed By</span>
                        {bounty.claimedBy ? (
                          <span className="text-sm font-mono text-white">{bounty.claimedBy}</span>
                        ) : (
                          <span className="text-sm text-white/50">Not claimed</span>
                        )}
                        {bounty.submissionDate && (
                          <span className="text-xs text-white/60">{bounty.submissionDate}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button className="base-button-secondary" size="sm">
                        <Eye className="w-4 h-4" />
                        <span className="ml-1">View</span>
                      </Button>
                      <Button className="base-button-secondary" size="sm">
                        <Settings className="w-4 h-4" />
                        <span className="ml-1">Edit</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
