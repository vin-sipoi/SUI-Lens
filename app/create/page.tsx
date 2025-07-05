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
} from "lucide-react"
import Link from "next/link"
import { useEventContext } from "@/context/EventContext"
import { mintPOAP, suilensService } from "@/lib/sui-client"
import Header from '@/app/components/Header'

export default function CreateEventPage() {
  const { user } = useUser()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { addEvent } = useEventContext()

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

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // POAP data state
  const [poapData, setPoapData] = useState({
    name: "",
    description: "",
    image: null as File | null,
  })

  // Generate QR code using Qrfy API
  const generateQRCode = async (eventId: string) => {
    try {
      const eventUrl = `${window.location.origin}/event/${eventId}/register`
      const response = await fetch('https://qrfy.com/api/v1/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add API key if required: 'Authorization': 'Bearer YOUR_API_KEY',
        },
        body: JSON.stringify({
          qr_data: eventUrl,
          image_format: 'PNG',
          image_width: 300,
          qr_code_logo: 'none',
          foreground_color: '#000000',
          background_color: '#FFFFFF',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate QR code')
      }

      const result = await response.json()
      return {
        qrCodeUrl: result.qr_code_url,
        eventUrl: eventUrl,
        qrCodeImage: result.image_url,
      }
    } catch (error) {
      console.error('Error generating QR code:', error)
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
        alert('Please fill in all required fields')
        setIsCreating(false)
        return
      }

      // Create event ID locally
      const eventId = `event_${Date.now()}`

      // Generate QR code for the event
      const qrData = await generateQRCode(eventId)

      // Add event to context
      addEvent({
        id: eventId,
        type: "",
        ...eventData,
        requiresApproval: eventData.requiresApproval,
        poapEnabled: poapData.name ? true : false,
        qrCode: qrData.qrCodeImage,
        eventUrl: qrData.eventUrl,
      })

      // Call smart contract to create event
      const tx = await suilensService.createEvent({
        name: eventData.title,
        description: eventData.description,
        startTime: new Date(`${eventData.date} ${eventData.time}`).getTime(),
        endTime: new Date(`${eventData.endDate || eventData.date} ${eventData.endTime || eventData.time}`).getTime(),
        maxAttendees: parseInt(eventData.capacity) || 100,
        poapTemplate: poapData.name || '',
      })
      console.log('Create event transaction:', tx)

      // POAP minting is disabled here to move to event details page after check-in
      // if (poapData.name) {
      //   try {
      //     const mintTx = await mintPOAP(
      //       eventId,
      //       poapData.name,
      //       poapData.image ? URL.createObjectURL(poapData.image) : '',
      //       poapData.description,
      //       ''
      //     )
      //     console.log('POAP mint transaction:', mintTx)
      //   } catch (mintError) {
      //     console.error('Error minting POAP:', mintError)
      //     alert('Failed to mint POAP. Please try again.')
      //   }
      // }

      // Redirect to discover page
      router.push(`/discover`)
    } catch (error) {
      console.error('Error creating event:', error)
      alert('Failed to create event. Please try again.')
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePoapImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPoapData({ ...poapData, image: file })
    }
  }

  const handlePoapSave = () => {
    setPoapDialogOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      {/* Form Section with Back Button */}
      <div className="max-w-md mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6">
          <Link href="/landing" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Create Event</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section */}
          <div className="bg-gray-900 rounded-lg h-32 sm:h-40 flex items-center justify-center relative overflow-hidden">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Event preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center">
                <Camera className="w-6 h-6 text-white mx-auto mb-2" />
                <span className="text-white text-xs sm:text-sm">Add Event Image</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="absolute top-3 right-3">
              <Button
                type="button"
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 sm:px-3 py-1 h-auto"
              >
                Upload Image
              </Button>
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

          {/* Add POAP to your event */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Add POAP to your event [Optional]
            </Label>
            <Dialog open={poapDialogOpen} onOpenChange={setPoapDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-center border-dashed border-2 border-gray-300 hover:border-gray-400 py-6"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add POAP
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95%] max-w-md mx-auto bg-white">
                <DialogHeader>
                  <DialogTitle>Add POAP to Event</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <p className="text-sm text-gray-600">
                    POAP (Proof of Attendance Protocol) allows you to create commemorative NFTs for your event attendees.
                  </p>
                  <div className="space-y-4">
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
                    <div>
                      <Label htmlFor="poap-image">POAP Image</Label>
                      <Input
                        id="poap-image"
                        type="file"
                        accept="image/*"
                        onChange={handlePoapImageUpload}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setPoapDialogOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    className="bg-blue-500 hover:bg-blue-600 w-full sm:w-auto"
                    onClick={handlePoapSave}
                  >
                    Add POAP
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Create Event Button */}
          <Button
            type="submit"
            disabled={isCreating}
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