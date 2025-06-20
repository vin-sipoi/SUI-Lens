"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  MapPin,
  Palette,
  Award,
  Coins,
  Eye,
  Upload,
  ArrowRight,
  Check,
  Zap,
  Star,
  Trophy,
  Sparkles,
  Target,
  Rocket,
  Gift,
  Users,
  Clock,
  Camera,
  Heart,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"

const eventThemes = [
  {
    id: "default",
    name: "Clean Slate",
    price: "Free",
    gradient: "from-gray-50 to-gray-100",
    description: "Minimal & professional",
    emoji: "✨",
  },
  {
    id: "neon",
    name: "Cyber Glow",
    price: "10 SUI",
    gradient: "from-purple-400 via-pink-400 to-blue-400",
    description: "Electric vibes",
    emoji: "⚡",
  },
  {
    id: "forest",
    name: "Nature Zen",
    price: "15 SUI",
    gradient: "from-emerald-300 to-green-400",
    description: "Organic & calm",
    emoji: "🌿",
  },
  {
    id: "sunset",
    name: "Golden Hour",
    price: "20 SUI",
    gradient: "from-orange-300 via-pink-300 to-rose-400",
    description: "Warm & inviting",
    emoji: "🌅",
  },
  {
    id: "ocean",
    name: "Deep Blue",
    price: "25 SUI",
    gradient: "from-blue-400 via-cyan-400 to-teal-400",
    description: "Mysterious depths",
    emoji: "🌊",
  },
  {
    id: "premium",
    name: "Platinum",
    price: "50 SUI",
    gradient: "from-gray-300 via-slate-400 to-gray-500",
    description: "Ultimate luxury",
    emoji: "💎",
  },
]

const achievements = [
  { id: "title", name: "Event Named", icon: "🎯", completed: false },
  { id: "description", name: "Story Told", icon: "📖", completed: false },
  { id: "date", name: "Time Set", icon: "⏰", completed: false },
  { id: "location", name: "Place Found", icon: "📍", completed: false },
  { id: "category", name: "Vibe Chosen", icon: "🎨", completed: false },
  { id: "theme", name: "Style Picked", icon: "✨", completed: false },
]

