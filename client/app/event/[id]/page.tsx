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
import { useSponsoredTransaction } from '@/hooks/useSponsoredTransaction'
import { suilensService, suiClient } from '@/lib/sui-client'
import { toast } from 'sonner'
import Header from '@/app/components/Header'
import QRScanner from '@/components/QRScanner'
import { generateEventQRCode, downloadQRCode } from '@/utils/qrCodeUtils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SlBadge } from "react-icons/sl";
import { RiNftLine } from "react-icons/ri";

export default function EventDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params?.id as string
  const { user } = useUser()
  const { getEvent, updateEvent, fetchEvents } = useEventContext()
  const { signAndExecuteTransaction } = useEnokiTransaction()
  const { sponsorAndExecute } = useSponsoredTransaction()
  
  const [event, setEvent] = useState<any>(null)
  const [registering, setRegistering] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showScanner, setShowScanner] = useState(false)
  const [eventQRCode, setEventQRCode] = useState<string | null>(null)
  const [generatingQR, setGeneratingQR] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

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

  const handleRegister = async () => {
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

    setRegistering(true)

    try {
      // Skip profile creation and directly proceed with event registration
      console.log('Skipping profile creation, proceeding directly to event registration...');

      // Get the ticket price (convert to MIST - 1 SUI = 1e9 MIST)
      const ticketPriceInMist = event.isFree ? 0 : parseInt(event.ticketPrice || '0') * 1e9;

      // Determine if we should use sponsored transaction
      // For free events: use sponsored transactions (gas-free)
      // For paid events: use non-sponsored transactions (allows proper payment collection)
      const useSponsoredTransaction = event.isFree;

      console.log(`Event type: ${event.isFree ? 'Free' : 'Paid'}, Using ${useSponsoredTransaction ? 'sponsored' : 'non-sponsored'} transaction`);

      // Create the registration transaction
      const tx = await suilensService.registerForEvent(eventId, ticketPriceInMist, useSponsoredTransaction);

      if (useSponsoredTransaction) {
        // Execute with sponsored transaction (free events)
        console.log('Attempting sponsored registration...')
        const result = await sponsorAndExecute({
          tx,
          network: process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet',
          skipOnlyTransactionKind: true
        })
        console.log('Registration result with sponsorship:', result)

        // Check if transaction was successful
        const isSuccess = result?.effects?.status?.status === 'success' ||
                         (result && !result.error);

        if (isSuccess) {
          // Update local state immediately
          if (event) {
            const updatedRsvps = [...(event.rsvps || []), user.walletAddress]
            updateEvent(eventId, { rsvps: updatedRsvps })
            setEvent({ ...event, rsvps: updatedRsvps })
          }

          toast.success('Successfully registered for the event!')

          // Refresh event data from blockchain after transaction confirms
          setTimeout(async () => {
            await refreshEventData()
          }, 3000) // Wait 3 seconds for blockchain to update
        } else {
          throw new Error('Transaction failed')
        }
      } else {
        // Execute with non-sponsored transaction (paid events)
        console.log('Attempting non-sponsored registration with payment...')
        const result = await signAndExecuteTransaction(tx)
        console.log('Registration result with payment:', result)

        // Check if transaction was successful
        const isSuccess = result?.effects?.status?.status === 'success' ||
                         (result && !result.errors);

        if (isSuccess) {
          // Update local state immediately
          if (event) {
            const updatedRsvps = [...(event.rsvps || []), user.walletAddress]
            updateEvent(eventId, { rsvps: updatedRsvps })
            setEvent({ ...event, rsvps: updatedRsvps })
          }

          toast.success(`Successfully registered for the event! Payment of ${event.ticketPrice} SUI processed.`)

          // Refresh event data from blockchain after transaction confirms
          setTimeout(async () => {
            await refreshEventData()
          }, 3000) // Wait 3 seconds for blockchain to update
        } else {
          throw new Error('Transaction failed')
        }
      }
    } catch (error: any) {
      console.error('Error registering for event:', error)
      toast.error(error.message || 'Failed to register for event')
    } finally {
      setRegistering(false)
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
      
      {/* Back Button */}
      <div className="px-4 pt-4">
        <Link href="/discover">
          <Button variant="secondary" size="sm" className="bg-white/90 hover:bg-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
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
        <div className="max-w-4xl mx-auto pr-4 py-8">
          <h1 className='pb-6 text-[#101928] font-semibold text-5xl'>{event.title}</h1>
          {/* Event Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 mb-8 py-6 pr-6">
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
            <div className="py-6">
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
              ) : (
                /* Registration Form */
                <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
                  <div className="flex flex-col gap-4">
                    <Label>
                      Full Name
                      <Input placeholder="Your Name" className="my-4" />
                    </Label>

                    <Label>
                      Email Address
                      <Input placeholder="Your Email" className="my-4" />
                    </Label>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-[#101928] rounded-3xl"
                    disabled={registering || isFull}
                  >
                    {registering ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Registering...
                      </>
                    ) : isFull ? (
                      'Event Full'
                    ) : (
                      'Register'
                    )}
                  </Button>
                </form>
              )}
              
              {/* Show Attended Status */}
              {hasAttended && (
                <div className="mt-4 text-center">
                  <Button 
                    variant="outline" 
                    disabled
                    className="bg-green-50 px-8 py-2 rounded-full"
                  >
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Checked In
                  </Button>
                </div>
              )}

              {event.requiresApproval && !isRegistered && (
                <p className="text-sm text-amber-600 mt-3 text-center">
                  ⚠️ This event requires approval from the organizer
                </p>
              )}
            </div>
          </div>
          {/* NFT Rewards Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-semibold mb-4 text-[#101928]">NFT Rewards</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {event.nftImageUrl && (
                <div className="border border-blue-200 bg-blue-50/50 rounded-lg p-4 relative">
                  <RiNftLine className='w-6 h-6 text-[#101928] absolute top-4 right-4'/>
                  <div className="pr-8">
                    <h3 className="font-semibold text-xl text-[#101928] mb-1">Event NFT</h3>
                    <p className="text-sm font-normal text-gray-600 mb-2">
                      Claim your commemorative NFT after registering
                    </p>
                    <img 
                      src={event.nftImageUrl} 
                      alt="Event NFT"
                      className="w-full h-32 rounded-lg object-cover mt-2"
                    />
                    <h2 className='font-semibold text-sm my-4'>Requirements</h2>
                    <ul className="list-disc list-inside text-[#667185]">
                      <li>Must have registered for the event</li>
                      <li>One NFT per attendee</li>
                    </ul>
                  </div>
                  <Button 
                    className='mt-5 w-full' 
                    disabled={!isRegistered}
                    variant={!isRegistered ? "outline" : "default"}
                  >
                    {!isRegistered ? (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Register to Claim NFT
                      </>
                    ) : (
                      <>
                        <Ticket className="w-4 h-4 mr-2" />
                        Claim NFT
                      </>
                    )}
                  </Button>
                </div>
              )}
              
              {event.poapImageUrl && (
                <div className="border border-purple-200 bg-purple-50/50 rounded-lg p-4 relative">
                  
                  <SlBadge className='w-6 h-6 text-[#101928] absolute top-4 right-4'/>
                  <div className="pr-8">
                    <h3 className="font-medium mb-1">POAP Badge</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Exclusive badge for attendees who check in
                    </p>
                    <img 
                      src={event.poapImageUrl} 
                      alt="POAP Badge"
                      className="w-full h-32 rounded-lg object-cover mt-2"
                    />
                    <h2 className='font-semibold text-sm my-4'>Requirements</h2>
                    <ul className="list-disc list-inside text-[#667185]">
                      <li>Must have checked in at the event</li>
                      <li>Available after check in at Event</li>
                    </ul>
                  </div>
                  <Button 
                    className='mt-5 w-full'
                    disabled={!hasAttended}
                    variant={!hasAttended ? "outline" : "default"}
                  >
                    {!hasAttended ? (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Check-in to Claim POAP
                      </>
                    ) : (
                      <>
                        <Award className="w-4 h-4 mr-2" />
                        Claim POAP Badge
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
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