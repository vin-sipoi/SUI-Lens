"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
  Calendar,
  MapPin,
  Upload,
  ArrowLeft,
  Globe,
  Users,
  Clock,
  Edit3,
  Camera,
  Ticket,
  Settings,
  ChevronDown,
  ExternalLink,
  Video,
} from "lucide-react"
import EventImageUpload from "@/components/EventImageUpload"
import Link from "next/link"
import {useRouter} from "next/navigation"
import { useEventStore } from "@/store/EventStore"

export default function CreateEventPage() {
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
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

  const addEvent = useEventStore((state) => state.addEvent)
  const router = useRouter();

  const [ticketDialogOpen, setTicketDialogOpen] = useState(false)
  const [capacityDialogOpen, setCapacityDialogOpen] = useState(false)
  const [tempTicketData, setTempTicketData] = useState({
    isFree: eventData.isFree,
    ticketPrice: eventData.ticketPrice,
  })
  const [tempCapacityData, setTempCapacityData] = useState({
    capacity: eventData.capacity,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addEvent({
      ...eventData,
      id: Date.now().toString(),
      attendees: "",
    })
    router.push("/dashboard")
    console.log("Event created:", eventData)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Date"
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "Time"
    const [hours, minutes] = timeStr.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour.toString().padStart(2, '0')}:${minutes} ${ampm}`
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

  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const isVideoCall = (url: string) => {
    const videoCallDomains = ['zoom.us', 'meet.google.com', 'teams.microsoft.com', 'webex.com']
    return videoCallDomains.some(domain => url.includes(domain))
  }

  const isGoogleMapsUrl = (url: string) => {
    return url.includes('maps.google.com') || url.includes('goo.gl/maps')
  }

  return (
    <div className="min-h-screen" style={{ background: "#201a28" }}>
      {/* Header */}
      <header className="border-b border-white/10 bg-[#201a28] sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" passHref>
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10" asChild>
                  <span className="flex items-center">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </span>
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="text-xl font-bold text-white">Suilens</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                className={`flex items-center space-x-2 text-white/70 text-sm px-2 py-1 rounded-lg transition-colors ${
                  eventData.isPrivate
                    ? "bg-pink-700/30 hover:bg-pink-700/50"
                    : "bg-emerald-700/30 hover:bg-emerald-700/50"
                }`}
                onClick={() =>
                  setEventData((prev) => ({
                    ...prev,
                    isPrivate: !prev.isPrivate,
                  }))
                }
                aria-pressed={eventData.isPrivate}
                title={eventData.isPrivate ? "Private Event" : "Public Event"}
              >
                {eventData.isPrivate ? (
                  <>
                    <Users className="w-4 h-4" />
                    <span>Private</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" />
                    <span>Public</span>
                  </>
                )}
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Preview */}
            <div className="space-y-6">
              {/* Event Image Upload */}
              <EventImageUpload />
              {/* Event Details Preview */}
              <Card className="bg-white/5 border-white/10 rounded-2xl">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-white font-semibold mb-4">Event Details</h3>
                  
                  {/* Date & Time */}
                  <div className="flex items-center space-x-3 text-white/70">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-white font-medium">
                        {eventData.date ? formatDate(eventData.date) : "Add date"}
                      </div>
                      <div className="text-sm text-white/60">
                        {eventData.time ? formatTime(eventData.time) : "Add time"}
                        {eventData.endTime && ` - ${formatTime(eventData.endTime)}`}
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center space-x-3 text-white/70">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                      {eventData.location && isValidUrl(eventData.location) ? (
                        isVideoCall(eventData.location) ? (
                          <Video className="w-4 h-4" />
                        ) : (
                          <MapPin className="w-4 h-4" />
                        )
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium flex items-center">
                        {eventData.location ? (
                          isValidUrl(eventData.location) ? (
                            <a 
                              href={eventData.location} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center hover:text-blue-400 transition-colors"
                            >
                              {isVideoCall(eventData.location) ? "Join Video Call" : 
                               isGoogleMapsUrl(eventData.location) ? "View on Google Maps" : 
                               "Visit Location"}
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                          ) : (
                            eventData.location
                          )
                        ) : (
                          "Add location"
                        )}
                      </div>
                      <div className="text-sm text-white/60">
                        {eventData.location && isValidUrl(eventData.location) ? (
                          isVideoCall(eventData.location) ? "Virtual meeting" : "Online location"
                        ) : (
                          "Offline location or virtual link"
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tickets */}
                  <div className="flex items-center space-x-3 text-white/70">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                      <Ticket className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-white font-medium">
                        {eventData.isFree ? "Free" : `$${eventData.ticketPrice || "0"}`}
                      </div>
                      <div className="text-sm text-white/60 flex items-center">
                        Tickets
                        <Edit3 className="w-3 h-3 ml-2" />
                      </div>
                    </div>
                  </div>

                  {/* Capacity Preview */}
                  {eventData.capacity && (
                    <div className="flex items-center space-x-3 text-white/70">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {eventData.capacity} guests
                        </div>
                        <div className="text-sm text-white/60">
                          Maximum capacity
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Form */}
            <div className="space-y-6">
              {/* Calendar Selector */}
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-white/70">Personal Calendar</span>
                <ChevronDown className="w-4 h-4 text-white/50" />
              </div>

              {/* Event Title */}
              <div className="space-y-2">
                <Input
                  placeholder="Event Name"
                  value={eventData.title}
                  onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                  className="bg-transparent border-none text-3xl font-bold text-white placeholder:text-white/40 px-0 focus-visible:ring-0 h-auto py-2"
                  style={{ fontSize: '2rem', lineHeight: '2.5rem' }}
                />
              </div>

              {/* Date and Time */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-white/70 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>Start</span>
                    </div>
                    <div className="space-y-2">
                      <Input
                        type="date"
                        value={eventData.date}
                        onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
                        className="bg-white/5 border-white/20 text-white focus:border-white/40 rounded-xl"
                      />
                      <Input
                        type="time"
                        value={eventData.time}
                        onChange={(e) => setEventData({ ...eventData, time: e.target.value })}
                        className="bg-white/5 border-white/20 text-white focus:border-white/40 rounded-xl"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-white/70 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>End</span>
                    </div>
                    <div className="space-y-2">
                      <Input
                        type="date"
                        value={eventData.date}
                        onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
                        className="bg-white/5 border-white/20 text-white focus:border-white/40 rounded-xl"
                      />
                      <Input
                        type="time"
                        value={eventData.endTime}
                        onChange={(e) => setEventData({ ...eventData, endTime: e.target.value })}
                        className="bg-white/5 border-white/20 text-white focus:border-white/40 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-end text-sm text-white/60">
                  <Globe className="w-4 h-4 mr-2" />
                  {eventData.timezone}
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-white/70 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>Add Event Location</span>
                </div>
                <Input
                  placeholder="Offline location or virtual link"
                  value={eventData.location}
                  onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 rounded-xl"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-white/70 text-sm">
                  <Edit3 className="w-4 h-4" />
                  <span>Add Description</span>
                </div>
                <Textarea
                  placeholder="What's your event about?"
                  rows={4}
                  value={eventData.description}
                  onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 rounded-xl resize-none"
                />
              </div>

              {/* Event Options */}
              <div className="space-y-4">
                <h3 className="text-white font-semibold">Event Options</h3>
                
                {/* Tickets */}
                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <div className="flex items-center space-x-3">
                    <Ticket className="w-5 h-5 text-white/70" />
                    <span className="text-white font-medium">Tickets</span>
                  </div>
                  <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="flex items-center space-x-2 text-white/70 hover:text-white hover:bg-white/10"
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
                    <DialogContent className="sm:max-w-[425px] bg-[#2a1f35] border-white/20 text-white">
                      <DialogHeader>
                        <DialogTitle className="text-white">Edit Tickets</DialogTitle>
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
                          <Label htmlFor="free-ticket" className="text-white">Free Event</Label>
                        </div>
                        {!tempTicketData.isFree && (
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right text-white">
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
                              className="col-span-3 bg-white/5 border-white/20 text-white"
                            />
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button 
                          type="submit" 
                          onClick={handleTicketSave}
                          className="bg-white text-gray-900 hover:bg-gray-100"
                        >
                          Save changes
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Require Approval */}
                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-white/70" />
                    <span className="text-white font-medium">Require Approval</span>
                  </div>
                  <Switch
                    checked={eventData.requiresApproval}
                    onCheckedChange={(checked) => setEventData({ ...eventData, requiresApproval: checked })}
                  />
                </div>

                {/* Capacity */}
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center space-x-3">
                    <Settings className="w-5 h-5 text-white/70" />
                    <span className="text-white font-medium">Capacity</span>
                  </div>
                  <Dialog open={capacityDialogOpen} onOpenChange={setCapacityDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="flex items-center space-x-2 text-white/70 hover:text-white hover:bg-white/10"
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
                    <DialogContent className="sm:max-w-[425px] bg-[#2a1f35] border-white/20 text-white">
                      <DialogHeader>
                        <DialogTitle className="text-white">Edit Capacity</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="capacity" className="text-right text-white">
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
                            className="col-span-3 bg-white/5 border-white/20 text-white"
                          />
                        </div>
                        <p className="text-sm text-white/60">
                          Leave empty for unlimited capacity
                        </p>
                      </div>
                      <DialogFooter>
                        <Button 
                          type="submit" 
                          onClick={handleCapacitySave}
                          className="bg-white text-gray-900 hover:bg-gray-100"
                        >
                          Save changes
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <Button 
                  onClick={handleSubmit}
                  className="bg-white w-auto text-gray-900 hover:bg-gray-100 font-medium px-6"
                >
                  Create Event
                </Button>
              </div>
          </div>
        </div>
      </div>
    </div>
  )
}