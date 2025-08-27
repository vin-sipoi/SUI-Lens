"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "../../context/UserContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import {
  ArrowLeft,
  Edit3,
  Camera,
  Plus,
  Loader2,
  Menu,
  X,
  Upload,
  Image as ImageIcon,
  Award,
  Ticket,
} from "lucide-react"
import Link from "next/link"
import { useEventContext } from "@/context/EventContext"
import { mintPOAP, suilensService } from "@/lib/sui-client"
import Header from '@/app/components/Header'
import { uploadImageToImgBB, validateImageFile } from '@/utils/imageUtils'
import { toast } from 'sonner'
import { useSponsoredTransaction } from '@/hooks/useSponsoredTransaction'
import { Transaction } from '@mysten/sui/transactions'

export default function CreateEventPage() {
  const { user } = useUser()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { addEvent } = useEventContext()
  const { sponsorAndExecute, isConnected } = useSponsoredTransaction()

  // Redirect to signin if not logged in
  useEffect(() => {
    if (!user) {
      const timeoutId = setTimeout(() => {
        router.push('/auth/signin')
      }, 100)
      return () => clearTimeout(timeoutId)
    }
  }, [user, router])

  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    endDate: "",
    time: "",
    endTime: "",
    location: "",
    category: "",
    capacity: "",
    ticketPrice: "",
    isFree: true,
    requiresApproval: false,
    isPrivate: false,
    timezone: "GMT+03:00 Nairobi",
  })

  const [isCreating, setIsCreating] = useState(false)
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false)
  const [capacityDialogOpen, setCapacityDialogOpen] = useState(false)
  const [poapDialogOpen, setPoapDialogOpen] = useState(false)
  const [tempTicketData, setTempTicketData] = useState({
    isFree: eventData.isFree,
    ticketPrice: eventData.ticketPrice,
  })
  const [tempCapacityData, setTempCapacityData] = useState({
    capacity: eventData.capacity,
  })

  // Three separate image states
  const [bannerImage, setBannerImage] = useState<{
    file: File | null;
    preview: string | null;
    url: string | null;
  }>({ file: null, preview: null, url: null })

  const [nftImage, setNftImage] = useState<{
    file: File | null;
    preview: string | null;
    url: string | null;
  }>({ file: null, preview: null, url: null })

  const [poapImage, setPoapImage] = useState<{
    file: File | null;
    preview: string | null;
    url: string | null;
  }>({ file: null, preview: null, url: null })

  // Upload states
  const [uploadingImages, setUploadingImages] = useState({
    banner: false,
    nft: false,
    poap: false,
  })

  // POAP data state
  const [poapData, setPoapData] = useState({
    name: "",
    description: "",
  })

  // Handle image upload for each type
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    imageType: 'banner' | 'nft' | 'poap'
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      toast.error(validation.error)
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (event) => {
      const preview = event.target?.result as string
      
      // Update the appropriate state
      if (imageType === 'banner') {
        setBannerImage({ file, preview, url: null })
      } else if (imageType === 'nft') {
        setNftImage({ file, preview, url: null })
      } else if (imageType === 'poap') {
        setPoapImage({ file, preview, url: null })
      }
    }
    reader.readAsDataURL(file)
  }

  // Upload images to imgBB and return the URLs
  const uploadImagesToCloud = async () => {
    const imageUrls = {
      bannerUrl: bannerImage.url || '',
      nftImageUrl: nftImage.url || '',
      poapImageUrl: poapImage.url || ''
    }
    
    const uploads: Promise<void>[] = []
    
    // Upload banner image
    if (bannerImage.file && !bannerImage.url) {
      uploads.push(
        uploadImageToImgBB(bannerImage.file, `${eventData.title}_banner_${Date.now()}`)
          .then(url => {
            setBannerImage(prev => ({ ...prev, url }))
            imageUrls.bannerUrl = url
          })
      )
    }
    
    // Upload NFT image
    if (nftImage.file && !nftImage.url) {
      uploads.push(
        uploadImageToImgBB(nftImage.file, `${eventData.title}_nft_${Date.now()}`)
          .then(url => {
            setNftImage(prev => ({ ...prev, url }))
            imageUrls.nftImageUrl = url
          })
      )
    }
    
    // Upload POAP image
    if (poapImage.file && !poapImage.url) {
      uploads.push(
        uploadImageToImgBB(poapImage.file, `${eventData.title}_poap_${Date.now()}`)
          .then(url => {
            setPoapImage(prev => ({ ...prev, url }))
            imageUrls.poapImageUrl = url
          })
      )
    }
    
    if (uploads.length > 0) {
      toast.info('Uploading images...')
      await Promise.all(uploads)
      toast.success('Images uploaded successfully!')
    }
    
    return imageUrls
  }

  // Generate QR code using qr-server.com API (free, no API key needed)
  const generateQRCode = async (eventId: string) => {
    try {
      const eventUrl = `${window.location.origin}/event/${eventId}/register`
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(eventUrl)}`
      
      return {
        qrCodeUrl: qrCodeUrl,
        eventUrl: eventUrl,
        qrCodeImage: qrCodeUrl,
      }
    } catch (error) {
      console.error('Error generating QR code:', error)
      // Fallback to the same URL
      const eventUrl = `${window.location.origin}/event/${eventId}/register`
      return {
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(eventUrl)}`,
        eventUrl: eventUrl,
        qrCodeImage: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(eventUrl)}`,
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      // Validate required fields
      if (!eventData.title || !eventData.description || !eventData.date || !eventData.time || !eventData.location) {
        toast.error('Please fill in all required fields')
        setIsCreating(false)
        return
      }

      // Validate that at least banner image is uploaded
      if (!bannerImage.file) {
        toast.error('Please upload at least an event banner image')
        setIsCreating(false)
        return
      }

      // Check if user has wallet connection or is authenticated via Enoki
      if (!isConnected && !user?.isEnoki) {
        toast.error('Please connect your wallet or ensure you are properly logged in with Enoki before creating an event')
        setIsCreating(false)
        return
      }

      // Upload images to imgBB and get the URLs
      const imageUrls = await uploadImagesToCloud()

      // Create event ID locally
      const eventId = `event_${Date.now()}`

      // Generate QR code for the event
      const qrData = await generateQRCode(eventId)

      // Add event to context with image URLs
      addEvent({
        id: eventId,
        type: "",
        ...eventData,
        bannerUrl: imageUrls.bannerUrl,
        nftImageUrl: imageUrls.nftImageUrl,
        poapImageUrl: imageUrls.poapImageUrl,
        requiresApproval: eventData.requiresApproval,
        poapEnabled: poapData.name ? true : false,
        qrCode: qrData.qrCodeImage,
        eventUrl: qrData.eventUrl,
        // rsvpTimes: undefined // Removed as it does not exist in the Event type
      })

      // First, ensure user has a profile (create if not exists)
      try {
        // Try to create a profile first (will fail if already exists, but that's okay)
        const profileTx = new Transaction()
        profileTx.moveCall({
          target: `${process.env.NEXT_PUBLIC_PACKAGE_ID}::suilens_core::create_profile`,
          arguments: [
            profileTx.object(process.env.NEXT_PUBLIC_EVENT_REGISTRY_ID!),
            profileTx.pure.string(user?.name || 'Event Creator'),
            profileTx.pure.string('Event creator on SUI-Lens'),
            profileTx.pure.string(user?.avatarUrl || user?.picture || 'https://api.dicebear.com/7.x/avataaars/svg?seed=SuiLens'),
            profileTx.object('0x6'), // Clock object
          ],
        })
        
        // Try to execute profile creation (ignore if fails - profile might already exist)
        try {
          await sponsorAndExecute({ tx: profileTx })
          toast.info('Profile created successfully!')
        } catch (profileError: any) {
          // Profile might already exist, that's okay
          console.log('Profile creation skipped (may already exist):', profileError.message)
        }
      } catch (error) {
        console.log('Profile check:', error)
      }

      // Now create the event with the uploaded image URLs
      const tx = await suilensService.createEvent({
        name: eventData.title,
        description: eventData.description,
        bannerUrl: imageUrls.bannerUrl,
        nftImageUrl: imageUrls.nftImageUrl,
        poapImageUrl: imageUrls.poapImageUrl,
        location: eventData.location,
        category: eventData.category,
        startTime: new Date(`${eventData.date} ${eventData.time}`).getTime(),
        endTime: new Date(`${eventData.endDate || eventData.date} ${eventData.endTime || eventData.time}`).getTime(),
        maxAttendees: parseInt(eventData.capacity) || 100,
        ticketPrice: eventData.isFree ? 0 : parseInt(eventData.ticketPrice) || 0,
        requiresApproval: eventData.requiresApproval,
        poapTemplate: poapData.name || '',
      })
      
      // Execute the transaction with Enoki zkLogin
      const result = await sponsorAndExecute({ tx })
      console.log('Create event transaction result:', result)

      toast.success('Event created successfully!')
      
      // Redirect to discover page
      router.push(`/discover`)
    } catch (error) {
      console.error('Error creating event:', error)
      if (error instanceof Error && error.message.includes('Wallet connection required')) {
        toast.error('Please connect your wallet or ensure you are properly logged in with Enoki before creating an event.')
      } else {
        toast.error('Failed to create event. Please try again.')
      }
    } finally {
      setIsCreating(false)
    }
  }

  const handleTicketSave = () => {
    setEventData({
      ...eventData,
      isFree: tempTicketData.isFree,
      ticketPrice: tempTicketData.ticketPrice,
    })
    setTicketDialogOpen(false)
  }

  const handleCapacitySave = () => {
    setEventData({
      ...eventData,
      capacity: tempCapacityData.capacity,
    })
    setCapacityDialogOpen(false)
  }

  const handlePoapSave = () => {
    setPoapDialogOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      {/* Form Section with Back Button */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6">
          <Link href="/landing" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Create Event</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Three Image Upload Sections */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Event Images</h2>
            
            {/* 1. Event Banner */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {bannerImage.preview ? (
                      <img src={bannerImage.preview} alt="Banner" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">📸 Event Banner *</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Main promotional image for your event (16:9 recommended)
                  </p>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'banner')}
                      className="hidden"
                    />
                    <Button type="button" variant="outline" size="sm" className="pointer-events-none">
                      <Upload className="w-4 h-4 mr-2" />
                      {bannerImage.file ? 'Change Image' : 'Upload Image'}
                    </Button>
                  </label>
                  {bannerImage.url && (
                    <span className="ml-2 text-sm text-green-600">✓ Uploaded</span>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Event NFT Image */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {nftImage.preview ? (
                      <img src={nftImage.preview} alt="NFT" className="w-full h-full object-cover" />
                    ) : (
                      <Ticket className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">🎫 Event NFT Image</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Commemorative NFT for registered attendees (1:1 recommended)
                  </p>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'nft')}
                      className="hidden"
                    />
                    <Button type="button" variant="outline" size="sm" className="pointer-events-none">
                      <Upload className="w-4 h-4 mr-2" />
                      {nftImage.file ? 'Change Image' : 'Upload Image'}
                    </Button>
                  </label>
                  {nftImage.url && (
                    <span className="ml-2 text-sm text-green-600">✓ Uploaded</span>
                  )}
                </div>
              </div>
            </div>

            {/* 3. POAP Badge Design */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                    {poapImage.preview ? (
                      <img src={poapImage.preview} alt="POAP" className="w-full h-full object-cover" />
                    ) : (
                      <Award className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">🏅 POAP Badge Design</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Badge for attendees who check in (Square, badge-style recommended)
                  </p>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'poap')}
                      className="hidden"
                    />
                    <Button type="button" variant="outline" size="sm" className="pointer-events-none">
                      <Upload className="w-4 h-4 mr-2" />
                      {poapImage.file ? 'Change Image' : 'Upload Image'}
                    </Button>
                  </label>
                  {poapImage.url && (
                    <span className="ml-2 text-sm text-green-600">✓ Uploaded</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Event Name */}
          <div>
            <Label htmlFor="eventName" className="text-sm font-medium text-gray-700 mb-2 block">
              Event Name *
            </Label>
            <Input
              id="eventName"
              placeholder="Enter event name"
              value={eventData.title}
              onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          {/* Start Date & Time */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Start *</Label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="date"
                value={eventData.date}
                onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
              <Input
                type="time"
                value={eventData.time}
                onChange={(e) => setEventData({ ...eventData, time: e.target.value })}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* End Date & Time */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">End</Label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="date"
                value={eventData.endDate}
                onChange={(e) => setEventData({ ...eventData, endDate: e.target.value })}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <Input
                type="time"
                value={eventData.endTime}
                onChange={(e) => setEventData({ ...eventData, endTime: e.target.value })}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Event Location */}
          <div>
            <Label htmlFor="location" className="text-sm font-medium text-gray-700 mb-2 block">
              Event Location *
            </Label>
            <Input
              id="location"
              placeholder="Offline location or virtual link"
              value={eventData.location}
              onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          {/* Add Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2 block">
              Add Description *
            </Label>
            <Textarea
              id="description"
              placeholder="What's your event about?"
              rows={4}
              value={eventData.description}
              onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
              required
            />
          </div>

          {/* Tickets */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Tickets</Label>
            <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between border-gray-300 hover:border-gray-400"
                  onClick={() => {
                    setTempTicketData({
                      isFree: eventData.isFree,
                      ticketPrice: eventData.ticketPrice,
                    })
                  }}
                >
                  <span>{eventData.isFree ? "Free" : `$${eventData.ticketPrice || "0"}`}</span>
                  <Edit3 className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95%] max-w-md mx-auto bg-white">
                <DialogHeader>
                  <DialogTitle>Edit Tickets</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="free-ticket"
                      checked={tempTicketData.isFree}
                      onCheckedChange={(checked) =>
                        setTempTicketData({ ...tempTicketData, isFree: checked })
                      }
                    />
                    <Label htmlFor="free-ticket">Free Event</Label>
                  </div>
                  {!tempTicketData.isFree && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="price" className="text-right">
                        Price ($)
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="0.00"
                        value={tempTicketData.ticketPrice}
                        onChange={(e) =>
                          setTempTicketData({ ...tempTicketData, ticketPrice: e.target.value })
                        }
                        className="col-span-3"
                      />
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    onClick={handleTicketSave}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Save changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Require Approval */}
          <div className="flex items-center justify-between py-2">
            <Label htmlFor="approval" className="text-sm font-medium text-gray-700">
              Require Approval
            </Label>
            <Switch
              id="approval"
              checked={eventData.requiresApproval}
              onCheckedChange={(checked) => setEventData({ ...eventData, requiresApproval: checked })}
            />
          </div>

          {/* Maximum Capacity */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Maximum Capacity</Label>
            <Dialog open={capacityDialogOpen} onOpenChange={setCapacityDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between border-gray-300 hover:border-gray-400"
                  onClick={() => {
                    setTempCapacityData({
                      capacity: eventData.capacity,
                    })
                  }}
                >
                  <span>{eventData.capacity || "Unlimited"}</span>
                  <Edit3 className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95%] max-w-md mx-auto bg-white">
                <DialogHeader>
                  <DialogTitle>Edit Capacity</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="capacity" className="text-right">
                      Max Guests
                    </Label>
                    <Input
                      id="capacity"
                      type="number"
                      placeholder="Unlimited"
                      value={tempCapacityData.capacity}
                      onChange={(e) =>
                        setTempCapacityData({ ...tempCapacityData, capacity: e.target.value })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    Leave empty for unlimited capacity
                  </p>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    onClick={handleCapacitySave}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Save changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* POAP Details (if POAP image uploaded) */}
          {poapImage.file && (
            <div className="border rounded-lg p-4 bg-blue-50">
              <h3 className="font-medium text-gray-900 mb-3">POAP Details</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="poap-name">POAP Name</Label>
                  <Input
                    id="poap-name"
                    placeholder="Enter POAP name"
                    value={poapData.name}
                    onChange={(e) => setPoapData({ ...poapData, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="poap-description">POAP Description</Label>
                  <Textarea
                    id="poap-description"
                    placeholder="Describe your POAP"
                    rows={3}
                    value={poapData.description}
                    onChange={(e) => setPoapData({ ...poapData, description: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Create Event Button */}
          <Button
            type="submit"
            disabled={isCreating || !bannerImage.file}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium disabled:opacity-50"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Event...
              </>
            ) : (
              'Create Event'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}