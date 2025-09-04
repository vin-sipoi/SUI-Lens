'use client'

import { useParams } from 'next/navigation'
import { useUser } from '@/context/UserContext'
import { useEventContext } from '@/context/EventContext'
import { useEffect, useState } from 'react'
import { generateUserEventQRCode } from '@/utils/qrCodeUtils'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export default function EventTicketPage() {
  const params = useParams()
  const eventId = params?.id as string
  const { user } = useUser()
  const { getEvent, fetchEvents } = useEventContext()
  const [event, setEvent] = useState<any>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadEventAndGenerateQR = async () => {
      if (!eventId) return

      setLoading(true)
      setError('')

      try {
        // First try to get from context
        let eventData = getEvent(eventId)

        // Only fetch from blockchain if not in context
        if (!eventData) {
          console.log('Event not in context, fetching from blockchain:', eventId)
          await fetchEvents()
          eventData = getEvent(eventId)
        }

        if (!eventData) {
          throw new Error('Event not found')
        }

        setEvent(eventData)

        // Generate QR code if user is logged in
        if (user?.walletAddress) {
          const qr = await generateUserEventQRCode(eventId, user.walletAddress)
          setQrCode(qr)
        }
      } catch (error: any) {
        console.error('Failed to load event or generate QR code:', error)
        setError(error.message || 'Failed to load event data')
      } finally {
        setLoading(false)
      }
    }

    loadEventAndGenerateQR()
  }, [eventId, user?.walletAddress, getEvent, fetchEvents])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please log in to view your ticket.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-gray-100">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading your ticket...</p>
        </div>
      </div>
    )
  }

  // Check if user is registered for this event
  const isRegistered = event?.rsvps?.includes(user?.walletAddress)

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-gray-100">
        <div className="bg-white shadow-xl rounded-2xl w-96 p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Ticket Not Available</h2>
          <p className="text-gray-600 mb-4">
            {error || 'Event not found or you may not be registered for this event.'}
          </p>
          <Button
            onClick={() => window.history.back()}
            className="w-full"
          >
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  if (!isRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-gray-100">
        <div className="bg-white shadow-xl rounded-2xl w-96 p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Not Registered</h2>
          <p className="text-gray-600 mb-4">
            You are not registered for this event. Please register first to view your ticket.
          </p>
          <Button
            onClick={() => window.location.href = `/event/${eventId}`}
            className="w-full"
          >
            Go to Event Page
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-gray-100">
      <div className="bg-white shadow-xl rounded-2xl w-96 p-6 text-center">
        {/* Ticket Label */}
        <div className="text-xs uppercase tracking-wide text-gray-500 mb-2 text-left">
          Ticket
        </div>

        {/* Event Info */}
        <h1 className="text-lg font-semibold text-gray-800 mb-1">
          {event.title}
        </h1>
        <p className="text-sm text-gray-600 mb-1">{event.date}, {event.time}</p>
        <p className="text-xs text-gray-500 mb-4">{event.location}</p>

        {/* QR Code */}
        <div className="border-t border-b border-gray-200 py-6 flex justify-center">
          {qrCode ? (
            <img
              src={qrCode}
              alt="QR Code"
              className="w-36 h-36"
            />
          ) : (
            <p className="text-gray-500">QR code not available</p>
          )}
        </div>

        {/* Guest Info */}
        <div className="flex justify-between items-center text-sm mt-4 px-2">
          <div>
            <p className="text-gray-500">Guest</p>
            <p className="font-semibold text-gray-800">{user.name || user.walletAddress}</p>
          </div>
          <div>
            <p className="text-gray-500">Status</p>
            <p className="text-green-600 font-semibold">Going</p>
          </div>
        </div>

        {/* Ticket Info */}
        <div className="flex justify-between items-center text-sm mt-4 px-2">
          <div>
            <p className="text-gray-500">Ticket</p>
            <p className="text-gray-800">1× Standard</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-6">
          <Button
            onClick={() => {
              const encodedLocation = encodeURIComponent(event.location)
              window.open(`https://www.google.com/maps/search/?api=1&query=${encodedLocation}`, '_blank')
            }}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 12.414a1.998 1.998 0 00-2.828 0l-4.243 4.243M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Get Directions
          </Button>
          <Button
            onClick={() => {
              // TODO: Implement wallet integration for adding ticket to digital wallet
              alert('Wallet integration coming soon!')
            }}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3-1.343-3-3S10.343 2 12 2s3 1.343 3 3-1.343 3-3 3zM6 22V11a2 2 0 012-2h8a2 2 0 012 2v11"
              />
            </svg>
            Add to Wallet
          </Button>
        </div>
      </div>
    </div>
  )
}
