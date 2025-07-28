'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Check, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCurrentAccount, ConnectButton, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { mintPOAP } from '@/lib/sui-client'
import { useEventContext } from '@/context/EventContext'
import { useUser } from '@/context/UserContext'

interface ClaimPOAPPageProps {
  params: { id: string }
}

export default function ClaimPOAPPage({ params }: ClaimPOAPPageProps) {
  const [claiming, setClaiming] = useState(false)
  const [claimed, setClaimed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [eventData, setEventData] = useState<any>(null)

  const currentAccount = useCurrentAccount()
  const signAndExecuteTransaction = useSignAndExecuteTransaction()

  const { getEvent } = useEventContext()
  const { user } = useUser()

  useEffect(() => {
    // Get event data from EventContext by ID
    const event = getEvent(params.id)
    if (event) {
      setEventData(event)
    } else {
      setError('Event not found')
    }
  }, [params.id, getEvent])

  const { markAttendance } = useEventContext()

  const handleCheckInAndClaim = async () => {
    if (!currentAccount) {
      alert('Please connect your wallet first')
      return
    }

    if (!eventData) {
      setError('Event data not available')
      return
    }

    setClaiming(true)
    setError(null)

    try {
      // Mark attendance first
      markAttendance(params.id, currentAccount.address)

      // Then mint POAP
      const txb = await mintPOAP(
        params.id,
        eventData.title || 'Event Attendance POAP',
        eventData.poapTemplate || '',
        JSON.stringify({ eventId: params.id, claimedAt: new Date().toISOString() }),
        currentAccount.address
      )

      const result = await signAndExecuteTransaction.mutateAsync({
        transaction: txb,
      })

      console.log('Mint POAP transaction result:', result)
      setClaimed(true)
    } catch (error) {
      console.error('Error claiming POAP:', error)
      setError('Failed to claim POAP. Please try again.')
    } finally {
      setClaiming(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <Image 
                src="https://i.ibb.co/PZHSkCVG/Suilens-Logo-Mark-Suilens-Black.png" 
                alt="Suilens Logo" 
                width={60}
                height={60}
                className="object-contain"
              />
            </div>
            <span className="text-2xl font-bold text-[#020B15]">Suilens</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Claim Your POAP
            </h1>
            <p className="text-gray-600 text-lg">
              Claim your Proof of Attendance Protocol NFT for attending this event
            </p>
          </div>

          {eventData && (
            <div className="bg-white rounded-xl shadow-lg border p-8 mb-8">
              <div className="mb-6">
                <img 
                  src={eventData.poapTemplate || 'https://via.placeholder.com/300x300?text=Event+POAP'} 
                  alt="Event POAP"
                  className="w-48 h-48 mx-auto rounded-lg object-cover"
                />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {eventData.title}
              </h2>
              <p className="text-gray-600 mb-6">
                {eventData.description}
              </p>

              {!currentAccount ? (
                <ConnectButton />
              ) : !claimed ? (
                <div>
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700 text-sm">
                      Wallet connected: {currentAccount?.address.slice(0, 6)}...{currentAccount?.address.slice(-4)}
                    </p>
                  </div>
                  <Button
                    onClick={handleCheckInAndClaim}
                    disabled={claiming}
                    className="bg-[#4DA2FF] hover:bg-blue-500 transition-colors text-white px-8 py-3 rounded-xl text-lg disabled:opacity-50"
                  >
                    {claiming ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Claiming POAP...
                      </>
                    ) : (
                      'Check In & Claim POAP'
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="mb-4">
                    <Check className="w-16 h-16 mx-auto text-green-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-green-600 mb-2">
                    POAP Claimed Successfully!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Your POAP NFT has been minted and transferred to your wallet.
                  </p>
                  <Link href="/dashboard">
                    <Button className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg">
                      View in Dashboard
                    </Button>
                  </Link>
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
            </div>
          )}

          <div className="text-center text-gray-500 text-sm">
            <p>
              Need help? <Link href="/support" className="text-blue-600 hover:underline">Contact Support</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
