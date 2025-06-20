"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  Users,
  Award,
  Coins,
  Wallet,
  TrendingUp,
  Globe,
  Star,
  ArrowRight,
  Heart,
} from "lucide-react"
import Link from "next/link"

const popularEvents = [
  {
    id: 1,
    title: "Sui Developer Conference 2024",
    date: "Dec 25, 2024",
    time: "2:00 PM PST",
    location: "San Francisco, CA",
    attendees: 2450,
    price: "Free",
    category: "Development",
    bountyPool: "5000 SUI",
    poapAvailable: true,
    trending: true,
    image: "bg-gradient-to-br from-blue-500 to-purple-600",
  },
  {
    id: 2,
    title: "DeFi Summit: Future of Finance",
    date: "Dec 28, 2024",
    time: "10:00 AM PST",
    location: "New York, NY",
    attendees: 1820,
    price: "150 SUI",
    category: "DeFi",
    bountyPool: "3000 SUI",
    poapAvailable: true,
    trending: true,
    image: "bg-gradient-to-br from-green-500 to-emerald-600",
  },
  {
    id: 3,
    title: "NFT Art & Culture Festival",
    date: "Jan 5, 2025",
    time: "9:00 AM PST",
    location: "Los Angeles, CA",
    attendees: 980,
    price: "Free",
    category: "NFTs",
    bountyPool: "2000 SUI",
    poapAvailable: true,
    trending: false,
    image: "bg-gradient-to-br from-pink-500 to-purple-600",
  },
]

const categories = [
  { id: "defi", name: "DeFi", icon: "🏗️", count: 45, color: "green" },
  { id: "nft", name: "NFTs", icon: "🎨", count: 32, color: "pink" },
  { id: "gaming", name: "Gaming", icon: "🎮", count: 28, color: "blue" },
  { id: "development", name: "Development", icon: "💻", count: 67, color: "indigo" },
  { id: "dao", name: "DAO", icon: "🏛️", count: 19, color: "orange" },
  { id: "education", name: "Education", icon: "📚", count: 41, color: "yellow" },
]

const featuredCalendars = [
  {
    id: 1,
    name: "Sui Foundation",
    description: "Official events from Sui Foundation",
    followers: "12.5K",
    events: 24,
    verified: true,
    color: "blue",
  },
  {
    id: 2,
    name: "DeFi Builders",
    description: "Leading DeFi events and workshops",
    followers: "8.2K",
    events: 18,
    verified: true,
    color: "green",
  },
  {
    id: 3,
    name: "Web3 Creators",
    description: "NFT and creator economy events",
    followers: "6.8K",
    events: 15,
    verified: false,
    color: "purple",
  },
]

const continents = [
  { name: "North America", count: 156, flag: "🇺🇸" },
  { name: "Europe", count: 89, flag: "🇪🇺" },
  { name: "Asia", count: 134, flag: "🌏" },
  { name: "South America", count: 23, flag: "🌎" },
  { name: "Africa", count: 12, flag: "🌍" },
  { name: "Oceania", count: 8, flag: "🇦🇺" },
]

