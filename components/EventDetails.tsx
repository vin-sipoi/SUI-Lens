"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MapPin, Clock, Users, Share2, Heart } from "lucide-react";
import Image from "next/image";
import { mintPOAP } from "@/lib/sui-client";
import { useUser } from "@/app/landing/UserContext";

interface EventDetailsProps {
  eventData: any;
  onClose: () => void;
}

export default function EventDetails({ eventData, onClose }: EventDetailsProps) {
  const { user } = useUser();
  const walletAddress = user?.walletAddress || "";

  const [isRegistered, setIsRegistered] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [hasClaimedPOAP, setHasClaimedPOAP] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isMinting, setIsMinting] = useState(false);

  const handleRegister = () => {
    setIsRegistered(true);
  };

  const handleCheckIn = () => {
    if (!isRegistered) {
      alert("Please register before checking in.");
      return;
    }
    setIsCheckedIn(true);
  };

  const handleClaimPOAP = async () => {
    if (!isCheckedIn) {
      alert("Please check in before claiming your POAP.");
      return;
    }
    setIsMinting(true);
    try {
      // Ensure all string parameters are defined and fallback to empty string if undefined
      const eventId = eventData.id?.toString() ?? "";
      const title = eventData.title ?? "";
      const image = eventData.image ?? "";
      const description = eventData.description ?? "";

      const tx = await mintPOAP(
        eventId,
        title,
        image,
        description,
        walletAddress
      );
      console.log("POAP mint transaction:", tx);
      setHasClaimedPOAP(true);
      alert("POAP minted successfully!");
    } catch (error) {
      console.error("Error minting POAP:", error);
      alert("Failed to mint POAP. Please try again.");
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="p-4">
        <Button onClick={onClose} variant="outline" className="text-white border-white hover:bg-gray-800">
          Close
        </Button>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
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
                className={`absolute top-4 right-4 bg-white/10 hover:bg-white/20 ${isLiked ? "text-red-400" : "text-white"} rounded-xl`}
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
              </Button>
            </div>

            <div className="bg-gray-800 p-6 rounded-2xl shadow-lg space-y-4">
              <div className="flex flex-wrap gap-2">
                {eventData.tags?.map((tag: string) => (
                  <Badge key={tag} className="bg-purple-500/20 text-purple-300 border border-purple-400/30 rounded-full">
                    {tag}
                  </Badge>
                ))}
              </div>

              <h1 className="text-3xl font-bold">{eventData.title}</h1>

              <div className="grid md:grid-cols-2 gap-4 text-gray-300">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-purple-400" />
                  <span>{eventData.date}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-green-400" />
                  <span>{eventData.time}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-pink-400" />
                  <span>{eventData.location}</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-400" />
                  <span>{eventData.registered ?? 0} registered</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-semibold mb-4">About This Event</h2>
              <p className="text-gray-400 leading-relaxed">{eventData.description}</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-semibold mb-4">Organizer</h2>
              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={eventData.organizer?.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-purple-500 text-white">{eventData.organizer?.name?.charAt(0) || "O"}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{eventData.organizer?.name}</h3>
                  <p className="text-gray-500 text-sm">{eventData.organizer?.title}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="bg-gray-800 border-none shadow-lg">
              <CardHeader className="bg-purple-600 text-white rounded-t-2xl p-4">
                <CardTitle className="text-2xl font-bold">Pending Approval</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p>We will let you know when the host approves your registration.</p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">Add to Calendar</Button>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg mt-2">Invite a Friend</Button>
                <p className="text-gray-500 text-sm mt-4">No longer able to attend? Notify the host by cancelling your registration.</p>
                <p className="text-gray-500 text-sm">Get Ready for the Event</p>
                <p className="text-gray-500 text-sm">Profile Complete - Reminder: SMS & Email</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-white text-2xl">Event Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="font-medium">Date</p>
                    <p className="text-gray-400">{eventData.date}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="font-medium">Time</p>
                    <p className="text-gray-400">{eventData.time}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-pink-400" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-gray-400">{eventData.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Registration and POAP Minting Section */}
            <Card className="bg-gray-800 border-none shadow-lg">
              <CardContent className="p-6 space-y-4">
                <Button
                  className={`w-full text-lg font-semibold py-4 rounded-xl shadow-lg ${isRegistered ? "bg-gray-400 hover:bg-gray-500" : "bg-blue-600 hover:bg-blue-700"}`}
                  onClick={handleRegister}
                  disabled={isRegistered}
                >
                  {isRegistered ? "✓ Registered" : "Register for Event"}
                </Button>
                {isRegistered && !isCheckedIn && (
                  <Button
                    className="w-full text-lg font-semibold py-4 rounded-xl shadow-lg bg-blue-600 hover:bg-blue-700 mt-4"
                    onClick={handleCheckIn}
                  >
                    Check In
                  </Button>
                )}
                {isCheckedIn && !hasClaimedPOAP && (
                  <Button
                    className="w-full text-lg font-semibold py-4 rounded-xl shadow-lg bg-blue-600 hover:bg-blue-700 mt-4"
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}