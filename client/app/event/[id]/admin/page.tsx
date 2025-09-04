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
  CalendarDays,
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
  Image,
  ChartColumnBig,
  AlertTriangle,
  Mail
} from 'lucide-react'
import Link from 'next/link'
import { useEnokiTransaction } from '@/hooks/useEnokiTransaction'
import { suilensService } from '@/lib/sui-client'
import { toast } from 'sonner'
import Header from '@/app/components/Header'
import { generateEventQRCode, downloadQRCode } from '@/utils/qrCodeUtils'
import { formatAddress } from '@/lib/utils'
import Sidebar from '@/components/Sidebar'

interface AttendeeData {
  address: string
  registeredAt?: string
  checkedIn: boolean
  checkedInAt?: string
}

export default function EventAdminPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params?.id as string
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
  const [guestList, setGuestList] = useState<any[]>([])
  const [fetchingGuests, setFetchingGuests] = useState(false)
  const [poapCollection, setPoapCollection] = useState<any>(null)
  const [checkingPoapStatus, setCheckingPoapStatus] = useState(false)
  const [creatingPoap, setCreatingPoap] = useState(false)
  const [poapFormData, setPoapFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    maxSupply: ''
  })
  const [emailBlastData, setEmailBlastData] = useState({
    subject: '',
    content: ''
  })
  const [sendingBlast, setSendingBlast] = useState(false)

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
      if (!eventId || !event) return
      
      setCheckingPoapStatus(true)
      try {
        // Check multiple sources for POAP existence:
        // 1. Event data from creation (if POAP was uploaded during event creation)
        // 2. LocalStorage (if POAP was created after event creation)
        // 3. Any other POAP-related fields in the event object
        
        const poapKey = `poap_collection_${eventId}`
        const hasLocalCollection = localStorage.getItem(poapKey) === 'true'
        
        // Check if event has POAP data from creation
        const hasEventPoapData = !!(
          event.poapImageUrl || 
          event.poapName || 
          event.poapDescription ||
          event.poap_image ||
          event.poap_collection_id ||
          event.hasPoapCollection
        )
        
        console.log('POAP Check:', {
          hasLocalCollection,
          hasEventPoapData,
          poapImageUrl: event.poapImageUrl,
          poapName: event.poapName,
          eventKeys: Object.keys(event)
        })
        
        if (hasLocalCollection || hasEventPoapData) {
          setPoapCollection({ exists: true })
          
          // If we have event POAP data, update the form with it
          if (hasEventPoapData && !poapFormData.imageUrl) {
            setPoapFormData(prev => ({
              ...prev,
              name: event.poapName || prev.name,
              description: event.poapDescription || prev.description,
              imageUrl: event.poapImageUrl || event.poap_image || prev.imageUrl
            }))
          }
        } else {
          setPoapCollection(null)
        }
      } catch (error) {
        console.error('Error checking POAP collection:', error)
        setPoapCollection(null)
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

  const handleFetchGuests = async () => {
    setFetchingGuests(true)
    try {
      const response = await fetch(`http://localhost:3009/api/registrations/event/${eventId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch guest list')
      }
      const data = await response.json()
      if (data.success) {
        setGuestList(data.data)
        toast.success(`Fetched ${data.data.length} registrants`)
      } else {
        throw new Error(data.message || 'Failed to fetch guest list')
      }
    } catch (error: any) {
      console.error('Error fetching guests:', error)
      toast.error(error.message || 'Failed to fetch guest list')
    } finally {
      setFetchingGuests(false)
    }
  }

  const handleSendEmailBlast = async () => {
    if (!emailBlastData.subject || !emailBlastData.content) {
      toast.error('Please fill in both subject and content')
      return
    }

    setSendingBlast(true)
    try {
      const response = await fetch('http://localhost:3009/api/registrations/email-blast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          subject: emailBlastData.subject,
          content: emailBlastData.content,
          userId: user?.id || null
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
        setEmailBlastData({ subject: '', content: '' })
      } else {
        throw new Error(data.message || 'Failed to send email blast')
      }
    } catch (error: any) {
      console.error('Error sending email blast:', error)
      toast.error(error.message || 'Failed to send email blast')
    } finally {
      setSendingBlast(false)
    }
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className='flex items-center'>
        <img className='ml-4' src="/suilenslogo.png" alt="" width={50} height={50}/>
        <p className='text-[#04101D] font-normal'>Suilens</p>
      </div>
     
      <div className="flex flex-1 mt-1">
        <div className='mt-14'>
          <Sidebar 
            activeSection={activeTab} 
            onSectionChange={setActiveTab} 
          />
        </div>
       
        <main className="flex-1 overflow-auto">
          <div className=" mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-6">
              <div className='flex flex-row gap-2 font-medium text-sm mb-5'>
              <Link href="/dashboard" className="inline-flex items-center text-[#667185] hover:text-gray-900 mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Link>
              <p className='text-[#667185]'>Dashboard / <span className='text-gray-900 font-medium'> Manage event</span></p>

              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-semibold text-[#101928]">Event Admin Panel</h1>
                  <p className="text-gray-600 mt-1">{event.title}</p>
                </div>
                
              </div>
            </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="attendees">Attendees</TabsTrigger>
            <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
            <TabsTrigger value="poap">POAP</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="container space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className='border-[#E4E7EC]'>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <ChartColumnBig className='text-[#101928] mb-10 w-5 h-5'/>
                      <p className="text-sm font-medium text-[#667185]">Total Registered</p>
                      <p className="pt-2 text-lg font-semibold text-[#101928]">{stats.totalRegistered}</p>
                    </div>
                    
                  </div>
                  
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <CheckCircle className='text-[#101928] mb-10 w-5 h-5'/>
                      <p className="text-sm font-medium text-[#667185]">Checked In</p>
                      <p className="pt-2 text-lg font-semibold text-[#101928]">{stats.totalAttended}</p>
                    </div>
                    
                  </div>
                  
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <DollarSign className='text-[#101928] mb-10 w-5 h-5'/>
                      <p className="text-sm font-medium text-[#667185]">Revenue</p>
                      <p className="pt-2 text-lg font-semibold text-[#101928]">
                        {event.isFree ? 'Free' : `$${stats.totalRevenue}`}
                      </p>
                    </div>
                    
                  </div>
                  
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className=''>
                      <img src="/spots-left.png" alt="" width={22} height={14} className='mb-10'/>
                      <p className="text-sm font-medium text-[#667185]">Spots Left</p>
                      <p className="pt-2 text-lg font-semibold text-[#101928]">
                        {typeof stats.spotsRemaining === 'number' ? stats.spotsRemaining : '∞'}
                      </p>
                    </div>
                    
                  </div>
                  
                </CardContent>
              </Card>
            </div>

            {/* Event Detail */}
            <div className="bg-white p-6 mt-7">
              <h2 className="text-2xl font-bold text-[#101928] my-4">{event.title}</h2>
              <div className="flex flex-wrap gap-4 text-sm text-[#667185] mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{event.date ? new Date(event.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : '8th August, 2025'}</span>
                </div>
                <span>|</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{event.date ? new Date(event.date).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                  }) : '10:00AM'}</span>
                </div>
                <span>|</span>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location || 'Lagos, Nigeria'}</span>
                </div>
              </div>
              
              <div className="border-t pt-4 mt-10">
                <h3 className="text-xl font-semibold text-[#101928] mb-3">About this event</h3>
                <p className="text-[#667185] leading-relaxed">
                  {event.description || 'Lorem ipsum dolor sit amet consectetur. Imperdiet facilisis nibh sed facilisi velit congue curabitur. Id feugiat rhoncus risus egestas. Lorem ipsum dolor sit amet consectetur. Imperdiet facilisis nibh sed facilisi velit congue curabitur. Id'}
                </p>
              </div>
            </div>

          </TabsContent>

          {/* Attendees Tab */}
          <TabsContent value="attendees" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className='flex flex-row gap-2'>
                    <CardTitle>Registered Attendees</CardTitle>
                    <p className="bg-blue-400 px-2 border rounded-full text-sm text-gray-500 mt-1">
                      {attendeeList.filter(a => a.checkedIn).length} 
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFetchGuests}
                      disabled={fetchingGuests}
                    >
                      {fetchingGuests ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Users className="w-4 h-4 mr-2" />
                      )}
                      Guest
                    </Button>
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

            {/* Guest List from Database */}
            {guestList.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className='flex flex-row gap-2'>
                      <CardTitle>Guest Registrants</CardTitle>
                      <p className="bg-green-400 px-2 border rounded-full text-sm text-white mt-1">
                        {guestList.length}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Registration Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {guestList.map((guest: any) => (
                          <TableRow key={guest.id}>
                            <TableCell>
                              <div className="font-medium text-gray-900">
                                {guest.name}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-gray-600">
                                {guest.email}
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(guest.created_at || guest.registeredAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Broadcast Tab */}
          <TabsContent value="broadcast" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Send Email Blast</CardTitle>
                <CardDescription>
                  Send an email to all registered attendees for this event
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email-subject" className="text-sm font-medium text-gray-700">
                    Subject *
                  </Label>
                  <Input
                    id="email-subject"
                    value={emailBlastData.subject}
                    onChange={(e) => setEmailBlastData({ ...emailBlastData, subject: e.target.value })}
                    placeholder="Enter email subject"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email-content" className="text-sm font-medium text-gray-700">
                    Content *
                  </Label>
                  <Textarea
                    id="email-content"
                    value={emailBlastData.content}
                    onChange={(e) => setEmailBlastData({ ...emailBlastData, content: e.target.value })}
                    placeholder="Enter email content (HTML supported)"
                    className="mt-1"
                    rows={8}
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-gray-600">
                    {guestList.length > 0 ? (
                      <span>This will be sent to {guestList.length} registered attendees</span>
                    ) : (
                      <span>Recipients will be determined from registered attendees</span>
                    )}
                  </div>
                  <Button
                    onClick={handleSendEmailBlast}
                    disabled={sendingBlast || !emailBlastData.subject || !emailBlastData.content}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {sendingBlast ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Send Email Blast
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* POAP Tab */}
          <TabsContent value="poap" className="space-y-6">
            {checkingPoapStatus ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            ) : poapCollection?.exists ? (
              <div className="space-y-6">
                {/* Active State - POAP Collection Active Banner */}
                <div className="bg-green-50 border-l-4 border-green-500 p-4 flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-green-900">POAP Collection Active</h4>
                      <p className="text-sm text-green-700 mt-1">
                        {event.poapImageUrl || event.poap_image ? 
                          'Your POAP collection is set up. Attendees who check in can now claim their POAPs.' :
                          'POAP collection created successfully. Attendees who check in can now claim their POAPs.'
                        }
                      </p>
                    </div>
                  </div>
                  <button className="text-green-600 hover:text-green-800">
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
                
                {/* POAP Badge Design Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">POAP Badge Design</h3>
                  <div className="w-[160px] h-[160px]">
                    <img 
                      src={poapFormData.imageUrl || event.poapImageUrl || event.poap_image || "/download (2) 1.png"}
                      alt="POAP Badge Design"
                      className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
                      onError={(e) => {
                        // Fallback to default image if the POAP image fails to load
                        (e.target as HTMLImageElement).src = "/download (2) 1.png"
                      }}
                    />
                  </div>
                  {(poapFormData.name || event.poapName) && (
                    <div className="mt-3">
                      <p className="font-medium text-gray-900">{poapFormData.name || event.poapName}</p>
                      {(poapFormData.description || event.poapDescription) && (
                        <p className="text-sm text-gray-600 mt-1">{poapFormData.description || event.poapDescription}</p>
                      )}
                    </div>
                  )}
                </div>
                
                {/* How POAPs Work Section */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">i</span>
                    </div>
                    <h4 className="font-medium text-blue-900">How POAPs Work</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-5 h-5 bg-blue-500 text-white text-xs font-bold rounded-full flex-shrink-0 mt-0.5">1</span>
                      <p className="text-sm text-blue-800">Attendees must check in to claim their POAP</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-5 h-5 bg-blue-500 text-white text-xs font-bold rounded-full flex-shrink-0 mt-0.5">2</span>
                      <p className="text-sm text-blue-800">Each person can claim only one per event</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-5 h-5 bg-blue-500 text-white text-xs font-bold rounded-full flex-shrink-0 mt-0.5">3</span>
                      <p className="text-sm text-blue-800">POAPs are permanent proof of attendance on the blockchain</p>
                    </div>
                  </div>
                </div>
                
                {/* Troubleshooting Section */}
                <div>
                  <p className="text-sm text-gray-700 mb-3">Having issues with POAP claiming?</p>
                  <Button 
                    onClick={() => {
                      const poapKey = `poap_collection_${eventId}`
                      localStorage.removeItem(poapKey)
                      setPoapCollection(null)
                      toast.info('You can now recreate the POAP collection')
                    }}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Reset POAP
                  </Button>
                </div>
              </div>
            ) : creatingPoap ? (
              <div className="space-y-6">
                {/* Success State - Upload Success Banner */}
                <div className="bg-green-50 border-l-4 border-green-500 p-4 flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-green-900">Upload Success</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Create a POAP collection to enable attendees to claim proof of attendance badges.
                      </p>
                    </div>
                  </div>
                  <button className="text-green-600 hover:text-green-800">
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="h-6 w-6 text-gray-700" />
                    <h3 className="text-lg font-semibold text-gray-900">POAPs Collection Management</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">Create and manage proof of attendance protocol badges for your event</p>

                  <div>
                    <Label htmlFor="poap-name" className="text-sm font-medium text-gray-700">POAP Name *</Label>
                    <Input
                      id="poap-name"
                      value={poapFormData.name}
                      onChange={(e) => setPoapFormData({ ...poapFormData, name: e.target.value })}
                      placeholder="Enter event name"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="poap-description" className="text-sm font-medium text-gray-700">Description</Label>
                    <Textarea
                      id="poap-description"
                      value={poapFormData.description}
                      onChange={(e) => setPoapFormData({ ...poapFormData, description: e.target.value })}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Upload Image</Label>
                    <div className="mt-1 border-2 border-dashed border-green-300 rounded-lg p-8 text-center bg-green-50">
                      <div className="flex flex-col items-center">
                        <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                        <p className="text-sm text-gray-700 mb-1">Uploading Document...</p>
                        <p className="text-xs text-gray-500">Uploaded document</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-3 text-blue-600 border-blue-300 hover:bg-blue-50"
                        >
                          Remove Upload
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="poap-supply" className="text-sm font-medium text-gray-700">Max Supply (Optional)</Label>
                    <Input
                      id="poap-supply"
                      type="text"
                      value={poapFormData.maxSupply}
                      onChange={(e) => setPoapFormData({ ...poapFormData, maxSupply: e.target.value })}
                      placeholder="Leave empty for unlimited"
                      className="mt-1"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleCreatePoapCollection}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Create POAP
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Initial State - No POAP collection yet */}
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-orange-900">No POAP collection yet</h4>
                      <p className="text-sm text-orange-700 mt-1">
                        {event.poapImageUrl || event.poap_image ? 
                          'Your event has POAP data but the collection needs to be activated.' :
                          'Create a POAP collection to enable attendees to claim proof of attendance badges.'
                        }
                      </p>
                      <Button 
                        onClick={() => setCreatingPoap(true)}
                        size="sm"
                        className="mt-2 bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        {event.poapImageUrl || event.poap_image ? 'Activate POAP' : 'Create POAP'}
                      </Button>
                    </div>
                  </div>
                  <button className="text-orange-600 hover:text-orange-800">
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="h-6 w-6 text-gray-700" />
                    <h3 className="text-lg font-semibold text-gray-900">POAPs Collection Management</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">Create and manage proof of attendance protocol badges for your event</p>

                  <div>
                    <Label htmlFor="poap-name" className="text-sm font-medium text-gray-700">POAP Name *</Label>
                    <Input
                      id="poap-name"
                      value={poapFormData.name}
                      onChange={(e) => setPoapFormData({ ...poapFormData, name: e.target.value })}
                      placeholder="Enter event name"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="poap-description" className="text-sm font-medium text-gray-700">Description</Label>
                    <Textarea
                      id="poap-description"
                      value={poapFormData.description}
                      onChange={(e) => setPoapFormData({ ...poapFormData, description: e.target.value })}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Upload Image</Label>
                    {poapFormData.imageUrl || event.poapImageUrl || event.poap_image ? (
                      <div className="mt-1 border-2 border-dashed border-green-300 rounded-lg p-4 text-center bg-green-50">
                        <img 
                          src={poapFormData.imageUrl || event.poapImageUrl || event.poap_image}
                          alt="POAP Preview"
                          className="w-24 h-24 mx-auto rounded-lg object-cover border mb-3"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                        <p className="text-sm text-green-700 mb-1">Image ready for POAP</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          onClick={() => setPoapFormData({...poapFormData, imageUrl: ''})}
                        >
                          Change Image
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <Image className="h-6 w-6 text-gray-400" />
                          </div>
                          <p className="text-sm text-blue-600 mb-1 cursor-pointer hover:text-blue-700">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-3 text-blue-600 border-blue-300 hover:bg-blue-50"
                          >
                            Browse Files
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="poap-supply" className="text-sm font-medium text-gray-700">Max Supply (Optional)</Label>
                    <Input
                      id="poap-supply"
                      type="text"
                      value={poapFormData.maxSupply}
                      onChange={(e) => setPoapFormData({ ...poapFormData, maxSupply: e.target.value })}
                      placeholder="Leave empty for unlimited"
                      className="mt-1"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleCreatePoapCollection}
                    disabled={!poapFormData.name || !poapFormData.description}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {event.poapImageUrl || event.poap_image ? 'Activate POAP Collection' : 'Create POAP'}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Financials Tab */}
          <TabsContent value="financials" className="space-y-6">
            {/* Financial Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <ChartColumnBig className='text-[#101928] mb-10 w-5 h-5'/>
                      <p className="text-sm font-medium text-[#667185]">Total Balance</p>
                      <p className="text-lg font-semibold text-[#101928]">
                        ${event.isFree ? '0' : (stats.totalRevenue * 0.95).toFixed(0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Ticket className='text-[#101928] mb-10 w-5 h-5'/>
                      <p className="text-sm font-medium text-[#667185]">Ticket Price</p>
                      <p className="text-lg font-semibold text-[#101928]">
                        {event.isFree ? 'Free' : `$${event.ticketPrice}`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Users className='text-[#101928] mb-10 w-5 h-5'/>
                      <p className="text-sm font-medium text-[#667185]">Spots Left</p>
                      <p className="text-lg font-semibold text-[#101928]">
                        {typeof stats.spotsRemaining === 'number' ? stats.spotsRemaining : '390'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Free Event Warning */}
            {event.isFree && (
              <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-orange-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-orange-800 font-medium">This is a free event</h4>
                    <p className="text-orange-700 text-sm mt-1">There are no revenue recorded from this event.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Paid Event Financial Details */}
            {!event.isFree && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg border p-6">
                  <h3 className="text-lg font-semibold text-[#101928] mb-4">Revenue Breakdown</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-[#667185]">Total Revenue</p>
                      <p className="text-2xl font-bold text-[#101928]">${stats.totalRevenue}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#667185]">Platform Fee (5%)</p>
                      <p className="text-2xl font-bold text-[#101928]">${(stats.totalRevenue * 0.05).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#667185]">Tickets Sold</p>
                      <p className="text-2xl font-bold text-[#101928]">{stats.totalRegistered}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#667185]">Available for Withdrawal</p>
                      <p className="text-2xl font-bold text-green-600">${(stats.totalRevenue * 0.95).toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {stats.totalRevenue > 0 && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-green-900">Ready for Withdrawal</h4>
                        <p className="text-sm text-green-700">Funds available after platform fee deduction</p>
                      </div>
                      <p className="text-2xl font-bold text-green-600">${(stats.totalRevenue * 0.95).toFixed(2)}</p>
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
              </div>
            )}
          </TabsContent>
        </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}