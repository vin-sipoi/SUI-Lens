"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "../landing/UserContext"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { useSuiContracts } from "@/hooks/useSuiContracts"
import { useCurrentAccount, ConnectButton } from "@mysten/dapp-kit"
import { toast } from "sonner"

export default function CreateEventPage() {
  const { user, login } = useUser();
  const router = useRouter();
  const currentAccount = useCurrentAccount();
  const { createEvent, createPoapCollection, isLoading } = useSuiContracts();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if we need to redirect
  const [shouldCheckAuth, setShouldCheckAuth] = useState(false);

  // Wait a bit before checking auth to allow UserContext to load from localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldCheckAuth(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Auto-login is now handled by WalletConnectionManager

  // Redirect to signin if no user and no wallet after initial load
  useEffect(() => {
    if (shouldCheckAuth && !currentAccount && !user) {
      router.push('/auth/signin');
    }
  }, [shouldCheckAuth, currentAccount, user, router]);

  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    endDate: "",
    endTime: "",
    location: "",
    category: "general",
    capacity: "",
    ticketPrice: "",
    isFree: true,
    requiresApproval: false,
    isPrivate: false,
    timezone: "GMT+03:00 Nairobi",
  })

  const [poapData, setPoapData] = useState({
    enabled: false,
    name: "",
    description: "",
    imageUrl: "",
    maxSupply: "",
  })

  const [isCreating, setIsCreating] = useState(false)
  const [ticketDialogOpen, setTicketDialogOpen] = useState<boolean>(false)
  const [capacityDialogOpen, setCapacityDialogOpen] = useState<boolean>(false)
  const [poapDialogOpen, setPoapDialogOpen] = useState<boolean>(false)
  const [tempTicketData, setTempTicketData] = useState({
    isFree: eventData.isFree,
    ticketPrice: eventData.ticketPrice,
  })
  const [tempCapacityData, setTempCapacityData] = useState({
    capacity: eventData.capacity,
  })
  const { addEvent } = useEventContext();
  
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Generate QR code using Qrfy API
  const generateQRCode = async (eventId: string) => {
    try {
      // Create the URL that will capture wallet addresses
      const eventUrl = `${window.location.origin}/event/${eventId}/register`
      
      const response = await fetch('https://qrfy.com/api/v1/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        qrCodeImage: result.image_url
      }
    } catch (error) {
      console.error('Error generating QR code:', error)
      // Fallback: create a simple QR code URL
      const eventUrl = `${window.location.origin}/event/${eventId}/register`
      return {
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(eventUrl)}`,
        eventUrl: eventUrl,
        qrCodeImage: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(eventUrl)}`
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!currentAccount) {
      toast.error('Please connect your wallet first');
      // Show connect wallet dialog or button
      const connectButton = document.querySelector('[data-testid="connect-wallet-button"]') as HTMLButtonElement;
      if (connectButton) {
        connectButton.click();
      }
      return;
    }

    // Validate field sizes before submission
    const MAX_STRING_SIZE = 16000; // Leave buffer below 16384 limit
    
    const validateFieldSize = (value: string, fieldName: string) => {
      const sizeInBytes = new TextEncoder().encode(value).length;
      if (sizeInBytes > MAX_STRING_SIZE) {
        toast.error(`${fieldName} is too long (${sizeInBytes} bytes). Please keep it under ${MAX_STRING_SIZE} bytes.`);
        throw new Error(`${fieldName} exceeds size limit`);
      }
    };

    try {
      // Validate required fields are not empty
      if (!eventData.title.trim()) {
        toast.error('Event title is required');
        return;
      }
      if (!eventData.description.trim()) {
        toast.error('Event description is required');
        return;
      }
      if (!eventData.location.trim()) {
        toast.error('Event location is required');
        return;
      }
      if (!eventData.date) {
        toast.error('Event date is required');
        return;
      }
      if (!eventData.time) {
        toast.error('Event time is required');
        return;
      }
      
      // Validate all string fields
      validateFieldSize(eventData.title, 'Event title');
      validateFieldSize(eventData.description, 'Event description');
      validateFieldSize(eventData.location, 'Event location');
      validateFieldSize(eventData.category, 'Event category');
      
      // For image URLs, we'll use a placeholder if no image is uploaded
      // This avoids the base64 data URL being too large
      let imageUrl = 'https://placeholder.com/event-image.png';
      if (imagePreview && imagePreview.startsWith('http')) {
        imageUrl = imagePreview;
        validateFieldSize(imageUrl, 'Image URL');
      }
      // If it's a base64 data URL, we'll need to upload it somewhere first
      // For now, we'll use the placeholder
      if (imagePreview && imagePreview.startsWith('data:')) {
        console.log('Base64 image detected, using placeholder for now');
        // TODO: Upload to IPFS or cloud storage
        imageUrl = 'https://placeholder.com/event-image.png';
      }

      setIsCreating(true);
      
      // Combine date and time
      const startDate = new Date(`${eventData.date}T${eventData.time}`);
      // If no end date/time specified, set end time to 2 hours after start
      const endDateStr = eventData.endDate || eventData.date;
      const endTimeStr = eventData.endTime || (() => {
        const tempDate = new Date(`${eventData.date}T${eventData.time}`);
        tempDate.setHours(tempDate.getHours() + 2);
        return tempDate.toTimeString().slice(0, 5);
      })();
      const endDate = new Date(`${endDateStr}T${endTimeStr}`);
      
      // Validate dates
      if (isNaN(startDate.getTime())) {
        toast.error('Invalid start date or time');
        setIsCreating(false);
        return;
      }
      
      if (isNaN(endDate.getTime())) {
        toast.error('Invalid end date or time');
        setIsCreating(false);
        return;
      }
      
      if (endDate <= startDate) {
        toast.error('End date must be after start date');
        setIsCreating(false);
        return;
      }
      
      // Log event data for debugging
      console.log('Creating event with data:', {
        title: eventData.title,
        description: eventData.description,
        imageUrl: imageUrl,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        location: eventData.location,
        category: eventData.category,
        capacity: eventData.capacity ? parseInt(eventData.capacity) : undefined,
        ticketPrice: eventData.isFree ? 0 : parseFloat(eventData.ticketPrice || '0'),
        requiresApproval: eventData.requiresApproval,
        isPrivate: eventData.isPrivate,
      });
      
      // Create event on blockchain
      await createEvent({
        title: eventData.title,
        description: eventData.description,
        imageUrl: imageUrl,
        startDate: startDate,
        endDate: endDate,
        location: eventData.location,
        category: eventData.category,
        capacity: eventData.capacity ? parseInt(eventData.capacity) : undefined,
        ticketPrice: eventData.isFree ? 0 : parseFloat(eventData.ticketPrice || '0'),
        requiresApproval: eventData.requiresApproval,
        isPrivate: eventData.isPrivate,
      });
      
      // If POAP is enabled, create POAP collection
      if (poapData.enabled && poapData.name) {
        // This would be called after getting the event ID from the transaction
        // For now, we'll skip this part as it requires transaction result parsing
      }
      
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    } finally {
      setIsCreating(false);
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

  const handlePoapSave = () => {
    setPoapDialogOpen(false);
  }

  // Show loading state while checking auth
  if (!shouldCheckAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/landing" className="flex items-center space-x-2 sm:space-x-3 z-20">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center">
              <Image 
                src="https://i.ibb.co/PZHSkCVG/Suilens-Logo-Mark-Suilens-Black.png" 
                alt="Suilens Logo" 
                width={60}
                height={60}
                className="object-contain"
              />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-[#020B15]">Suilens</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex text-sm font-inter items-center space-x-8">
            <Link href='/landing' className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Home
            </Link>
            <Link href='/communities' className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Communities
            </Link>
            <Link href='/discover' className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Discover
            </Link>
            <Link href='/dashboard' className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Dashboard
            </Link>
            <Link href='/bounties' className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Bounties
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 focus:outline-none z-20"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Actions */}
          <div className="hidden md:flex text-sm items-center space-x-4">
            {!currentAccount ? (
              <ConnectButton 
                connectText="Connect Wallet"
                className="bg-[#4DA2FF] hover:bg-blue-500 transition-colors text-white px-6 rounded-xl"
              />
            ) : !user ? (
              <Link href='/auth/signin'>
                <Button className="bg-[#4DA2FF] hover:bg-blue-500 transition-colors text-white px-6 rounded-xl">
                  Sign In
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Connected</span>
                <img
                  src={user.avatarUrl || '/placeholder-user.jpg'}
                  alt="Profile"
                  className="w-8 h-8 rounded-full border border-gray-200"
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-10 bg-white pt-16 pb-6 px-4">
            <nav className="flex flex-col space-y-6">
              <Link
                href="/landing"
                className="text-lg font-medium text-gray-900 py-2 border-b border-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/communities"
                className="text-lg font-medium text-gray-900 py-2 border-b border-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Communities
              </Link>
              <Link
                href="/discover"
                className="text-lg font-medium text-gray-900 py-2 border-b border-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Discover
              </Link>
              <Link
                href="/dashboard"
                className="text-lg font-medium text-gray-900 py-2 border-b border-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/bounties"
                className="text-lg font-medium text-gray-900 py-2 border-b border-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Bounties
              </Link>
              
              {/* Mobile Actions */}
              <div className="flex flex-col space-y-4 pt-4">
                {!currentAccount ? (
                  <ConnectButton 
                    connectText="Connect Wallet"
                    className="w-full bg-[#4DA2FF] hover:bg-blue-500 transition-colors text-white py-2 rounded-xl"
                  />
                ) : !user ? (
                  <Link href='/auth/signin' onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-[#4DA2FF] hover:bg-blue-500 transition-colors text-white py-2 rounded-xl">
                      Sign In
                    </Button>
                  </Link>
                ) : (
                  <div className="flex items-center justify-center gap-2 py-2">
                    <span className="text-gray-600">Connected</span>
                    <img
                      src={user.avatarUrl || '/placeholder-user.jpg'}
                      alt="Profile"
                      className="w-8 h-8 rounded-full border border-gray-200"
                    />
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

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
              Event Name
            </Label>
            <Input
              id="eventName"
              placeholder="Enter event name"
              value={eventData.title}
              onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              maxLength={200}
              required
            />
            <div className="text-xs text-gray-500 mt-1">
              {eventData.title.length}/200 characters
            </div>
          </div>

          {/* Event Category */}
          <div>
            <Label htmlFor="category" className="text-sm font-medium text-gray-700 mb-2 block">
              Event Category
            </Label>
            <Select
              value={eventData.category}
              onValueChange={(value) => setEventData({ ...eventData, category: value })}
            >
              <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="gaming">Gaming</SelectItem>
                <SelectItem value="defi">DeFi</SelectItem>
                <SelectItem value="nft">NFT</SelectItem>
                <SelectItem value="dao">DAO</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="education">Education</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Start Date & Time */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Start</Label>
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
                value={eventData.endDate || eventData.date}
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
              Event Location
            </Label>
            <Input
              id="location"
              placeholder="Offline location or virtual link"
              value={eventData.location}
              onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              maxLength={500}
              required
            />
            <div className="text-xs text-gray-500 mt-1">
              {eventData.location.length}/500 characters
            </div>
          </div>

          {/* Add Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2 block">
              Add Description
            </Label>
            <Textarea
              id="description"
              placeholder="What's your event about?"
              rows={4}
              value={eventData.description}
              onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
              maxLength={2000}
              required
            />
            <div className="text-xs text-gray-500 mt-1">
              {eventData.description.length}/2000 characters
            </div>
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
                  <span>{eventData.isFree ? "Free" : `${eventData.ticketPrice || "0"} SUI`}</span>
                  <Edit3 className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95%] max-w-md mx-auto bg-white" aria-describedby="ticket-dialog-description">
                <DialogHeader>
                  <DialogTitle>Edit Tickets</DialogTitle>
                </DialogHeader>
                <p id="ticket-dialog-description" className="sr-only">
                  Configure ticket pricing for your event
                </p>
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
                        Price (SUI)
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.1"
                        min="0"
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

          {/* Private Event */}
          <div className="flex items-center justify-between py-2">
            <Label htmlFor="private" className="text-sm font-medium text-gray-700">
              Private Event
            </Label>
            <Switch
              id="private"
              checked={eventData.isPrivate}
              onCheckedChange={(checked) => setEventData({ ...eventData, isPrivate: checked })}
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
              <DialogContent className="w-[95%] max-w-md mx-auto bg-white" aria-describedby="capacity-dialog-description">
                <DialogHeader>
                  <DialogTitle>Edit Capacity</DialogTitle>
                </DialogHeader>
                <p id="capacity-dialog-description" className="sr-only">
                  Set the maximum number of attendees for your event
                </p>
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
                  {poapData.enabled ? (
                    <span className="flex items-center">
                      <span className="mr-2">POAP: {poapData.name || 'Configured'}</span>
                      <Edit3 className="w-4 h-4" />
                    </span>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 mr-2" />
                      Add POAP
                    </>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95%] max-w-md mx-auto bg-white" aria-describedby="poap-dialog-description">
                <DialogHeader>
                  <DialogTitle>Add POAP to Event</DialogTitle>
                </DialogHeader>
                <p id="poap-dialog-description" className="sr-only">
                  Configure Proof of Attendance Protocol NFTs for your event attendees
                </p>
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
                      <Label htmlFor="poap-image">POAP Image URL</Label>
                      <Input
                        id="poap-image"
                        placeholder="https://..."
                        value={poapData.imageUrl}
                        onChange={(e) => setPoapData({ ...poapData, imageUrl: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="poap-supply">Max Supply (optional)</Label>
                      <Input
                        id="poap-supply"
                        type="number"
                        placeholder="Unlimited"
                        value={poapData.maxSupply}
                        onChange={(e) => setPoapData({ ...poapData, maxSupply: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setPoapData({ enabled: false, name: "", description: "", imageUrl: "", maxSupply: "" });
                      setPoapDialogOpen(false);
                    }}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    className="bg-blue-500 hover:bg-blue-600 w-full sm:w-auto"
                    onClick={() => {
                      setPoapData({ ...poapData, enabled: true });
                      handlePoapSave();
                    }}
                  >
                    Add POAP
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Create Event Button / Connect Wallet */}
          {!currentAccount ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 text-center">
                You need to connect your wallet to create an event
              </p>
              <ConnectButton 
                connectText="Connect Wallet to Continue"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium"
              />
            </div>
          ) : (
            <Button 
              type="submit"
              disabled={isCreating || isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium disabled:opacity-50"
            >
              {isCreating || isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Event...
                </>
              ) : (
                'Create Event'
              )}
            </Button>
          )}
        </form>
      </div>
    </div>
  )
}