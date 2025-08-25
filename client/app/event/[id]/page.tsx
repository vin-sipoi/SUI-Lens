'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useUser } from '@/context/UserContext'
import { useEventContext } from '@/context/EventContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Ticket,
  Share2,
  Heart,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Award,
  QrCode,
  DollarSign,
  Camera,
  Download,
  XCircle
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useEnokiTransaction } from '@/hooks/useEnokiTransaction'
import { suilensService } from '@/lib/sui-client'
import { toast } from 'sonner'
import Header from '@/app/components/Header'
import QRScanner from '@/components/QRScanner'
import { generateEventQRCode, downloadQRCode } from '@/utils/qrCodeUtils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function EventDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params?.id as string
  const { user } = useUser()
  const { getEvent, updateEvent, fetchEvents } = useEventContext()
  const { signAndExecuteTransaction } = useEnokiTransaction()
  
  const [event, setEvent] = useState<any>(null)
  const [registering, setRegistering] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showScanner, setShowScanner] = useState(false)
  const [eventQRCode, setEventQRCode] = useState<string | null>(null)
  const [generatingQR, setGeneratingQR] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  
  // Add form state management
  const [registrationForm, setRegistrationForm] = useState({
    name: '',
    email: ''
  })
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: ''
  })

  useEffect(() => {
    const loadEvent = async () => {
      setLoading(true)
      
      // First try to get from context
      let eventData = getEvent(eventId)
      
      // Only fetch from blockchain if not in context
      if (!eventData) {
        console.log('Event not in context, fetching from blockchain:', eventId)
        await fetchEvents()
        eventData = getEvent(eventId)
      }
      
      if (eventData) {
        // Check if we have a local attendance state that might not be on chain yet
        const currentEvent = event
        const checkInKey = user?.walletAddress ? `checkin_${eventId}_${user.walletAddress}` : null
        const hasSessionCheckIn = checkInKey ? sessionStorage.getItem(checkInKey) === 'true' : false
        
        if ((currentEvent?.attendance?.includes(user?.walletAddress) || hasSessionCheckIn) && 
            user?.walletAddress &&
            !eventData.attendance?.includes(user.walletAddress)) {
          console.log('Preserving check-in state from previous load or session')
          eventData.attendance = [...(eventData.attendance || []), user.walletAddress]
        }
        
        console.log('Event data loaded:', {
          id: eventData.id,
          title: eventData.title,
          totalRsvps: eventData.rsvps?.length,
          totalAttendance: eventData.attendance?.length,
          attendanceList: eventData.attendance,
          userWallet: user?.walletAddress,
          isUserRegistered: user?.walletAddress && eventData.rsvps?.includes(user.walletAddress),
          hasUserAttended: user?.walletAddress && eventData.attendance?.includes(user.walletAddress),
          hasSessionCheckIn
        })
      }
      
      setEvent(eventData)
      setLoading(false)
    }
    
    loadEvent()
  }, [eventId, getEvent, fetchEvents])

  // Remove constant debug logging to reduce noise
  
  const isRegistered = event?.rsvps?.includes(user?.walletAddress)
  
  // Check both event attendance and session storage for check-in status
  const checkInKey = user?.walletAddress ? `checkin_${eventId}_${user.walletAddress}` : null
  const hasSessionCheckIn = checkInKey ? sessionStorage.getItem(checkInKey) === 'true' : false
  const hasAttended = event?.attendance?.includes(user?.walletAddress) || hasSessionCheckIn
  
  const isFull = event?.capacity && event?.rsvps?.length >= parseInt(event.capacity)
  const isEventCreator = event?.creator === user?.walletAddress
  
  // Check if event has started and ended using timestamps
  const now = Date.now()
  const eventStartTime = event?.startTimestamp || 0
  const eventEndTime = event?.endTimestamp || (eventStartTime ? eventStartTime + (24 * 60 * 60 * 1000) : 0) // Default to 24 hours after start
  const hasEventStarted = eventStartTime && now >= eventStartTime
  const hasEventEnded = eventEndTime && now > eventEndTime
  const canCheckIn = hasEventStarted && !hasEventEnded

  const saveRegistrationToDatabase = async (registrationData: any) => {
    try {
      const response = await fetch('http://localhost:3005/api/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: registrationData.email,
          userName: registrationData.name || 'Anonymous',
          eventId: registrationData.eventId,
          userAddress: registrationData.userAddress,
          registeredAt: new Date().toISOString()
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Registration save failed:', response.status, errorText)
        return null
      }

      const result = await response.json()
      console.log('Registration saved to database successfully:', result.data?.id || result.id)
      return result
    } catch (error) {
      console.error('Error saving registration (non-blocking):', error)
      return null
    }
  }

  // Updated handleRegister function to accept form data
  const handleRegister = async (formData = null) => {
    if (!user?.walletAddress) {
      toast.error('Please connect your wallet first')
      router.push('/auth/signin')
      return
    }

    // Check if already registered
    if (isRegistered) {
      toast.info('You are already registered for this event')
      return
    }

    // If called from form, validate form data
    if (formData) {
      const errors = {}
      if (!formData.name.trim()) {
        errors.name = 'Name is required'
      }
      if (!formData.email.trim()) {
        errors.email = 'Email is required'
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Please enter a valid email address'
      }

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors)
        return
      }
      
      setFormErrors({ name: '', email: '' })
    }

    setRegistering(true)

    try {
      // First, try to create a profile if user doesn't have one
      // This is a workaround - in production, you'd check if profile exists first
      try {
        const profileTx = await suilensService.createProfile(
          formData?.name || user.name || 'SuiLens User',
          'Active member of the SuiLens community',
          'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.walletAddress
        )
        await signAndExecuteTransaction(profileTx)
        console.log('Profile created successfully')
      } catch (profileError: any) {
        // Profile might already exist, continue with registration
        console.log('Profile creation skipped:', profileError.message)
      }

      // Get the ticket price (convert to MIST - 1 SUI = 1e9 MIST)
      const ticketPriceInMist = event.isFree ? 0 : parseInt(event.ticketPrice || '0') * 1e9;
      
      // Create the registration transaction with payment
      const tx = await suilensService.registerForEvent(eventId, ticketPriceInMist)
      
      // Execute the transaction
      const result = await signAndExecuteTransaction(tx)
      console.log('Registration result:', result)
      
      // Check if transaction was successful
      if (result.success && result.data?.effects?.status?.status === 'success') {
        // Save registration to database (use form data if available, fallback to user data)
        const registrationData = {
          email: formData?.email || user?.email,
          name: formData?.name || user?.name || 'Anonymous',
          eventId: eventId,
          userId: user.walletAddress
        }
        
        if (registrationData.email) {
          const dbResult = await saveRegistrationToDatabase(registrationData)
          if (!dbResult) {
            console.warn('Database registration failed, but blockchain registration succeeded')
            // Don't fail the entire process if database save fails
          }
        }
        
        // Update local state immediately
        if (event) {
          const updatedRsvps = [...(event.rsvps || []), user.walletAddress]
          updateEvent(eventId, { rsvps: updatedRsvps })
          setEvent({ ...event, rsvps: updatedRsvps })
        }
        
        // Clear form on success
        if (formData) {
          setRegistrationForm({ name: '', email: '' })
        }
        
        toast.success('Successfully registered for the event!')
        
        // Refresh event data from blockchain after transaction confirms
        setTimeout(async () => {
          await refreshEventData()
        }, 3000) // Wait 3 seconds for blockchain to update
      } else {
        // Handle transaction failure with better error messages
        const errorMessage = result.error || 'Transaction failed';
        console.error('Transaction failed:', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Error registering for event:', error)
      toast.error(error.message || 'Failed to register for event')
    } finally {
      setRegistering(false)
    }
  }

  // Add form submission handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleRegister(registrationForm)
  }

  // Add input change handler
  const handleInputChange = (field: string, value: string) => {
    setRegistrationForm(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: event?.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Event link copied to clipboard!')
    }
  }

  const handleGenerateQRCode = async () => {
    setGeneratingQR(true)
    try {
      const qrCode = await generateEventQRCode(eventId)
      setEventQRCode(qrCode)
      toast.success('QR code generated successfully!')
    } catch (error) {
      console.error('Error generating QR code:', error)
      toast.error('Failed to generate QR code')
    } finally {
      setGeneratingQR(false)
    }
  }

  const handleDownloadQRCode = async () => {
    try {
      await downloadQRCode(eventId, event.title)
      toast.success('QR code downloaded!')
    } catch (error) {
      console.error('Error downloading QR code:', error)
      toast.error('Failed to download QR code')
    }
  }

  const refreshEventData = async () => {
    setRefreshing(true)
    try {
      await fetchEvents()
      const updatedEvent = getEvent(eventId)
      if (updatedEvent && user?.walletAddress) {
        // Preserve local attendance state if blockchain hasn't caught up
        // This prevents the "disappearing check-in" issue
        const userAddress = user.walletAddress
        if (event?.attendance?.includes(userAddress) && 
            !updatedEvent.attendance?.includes(userAddress)) {
          console.log('Preserving local check-in state while blockchain updates')
          updatedEvent.attendance = [...(updatedEvent.attendance || []), userAddress]
        }
        setEvent(updatedEvent)
        // Only show toast if not preserving local state
        if (!event?.attendance?.includes(userAddress) || 
            updatedEvent.attendance?.includes(userAddress)) {
          toast.success('Event data refreshed')
        }
      } else if (updatedEvent) {
        // No user logged in, just update the event
        setEvent(updatedEvent)
        toast.success('Event data refreshed')
      }
    } finally {
      setRefreshing(false)
    }
  }

  const handleCheckInSuccess = async (scannedEventId: string) => {
    if (scannedEventId === eventId && user?.walletAddress) {
      // Update local state to reflect attendance immediately
      const updatedAttendance = [...(event.attendance || []), user.walletAddress]
      
      // Store check-in state in session storage as backup
      const checkInKey = `checkin_${eventId}_${user.walletAddress}`
      sessionStorage.setItem(checkInKey, 'true')
      
      // Update both the local state and context to ensure persistence
      const updatedEvent = { ...event, attendance: updatedAttendance }
      setEvent(updatedEvent)
      updateEvent(eventId, { attendance: updatedAttendance })
      
      toast.success('✅ You have been checked in!')
      
      // Don't immediately refresh - let the local update persist
      // Only refresh after a longer delay to confirm blockchain state
      setTimeout(async () => {
        // Only refresh if still on the same event page
        if (eventId === scannedEventId) {
          await refreshEventData()
        }
      }, 5000) // Wait 5 seconds for blockchain to fully update
    }
    setShowScanner(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </div>
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
              <p className="text-gray-600 mb-4">The event you're looking for doesn't exist.</p>
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
      
      {/* Hero Section with Banner */}
      <div className="relative h-64 md:h-96 bg-gray-200">
        {event.bannerUrl ? (
          <img 
            src={event.bannerUrl} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600" />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        
        {/* Back Button */}
        <div className="absolute top-4 left-4">
          <Link href="/discover">
            <Button variant="secondary" size="sm" className="bg-white/90 hover:bg-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>

        {/* Share and Like Buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button 
            variant="secondary" 
            size="icon"
            onClick={handleShare}
            className="bg-white/90 hover:bg-white"
          >
            <Share2 className="w-4 h-4" />
          </Button>
          <Button 
            variant="secondary" 
            size="icon"
            className="bg-white/90 hover:bg-white"
          >
            <Heart className="w-4 h-4" />
          </Button>
          {/* Debug: Force refresh to check blockchain state */}
          <Button 
            variant="secondary" 
            size="sm"
            onClick={async () => {
              console.log('=== FORCE REFRESH DEBUG ===')
              console.log('Current event attendance:', event?.attendance)
              console.log('User wallet:', user?.walletAddress)
              console.log('Fetching fresh from blockchain...')
              await fetchEvents()
              const fresh = getEvent(eventId)
              console.log('Fresh event data:', fresh)
              console.log('Fresh attendance list:', fresh?.attendance)
              if (fresh) {
                setEvent(fresh)
                toast.info(`Refreshed: ${fresh.attendance?.length || 0} checked in`)
              }
            }}
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
            title="Force refresh from blockchain"
          >
            Debug Refresh
          </Button>
        </div>
      </div>

      {/* Event Content */}
      <div>
        {/* Blue Header Banner */}
        <div className="text-white py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="w-full h-80 overflow-hidden rounded-lg">
              <Image
                src={event.bannerUrl}
                alt={event.title}
                width={1200}
                height={320}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className='pb-6 text-[#101928] font-semibold text-5xl'>{event.title}</h1>
          {/* Event Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 mb-8 p-6">
            <div className="flex items-center text-gray-700">
              <div className='flex flex-row gap-2 text-[#667185] font-normal text-lg'>
                <p>{event.date}</p>
                <span>|</span>
                <p>{event.time}</p>
                <span>|</span>
                
                <p className='flex flex-row'> <MapPin className='w-4 h-4'/> {event.location}</p>
              </div>
            </div>
            
            <div className="flex items-center text-gray-700">
              <Users className="w-5 h-5 mr-3 text-blue-600" />
              <p>
                {event.rsvps?.length || 0} registered
                {event.capacity && ` / ${event.capacity} spots`}
              </p>
            </div>
          </div>

          {/* About This Event */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-[#101928]">About this event</h2>
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{event.description}</p>
          </div>

          {/* Location */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Location</h2>
            <div className="flex items-center text-gray-700 mb-4">
              <MapPin className="w-5 h-5 mr-3 text-blue-600" />
              <p>{event.location}</p>
            </div>
            {/* Placeholder for map - you can integrate Google Maps or another map service */}
            <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Map placeholder</p>
            </div>
          </div>

          {/* Registration Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-semibold mb-4 text-[#101928]">Registration</h2>
            <div className="p-6">
              {isRegistered ? (
                /* Registration Success Message */
                <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                      <div>
                        <h3 className="font-semibold text-green-800">You're registered</h3>
                        <p className="text-sm text-green-700">
                          You've secured your spot for {event.title}. See you on {event.date} at {event.time}, {event.location}.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="border-t pt-6 mb-6">
                <h2 className="text-xl font-semibold mb-3">About This Event</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
              </div>

              {/* Map location */}



               {/* Registration Form */}
                  <div className="border-t pt-9 mb-6">
                    <h2 className="text-4xl font-semibold text-[#101928] pb-4 mb-4"> Registration</h2>
                    
                    <form>
                      <div className="flex flex-col  gap-4">
                        <Label>
                          Full Name
                          <Input placeholder="Your Name" className="my-4" />
                        </Label>

                        <Label>
                          Email Address
                          <Input placeholder="Your Email" className="my-4" />
                        </Label>
                      </div>
                      <Button type="submit" className="w-full bg-[#101928] rounded-3xl">
                        Register
                      </Button>
                    </form>
                  </div>
              {/* NFT Rewards Section */}
              <div className="border-t pt-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">🎁 NFT Rewards</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {event.nftImageUrl && (
                    <Card className="border-blue-200 bg-blue-50/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Ticket className="w-6 h-6 text-blue-600 mt-1" />
                          <div className="flex-1">
                            <h3 className="font-medium mb-1">Event NFT</h3>
                            <p className="text-sm text-gray-600 mb-2">
                              Claim your commemorative NFT after registering
                            </p>
                            {event.nftImageUrl && (
                              <img 
                                src={event.nftImageUrl} 
                                alt="Event NFT"
                                className="w-20 h-20 rounded-lg object-cover"
                              />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {event.poapImageUrl && (
                    <Card className="border-purple-200 bg-purple-50/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Award className="w-6 h-6 text-purple-600 mt-1" />
                          <div className="flex-1">
                            <h3 className="font-medium mb-1">POAP Badge</h3>
                            <p className="text-sm text-gray-600 mb-2">
                              Exclusive badge for attendees who check in
                            </p>
                            {event.poapImageUrl && (
                              <img 
                                src={event.poapImageUrl} 
                                alt="POAP"
                                className="w-20 h-20 rounded-lg object-cover"
                              />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  {!user?.walletAddress ? (
                    <Link href="/auth/signin" className="flex-1">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        Sign In to Register
                      </Button>
                    </Link>
                  ) : isRegistered ? (
                    <>
                      <div className="flex-1">
                        <Button 
                          disabled 
                          className="w-full bg-green-600"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          You're Registered
                        </Button>
                      </div>
                      {(event.nftImageUrl || event.poapImageUrl) && (
                        <Link href={`/event/${eventId}/claim-nft`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            <Award className="w-4 h-4 mr-2" />
                            Claim NFTs
                          </Button>
                        </Link>
                      )}
                    </>
                  ) : isFull ? (
                    <Button disabled className="flex-1">
                      Event Full
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleRegister}
                      disabled={registering}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {registering ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        <>
                          <Ticket className="w-4 h-4 mr-2" />
                          Register for Event
                        </>
                      )}
                    </Button>
                  )}
                  
                  {/* Check-in Button for Attendees */}
                  {isRegistered && !hasAttended && (
                    <>
                      {!hasEventStarted ? (
                        <div>
                          <Button 
                            variant="outline" 
                            className="sm:w-auto"
                            disabled
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            Check-in Not Yet Available
                          </Button>
                          <p className="text-xs text-amber-600 mt-1">
                            Check-in will be available on {event.date} at {event.time}
                          </p>
                        </div>
                      ) : hasEventEnded ? (
                        <div>
                          <Button 
                            variant="outline" 
                            className="sm:w-auto"
                            disabled
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Event Ended
                          </Button>
                          <p className="text-xs text-red-600 mt-1">
                            Check-in is no longer available
                          </p>
                        </div>
                      ) : (
                        <>
                          <Button 
                            variant="outline" 
                            className="sm:w-auto"
                            onClick={() => setShowScanner(true)}
                          >
                            <Camera className="w-4 h-4 mr-2" />
                            Check In
                          </Button>
                          <p className="text-xs text-green-600 mt-1">
                            ✅ Check-in is now available
                          </p>
                        </>
                      )}
                    </>
                  )}
                  
                  {/* Show Attended Status */}
                  {hasAttended && (
                    <Button 
                      variant="outline" 
                      disabled
                      className="sm:w-auto bg-green-50"
                    >
                      <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                      Checked In
                    </Button>
                  )}
                </div>

                {event.requiresApproval && !isRegistered && (
                  <p className="text-sm text-amber-600 mt-3">
                    ⚠️ This event requires approval from the organizer
                  </p>
                )}
              </div>

          {/* Event Creator QR Code Management */}
          {isEventCreator && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">🎫 Event Check-in QR Code</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-4">
                  Generate and download a QR code for attendees to check in at your event.
                  Display this QR code at the venue for attendees to scan.
                </p>
                
                {eventQRCode ? (
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg flex justify-center">
                      <img 
                        src={eventQRCode} 
                        alt="Event Check-in QR Code"
                        className="w-48 h-48"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleDownloadQRCode}
                        className="flex-1"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download QR Code
                      </Button>
                      <Button 
                        onClick={handleGenerateQRCode}
                        variant="outline"
                        disabled={generatingQR}
                      >
                        {generatingQR ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Regenerate'
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    onClick={handleGenerateQRCode}
                    disabled={generatingQR}
                    className="w-full"
                  >
                    {generatingQR ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating QR Code...
                      </>
                    ) : (
                      <>
                        <QrCode className="w-4 h-4 mr-2" />
                        Generate Check-in QR Code
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
      
      {/* QR Scanner Modal */}
      <QRScanner 
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onSuccess={handleCheckInSuccess}
      />
    </div>
  )
}