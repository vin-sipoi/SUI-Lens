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
  DollarSign
} from 'lucide-react'
import Link from 'next/link'
import { useEnokiTransaction } from '@/hooks/useEnokiTransaction'
import { suilensService } from '@/lib/sui-client'
import { toast } from 'sonner'
import Header from '@/app/components/Header'

export default function EventDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string
  const { user } = useUser()
  const { getEvent, updateEvent, fetchEvents } = useEventContext()
  const { signAndExecuteTransaction } = useEnokiTransaction()
  
  const [event, setEvent] = useState<any>(null)
  const [registering, setRegistering] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadEvent = async () => {
      setLoading(true)
      // First try to get from context
      let eventData = getEvent(eventId)
      
      if (!eventData) {
        // If not in context, fetch from blockchain
        await fetchEvents()
        eventData = getEvent(eventId)
      }
      
      setEvent(eventData)
      setLoading(false)
    }
    
    loadEvent()
  }, [eventId, getEvent, fetchEvents])

  const isRegistered = event?.rsvps?.includes(user?.walletAddress)
  const hasAttended = event?.attendance?.includes(user?.walletAddress)
  const isFull = event?.capacity && event?.rsvps?.length >= parseInt(event.capacity)

  const handleRegister = async () => {
    if (!user?.walletAddress) {
      toast.error('Please connect your wallet first')
      router.push('/auth/signin')
      return
    }

    setRegistering(true)

    try {
      // Get the ticket price (convert to MIST - 1 SUI = 1e9 MIST)
      const ticketPriceInMist = event.isFree ? 0 : parseInt(event.ticketPrice || '0') * 1e9;
      
      // Create the registration transaction with payment
      const tx = await suilensService.registerForEvent(eventId, ticketPriceInMist)
      
      // Execute the transaction
      const result = await signAndExecuteTransaction(tx)
      console.log('Registration result:', result)
      
      // Update local state
      if (event) {
        const updatedRsvps = [...(event.rsvps || []), user.walletAddress]
        updateEvent(eventId, { rsvps: updatedRsvps })
        setEvent({ ...event, rsvps: updatedRsvps })
      }
      
      toast.success('Successfully registered for the event!')
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
        </div>
      </div>

      {/* Event Content */}
      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-xl">
            <CardContent className="p-6 md:p-8">
              {/* Title and Category */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <Badge variant="secondary" className="mb-3">
                      {event.category || 'Event'}
                    </Badge>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                      {event.title}
                    </h1>
                  </div>
                  {event.qrCode && (
                    <div className="hidden md:block">
                      <img 
                        src={event.qrCode} 
                        alt="Event QR Code"
                        className="w-24 h-24 rounded-lg"
                      />
                    </div>
                  )}
                </div>

                {/* Key Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-3 text-blue-600" />
                    <div>
                      <p className="font-medium">{event.date}</p>
                      <p className="text-sm">{event.time}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-3 text-blue-600" />
                    <p>{event.location}</p>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Users className="w-5 h-5 mr-3 text-blue-600" />
                    <p>
                      {event.rsvps?.length || 0} registered
                      {event.capacity && ` / ${event.capacity} spots`}
                    </p>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="w-5 h-5 mr-3 text-blue-600" />
                    <p>{event.isFree ? 'Free' : `$${event.ticketPrice}`}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="border-t pt-6 mb-6">
                <h2 className="text-xl font-semibold mb-3">About This Event</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
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
                  
                  {event.qrCode && (
                    <Button variant="outline" className="sm:w-auto">
                      <QrCode className="w-4 h-4 mr-2" />
                      Show QR
                    </Button>
                  )}
                </div>

                {event.requiresApproval && !isRegistered && (
                  <p className="text-sm text-amber-600 mt-3">
                    ⚠️ This event requires approval from the organizer
                  </p>
                )}
              </div>

              {/* Organizer Info */}
              {event.organizer && (
                <div className="border-t pt-6 mt-6">
                  <h3 className="text-lg font-semibold mb-3">Organized By</h3>
                  <div className="flex items-center gap-3">
                    <img 
                      src={event.organizer.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=SuiLens'}
                      alt="Organizer"
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{event.organizer.name}</p>
                      <p className="text-sm text-gray-600">Event Organizer</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}