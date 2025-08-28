'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useUser } from '@/context/UserContext'
import { useEventContext } from '@/context/EventContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  MapPin,
  Users,
  Ticket,
  Share2,
  Heart,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Award,
  QrCode,
  Camera,
  Download,
  XCircle,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useEnokiTransaction } from '@/hooks/useEnokiTransaction'
import { suilensService } from '@/lib/sui-client'
import { toast } from 'sonner'
import Header from '@/app/components/Header'
import QRScanner from '@/components/QRScanner'
import { generateEventQRCode, downloadQRCode } from '@/utils/qrCodeUtils'

export default function EventDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params?.id as string
  const { user } = useUser()
  const { getEvent, updateEvent, fetchEvents } = useEventContext()
  const { signAndExecuteTransaction } = useEnokiTransaction()

  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [eventQRCode, setEventQRCode] = useState<string | null>(null)
  const [generatingQR, setGeneratingQR] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Registration form state
  const [registrationForm, setRegistrationForm] = useState({ name: '', email: '' })
  const [formErrors, setFormErrors] = useState({ name: '', email: '' })

  useEffect(() => {
    const loadEvent = async () => {
      setLoading(true)
      let eventData = getEvent(eventId)

      if (!eventData) {
        await fetchEvents()
        eventData = getEvent(eventId)
      }
      setEvent(eventData)
      setLoading(false)
    }
    loadEvent()
  }, [eventId, getEvent, fetchEvents])

  const isRegistered = event?.rsvps?.includes(user?.walletAddress)
  const checkInKey = user?.walletAddress ? `checkin_${eventId}_${user.walletAddress}` : null
  const hasSessionCheckIn = checkInKey ? sessionStorage.getItem(checkInKey) === 'true' : false
  const hasAttended = event?.attendance?.includes(user?.walletAddress) || hasSessionCheckIn
  const isFull = event?.capacity && event?.rsvps?.length >= parseInt(event.capacity)
  const isEventCreator = event?.creator === user?.walletAddress

  const now = Date.now()
  const eventStartTime = event?.startTimestamp || 0
  const eventEndTime = event?.endTimestamp || (eventStartTime ? eventStartTime + 24 * 60 * 60 * 1000 : 0)
  const hasEventStarted = eventStartTime && now >= eventStartTime
  const hasEventEnded = eventEndTime && now > eventEndTime

  // ✅ Save registration to DB
  const saveRegistrationToDatabase = async (data: any) => {
    try {
      const res = await fetch('http://localhost:3009/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) return null
      return await res.json()
    } catch {
      return null
    }
  }

  // ✅ Handle registration
  const handleRegister = async (formData = null) => {
    if (!user?.walletAddress) {
      toast.error('Please connect your wallet first')
      router.push('/auth/signin')
      return
    }

    if (isRegistered) {
      toast.info('You are already registered for this event')
      return
    }

    // Validate form if provided
    if (formData) {
      const errors: any = {}
      if (!formData.name.trim()) errors.name = 'Name is required'
      if (!formData.email.trim()) {
        errors.email = 'Email is required'
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Invalid email'
      }
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors)
        return
      }
      setFormErrors({ name: '', email: '' })
    }

    setRegistering(true)
    try {
      const ticketPriceInMist = event.isFree ? 0 : parseInt(event.ticketPrice || '0') * 1e9
      const tx = await suilensService.registerForEvent(eventId, ticketPriceInMist)
      const result = await signAndExecuteTransaction(tx)

      if (result.success && result.data?.effects?.status?.status === 'success') {
        const registrationData = {
          email: formData?.email || user?.email,
          name: formData?.name || user?.name || 'Anonymous',
          eventId,
          userId: user.walletAddress
        }
        if (registrationData.email) await saveRegistrationToDatabase(registrationData)

        const updatedRsvps = [...(event.rsvps || []), user.walletAddress]
        updateEvent(eventId, { rsvps: updatedRsvps })
        setEvent({ ...event, rsvps: updatedRsvps })

        if (formData) setRegistrationForm({ name: '', email: '' })
        toast.success('Successfully registered!')
        setTimeout(refreshEventData, 3000)
      } else {
        throw new Error(result.error || 'Transaction failed')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to register')
    } finally {
      setRegistering(false)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleRegister(registrationForm)
  }

  const handleInputChange = (field: string, value: string) => {
    setRegistrationForm(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: '' }))
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: event?.title, text: event?.description, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Event link copied!')
    }
  }

  const handleGenerateQRCode = async () => {
    setGeneratingQR(true)
    try {
      const qr = await generateEventQRCode(eventId)
      setEventQRCode(qr)
    } catch {
      toast.error('Failed to generate QR code')
    } finally {
      setGeneratingQR(false)
    }
  }

  const handleDownloadQRCode = async () => {
    try {
      await downloadQRCode(eventId, event.title)
    } catch {
      toast.error('Failed to download QR code')
    }
  }

  const refreshEventData = async () => {
    setRefreshing(true)
    await fetchEvents()
    const updatedEvent = getEvent(eventId)
    setEvent(updatedEvent)
    setRefreshing(false)
  }

  const handleCheckInSuccess = (scannedEventId: string) => {
    if (scannedEventId === eventId && user?.walletAddress) {
      const updatedAttendance = [...(event.attendance || []), user.walletAddress]
      sessionStorage.setItem(checkInKey!, 'true')
      updateEvent(eventId, { attendance: updatedAttendance })
      setEvent({ ...event, attendance: updatedAttendance })
      toast.success('You have been checked in!')
      setTimeout(refreshEventData, 5000)
    }
    setShowScanner(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-12 text-center">
              <h2 className="text-xl font-semibold mb-2">Event Not Found</h2>
              <p className="text-gray-600 mb-4">This event doesn't exist.</p>
              <Link href="/discover">
                <Button>Browse Events</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Banner */}
      <div className="relative h-64 md:h-96 bg-gray-200">
        {event.bannerUrl ? (
          <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600" />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="absolute top-4 left-4">
          <Link href="/discover">
            <Button variant="secondary" size="sm" className="bg-white/90 hover:bg-white">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </Link>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <Button variant="secondary" size="icon" onClick={handleShare} className="bg-white/90 hover:bg-white">
            <Share2 className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="icon" className="bg-white/90 hover:bg-white">
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Event Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6">{event.title}</h1>

        {/* Info */}
        <div className="flex items-center gap-4 text-gray-600 mb-8">
          <MapPin className="w-5 h-5 text-blue-600" /> {event.location}
          <Users className="w-5 h-5 text-blue-600" /> {event.rsvps?.length || 0} registered
        </div>

        {/* Description */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">About this event</h2>
          <p className="text-gray-700">{event.description}</p>
        </div>

        {/* Registration */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Registration</h2>
          {isRegistered ? (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
              <p>You're registered for this event!</p>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <Label>
                Full Name
                <Input
                  placeholder="Your name"
                  value={registrationForm.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                />
                {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
              </Label>
              <Label>
                Email
                <Input
                  placeholder="Your email"
                  value={registrationForm.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                />
                {formErrors.email && <p className="text-red-500 text-sm">{formErrors.email}</p>}
              </Label>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={registering}>
                {registering ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Ticket className="w-4 h-4 mr-2" />}
                {registering ? 'Registering...' : 'Register for Event'}
              </Button>
            </form>
          )}
        </div>

        {/* Event Creator QR Section */}
        {isEventCreator && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Manage QR Code</h3>
            {eventQRCode ? (
              <div className="space-y-4">
                <img src={eventQRCode} alt="Event QR" className="w-48 h-48 mx-auto" />
                <div className="flex gap-2">
                  <Button onClick={handleDownloadQRCode}>
                    <Download className="w-4 h-4 mr-2" /> Download QR
                  </Button>
                  <Button onClick={handleGenerateQRCode} variant="outline" disabled={generatingQR}>
                    {generatingQR ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Regenerate'}
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={handleGenerateQRCode} disabled={generatingQR}>
                {generatingQR ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4 mr-2" /> Generate QR
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>

      <QRScanner isOpen={showScanner} onClose={() => setShowScanner(false)} onSuccess={handleCheckInSuccess} />
    </div>
  )
}
