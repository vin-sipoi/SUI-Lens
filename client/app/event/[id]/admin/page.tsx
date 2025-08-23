'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useUser } from '@/context/UserContext'
import { useEventContext } from '@/context/EventContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  ArrowLeft,
  Users,
  DollarSign,
  QrCode,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Calendar,
  MapPin,
  Ticket,
  Award,
  Settings,
  Loader2,
  Copy,
  UserCheck,
  UserX,
  RefreshCw,
  Wallet,
  Plus,
  Image
} from 'lucide-react'
import Link from 'next/link'
import { useEnokiTransaction } from '@/hooks/useEnokiTransaction'
import { suilensService } from '@/lib/sui-client'
import { toast } from 'sonner'
import Header from '@/app/components/Header'
import { generateEventQRCode, downloadQRCode } from '@/utils/qrCodeUtils'
import { formatAddress } from '@/lib/utils'

interface AttendeeData {
  address: string
  registeredAt?: string
  checkedIn: boolean
  checkedInAt?: string
}

export default function EventAdminPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string
  const { user } = useUser()
  const { getEvent, updateEvent, fetchEvents } = useEventContext()
  const { signAndExecuteTransaction } = useEnokiTransaction()
  
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [eventQRCode, setEventQRCode] = useState<string | null>(null)
  const [generatingQR, setGeneratingQR] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)
  const [markingAttendance, setMarkingAttendance] = useState<string | null>(null)
  const [attendeeList, setAttendeeList] = useState<AttendeeData[]>([])
  const [poapCollection, setPoapCollection] = useState<any>(null)
  const [checkingPoapStatus, setCheckingPoapStatus] = useState(false)
  const [creatingPoap, setCreatingPoap] = useState(false)
  const [poapFormData, setPoapFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    maxSupply: ''
  })

  useEffect(() => {
    const loadEvent = async () => {
      setLoading(true)
      let eventData = getEvent(eventId)
      
      if (!eventData) {
        await fetchEvents()
        eventData = getEvent(eventId)
      }
      
      if (eventData) {
        setEvent(eventData)
        
        // Process attendee data with proper check-in status
        console.log('Event RSVPs:', eventData.rsvps)
        console.log('Event Attendance:', eventData.attendance)
        
        const attendees: AttendeeData[] = (eventData.rsvps || []).map((address: string) => ({
          address,
          registeredAt: new Date().toISOString(), // TODO: Get actual registration time from blockchain
          checkedIn: eventData.attendance?.includes(address) || false,
          checkedInAt: eventData.attendance?.includes(address) ? new Date().toISOString() : undefined
        }))
        
        console.log('Processed attendee list:', attendees)
        setAttendeeList(attendees)
        
        // Set default POAP form data based on event
        setPoapFormData({
          name: `${eventData.title} POAP`,
          description: `Proof of attendance for ${eventData.title}`,
          imageUrl: eventData.poapImageUrl || '',
          maxSupply: ''
        })
      }
      setLoading(false)
    }
    
    loadEvent()
  }, [eventId, getEvent, fetchEvents])
  
  // Check if POAP collection exists for this event
  useEffect(() => {
    const checkPoapCollection = async () => {
      if (!eventId) return
      
      setCheckingPoapStatus(true)
      try {
        // For now, we always assume no collection exists initially
        // The collection will only exist after it's been created via createPOAPCollection
        // We store this in localStorage as a temporary solution
        const poapKey = `poap_collection_${eventId}`
        const hasCollection = localStorage.getItem(poapKey) === 'true'
        setPoapCollection(hasCollection ? { exists: true } : null)
      } catch (error) {
        console.error('Error checking POAP collection:', error)
      } finally {
        setCheckingPoapStatus(false)
      }
    }
    
    if (event) {
      checkPoapCollection()
    }
  }, [event, eventId])

  // Check if user is the event creator
  const isEventCreator = event?.creator === user?.walletAddress

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
              <Link href="/dashboard">
                <Button>Back to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!isEventCreator) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-12 text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-gray-600 mb-4">You don't have permission to manage this event.</p>
              <Link href={`/event/${eventId}`}>
                <Button>View Event Page</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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

  const handleMarkAttendance = async (attendeeAddress: string) => {
    setMarkingAttendance(attendeeAddress)
    try {
      const tx = await suilensService.markAttendance(eventId, attendeeAddress)
      const result = await signAndExecuteTransaction(tx)
      console.log('Attendance marked:', result)
      
      // Update local state
      const updatedAttendance = [...(event.attendance || []), attendeeAddress]
      updateEvent(eventId, { attendance: updatedAttendance })
      setEvent({ ...event, attendance: updatedAttendance })
      
      // Update attendee list
      setAttendeeList(prev => prev.map(a => 
        a.address === attendeeAddress 
          ? { ...a, checkedIn: true, checkedInAt: new Date().toISOString() }
          : a
      ))
      
      toast.success('Attendance marked successfully!')
    } catch (error: any) {
      console.error('Error marking attendance:', error)
      toast.error(error.message || 'Failed to mark attendance')
    } finally {
      setMarkingAttendance(null)
    }
  }

  const handleCreatePoapCollection = async () => {
    if (!poapFormData.name || !poapFormData.description || !poapFormData.imageUrl) {
      toast.error('Please fill in all required fields')
      return
    }
    
    setCreatingPoap(true)
    try {
      const tx = await suilensService.createPOAPCollection(eventId, {
        name: poapFormData.name,
        description: poapFormData.description,
        imageUrl: poapFormData.imageUrl,
        maxSupply: poapFormData.maxSupply ? parseInt(poapFormData.maxSupply) : undefined
      })
      
      const result = await signAndExecuteTransaction(tx)
      console.log('POAP collection created:', result)
      
      // Mark collection as created in localStorage
      const poapKey = `poap_collection_${eventId}`
      localStorage.setItem(poapKey, 'true')
      
      setPoapCollection({ exists: true })
      toast.success('POAP collection created successfully! Attendees can now claim their POAPs.')
    } catch (error: any) {
      console.error('Error creating POAP collection:', error)
      toast.error(error.message || 'Failed to create POAP collection')
    } finally {
      setCreatingPoap(false)
    }
  }
  
  const handleWithdrawFunds = async () => {
    setWithdrawing(true)
    try {
      const tx = await suilensService.withdrawEventFunds(eventId)
      const result = await signAndExecuteTransaction(tx)
      console.log('Funds withdrawn:', result)
      toast.success('Event funds withdrawn successfully!')
    } catch (error: any) {
      console.error('Error withdrawing funds:', error)
      toast.error(error.message || 'Failed to withdraw funds')
    } finally {
      setWithdrawing(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  // Calculate statistics
  const stats = {
    totalRegistered: event.rsvps?.length || 0,
    totalAttended: event.attendance?.length || 0,
    attendanceRate: event.rsvps?.length ? 
      Math.round(((event.attendance?.length || 0) / event.rsvps.length) * 100) : 0,
    totalRevenue: (event.rsvps?.length || 0) * parseFloat(event.ticketPrice || '0'),
    spotsRemaining: event.capacity ? 
      parseInt(event.capacity) - (event.rsvps?.length || 0) : 'Unlimited'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Event Admin Panel</h1>
              <p className="text-gray-600 mt-1">{event.title}</p>
            </div>
            <Link href={`/event/${eventId}`}>
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                View Public Page
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Registered</p>
                  <p className="text-2xl font-bold">{stats.totalRegistered}</p>
                  {event.capacity && (
                    <p className="text-xs text-gray-500">of {event.capacity}</p>
                  )}
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Attended</p>
                  <p className="text-2xl font-bold">{stats.totalAttended}</p>
                  <p className="text-xs text-gray-500">{stats.attendanceRate}% rate</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold">
                    {event.isFree ? 'Free' : `$${stats.totalRevenue}`}
                  </p>
                  {!event.isFree && (
                    <p className="text-xs text-gray-500">${event.ticketPrice} per ticket</p>
                  )}
                </div>
                <DollarSign className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Spots Left</p>
                  <p className="text-2xl font-bold">{stats.spotsRemaining}</p>
                  <p className="text-xs text-gray-500">
                    {stats.spotsRemaining === 'Unlimited' ? 'No limit' : 'Available'}
                  </p>
                </div>
                <Ticket className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="attendees">Attendees</TabsTrigger>
            <TabsTrigger value="checkin">Check-in</TabsTrigger>
            <TabsTrigger value="poap">POAP</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Date & Time</p>
                    <p className="font-medium">{event.date} at {event.time}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium">{event.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <Badge>{event.category || 'General'}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge variant="outline" className="bg-green-50">
                      Active
                    </Badge>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">Event ID</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-gray-100 p-2 rounded flex-1 truncate">
                      {eventId}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(eventId)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" onClick={() => setActiveTab('attendees')}>
                  <Users className="w-4 h-4 mr-2" />
                  View Attendee List
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('checkin')}>
                  <QrCode className="w-4 h-4 mr-2" />
                  Generate QR Code
                </Button>
                <Button variant="outline" onClick={() => router.push(`/event/${eventId}/edit`)}>
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Event
                </Button>
                {!event.isFree && stats.totalRevenue > 0 && (
                  <Button variant="outline" onClick={() => setActiveTab('financials')}>
                    <Wallet className="w-4 h-4 mr-2" />
                    Withdraw Funds
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendees Tab */}
          <TabsContent value="attendees" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Registered Attendees</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {attendeeList.length} registered • {attendeeList.filter(a => a.checkedIn).length} checked in
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={async () => {
                        setLoading(true)
                        await fetchEvents()
                        const updatedEvent = getEvent(eventId)
                        if (updatedEvent) {
                          setEvent(updatedEvent)
                          const attendees: AttendeeData[] = (updatedEvent.rsvps || []).map((address: string) => ({
                            address,
                            registeredAt: new Date().toISOString(),
                            checkedIn: updatedEvent.attendance?.includes(address) || false,
                            checkedInAt: updatedEvent.attendance?.includes(address) ? new Date().toISOString() : undefined
                          }))
                          setAttendeeList(attendees)
                        }
                        setLoading(false)
                        toast.success('Attendee list refreshed')
                      }}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {attendeeList.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No attendees registered yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Wallet Address</TableHead>
                          <TableHead>Registration</TableHead>
                          <TableHead>Check-in Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attendeeList.map((attendee) => (
                          <TableRow key={attendee.address}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <code className="text-xs">{formatAddress(attendee.address)}</code>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(attendee.address)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(attendee.registeredAt || '').toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {attendee.checkedIn ? (
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Checked In
                                </Badge>
                              ) : (
                                <Badge variant="outline">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Not Checked In
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {!attendee.checkedIn && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleMarkAttendance(attendee.address)}
                                  disabled={markingAttendance === attendee.address}
                                >
                                  {markingAttendance === attendee.address ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <>
                                      <UserCheck className="w-3 h-3 mr-1" />
                                      Mark Present
                                    </>
                                  )}
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Check-in Tab */}
          <TabsContent value="checkin" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Check-in QR Code</CardTitle>
                <CardDescription>
                  Generate and download a QR code for attendees to scan at your event
                </CardDescription>
              </CardHeader>
              <CardContent>
                {eventQRCode ? (
                  <div className="space-y-6">
                    <div className="bg-white p-8 rounded-lg border flex justify-center">
                      <img 
                        src={eventQRCode} 
                        alt="Event Check-in QR Code"
                        className="w-64 h-64"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button onClick={handleDownloadQRCode} className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Download QR Code
                      </Button>
                      <Button 
                        onClick={handleGenerateQRCode}
                        variant="outline"
                        disabled={generatingQR}
                        className="w-full"
                      >
                        {generatingQR ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Regenerating...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Regenerate QR Code
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">How to use:</h4>
                      <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                        <li>Download and print this QR code</li>
                        <li>Display it prominently at your event venue</li>
                        <li>Attendees scan it using the SuiLens app to check in</li>
                        <li>Once checked in, they can claim their POAP after the event</li>
                      </ol>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <QrCode className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-6">No QR code generated yet</p>
                    <Button 
                      onClick={handleGenerateQRCode}
                      disabled={generatingQR}
                      size="lg"
                    >
                      {generatingQR ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <QrCode className="w-4 h-4 mr-2" />
                          Generate Check-in QR Code
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manual Check-in</CardTitle>
                <CardDescription>
                  Manually mark attendees as present if they can't scan the QR code
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline"
                  onClick={() => setActiveTab('attendees')}
                  className="w-full"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Go to Attendee List
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* POAP Tab */}
          <TabsContent value="poap" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center gap-2">
                    <Award className="h-6 w-6 text-purple-600" />
                    POAP Collection Management
                  </div>
                </CardTitle>
                <CardDescription>
                  Create and manage Proof of Attendance Protocol badges for your event
                </CardDescription>
              </CardHeader>
              <CardContent>
                {checkingPoapStatus ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                  </div>
                ) : poapCollection?.exists ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-green-900">POAP Collection Active</h4>
                          <p className="text-sm text-green-700 mt-1">
                            Your POAP collection is set up. Attendees who check in can now claim their POAPs.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {poapFormData.imageUrl && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">POAP Badge Design:</p>
                        <img 
                          src={poapFormData.imageUrl} 
                          alt="POAP Badge"
                          className="w-32 h-32 rounded-lg object-cover border"
                        />
                      </div>
                    )}
                    
                    <div className="bg-purple-50 p-4 rounded-lg mt-4">
                      <h4 className="font-medium text-purple-900 mb-2">How POAPs Work:</h4>
                      <ol className="text-sm text-purple-800 space-y-1 list-decimal list-inside">
                        <li>Attendees must check in at your event</li>
                        <li>After checking in, they can claim their POAP</li>
                        <li>Each attendee can only claim one POAP per event</li>
                        <li>POAPs serve as permanent proof of attendance on the blockchain</li>
                      </ol>
                    </div>
                    
                    {/* Add option to recreate if there's an issue */}
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-600 mb-2">Having issues with POAP claiming?</p>
                      <Button 
                        onClick={() => {
                          // Clear the collection status and allow recreation
                          const poapKey = `poap_collection_${eventId}`
                          localStorage.removeItem(poapKey)
                          setPoapCollection(null)
                          toast.info('You can now recreate the POAP collection')
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Reset POAP Collection
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Award className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-amber-900">No POAP Collection Yet</h4>
                          <p className="text-sm text-amber-700 mt-1">
                            Create a POAP collection to enable attendees to claim proof of attendance badges.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="poap-name">POAP Name *</Label>
                        <Input
                          id="poap-name"
                          value={poapFormData.name}
                          onChange={(e) => setPoapFormData({ ...poapFormData, name: e.target.value })}
                          placeholder="e.g., DevCon 2024 POAP"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="poap-description">Description *</Label>
                        <Textarea
                          id="poap-description"
                          value={poapFormData.description}
                          onChange={(e) => setPoapFormData({ ...poapFormData, description: e.target.value })}
                          placeholder="Describe what this POAP represents..."
                          className="mt-1"
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="poap-image">Badge Image URL *</Label>
                        <Input
                          id="poap-image"
                          value={poapFormData.imageUrl}
                          onChange={(e) => setPoapFormData({ ...poapFormData, imageUrl: e.target.value })}
                          placeholder="https://example.com/poap-badge.png"
                          className="mt-1"
                        />
                        {poapFormData.imageUrl && (
                          <div className="mt-2">
                            <img 
                              src={poapFormData.imageUrl} 
                              alt="POAP Preview"
                              className="w-24 h-24 rounded-lg object-cover border"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none'
                              }}
                            />
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="poap-supply">Max Supply (Optional)</Label>
                        <Input
                          id="poap-supply"
                          type="number"
                          value={poapFormData.maxSupply}
                          onChange={(e) => setPoapFormData({ ...poapFormData, maxSupply: e.target.value })}
                          placeholder="Leave empty for unlimited"
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Limit the number of POAPs that can be claimed. Leave empty for unlimited.
                        </p>
                      </div>
                      
                      <Button 
                        onClick={handleCreatePoapCollection}
                        disabled={creatingPoap || !poapFormData.name || !poapFormData.description || !poapFormData.imageUrl}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                      >
                        {creatingPoap ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating POAP Collection...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Create POAP Collection
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">What are POAPs?</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        POAPs (Proof of Attendance Protocol) are special NFT badges that prove someone attended your event.
                        They're valuable digital collectibles that attendees can keep forever.
                      </p>
                      <h4 className="font-medium text-gray-900 mb-2">Benefits:</h4>
                      <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                        <li>Increase attendee engagement and retention</li>
                        <li>Create lasting memories for your community</li>
                        <li>Build on-chain reputation for attendees</li>
                        <li>Enable future token-gated experiences</li>
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financials Tab */}
          <TabsContent value="financials" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Ticket Price</p>
                    <p className="text-2xl font-bold">
                      {event.isFree ? 'Free' : `$${event.ticketPrice}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${stats.totalRevenue}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tickets Sold</p>
                    <p className="text-2xl font-bold">{stats.totalRegistered}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Platform Fee (5%)</p>
                    <p className="text-2xl font-bold">
                      ${(stats.totalRevenue * 0.05).toFixed(2)}
                    </p>
                  </div>
                </div>

                {!event.isFree && stats.totalRevenue > 0 && (
                  <div className="pt-6 border-t">
                    <div className="bg-green-50 p-4 rounded-lg mb-4">
                      <h4 className="font-medium text-green-900 mb-2">Available for Withdrawal</h4>
                      <p className="text-3xl font-bold text-green-600">
                        ${(stats.totalRevenue * 0.95).toFixed(2)}
                      </p>
                      <p className="text-sm text-green-700 mt-1">After 5% platform fee</p>
                    </div>

                    <Button 
                      onClick={handleWithdrawFunds}
                      disabled={withdrawing}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {withdrawing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing Withdrawal...
                        </>
                      ) : (
                        <>
                          <Wallet className="w-4 h-4 mr-2" />
                          Withdraw Funds to Wallet
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Funds will be sent to your connected wallet address
                    </p>
                  </div>
                )}

                {event.isFree && (
                  <div className="bg-gray-50 p-6 rounded-lg text-center">
                    <p className="text-gray-600">This is a free event with no revenue</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}