export default function DiscoverPage() {
  const [activeTab, setActiveTab] = useState("popular")

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
      <header className="border-b border-white/10 glass-dark sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 suilens-gradient-blue rounded-2xl flex items-center justify-center shadow-lg animate-glow-pulse">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-3xl font-bold gradient-text">Suilens</span>
          </Link>

          <nav className="hidden lg:flex items-center space-x-8">
            <Link href="/discover" className="text-blue-400 font-semibold relative">
              Discover
              <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-400 rounded-full"></div>
            </Link>
            {["Create Event", "Bounties", "Dashboard"].map((item) => (
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
            <Button className="base-button-secondary">
              <Wallet className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Connect Wallet</span>
              <span className="sm:hidden">Connect</span>
            </Button>
            <Link href="/create">
              <Button className="base-button-primary">
                <span className="hidden sm:inline">Create Event</span>
                <span className="sm:hidden">Create</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-display gradient-text mb-4 text-glow-white">Discover Web3 Events</h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
            Join the most exciting blockchain events, earn POAPs, claim bounties, and connect with the Web3 community
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
              <Input placeholder="Search events, locations, or topics..." className="base-input pl-12 py-4 text-lg" />
            </div>
            <Button className="base-button-secondary px-6 py-4">
              <Filter className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 max-w-2xl mx-auto glass-dark rounded-2xl p-2 border border-white/10">
            <TabsTrigger
              value="popular"
              className="flex items-center gap-2 rounded-xl data-[state=active]:bg-white/15 data-[state=active]:text-white data-[state=active]:shadow-sm text-white/70 font-semibold"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Popular</span>
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="flex items-center gap-2 rounded-xl data-[state=active]:bg-white/15 data-[state=active]:text-white data-[state=active]:shadow-sm text-white/70 font-semibold"
            >
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">Categories</span>
            </TabsTrigger>
            <TabsTrigger
              value="calendars"
              className="flex items-center gap-2 rounded-xl data-[state=active]:bg-white/15 data-[state=active]:text-white data-[state=active]:shadow-sm text-white/70 font-semibold"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Calendars</span>
            </TabsTrigger>
            <TabsTrigger
              value="locations"
              className="flex items-center gap-2 rounded-xl data-[state=active]:bg-white/15 data-[state=active]:text-white data-[state=active]:shadow-sm text-white/70 font-semibold"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Locations</span>
            </TabsTrigger>
          </TabsList>

          {/* Popular Events */}
          <TabsContent value="popular" className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <TrendingUp className="w-6 h-6 mr-2 text-orange-400" />
                Trending Events
              </h2>
              <Button className="base-button-secondary">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="grid-responsive">
              {popularEvents.map((event, index) => (
                <Card
                  key={event.id}
                  className={`base-card-light overflow-hidden interactive ${
                    index === 0 ? "lg:col-span-2 lg:row-span-2" : ""
                  }`}
                >
                  <div className="relative overflow-hidden">
                    <div className={`${event.image} ${index === 0 ? "h-80" : "h-48"} relative`}>
                      {event.trending && (
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-red-500 text-white font-semibold px-3 py-1 rounded-full">
                            🔥 Trending
                          </Badge>
                        </div>
                      )}

                      <div className="absolute top-4 right-4 flex gap-2">
                        {event.poapAvailable && (
                          <Badge className="bg-green-500 text-white font-semibold px-2 py-1 rounded-full">
                            <Award className="w-3 h-3 mr-1" />
                            POAP
                          </Badge>
                        )}
                        {event.bountyPool && (
                          <Badge className="bg-purple-500 text-white font-semibold px-2 py-1 rounded-full">
                            <Coins className="w-3 h-3 mr-1" />
                            Bounty
                          </Badge>
                        )}
                      </div>

                      <div className="absolute bottom-4 left-4 right-4">
                        <Badge className="bg-white/90 text-gray-900 font-semibold px-3 py-1 rounded-full mb-3">
                          {event.category}
                        </Badge>
                        <h3 className={`font-bold text-white mb-2 ${index === 0 ? "text-3xl" : "text-xl"}`}>
                          {event.title}
                        </h3>
                        <div className="flex items-center text-white/90 text-sm">
                          <Calendar className="w-4 h-4 mr-2" />
                          {event.date} • {event.time}
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-green-500" />
                        <span>{event.attendees.toLocaleString()} attending</span>
                      </div>
                      {event.bountyPool && (
                        <div className="flex items-center">
                          <Coins className="w-4 h-4 mr-2 text-purple-500" />
                          <span>{event.bountyPool} bounty pool</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex flex-col">
                        <span className="font-bold text-xl gradient-text">{event.price}</span>
                        {event.poapAvailable && <span className="text-xs text-green-600 font-medium">+ Free POAP</span>}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="rounded-lg">
                          <Heart className="w-4 h-4" />
                        </Button>
                        <Link href={`/events/${event.id}`}>
                          <Button className="base-button-primary">View Event</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Categories */}
          <TabsContent value="categories" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Browse by Category</h2>
              <p className="text-white/70">Explore events in your favorite Web3 domains</p>
            </div>

            <div className="grid-responsive">
              {categories.map((category, index) => (
                <Card
                  key={category.id}
                  className="base-card-light cursor-pointer interactive overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`h-32 bg-${category.color}-500 relative`}>
                    <div className="absolute bottom-4 left-6">
                      <div className="text-4xl mb-2">{category.icon}</div>
                      <h3 className="text-xl font-bold text-white">{category.name}</h3>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-white/90 text-gray-900 font-semibold">{category.count} events</Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Featured Calendars */}
          <TabsContent value="calendars" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Featured Event Calendars</h2>
              <p className="text-white/70">Follow your favorite organizers and communities</p>
            </div>

            <div className="grid-responsive">
              {featuredCalendars.map((calendar, index) => (
                <Card
                  key={calendar.id}
                  className="base-card-light cursor-pointer interactive animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6 text-center">
                    <div
                      className={`w-20 h-20 bg-${calendar.color}-500 rounded-full mx-auto mb-4 flex items-center justify-center`}
                    >
                      <span className="text-2xl font-bold text-white">{calendar.name.charAt(0)}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <h3 className="font-bold text-lg text-gray-900">{calendar.name}</h3>
                      {calendar.verified && (
                        <Badge className="bg-blue-500 text-white rounded-full px-2 py-1 text-xs">✓</Badge>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{calendar.description}</p>
                    <div className="flex justify-center gap-4 text-sm text-gray-500 mb-4">
                      <span>{calendar.followers} followers</span>
                      <span>{calendar.events} events</span>
                    </div>
                    <Button className="base-button-primary w-full">Follow</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Locations */}
          <TabsContent value="locations" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Explore by Location</h2>
              <p className="text-white/70">Discover Web3 events happening around the world</p>
            </div>

            <div className="grid-responsive">
              {continents.map((continent, index) => (
                <Card
                  key={continent.name}
                  className="base-card-light cursor-pointer interactive animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-6xl mb-4">{continent.flag}</div>
                    <h3 className="font-bold text-xl mb-2 text-gray-900">{continent.name}</h3>
                    <p className="text-gray-600 mb-4">{continent.count} upcoming events</p>
                    <Button className="base-button-secondary w-full">Explore Events</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