export default function CreateEventPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedTheme, setSelectedTheme] = useState("default")
  const [completedAchievements, setCompletedAchievements] = useState<string[]>([])
  const [showConfetti, setShowConfetti] = useState(false)
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
    allowWaitlist: true,
    enablePOAP: true,
    bountyPool: "",
    tags: [] as string[],
  })

  // Calculate completion percentage
  const completionPercentage = Math.round((completedAchievements.length / achievements.length) * 100)

  // Check achievements
  useEffect(() => {
    const newAchievements: string[] = []

    if (eventData.title.length > 0) newAchievements.push("title")
    if (eventData.description.length > 10) newAchievements.push("description")
    if (eventData.date) newAchievements.push("date")
    if (eventData.location.length > 0) newAchievements.push("location")
    if (eventData.category) newAchievements.push("category")
    if (selectedTheme !== "default") newAchievements.push("theme")

    // Trigger confetti for new achievements
    if (newAchievements.length > completedAchievements.length) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }

    setCompletedAchievements(newAchievements)
  }, [eventData, selectedTheme, completedAchievements.length])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Event created:", { ...eventData, theme: selectedTheme })
  }

  const addTag = (tag: string) => {
    if (tag && !eventData.tags.includes(tag)) {
      setEventData({ ...eventData, tags: [...eventData.tags, tag] })
    }
  }

  const removeTag = (tagToRemove: string) => {
    setEventData({ ...eventData, tags: eventData.tags.filter((tag) => tag !== tagToRemove) })
  }

  const totalSteps = 4

  return (
    <div className="min-h-screen" style={{ background: "#201a28" }}>
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 60 }, (_, i) => (
            <div
              key={i}
              className="absolute animate-bounce-gentle animate-sparkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                fontSize: `${Math.random() * 24 + 16}px`,
              }}
            >
              {["🎉", "✨", "🎊", "⭐", "🚀", "💎", "🌟", "🎯"][Math.floor(Math.random() * 8)]}
            </div>
          ))}
        </div>
      )}

      {/* Sophisticated Floating Elements */}
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

      {/* Header */}
      <header className="border-b border-white/10 glass-dark sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 suilens-gradient-blue rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform animate-glow-pulse">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-3xl font-bold gradient-text text-glow-white">Suilens</span>
            </Link>

            {/* Progress & Achievement Bar */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-3 glass-light rounded-full px-6 py-3 shadow-xl">
                <Trophy className="w-5 h-5 text-amber-500 animate-sparkle" />
                <span className="text-sm font-bold text-gray-700">{completionPercentage}% Complete</span>
                <div className="w-24 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full suilens-gradient-blue transition-all duration-700 ease-out rounded-full"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all duration-500 ${
                      completedAchievements.includes(achievement.id)
                        ? "glass-light text-green-600 scale-125 animate-bounce-gentle shadow-lg"
                        : "glass-dark text-white/40"
                    }`}
                    title={achievement.name}
                  >
                    {achievement.icon}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/discover">
                <Button className="base-button-secondary">Cancel</Button>
              </Link>
              <Button form="create-event-form" type="submit" className="base-button-primary btn-magical">
                <Rocket className="w-5 h-5 mr-2" />
                Launch Event
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-6xl relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center space-x-3 glass-dark rounded-full px-8 py-3 mb-8 shadow-xl">
            <Sparkles className="w-6 h-6 text-blue-400 animate-sparkle" />
            <span className="text-blue-300 font-bold text-lg">Event Creation Quest</span>
          </div>
          <h1 className="text-display text-white mb-6 text-glow-white">Delightful events</h1>
          <h2 className="text-display gradient-text mb-8">start here.</h2>
          <p className="text-xl text-white/80 max-w-4xl mx-auto leading-relaxed">
            Create unforgettable Web3 experiences with our gamified event builder. Each step unlocks new possibilities!
            🚀
          </p>
        </div>

        <form id="create-event-form" onSubmit={handleSubmit}>
          <Tabs value={`step-${currentStep}`} className="w-full">
            {/* Sophisticated Tab Navigation */}
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-12 glass-dark rounded-3xl p-3 shadow-2xl border border-white/10">
              <TabsTrigger
                value="step-1"
                onClick={() => setCurrentStep(1)}
                className="rounded-2xl data-[state=active]:bg-white/15 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all font-bold text-white/70 data-[state=active]:scale-105"
              >
                <Target className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">The Basics</span>
                <span className="sm:hidden">Basics</span>
              </TabsTrigger>
              <TabsTrigger
                value="step-2"
                onClick={() => setCurrentStep(2)}
                className="rounded-2xl data-[state=active]:bg-white/15 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all font-bold text-white/70 data-[state=active]:scale-105"
              >
                <Clock className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">When & Where</span>
                <span className="sm:hidden">Details</span>
              </TabsTrigger>
              <TabsTrigger
                value="step-3"
                onClick={() => setCurrentStep(3)}
                className="rounded-2xl data-[state=active]:bg-white/15 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all font-bold text-white/70 data-[state=active]:scale-105"
              >
                <Palette className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Style It</span>
                <span className="sm:hidden">Style</span>
              </TabsTrigger>
              <TabsTrigger
                value="step-4"
                onClick={() => setCurrentStep(4)}
                className="rounded-2xl data-[state=active]:bg-white/15 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all font-bold text-white/70 data-[state=active]:scale-105"
              >
                <Eye className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Preview</span>
              </TabsTrigger>
            </TabsList>

            {/* Step 1: The Basics */}
            <TabsContent value="step-1" className="space-y-10 animate-fade-in-up">
              <Card className="base-card-light">
                <CardHeader className="bg-blue-50/80 border-b border-blue-100/50 rounded-t-3xl">
                  <CardTitle className="text-4xl font-bold text-gray-800 flex items-center">
                    <Target className="w-10 h-10 mr-4 text-blue-600" />
                    Let's Start Your Story
                  </CardTitle>
                  <p className="text-gray-600 text-xl mt-2">Every great event begins with a compelling story</p>
                </CardHeader>
                <CardContent className="p-10 space-y-10">
                  <div className="grid lg:grid-cols-2 gap-10">
                    <div className="space-y-8">
                      {/* Event Title */}
                      <div className="space-y-4 group">
                        <Label htmlFor="title" className="text-xl font-bold text-gray-800 flex items-center">
                          <Zap className="w-6 h-6 mr-3 text-yellow-500" />
                          What's your event called? *
                        </Label>
                        <div className="relative">
                          <Input
                            id="title"
                            placeholder="e.g., Sui Developer Conference 2024"
                            value={eventData.title}
                            onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                            required
                            className="text-xl py-5 rounded-2xl border-2 focus:border-blue-400"
                          />
                          {eventData.title && (
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                              <Check className="w-6 h-6 text-green-500 animate-bounce-gentle" />
                            </div>
                          )}
                        </div>
                        {eventData.title && (
                          <p className="text-sm text-green-600 flex items-center font-semibold">
                            <Star className="w-5 h-5 mr-2 animate-sparkle" />
                            Fantastic title! Very engaging.
                          </p>
                        )}
                      </div>

                      {/* Category */}
                      <div className="space-y-4">
                        <Label htmlFor="category" className="text-xl font-bold text-gray-800 flex items-center">
                          <Heart className="w-6 h-6 mr-3 text-pink-500" />
                          What's the vibe? *
                        </Label>
                        <Select
                          value={eventData.category}
                          onValueChange={(value) => setEventData({ ...eventData, category: value })}
                        >
                          <SelectTrigger className="text-xl py-5 rounded-2xl border-2">
                            <SelectValue placeholder="Choose your event's personality" />
                          </SelectTrigger>
                          <SelectContent className="base-card-light border-0 shadow-2xl rounded-2xl">
                            <SelectItem value="defi" className="text-xl py-4 rounded-xl">
                              🏗️ DeFi & Finance
                            </SelectItem>
                            <SelectItem value="nft" className="text-xl py-4 rounded-xl">
                              🎨 NFTs & Digital Art
                            </SelectItem>
                            <SelectItem value="gaming" className="text-xl py-4 rounded-xl">
                              🎮 Gaming & Metaverse
                            </SelectItem>
                            <SelectItem value="development" className="text-xl py-4 rounded-xl">
                              💻 Development & Tech
                            </SelectItem>
                            <SelectItem value="dao" className="text-xl py-4 rounded-xl">
                              🏛️ DAO & Governance
                            </SelectItem>
                            <SelectItem value="education" className="text-xl py-4 rounded-xl">
                              📚 Education & Learning
                            </SelectItem>
                            <SelectItem value="networking" className="text-xl py-4 rounded-xl">
                              🤝 Networking & Social
                            </SelectItem>
                            <SelectItem value="hackathon" className="text-xl py-4 rounded-xl">
                              ⚡ Hackathon & Competition
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Tags */}
                      <div className="space-y-4">
                        <Label className="text-xl font-bold text-gray-800 flex items-center">
                          <TrendingUp className="w-6 h-6 mr-3 text-purple-500" />
                          Add some hashtags
                        </Label>
                        <div className="flex flex-wrap gap-3 mb-4">
                          {eventData.tags.map((tag) => (
                            <Badge
                              key={tag}
                              className="px-5 py-2 rounded-full cursor-pointer hover:bg-red-100 bg-blue-50 text-blue-700 border border-blue-200 transition-all hover:scale-110 text-base font-semibold"
                              onClick={() => removeTag(tag)}
                            >
                              #{tag} ×
                            </Badge>
                          ))}
                        </div>
                        <Input
                          placeholder="Type a tag and press Enter"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              addTag(e.currentTarget.value)
                              e.currentTarget.value = ""
                            }
                          }}
                          className="text-lg rounded-2xl border-2"
                        />
                      </div>
                    </div>

                    <div className="space-y-8">
                      {/* Description */}
                      <div className="space-y-4">
                        <Label htmlFor="description" className="text-xl font-bold text-gray-800 flex items-center">
                          <Sparkles className="w-6 h-6 mr-3 text-cyan-500" />
                          Tell your story *
                        </Label>
                        <Textarea
                          id="description"
                          placeholder="Paint a picture with words... What makes this event special? What will attendees experience? Let your creativity flow! ✨"
                          rows={8}
                          value={eventData.description}
                          onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                          required
                          className="resize-none text-lg rounded-2xl border-2"
                        />
                        <div className="flex justify-between text-sm">
                          <span
                            className={`font-semibold ${eventData.description.length > 10 ? "text-green-600" : "text-gray-400"}`}
                          >
                            {eventData.description.length > 10 ? "✨ Excellent description!" : "Tell us more..."}
                          </span>
                          <span className="text-gray-400">{eventData.description.length} characters</span>
                        </div>
                      </div>

                      {/* Image Upload */}
                      <div className="space-y-4">
                        <Label className="text-xl font-bold text-gray-800 flex items-center">
                          <Camera className="w-6 h-6 mr-3 text-green-500" />
                          Add some visual magic
                        </Label>
                        <div className="border-2 border-dashed border-gray-200 rounded-3xl p-10 text-center hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer group">
                          <div className="w-24 h-24 suilens-gradient-blue rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-2xl">
                            <Upload className="w-12 h-12 text-white" />
                          </div>
                          <p className="text-gray-700 font-bold mb-3 text-lg">Drop your event banner here</p>
                          <p className="text-gray-500 mb-4">PNG, JPG up to 10MB • Recommended: 1200x630px</p>
                          <div className="inline-flex items-center space-x-3 text-blue-600">
                            <Gift className="w-5 h-5" />
                            <span className="font-semibold">Pro tip: Great visuals get 3x more attendees!</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button
                  onClick={() => setCurrentStep(2)}
                  className="base-button-primary px-10 py-5 text-xl font-bold btn-magical"
                >
                  Continue the Journey
                  <ArrowRight className="w-6 h-6 ml-3" />
                </Button>
              </div>
            </TabsContent>

            {/* Step 2: When & Where */}
            <TabsContent value="step-2" className="space-y-10 animate-fade-in-up">
              <div className="grid lg:grid-cols-2 gap-10">
                {/* Date & Time */}
                <Card className="base-card-light">
                  <CardHeader className="bg-emerald-50/80 border-b border-emerald-100/50 rounded-t-3xl">
                    <CardTitle className="flex items-center text-3xl text-gray-800">
                      <Clock className="w-8 h-8 mr-4 text-emerald-600" />
                      When's the Magic Happening?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="date" className="text-gray-800 font-bold flex items-center text-lg">
                          <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                          Event Date *
                        </Label>
                        <Input
                          id="date"
                          type="date"
                          value={eventData.date}
                          onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
                          required
                          className="text-lg py-4 rounded-2xl border-2"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="time" className="text-gray-800 font-bold text-lg">
                          Start Time *
                        </Label>
                        <Input
                          id="time"
                          type="time"
                          value={eventData.time}
                          onChange={(e) => setEventData({ ...eventData, time: e.target.value })}
                          required
                          className="text-lg py-4 rounded-2xl border-2"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="endTime" className="text-gray-800 font-bold text-lg">
                        End Time (optional)
                      </Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={eventData.endTime}
                        onChange={(e) => setEventData({ ...eventData, endTime: e.target.value })}
                        className="text-lg py-4 rounded-2xl border-2"
                      />
                    </div>
                    {eventData.date && eventData.time && (
                      <div className="status-success rounded-2xl p-6 border-2">
                        <p className="font-bold flex items-center text-lg">
                          <Check className="w-6 h-6 mr-3 animate-bounce-gentle" />
                          Perfect! Your event is scheduled. 🎯
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Location */}
                <Card className="base-card-light">
                  <CardHeader className="bg-pink-50/80 border-b border-pink-100/50 rounded-t-3xl">
                    <CardTitle className="flex items-center text-3xl text-gray-800">
                      <MapPin className="w-8 h-8 mr-4 text-pink-600" />
                      Where's the Party?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div className="space-y-3">
                      <Label htmlFor="location" className="text-gray-800 font-bold flex items-center text-lg">
                        <MapPin className="w-5 h-5 mr-2 text-pink-500" />
                        Venue or Address *
                      </Label>
                      <Input
                        id="location"
                        placeholder="Enter venue name or full address"
                        value={eventData.location}
                        onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                        required
                        className="text-lg py-4 rounded-2xl border-2"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="capacity" className="text-gray-800 font-bold flex items-center text-lg">
                        <Users className="w-5 h-5 mr-2 text-blue-500" />
                        How many people?
                      </Label>
                      <Input
                        id="capacity"
                        type="number"
                        placeholder="Maximum attendees"
                        value={eventData.capacity}
                        onChange={(e) => setEventData({ ...eventData, capacity: e.target.value })}
                        className="text-lg py-4 rounded-2xl border-2"
                      />
                      <p className="text-gray-500 font-medium">Leave empty for unlimited capacity</p>
                    </div>
                    {eventData.location && (
                      <div className="bg-pink-50 border-2 border-pink-200 rounded-2xl p-6">
                        <p className="text-pink-700 font-bold flex items-center text-lg">
                          <Check className="w-6 h-6 mr-3 animate-bounce-gentle" />
                          Location locked in! 📍
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Web3 Features */}
              <Card className="base-card-light">
                <CardHeader className="bg-blue-50/80 border-b border-blue-100/50 rounded-t-3xl">
                  <CardTitle className="flex items-center text-3xl text-gray-800">
                    <Coins className="w-8 h-8 mr-4 text-blue-600" />
                    Web3 Superpowers
                  </CardTitle>
                  <p className="text-gray-600 text-xl mt-3">Make your event legendary with blockchain features</p>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-8 bg-emerald-50 rounded-3xl border-2 border-emerald-200 hover:border-emerald-300 transition-all">
                        <div className="flex items-center space-x-6">
                          <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-xl">
                            <Award className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-emerald-800 text-xl">Enable POAP</p>
                            <p className="text-emerald-600 font-medium">Proof of Attendance Protocol</p>
                          </div>
                        </div>
                        <Switch
                          checked={eventData.enablePOAP}
                          onCheckedChange={(checked) => setEventData({ ...eventData, enablePOAP: checked })}
                          className="scale-150"
                        />
                      </div>

                      <div className="space-y-4">
                        <Label htmlFor="bountyPool" className="text-gray-800 font-bold flex items-center text-lg">
                          <Gift className="w-5 h-5 mr-2 text-purple-500" />
                          Bounty Pool (SUI)
                        </Label>
                        <Input
                          id="bountyPool"
                          type="number"
                          placeholder="0"
                          value={eventData.bountyPool}
                          onChange={(e) => setEventData({ ...eventData, bountyPool: e.target.value })}
                          className="text-lg py-4 rounded-2xl border-2"
                        />
                        <p className="text-gray-500 flex items-center font-medium">
                          <Sparkles className="w-5 h-5 mr-2" />
                          Reward community contributions and engagement
                        </p>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="space-y-6">
                        <div className="flex items-center space-x-4 p-6 bg-gray-50 rounded-3xl hover:bg-gray-100 transition-colors">
                          <Switch
                            id="private-event"
                            checked={eventData.isPrivate}
                            onCheckedChange={(checked) => setEventData({ ...eventData, isPrivate: checked })}
                            className="scale-125"
                          />
                          <Label htmlFor="private-event" className="text-gray-800 font-bold text-lg">
                            Private Event
                          </Label>
                        </div>

                        <div className="flex items-center space-x-4 p-6 bg-gray-50 rounded-3xl hover:bg-gray-100 transition-colors">
                          <Switch
                            id="approval-required"
                            checked={eventData.requiresApproval}
                            onCheckedChange={(checked) => setEventData({ ...eventData, requiresApproval: checked })}
                            className="scale-125"
                          />
                          <Label htmlFor="approval-required" className="text-gray-800 font-bold text-lg">
                            Require Approval
                          </Label>
                        </div>

                        <div className="flex items-center space-x-4 p-6 bg-gray-50 rounded-3xl hover:bg-gray-100 transition-colors">
                          <Switch
                            id="allow-waitlist"
                            checked={eventData.allowWaitlist}
                            onCheckedChange={(checked) => setEventData({ ...eventData, allowWaitlist: checked })}
                            className="scale-125"
                          />
                          <Label htmlFor="allow-waitlist" className="text-gray-800 font-bold text-lg">
                            Allow Waitlist
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row justify-between gap-6">
                <Button
                  onClick={() => setCurrentStep(1)}
                  className="base-button-secondary px-10 py-5 text-xl font-bold"
                >
                  Back to Basics
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  className="base-button-green px-10 py-5 text-xl font-bold btn-magical"
                >
                  Choose Your Style
                  <ArrowRight className="w-6 h-6 ml-3" />
                </Button>
              </div>
            </TabsContent>

            {/* Step 3: Theme Selection */}
            <TabsContent value="step-3" className="space-y-10 animate-fade-in-up">
              <Card className="base-card-light">
                <CardHeader className="bg-pink-50/80 border-b border-pink-100/50 rounded-t-3xl">
                  <CardTitle className="flex items-center text-4xl text-gray-800">
                    <Palette className="w-10 h-10 mr-4 text-pink-600" />
                    Make It Beautiful
                  </CardTitle>
                  <p className="text-gray-600 text-xl mt-3">Choose a theme that matches your event's personality</p>
                </CardHeader>
                <CardContent className="p-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {eventThemes.map((theme) => (
                      <div
                        key={theme.id}
                        className={`relative cursor-pointer rounded-3xl overflow-hidden transition-all duration-500 interactive ${
                          selectedTheme === theme.id ? "ring-4 ring-blue-500 shadow-2xl scale-110" : "hover:shadow-2xl"
                        }`}
                        onClick={() => setSelectedTheme(theme.id)}
                      >
                        <div className={`h-48 bg-gradient-to-br ${theme.gradient} relative overflow-hidden`}>
                          {theme.price !== "Free" && (
                            <div className="absolute top-4 right-4">
                              <Badge className="bg-white/95 text-gray-900 font-bold px-4 py-2 rounded-full shadow-xl text-sm">
                                {theme.price}
                              </Badge>
                            </div>
                          )}
                          <div className="absolute top-4 left-4 text-4xl animate-bounce-gentle">{theme.emoji}</div>
                          {selectedTheme === theme.id && (
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center animate-bounce-gentle shadow-2xl">
                                <Check className="w-10 h-10 text-blue-600" />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="p-8 bg-white">
                          <h3 className="font-bold text-2xl mb-3 text-gray-900">{theme.name}</h3>
                          <p className="text-gray-600 text-lg">{theme.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row justify-between gap-6">
                <Button
                  onClick={() => setCurrentStep(2)}
                  className="base-button-secondary px-10 py-5 text-xl font-bold"
                >
                  Back to Details
                </Button>
                <Button
                  onClick={() => setCurrentStep(4)}
                  className="base-button-pink px-10 py-5 text-xl font-bold btn-magical"
                >
                  See the Magic
                  <ArrowRight className="w-6 h-6 ml-3" />
                </Button>
              </div>
            </TabsContent>

            {/* Step 4: Preview */}
            <TabsContent value="step-4" className="space-y-10 animate-fade-in-up">
              <Card className="base-card-light">
                <CardHeader className="bg-emerald-50/80 border-b border-emerald-100/50 rounded-t-3xl">
                  <CardTitle className="flex items-center text-4xl text-gray-800">
                    <Eye className="w-10 h-10 mr-4 text-emerald-600" />
                    Your Masterpiece
                  </CardTitle>
                  <p className="text-gray-600 text-xl mt-3">Take a final look before launching to the world</p>
                </CardHeader>
                <CardContent className="p-10">
                  {/* Event Preview Card */}
                  <div className="max-w-3xl mx-auto">
                    <div
                      className={`rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br ${eventThemes.find((t) => t.id === selectedTheme)?.gradient} interactive`}
                    >
                      <div className="h-64 relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/30"></div>
                        <div className="absolute top-6 right-6 text-5xl animate-bounce-gentle">
                          {eventThemes.find((t) => t.id === selectedTheme)?.emoji}
                        </div>
                        <div className="absolute bottom-8 left-8 right-8">
                          <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-lg text-glow-white">
                            {eventData.title || "Your Amazing Event Title"}
                          </h2>
                          <div className="flex items-center text-white/90 text-xl">
                            <Calendar className="w-6 h-6 mr-3" />
                            {eventData.date || "Event Date"} • {eventData.time || "Time"}
                          </div>
                        </div>
                      </div>
                      <div className="bg-white p-10">
                        <div className="flex items-center justify-between mb-8">
                          <Badge className="rounded-full px-6 py-3 text-xl bg-blue-50 text-blue-700 border-2 border-blue-200 font-bold">
                            {eventData.category || "Category"}
                          </Badge>
                          <div className="flex gap-4">
                            {eventData.enablePOAP && (
                              <Badge className="bg-emerald-500 text-white rounded-full px-4 py-2 shadow-xl font-bold">
                                <Award className="w-5 h-5 mr-2" />
                                POAP
                              </Badge>
                            )}
                            {eventData.bountyPool && (
                              <Badge className="bg-purple-500 text-white rounded-full px-4 py-2 shadow-xl font-bold">
                                <Coins className="w-5 h-5 mr-2" />
                                Bounty
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-700 mb-8 text-xl leading-relaxed">
                          {eventData.description ||
                            "Your amazing event description will appear here, telling the story of what makes this event special and why people should attend..."}
                        </p>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-6 h-6 mr-3" />
                          <span className="text-xl font-semibold">{eventData.location || "Event Location"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row justify-between gap-6">
                <Button
                  onClick={() => setCurrentStep(3)}
                  className="base-button-secondary px-10 py-5 text-xl font-bold"
                >
                  Back to Styling
                </Button>
                <Button
                  type="submit"
                  className="base-button-green px-16 py-6 text-2xl font-bold btn-magical shadow-2xl"
                >
                  <Rocket className="w-8 h-8 mr-4" />
                  Launch Your Event! 🚀
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </div>
  )
}
