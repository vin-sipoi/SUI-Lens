"use client"

import { useParams } from "next/navigation"
import { useEventContext } from "@/context/EventContext"
import { useUser } from "@/app/landing/UserContext"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, MapPin, Clock, Users, Share2, Heart, DollarSign } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { mintPOAP } from "@/lib/sui-client"

export default function EventPage() {
  const { id } = useParams()
  const { events } = useEventContext()
  const { user } = useUser()
  const walletAddress = user?.walletAddress || ""

  // Find event by id from context
  const eventData = events.find((event) => event.id === id)

  // Handle case if event not found
  if (!eventData) {
    return <div className="text-white p-8">Event not found</div>
  }

  const [isRegistered, setIsRegistered] = useState(false)
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [hasClaimedPOAP, setHasClaimedPOAP] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isMinting, setIsMinting] = useState(false)

  const handleRegister = () => {
    setIsRegistered(true)
  }

  const handleCheckIn = () => {
    if (!isRegistered) {
      alert("Please register before checking in.")
      return
    }
    setIsCheckedIn(true)
  }

  const handleClaimPOAP = async () => {
    if (!isCheckedIn) {
      alert("Please check in before claiming your POAP.")
      return
    }
    setIsMinting(true)
    try {
      const tx = await mintPOAP(
        eventData.id?.toString() ?? "",
        eventData.title,
        eventData.image,
        eventData.description,
        walletAddress
      )
      console.log("POAP mint transaction:", tx)
      setHasClaimedPOAP(true)
      alert("POAP minted successfully!")
    } catch (error) {
      console.error("Error minting POAP:", error)
      alert("Failed to mint POAP. Please try again.")
    } finally {
      setIsMinting(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "#201a28" }}>
      {/* Floating Elements */}
      {typeof window !== "undefined" && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="floating-orb floating-orb-1 w-32 h-32 top-20 left-10 animate-float-elegant"></div>
          <div
            className="floating-orb floating-orb-2 w-24 h-24 top-40 right-20 animate-float-elegant"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="floating-orb floating-orb-3 w-40 h-40 bottom-40 left-20 animate-float-elegant"
            style={{ animationDelay: "4s" }}
          ></div>
          <div
            className="floating-orb floating-orb-4 w-28 h-28 bottom-20 right-10 animate-float-elegant"
            style={{ animationDelay: "6s" }}
          ></div>
        </div>
      )}

      {/* Enhanced Header */}
      <header className="border-b border-white/10 glass-dark sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/landing" className="flex items-center space-x-3">
            <div className="w-10 h-10 suilens-gradient-blue rounded-2xl flex items-center justify-center shadow-lg animate-glow-pulse">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-3xl font-bold gradient-text">Suilens</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/discover" className="text-white/70 hover:text-white transition-colors font-medium">
              ← Back to Events
            </Link>
            <Button className="base-button-secondary">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Image */}
            <div className="relative">
              <Image
                src={eventData.image || "/placeholder.svg"}
                alt={eventData.title}
                width={800}
                height={400}
                className="w-full h-64 md:h-80 object-cover rounded-3xl"
              />
              <Button
                variant="ghost"
                size="sm"
                className={`absolute top-4 right-4 glass-dark hover:bg-white/20 ${isLiked ? "text-red-400" : "text-white"} rounded-xl`}
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
              </Button>
            </div>

            {/* Event Details */}
            <div className="base-card p-8 space-y-6">
              <div className="flex flex-wrap gap-2">
                {eventData.tags?.map((tag) => (
                  <Badge key={tag} className="bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full">
                    {tag}
                  </Badge>
                ))}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-white">{eventData.title}</h1>

              <div className="grid md:grid-cols-2 gap-4 text-white/70">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-3 text-blue-400" />
                  <span>{eventData.date}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-3 text-green-400" />
                  <span>{eventData.time}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-3 text-pink-400" />
                  <span>{eventData.location}</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-3 text-purple-400" />
                  <span>{eventData.registered ?? 0} registered</span>
                </div>
              </div>
            </div>

            <div className="h-px bg-white/10"></div>

            {/* Description */}
            <div className="base-card p-8 space-y-4">
              <h2 className="text-2xl font-semibold text-white">About This Event</h2>
              <p className="text-white/80 leading-relaxed">{eventData.description}</p>
            </div>

            <div className="h-px bg-white/10"></div>

            {/* Organizer */}
            <div className="base-card p-8 space-y-4">
              <h2 className="text-2xl font-semibold text-white">Organizer</h2>
              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={eventData.organizer?.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-blue-500 text-white">SC</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-white">{eventData.organizer?.name}</h3>
                  <p className="text-white/60 text-sm">{eventData.organizer?.title}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enhanced Registration Card */}
            <Card className="base-card overflow-hidden sticky top-4">
              <div className="suilens-gradient-blue p-1 rounded-3xl">
                <div className="base-card-light rounded-3xl">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-3xl">
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-3xl font-bold gradient-text">{eventData.price}</span>
                      <Badge className="bg-blue-500 text-white border-0 font-semibold px-3 py-1 rounded-full">
                        {eventData.category}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-gray-600">Registered</span>
                        <span className="text-gray-900">
                      {eventData.registered ?? 0} / {parseInt(eventData.capacity ?? "0") ?? 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="suilens-gradient-blue h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${((eventData.registered ?? 0) / (parseInt(eventData.capacity ?? "1") ?? 1)) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    {(parseInt(eventData.capacity ?? "0") ?? 0) - (eventData.registered ?? 0)} spots remaining
                  </p>
                    </div>

                    <Button
                      className={`w-full text-lg font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                        isRegistered ? "bg-gray-400 hover:bg-gray-500" : "base-button-primary"
                      }`}
                      size="lg"
                      onClick={handleRegister}
                    >
                      {isRegistered ? "✓ Registered" : "Register for Event"}
                    </Button>

                    {isRegistered && !isCheckedIn && (
                      <Button
                        className="w-full text-lg font-semibold py-4 rounded-xl shadow-lg base-button-primary mt-4"
                        size="lg"
                        onClick={handleCheckIn}
                      >
                        Check In
                      </Button>
                    )}

                    {isCheckedIn && !hasClaimedPOAP && (
                      <Button
                        className="w-full text-lg font-semibold py-4 rounded-xl shadow-lg base-button-primary mt-4"
                        size="lg"
                        onClick={handleClaimPOAP}
                        disabled={isMinting}
                      >
                        {isMinting ? "Minting POAP..." : "Claim POAP"}
                      </Button>
                    )}

                    {hasClaimedPOAP && (
                      <p className="text-green-400 text-center font-semibold mt-4">
                        POAP claimed! 🎉
                      </p>
                    )}

                    <p className="text-xs text-gray-500 text-center bg-gray-50 p-3 rounded-xl">
                      🔒 Registration closes 1 hour before the event
                    </p>
                  </CardContent>
                </div>
              </div>
            </Card>

            {/* Event Info */}
            <Card className="base-card">
              <CardHeader>
                <CardTitle className="text-white">Event Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-white">Date & Time</p>
                      <p className="text-sm text-white/70">{eventData.date}</p>
                      <p className="text-sm text-white/70">{eventData.time}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-pink-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-white">Location</p>
                      <p className="text-sm text-white/70">{eventData.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <DollarSign className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-white">Price</p>
                      <p className="text-sm text-white/70">{eventData.price}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
