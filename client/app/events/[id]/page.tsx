'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import EventDetails from "@/components/EventDetails"
import { useEventContext } from '@/context/EventContext'
import { useUser } from '@/context/UserContext'

const EventDashboard: React.FC = () => {
  const { events, updateEvent } = useEventContext()
  const { user } = useUser()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null)

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleRegister = (eventId: string) => {
    if (!user) {
      alert('Please login to register for events.')
      return
    }
    try {
      // Update RSVP status in EventContext
      const event = events.find(e => e.id === eventId)
      if (event && user.walletAddress) {
        const rsvps = event.rsvps || []
        if (!rsvps.includes(user.walletAddress)) {
          updateEvent(eventId, { rsvps: [...rsvps, user.walletAddress] })
        }
      }
      // Select event to show details inline
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
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Image 
                src="https://i.ibb.co/PZHSkCVG/Suilens-Logo-Mark-Suilens-Black.png" 
                alt="Suilens Logo" 
                width={60}
                height={60}
                className="object-contain"
              />
            </div>
            <span className="text-2xl font-bold text-gray-800">Suilens</span>
          </Link>

          <nav className="hidden lg:flex items-center space-x-8">
            {["Home", "Communities",].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase().replace(' ', '-')}`}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                {item}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Search Bar */}
      <div className="p-6">
        <Input
          type="text"
          placeholder="Search for community or event..."
          className="w-full max-w-xl p-2 border rounded"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Event Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
        {filteredEvents.map((event) => (
          <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img src={event.image} alt={event.title} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3
                className="text-lg font-bold cursor-pointer hover:underline"
                onClick={() => setSelectedEvent(event)}
              >
                {event.title}
              </h3>
              <p className="text-sm text-gray-600">{event.type}</p>
              <p className="text-sm text-gray-500">{event.date}</p>
              {event.rsvps && event.rsvps.includes(user?.walletAddress || '') ? (
                <>
                  {event.requiresApproval ? (
                    <button
                      className="mt-2 w-full bg-yellow-400 text-white py-2 rounded cursor-not-allowed"
                      disabled
                    >
                      Pending Approval
                    </button>
                  ) : (
                    <button
                      className="mt-2 w-full bg-green-600 text-white py-2 rounded cursor-not-allowed"
                      disabled
                    >
                      You're In
                    </button>
                  )}
                </>
              ) : (
                <button
                  className="mt-2 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                  onClick={() => handleRegister(event.id)}
                >
                  Register
                </button>
              )}
              {event.attendance && event.attendance.includes(user?.walletAddress || '') && (
                <p className="mt-1 text-green-600 font-semibold text-center">Checked In</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Event Details Inline */}
      {selectedEvent && (
        <div className="p-6 bg-white rounded-lg shadow-lg max-w-6xl mx-auto my-6">
          <EventDetails eventData={selectedEvent} onClose={() => setSelectedEvent(null)} />
        </div>
      )}
    </div>
  )
}

export default EventDashboard