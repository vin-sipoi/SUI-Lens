"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Filter,
  Calendar,
  Heart,
  Menu,
  X,
  RefreshCw,
  MapPin
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import EventDetails from '@/components/EventDetails';
import { useEventContext } from '@/context/EventContext'
import { useUser } from '@/context/UserContext'
import Header from "../components/Header"

const EventDashboard: React.FC = () => {
  const { events, updateEvent, isLoading, fetchEvents } = useEventContext()
  const { user } = useUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null)

  const categories = [
    { id: "all", label: "All Events" },
    { id: "community", label: "Community" },
    { id: "developers", label: "Developers" },
    { id: "creators", label: "Content Creators" },
  ]

  const filteredEvents = events
    .filter(event =>
      (event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       event.type.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedCategory === "all" || event.category === selectedCategory)
    )

  const handleRegister = (eventId: string) => {
    if (!user) {
      alert('Please login to register for events.')
      return
    }
    try {
      const event = events.find(e => e.id === eventId)
      if (event && user.walletAddress) {
        const rsvps = event.rsvps || []
        if (!rsvps.includes(user.walletAddress)) {
          updateEvent(eventId, { rsvps: [...rsvps, user.walletAddress] })
        }
      }
      const selected = events.find(e => e.id === eventId)
      setSelectedEvent(selected || null)
    } catch (error) {
      console.error("Error updating RSVP:", error)
      alert("Failed to register for event. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <Header />

      {/* Search and Filter Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          {/* Search Bar */}
          <div className="relative w-full sm:max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search for community or event..."
              className="w-full pl-10 py-2 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:w-[600px]"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Button - Only on mobile */}
          <Button className="sm:hidden w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            Filter
          </Button>

          {/* Refresh Button */}
          <Button 
            onClick={() => fetchEvents()}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>

        {/* Category Pills */}
        <div className="flex flex-nowrap overflow-x-auto pb-2 gap-2 sm:gap-3 hide-scrollbar">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium ${
                selectedCategory === category.id
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Event Grid */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-8 max-w-md mx-auto">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading events...</h3>
              <p className="text-gray-600">Fetching events from the blockchain</p>
            </div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-8 max-w-md mx-auto">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 
                  `No events matching "${searchTerm}"` : 
                  "Be the first to create an event!"}
              </p>
              <Link href="/create">
                <Button className="bg-blue-600 text-white hover:bg-blue-700">
                  Create Event
                </Button>
              </Link>
            </div>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
          {filteredEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 relative overflow-hidden bg-gray-100">
                <img 
                  src={event.bannerUrl || event.image || 'https://via.placeholder.com/400x300?text=Event'} 
                  alt={event.title} 
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-300" 
                />
              </div>
              <div className="p-4">
                <Link href={`/event/${event.id}`}>
                  <h3 className="text-lg text-[#101928] font-bold line-clamp-1 cursor-pointer hover:underline">
                    {event.title}
                  </h3>
                </Link>
                <div className="flex items-center font-medium text-sm text-[#667185] mt-1">
                  <Calendar className="h-3 w-3" />
                  <span className="truncate">{new Date(event.date).toLocaleDateString()}</span>
                  <span className="mx-2"></span>
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{event.location}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {event.description || "No description available."}
                </p>
                <div className="mt-4 py-2 gap-2 flex flex-col sm:flex-row lg:flex-col">
                  

                  <Link href={`/event/${event.id}`} className="block">
                    <Button
                      variant="outline"
                      className="w-full py-2 text-sm border-[#4DA2FF] rounded-3xl text-[#4DA2FF]  hover:text-[#4DA2FF]"
                    >
                      View Details
                    </Button>
                  </Link>
                </div>
                {event.rsvps && event.rsvps.includes(user?.walletAddress || '') && (
                  <div className="mt-2 text-center">
                    {event.attendance && event.attendance.includes(user?.walletAddress || '') ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        ✓ Checked In
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        ✓ Registered
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Event Details Inline */}
      {selectedEvent && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-lg shadow-lg max-w-6xl mx-auto">
            <EventDetails eventData={selectedEvent} onClose={() => setSelectedEvent(null)} />
          </div>
        </div>
      )}

      {/* Custom CSS for hiding scrollbars */}
      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari and Opera */
        }
      `}</style>
    </div>
  )
}

export default EventDashboard