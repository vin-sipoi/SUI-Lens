"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Filter,
  Calendar,
  Heart,
  Menu,
  X,
  RefreshCw,
  MapPin
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import EventDetails from '@/components/EventDetails';
import { useEventContext } from '@/context/EventContext'
import { useUser } from '@/context/UserContext'
import Header from "../components/Header"
import styles from './page.module.css'

const EventDashboard: React.FC = () => {
  const { events, updateEvent, isLoading, fetchEvents } = useEventContext()
  const { user } = useUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null)

  const categories = [
    { id: "all", label: "All Events" },
    { id: "community", label: "Community" },
    { id: "developers", label: "Developers" },
    { id: "creators", label: "Content Creators" },
  ]

  // derive categories from events, remove empty and exclude any literal 'all'
  const eventCategories = Array.from(new Set(
    events
      .map(e => (e.category || '').toString().toLowerCase().trim())
      .filter(Boolean)
  )).filter(c => c !== 'all')

  // Do NOT include an 'All' tag here — the top category pills already include 'All'
  const tags = eventCategories.map(c => ({ id: c, label: c.split(/[-_\s]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') }))

  const filteredEvents = events
    .filter(event =>
      (event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       event.type.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedCategory === "all" || event.category === selectedCategory)
    )

  const handleRegister = (eventId: string) => {
    if (!user) {
      alert('Please login to register for events.')
      return
    }
    try {
      const event = events.find(e => e.id === eventId)
      if (event && user.walletAddress) {
        const rsvps = event.rsvps || []
        if (!rsvps.includes(user.walletAddress)) {
          updateEvent(eventId, { rsvps: [...rsvps, user.walletAddress] })
        }
      }
      const selected = events.find(e => e.id === eventId)
      setSelectedEvent(selected || null)
    } catch (error) {
      console.error("Error updating RSVP:", error)
      alert("Failed to register for event. Please try again.")
    }
  }

  return (
    <div className={`${styles.pageRoot} bg-[#F0F2F5] min-h-screen`}> 
      {/* Header */}
      <Header />

      {/* Search and Filter Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
        {/* Frame 1618867839 - centered absolute frame per Figma */}
        <div className={`${styles.searchFrame} flex items-center gap-[28px]`}>
          {/* Input Frame */}
          <div className="input-frame flex items-center gap-[10px] p-3 w-[760px] h-[56px] bg-[#F3F5F7] border border-[#D0D5DD] rounded-[8px] box-border">
            {/* Left Content */}
            <div className="flex items-center gap-[8px] flex-grow">
              <Search className="w-4 h-4 text-[#667185] flex-none" />

              <div className="flex items-center gap-[2px] w-[204px] h-[20px]">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm((e.target as HTMLInputElement).value)}
                  placeholder="Search for community or event..."
                  aria-label="Search"
                  className="bg-transparent border-none outline-none font-sans font-normal text-[14px] leading-[145%] text-[#101928] w-full"
                />
              </div>
            </div>

            {/* Right content hidden per Figma (kept for future use) */}
            <div className="hidden" />
          </div>

          {/* Button / primary (Refresh) */}
          <div className="refresh-frame flex items-center justify-center w-[110px] h-[56px] border border-[#D0D5DD] rounded-[10px] p-[6px] box-border">
            <button onClick={() => fetchEvents && fetchEvents()} disabled={isLoading} className="flex items-center justify-center gap-[6px] w-full h-full bg-transparent border-none p-0" style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}>
              <RefreshCw className={`${isLoading ? 'animate-spin' : ''} w-3 h-3 text-black`} />
              <span className="font-semibold text-[10px] leading-[130%] text-[#101928]">Refresh</span>
            </button>
          </div>
        </div>

        {/* Category Pills (unchanged positioning below the frame) */}
        <div className="pt-[180px] flex flex-nowrap overflow-x-auto pb-2 gap-2 sm:gap-3 hide-scrollbar">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium ${
                selectedCategory === category.id
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Event Grid - Figma absolute frames */}
      <div className="relative w-full h-[1400px]">
        {/* Tags Frame (Frame 53091) */}
        <div className={`${styles.tagsFrame} flex items-center gap-2`}>
          {/* Render tags dynamically from events (no hardcoded values) */}
          {tags.map((tag, idx) => {
             const isActive = selectedCategory === (tag.id)
             const bg = isActive ? '#E4F1FF' : '#FFFFFF'
             const border = isActive ? '1.5px solid #4DA2FF' : '1.5px solid #D0D5DD'
             const color = isActive ? '#4DA2FF' : '#667185'
             return (
               <button
                 key={tag.id + "-tag-" + idx}
                 onClick={() => setSelectedCategory(tag.id === 'all' ? 'all' : tag.id)}
                 className={`${styles.tagPill} flex items-center justify-center px-2 py-1 h-[40px] rounded-[16px]`}
                 style={{ background: bg, border: border, cursor: 'pointer' }}
               >
                 <div className="flex items-center gap-[4px]">
                   <div className="w-4 h-4 rounded-sm" style={{ background: isActive ? '#4DA2FF' : '#667185' }} />
                   <span className="font-semibold text-[14px] leading-[145%]" style={{ color }}>{tag.label}</span>
                 </div>
               </button>
             )
           })}
         </div>

        {/* Cards Container — standard layout for all events (wraps into rows of 3 using fixed card width) */}
        <div className={`${styles.cardsContainer}`}>
          {filteredEvents.map((event, i) => (
            <div key={event.id} className={`${styles.card}`}>
              {/* Community card image — centered and sized to Figma spec (444.48 x 266.87) */}
              <div className={`${styles.cardImageWrap} flex justify-center`}>
                <div className={`${styles.cardImage} overflow-hidden`}>
                  <img src={event.bannerUrl || event.image || 'https://via.placeholder.com/444x267'} alt={event.title} className="w-full h-full object-cover block" />
                </div>
              </div>

              {/* Inner content container centered (width: 415.95px) */}
              <div className={`${styles.cardInner} flex flex-col gap-[12.88px]`}>
                <div className="flex flex-col gap-[12.88px]">
                  <h3 className={`${styles.cardTitle} overflow-hidden truncate`} title={event.title}>{event.title}</h3>
                  <div className={`${styles.cardMeta} flex items-center gap-[12.88px]`}>
                    <div className="flex items-center gap-[4.37px]">
                      <Calendar className="w-[10.2px] h-[10.2px] text-[#667185]" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-[4.37px]">
                      <MapPin className="w-[10.2px] h-[10.2px] text-[#667185]" />
                      <span>{event.location || 'Online'}</span>
                    </div>
                  </div>
                </div>

                <p className={`${styles.cardDesc}`}>{event.description || ''}</p>

                <div className={`${styles.cardButtons} flex flex-col gap-[10px] mt-auto`}>
                  <Link href={`/event/${event.id}`} className={`no-underline ${styles.noUnderline}`}>
                    <div className={`${styles.primaryBtn} flex items-center justify-center`}>Register</div>
                  </Link>

                  <Link href={`/event/${event.id}`} className={`no-underline ${styles.noUnderline}`}>
                    <div className={`${styles.secondaryBtn} flex items-center justify-center`}>View Details</div>
                  </Link>
                </div>
              </div>
            </div>
           ))}
        </div>
      </div>

      {/* Event Details Inline */}
      {selectedEvent && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-lg shadow-lg max-w-6xl mx-auto">
            <EventDetails eventData={selectedEvent} onClose={() => setSelectedEvent(null)} />
          </div>
        </div>
      )}
    </div>
  )
}

export default EventDashboard