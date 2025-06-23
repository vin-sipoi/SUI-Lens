"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Wallet, Award, Coins, ArrowRight, Play, Calendar, MapPin, Users, Clock } from "lucide-react"
import Link from "next/link"

type Event = {
  id: number
  title: string
  description: string
  date: string
  location: string
  attendees: number
  category: string
}

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([])

  // Function to add a new event (you can call this from elsewhere in your app)
  const addEvent = (newEvent: Omit<Event, "id">) => {
    setEvents(prevEvents => [...prevEvents, { ...newEvent, id: Date.now() }])
  }

  // Function to remove an event
  const removeEvent = (eventId: number): void => {
    setEvents((prevEvents: Event[]) => prevEvents.filter((event: Event) => event.id !== eventId))
  }

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
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 suilens-gradient-blue rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform animate-glow-pulse">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-3xl font-bold gradient-text">Suilens</span>
          </Link>

          <nav className="hidden lg:flex items-center space-x-8">
            {["Discover", "Bounties", "POAPs", "Help"].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                className="text-white/70 hover:text-white font-medium transition-colors"
              >
                {item}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-10">
            <Link
              href="/discover"
              className="hidden sm:block text-white/70 hover:text-white font-medium transition-colors"
            >
              Explore Events
            </Link>
            
            <Link href="/auth/signup" className="hidden sm:block text-white/70 hover:text-white font-medium transition-colors">Sign Up</Link>
           
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="py-16 sm:py-20 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-10">
            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                <Input
                  placeholder="Search Web3 events, bounties, or locations..."
                  className="base-input pl-12 py-4 text-lg"
                />
              </div>
              <Link href="/discover">
                <Button className="base-button-primary px-8 py-4 text-lg font-semibold">Search Events</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Latest Events</h2>
                <p className="text-white/60">Discover and join amazing Web3 events happening around you</p>
              </div>
              
            </div>

            {events.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 mx-auto mb-6 glass-dark rounded-2xl flex items-center justify-center">
                  <Calendar className="w-12 h-12 text-white/40" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">No Events Yet</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="glass-dark border border-white/10 rounded-2xl p-6 hover:border-blue-300/30 transition-all duration-300 group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-white/60 text-sm mb-4 line-clamp-2">
                          {event.description}
                        </p>
                      </div>
                      <Button
                        onClick={() => removeEvent(event.id)}
                        className="text-white/40 hover:text-red-400 p-1"
                        variant="ghost"
                        size="sm"
                      >
                        ×
                      </Button>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-white/60 text-sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-white/60 text-sm">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center text-white/60 text-sm">
                        <Users className="w-4 h-4 mr-2" />
                        <span>{event.attendees} attendees</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-medium rounded-full">
                        {event.category}
                      </span>
                      <Button className="base-button-primary text-sm px-4 py-2">
                        View Event
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      
    </div>
  )
}