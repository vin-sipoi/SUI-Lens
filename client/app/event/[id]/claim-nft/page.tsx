'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useUser } from '@/context/UserContext'
import { useEventContext } from '@/context/EventContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Loader2, Award, CheckCircle, XCircle, Ticket } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useSponsoredTransaction } from '@/hooks/useSponsoredTransaction'
import { suilensService } from '@/lib/sui-client'
import { toast } from 'sonner'
import Header from '@/app/components/Header'

export default function ClaimNFTPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string
  const { user } = useUser()
  const { getEvent } = useEventContext()
  const { sponsorAndExecute } = useSponsoredTransaction()
  
  const [event, setEvent] = useState<any>(null)
  const [claiming, setClaiming] = useState(false)
  const [claimedNFT, setClaimedNFT] = useState(false)
  const [claimedPOAP, setClaimedPOAP] = useState(false)
  const [error, setError] = useState('')
  const [checkingClaims, setCheckingClaims] = useState(true)

  useEffect(() => {
    if (eventId) {
      const eventData = getEvent(eventId)
      if (eventData) {
        setEvent(eventData)
      } else {
        setError('Event not found')
      }
    }
  }, [eventId, getEvent])

  // Check if user has already claimed NFTs
  useEffect(() => {
    const checkClaimStatus = async () => {
      if (!user?.walletAddress) {
        setCheckingClaims(false)
        return
      }

      try {
        // Check for Event NFTs
        const eventNFTs = await suilensService.getUserEventNFTs(user.walletAddress)
        const hasEventNFT = eventNFTs.data?.some((nft: any) => {
          const content = nft.data?.content
          return content?.fields?.event_id === eventId
        })
        setClaimedNFT(hasEventNFT || false)

        // Check for POAPs  
        const poaps = await suilensService.getUserPOAPs(user.walletAddress)
        const hasPOAP = poaps.data?.some((poap: any) => {
          const content = poap.data?.content
          return content?.fields?.event_id === eventId
        })
        setClaimedPOAP(hasPOAP || false)
      } catch (error) {
        console.error('Error checking claim status:', error)
      } finally {
        setCheckingClaims(false)
      }
    }

    if (user?.walletAddress && eventId) {
      checkClaimStatus()
    } else {
      setCheckingClaims(false)
    }
  }, [user?.walletAddress, eventId])

  // Check if user is registered
  const isRegistered = event?.rsvps?.includes(user?.walletAddress)
  const hasAttended = event?.attendance?.includes(user?.walletAddress)

  const handleClaimNFT = async () => {
    if (!user?.walletAddress) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!isRegistered) {
      toast.error('You must be registered for this event to claim the NFT')
      return
    }

    setClaiming(true)
    setError('')

    try {
      // Create the mint NFT transaction (uses event's stored metadata including nftImageUrl)
      const tx = await suilensService.mintEventNFT(eventId)
      
      // Execute the transaction using sponsored transaction (gas-free)
      console.log('Attempting sponsored NFT claim...')
      const result = await sponsorAndExecute({
        tx,
        network: process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet',
        skipOnlyTransactionKind: true
      })
      console.log('NFT claim result with sponsorship:', result)
      
      setClaimedNFT(true)
      toast.success('🎉 Event NFT claimed successfully!')
      
      // Redirect to user's profile after a delay
      setTimeout(() => {
        router.push('/profile?refresh=true')
      }, 3000)
    } catch (error: any) {
      console.error('Error claiming NFT:', error)
      setError(error.message || 'Failed to claim NFT')
      toast.error('Failed to claim NFT. Please try again.')
    } finally {
      setClaiming(false)
    }
  }

  const handleClaimPOAP = async () => {
    if (!user?.walletAddress) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!hasAttended) {
      toast.error('You must have attended the event to claim the POAP')
      return
    }

    setClaiming(true)
    setError('')

    try {
      // Create the mint POAP transaction (uses event's stored metadata including poapImageUrl)
      const tx = await suilensService.mintPOAP(eventId)
      
      // Execute the transaction using sponsored transaction (gas-free)
      console.log('Attempting sponsored POAP claim...')
      const result = await sponsorAndExecute({
        tx,
        network: process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet',
        skipOnlyTransactionKind: true
      })
      console.log('POAP claim result with sponsorship:', result)
      
      setClaimedPOAP(true)
      toast.success('🏅 POAP claimed successfully!')
      
      // Redirect to user's profile after a delay
      setTimeout(() => {
        router.push('/profile?refresh=true')
      }, 3000)
    } catch (error: any) {
      console.error('Error claiming POAP:', error)
      
      // Check for specific Move error codes
      let errorMessage = 'Failed to claim POAP'
      
      if (error.message.includes('MoveAbort')) {
        if (error.message.includes(', 8)')) {
          // E_EVENT_NOT_STARTED
          errorMessage = 'POAPs can only be claimed after the event has started. Please check back later.'
        } else if (error.message.includes(', 5)')) {
          // E_EVENT_NOT_ENDED (no longer used but kept for compatibility)
          errorMessage = 'POAPs can only be claimed after checking in at the event.'
        } else if (error.message.includes(', 3)')) {
          // E_ALREADY_CLAIMED
          errorMessage = 'You have already claimed the POAP for this event.'
        } else if (error.message.includes(', 4)')) {
          // E_NOT_ATTENDEE
          errorMessage = 'You must check in at the event to claim the POAP.'
        } else if (error.message.includes(', 6)')) {
          // E_POAP_NOT_ACTIVE
          errorMessage = 'The POAP collection for this event is not active.'
        } else if (error.message.includes(', 7)')) {
          // E_MAX_SUPPLY_REACHED
          errorMessage = 'All POAPs for this event have been claimed.'
        } else if (error.message.includes(', 2)')) {
          // E_POAP_NOT_FOUND
          errorMessage = 'No POAP collection exists for this event.'
        }
      }
      
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setClaiming(false)
    }
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-12 text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
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
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href={`/event/${eventId}`} className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Event
        </Link>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Claim Your NFTs</h1>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Event NFT Card */}
            <Card className={!isRegistered ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <Ticket className="h-8 w-8 text-blue-600" />
                  <Badge variant="secondary">Event NFT</Badge>
                </div>
                <CardTitle>Event Registration NFT</CardTitle>
                <CardDescription>
                  Commemorative NFT for registered attendees
                </CardDescription>
              </CardHeader>
              <CardContent>
                {event.nftImageUrl && (
                  <div className="mb-4 rounded-lg overflow-hidden bg-gray-100">
                    <img 
                      src={event.nftImageUrl} 
                      alt="Event NFT" 
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
                
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-1">Requirements:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Must be registered for the event</li>
                      <li>One NFT per attendee</li>
                    </ul>
                  </div>

                  {!user?.walletAddress ? (
                    <Button disabled className="w-full">
                      Connect Wallet to Claim
                    </Button>
                  ) : !isRegistered ? (
                    <div>
                      <Button disabled className="w-full mb-2">
                        Not Registered
                      </Button>
                      <p className="text-xs text-center text-gray-500">
                        You must register for the event first
                      </p>
                    </div>
                  ) : claimedNFT ? (
                    <div className="text-center">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                      <p className="text-green-600 font-medium">NFT Claimed!</p>
                    </div>
                  ) : checkingClaims ? (
                    <Button disabled className="w-full">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Checking Status...
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleClaimNFT}
                      disabled={claiming}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {claiming ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Claiming NFT...
                        </>
                      ) : (
                        <>
                          <Ticket className="w-4 h-4 mr-2" />
                          Claim Event NFT
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* POAP Card */}
            <Card className={!hasAttended ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <Award className="h-8 w-8 text-purple-600" />
                  <Badge variant="secondary">POAP</Badge>
                </div>
                <CardTitle>Proof of Attendance</CardTitle>
                <CardDescription>
                  Badge for attendees who checked in at the event
                </CardDescription>
              </CardHeader>
              <CardContent>
                {event.poapImageUrl && (
                  <div className="mb-4 rounded-lg overflow-hidden bg-gray-100">
                    <img 
                      src={event.poapImageUrl} 
                      alt="POAP" 
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
                
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-1">Requirements:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Must have checked in at the event</li>
                      <li>Available after check-in during the event</li>
                    </ul>
                  </div>
                  
                  {/* Show info about when POAP can be claimed */}
                  {event.date && new Date(event.date + ' ' + (event.time || '')).getTime() > Date.now() && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-blue-700">
                        <strong>Note:</strong> POAPs will be available after you check in when the event starts on {event.date} at {event.time || 'start time'}.
                      </p>
                    </div>
                  )}

                  {!user?.walletAddress ? (
                    <Button disabled className="w-full">
                      Connect Wallet to Claim
                    </Button>
                  ) : !hasAttended ? (
                    <div>
                      <Button disabled className="w-full mb-2">
                        Attendance Not Verified
                      </Button>
                      <p className="text-xs text-center text-gray-500">
                        You must check in at the event first
                      </p>
                    </div>
                  ) : claimedPOAP ? (
                    <div className="text-center">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                      <p className="text-green-600 font-medium">POAP Claimed!</p>
                    </div>
                  ) : checkingClaims ? (
                    <Button disabled className="w-full">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Checking Status...
                    </Button>
                  ) : event.date && new Date(event.date + ' ' + (event.time || '')).getTime() > Date.now() ? (
                    <div>
                      <Button disabled className="w-full mb-2">
                        Event Not Started
                      </Button>
                      <p className="text-xs text-center text-gray-500">
                        POAPs available after event starts
                      </p>
                    </div>
                  ) : (
                    <Button 
                      onClick={handleClaimPOAP}
                      disabled={claiming}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {claiming ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Claiming POAP...
                        </>
                      ) : (
                        <>
                          <Award className="w-4 h-4 mr-2" />
                          Claim POAP
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Error Display */}
          {error && (
            <Card className="mt-6 border-red-200 bg-red-50">
              <CardContent className="py-4">
                <div className="flex items-center text-red-600">
                  <XCircle className="h-5 w-5 mr-2" />
                  <p>{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>About Event NFTs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm text-gray-600">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">🎫 Event NFT</h4>
                  <p>A commemorative NFT given to all registered attendees. This NFT serves as proof of your registration and can be kept as a digital collectible.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">🏅 POAP (Proof of Attendance Protocol)</h4>
                  <p>A special badge NFT that proves you actually attended the event. POAPs are only available to users who checked in during the event.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">💎 Benefits</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Build your on-chain event history</li>
                    <li>Unlock exclusive perks and access</li>
                    <li>Show your participation in the community</li>
                    <li>Trade or showcase in your collection</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}