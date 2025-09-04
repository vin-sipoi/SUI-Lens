"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
    .filter(event => event.startTimestamp && event.startTimestamp >= Date.now())
    .sort((a, b) => (a.startTimestamp || 0) - (b.startTimestamp || 0))

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
    <div className="min-h-screen bg-gray-50 text-gray-800 overflow-x-hidden">
      {/* Header */}
      <Header />

      {/* Search and Filter Section */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* Search Bar */}
          <div className="relative w-full sm:max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search for community or event..."
              className="w-full pl-10 py-2.5 sm:py-3 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Button - Only on mobile */}
          <Button className="sm:hidden w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 py-2.5">
            <Filter className="h-4 w-4" />
            Filter
          </Button>

          {/* Refresh Button */}
          <Button 
            onClick={() => fetchEvents()}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 sm:px-4 py-2.5 flex-shrink-0"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>

        {/* Category Pills */}
        <div className="flex flex-nowrap overflow-x-auto pb-2 gap-2 sm:gap-3 hide-scrollbar -mx-1 px-1">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`whitespace-nowrap px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors flex-shrink-0 ${
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
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pb-8 sm:pb-10">
        {isLoading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 max-w-md mx-auto">
              <div className="animate-spin rounded-full h-10 sm:h-12 w-10 sm:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Loading events...</h3>
              <p className="text-sm sm:text-base text-gray-600">Fetching events from the blockchain</p>
            </div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 max-w-md mx-auto">
              <Calendar className="h-10 sm:h-12 w-10 sm:w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No events found</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                {searchTerm ? 
                  `No events matching "${searchTerm}"` : 
                  "Be the first to create an event!"}
              </p>
              <Link href="/create">
                <Button className="bg-blue-600 text-white hover:bg-blue-700 text-sm sm:text-base px-4 sm:px-6 py-2">
                  Create Event
                </Button>
              </Link>
            </div>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6 xl:gap-8">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="w-full max-w-full p-3 sm:p-4 md:p-6 lg:p-8 bg-white border-2 rounded-2xl sm:rounded-3xl overflow-hidden border-gray-100 transition-colors group cursor-pointer flex flex-col h-full"
            >
              {/* Inner wrapper: adds padding and border so image and text align */}
              <div className="border border-[#E6E7E8] rounded-2xl sm:rounded-3xl flex flex-col h-full overflow-hidden">
                
                {/* Image Section: responsive height */}
                <div className="relative w-full h-32 sm:h-40 md:h-48 lg:h-52 overflow-hidden">
                  <img 
                    src={event.bannerUrl || event.image || 'https://via.placeholder.com/400x300?text=Event'} 
                    alt={event.title} 
                    className="w-full rounded-t-2xl sm:rounded-t-3xl rounded-b-none h-full object-cover transition-transform hover:scale-105 duration-300" 
                  />
                </div>

                {/* Content Section */}
                <div className="p-3 sm:p-4 md:p-6 mt-2 sm:mt-4 flex-1 flex flex-col min-w-0">
                  {/* Header with title */}
                  <div className="flex items-start justify-between mb-2 sm:mb-3 min-w-0">
                    <Link href={`/event/${event.id}`} className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg md:text-xl font-semibold text-[#101928] cursor-pointer hover:underline line-clamp-2 break-words">
                        {event.title}
                      </h3>
                    </Link>
                  </div>

                  {/* Date and Location */}
                  <div className="flex flex-col sm:flex-row sm:items-center font-medium text-xs sm:text-sm text-[#667185] mb-2 sm:mb-3 gap-1 sm:gap-0 min-w-0">
                    <div className="flex items-center min-w-0">
                      <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <span className="hidden sm:inline sm:mx-2 flex-shrink-0">•</span>
                    <div className="flex items-center min-w-0">
                      <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[#8A94A5] text-xs sm:text-sm md:text-base mb-3 sm:mb-4 md:mb-6 leading-relaxed flex-1 line-clamp-3 break-words">
                    {event.description || "No description available."}
                  </p>

                  {/* Action Row: Buttons - stick to bottom */}
                  <div className="mt-auto space-y-2 w-full">
                    <Link href={`/event/${event.id}`} className="block w-full">
                      <Button
                        variant="outline"
                        className="w-full py-2 text-xs sm:text-sm border-[#4DA2FF] hover:bg-blue-500 hover:text-white rounded-2xl sm:rounded-3xl text-[#4DA2FF] transition-colors"
                      >
                        Register
                      </Button>
                    </Link> 

                    <Link href={`/event/${event.id}`} className="block w-full">
                      <Button
                        variant="outline"
                        className="w-full py-2 text-xs sm:text-sm border-[#4DA2FF] rounded-2xl sm:rounded-3xl text-[#4DA2FF] hover:bg-gray-50 transition-colors"
                      >
                        View Details
                      </Button>
                    </Link>

                    {/* Registration Status Badge */}
                    {event.rsvps && event.rsvps.includes(user?.walletAddress || '') && (
                      <div className="text-center pt-2 w-full">
                        {event.attendance && event.attendance.includes(user?.walletAddress || '') ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                            ✓ Checked In
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                            ✓ Registered
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
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