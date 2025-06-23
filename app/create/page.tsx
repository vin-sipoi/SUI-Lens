"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
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
} from "lucide-react"

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
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

  return (
    <div className="min-h-screen" style={{ background: "#201a28" }}>
      {/* Header */}
      <header className="border-b border-white/10 bg-[#201a28] sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="text-xl font-bold text-white">Suilens</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-white/70 text-sm">
                <Globe className="w-4 h-4" />
                <span>Public</span>
                <ChevronDown className="w-4 h-4" />
              </div>
              <Button 
                onClick={handleSubmit}
                className="bg-white text-gray-900 hover:bg-gray-100 font-medium px-6"
              >
                Create Event
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Preview */}
            <div className="space-y-6">
              {/* Event Image Upload */}
              <div className="relative">
                <div 
                  className="w-full h-64 rounded-2xl border-2 border-dashed border-white/20 bg-white/5 flex items-center justify-center cursor-pointer hover:border-white/40 hover:bg-white/10 transition-all group"
                  style={{
                    backgroundImage: eventData.title ? 
                      "linear-gradient(135deg, rgba(147, 51, 234, 0.8), rgba(59, 130, 246, 0.8)), url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"grain\" width=\"100\" height=\"100\" patternUnits=\"userSpaceOnUse\"><circle cx=\"20\" cy=\"20\" r=\"1\" fill=\"%23ffffff\" opacity=\"0.1\"/><circle cx=\"80\" cy=\"40\" r=\"1\" fill=\"%23ffffff\" opacity=\"0.1\"/><circle cx=\"40\" cy=\"80\" r=\"1\" fill=\"%23ffffff\" opacity=\"0.1\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23grain)\"/></svg>')" : 
                      undefined
                  }}
                >
                  {!eventData.title ? (
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 transition-colors">
                        <Camera className="w-6 h-6 text-white/60" />
                      </div>
                      <p className="text-white/60 font-medium">Add event image</p>
                      <p className="text-white/40 text-sm mt-1">Recommended: 1200x630</p>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/60 to-transparent rounded-2xl">
                      <h2 className="text-2xl font-bold text-white mb-2">{eventData.title}</h2>
                      <div className="flex items-center text-white/90 text-sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(eventData.date)} • {formatTime(eventData.time)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Theme Selector */}
                <div className="absolute top-4 right-4">
                  <Button 
                    type="button"
                    size="sm" 
                    variant="secondary" 
                    className="bg-white/90 text-gray-900 hover:bg-white rounded-xl px-3 py-2 text-xs font-medium"
                  >
                    Theme
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>

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
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-white font-medium">
                        {eventData.location || "Add location"}
                      </div>
                      <div className="text-sm text-white/60">
                        Offline location or virtual link
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
                  <div className="flex items-center space-x-2">
                    <span className="text-white/70">Free</span>
                    <Edit3 className="w-4 h-4 text-white/50" />
                  </div>
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
                  <div className="flex items-center space-x-2">
                    <span className="text-white/70">Unlimited</span>
                    <Edit3 className="w-4 h-4 text-white/50" />
                  </div>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  )
}