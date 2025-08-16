'use client'

import { useState } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Camera, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { parseEventQRCode, isQRCodeValid } from '@/utils/qrCodeUtils'
import { useUser } from '@/context/UserContext'
import { useEnokiTransaction } from '@/hooks/useEnokiTransaction'
import { suilensService } from '@/lib/sui-client'
import { toast } from 'sonner'

interface QRScannerProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (eventId: string) => void
}

export default function QRScanner({ isOpen, onClose, onSuccess }: QRScannerProps) {
  const { user } = useUser()
  const { signAndExecuteTransaction } = useEnokiTransaction()
  const [scanning, setScanning] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<'success' | 'error' | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  if (!isOpen) return null

  const handleScan = async (result: any) => {
    if (!result || processing) return
    
    // Get the scanned text
    const scannedData = result[0]?.rawValue || result
    if (!scannedData) return
    
    console.log('Scanned QR code data:', scannedData)
    
    setProcessing(true)
    setScanning(false)
    
    try {
      // Parse the QR code data
      const qrData = parseEventQRCode(scannedData)
      
      if (!qrData) {
        console.error('Invalid QR code format. Expected format: suilens://checkin/{eventId}/{verificationCode}/{timestamp}')
        console.error('Received:', scannedData)
        throw new Error('Invalid QR code. This is not a SuiLens event check-in code.')
      }
      
      console.log('Parsed QR data:', qrData)
      
      // Validate QR code age (optional)
      if (!isQRCodeValid(qrData)) {
        console.error('QR code expired. Generated at:', new Date(qrData.timestamp))
        throw new Error('QR code has expired. Please ask the organizer for a new one.')
      }
      
      if (!user?.walletAddress) {
        console.error('No wallet connected')
        throw new Error('Please connect your wallet first')
      }
      
      console.log('Creating self check-in transaction for event:', qrData.eventId)
      console.log('Verification code:', qrData.verificationCode)
      console.log('User address:', user.walletAddress)
      
      // Create self check-in transaction (user signs their own transaction)
      const tx = await suilensService.selfCheckin(
        qrData.eventId,
        qrData.verificationCode
      )
      
      // Execute the transaction
      const result = await signAndExecuteTransaction(tx)
      console.log('Check-in transaction result:', result)
      
      setResult('success')
      toast.success('✅ Successfully checked in to the event!')
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(qrData.eventId)
      }
      
      // Close scanner after 2 seconds
      setTimeout(() => {
        onClose()
      }, 2000)
      
    } catch (error: any) {
      console.error('Error processing QR code:', error)
      setResult('error')
      
      // Provide specific error messages based on Move error codes
      let errorMsg = 'Failed to check in'
      
      if (error.message.includes('Invalid QR code')) {
        errorMsg = 'Wrong QR Code! Please scan a SuiLens event check-in QR code.'
        console.error('WRONG QR CODE SCANNED')
      } else if (error.message.includes('expired')) {
        errorMsg = 'This QR code has expired. Please ask the event organizer for a new one.'
      } else if (error.message.includes('wallet')) {
        errorMsg = 'Please connect your wallet first.'
      } else if (error.message.includes('MoveAbort')) {
        // Parse Move error codes
        if (error.message.includes(', 14)')) {
          errorMsg = 'Event has not started yet. Check-in is only available during the event.'
          console.error('EVENT NOT STARTED: Cannot check in before event start time')
        } else if (error.message.includes(', 15)')) {
          errorMsg = 'Event has already ended. Check-in is no longer available.'
          console.error('EVENT ENDED: Cannot check in after event end time')
        } else if (error.message.includes(', 8)')) {
          errorMsg = 'You are not registered for this event. Please register first.'
          console.error('NOT REGISTERED: User must register before checking in')
        } else if (error.message.includes(', 16)')) {
          errorMsg = 'You have already checked in to this event.'
          console.error('ALREADY CHECKED IN: User has already been marked as attended')
        } else if (error.message.includes(', 17)')) {
          errorMsg = 'Invalid verification code. Please use the correct QR code for this event.'
          console.error('INVALID TICKET: Verification code does not match')
        } else {
          errorMsg = 'Check-in failed. Please try again or contact the event organizer.'
        }
      } else {
        errorMsg = error.message || 'Failed to check in'
      }
      
      setErrorMessage(errorMsg)
      toast.error(errorMsg)
      
      // Allow retry after 3 seconds
      setTimeout(() => {
        setResult(null)
        setScanning(true)
        setProcessing(false)
        setErrorMessage('')
      }, 3000)
    }
  }

  const handleError = (error: any) => {
    console.error('Scanner error:', error)
    toast.error('Camera error. Please check permissions.')
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-2 top-2"
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scan Event QR Code
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Scanner Area */}
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {scanning && !processing && (
                <>
                  <Scanner
                    onScan={handleScan}
                    onError={handleError}
                    constraints={{
                      facingMode: 'environment'
                    }}
                    styles={{
                      container: {
                        width: '100%',
                        height: '100%',
                      }
                    }}
                  />
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-4 border-2 border-blue-500 rounded-lg">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />
                    </div>
                  </div>
                </>
              )}
              
              {processing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                  <p className="text-gray-600">Processing check-in...</p>
                </div>
              )}
              
              {result === 'success' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-50">
                  <CheckCircle className="h-16 w-16 text-green-600 mb-4" />
                  <p className="text-lg font-semibold text-green-600">Check-in Successful!</p>
                  <p className="text-sm text-gray-600 mt-2">You can now claim your POAP</p>
                </div>
              )}
              
              {result === 'error' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50">
                  <XCircle className="h-16 w-16 text-red-600 mb-4" />
                  <p className="text-lg font-semibold text-red-600">Check-in Failed</p>
                  <p className="text-sm text-gray-600 mt-2 px-4 text-center">{errorMessage}</p>
                  <p className="text-xs text-gray-500 mt-4">Retrying in 3 seconds...</p>
                </div>
              )}
            </div>
            
            {/* Instructions */}
            {scanning && !processing && (
              <div className="text-center text-sm text-gray-600">
                <p>Position the QR code within the frame</p>
                <p className="mt-1">The scanner will automatically detect it</p>
              </div>
            )}
            
            {/* Manual Entry Option */}
            {!processing && !result && (
              <Button
                variant="outline"
                onClick={() => {
                  toast.info('Manual entry coming soon')
                }}
                className="w-full"
              >
                Enter Code Manually
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}