"use client"

import { useState } from "react"
import {Search} from "lucide-react"
import EventDetails from '@/components/EventDetails';
import { useEventContext } from '@/context/EventContext'
import Header from "../components/Header"

const EventDashboard: React.FC = () => {
  const { events } = useEventContext()
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

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 overflow-x-hidden">
      {/* Header */}
      <Header />

      {/* Search and Filter Section */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* Search Bar (from communities page) */}
          <div className="mb-8 w-full sm:w-9/12 md:w-2/3 mx-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-3 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search events..."
                className="block w-full pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-3xl bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          {/* ...other filter buttons and category pills... */}
        </div>
        {/* ...category pills and event grid rendering... */}
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