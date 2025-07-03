'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface RewardPool {
  amount: number
  maxParticipants: number
  status: 'none' | 'locked' | 'distributed' | 'cancelled'
  contractEventId?: string
  distributionMethod: 'attendance' | 'manual'
  participants: string[]
  distributedAt?: Date
  createdAt: Date
}

interface Event {
  id: string
  title: string
  description: string
  date: string
  endDate?: string
  time: string
  endTime?: string
  location: string
  capacity?: string
  ticketPrice?: string
  isFree: boolean
  requiresApproval?: boolean
  isPrivate: boolean
  poapEnabled?: boolean
  qrCode?: string
  eventUrl?: string
  type: string
  rsvps?: string[]
  attendance?: string[]
  image?: string
  tags?: string[]
  registered?: number
  organizer?: {
    name: string
    avatar?: string
    title?: string
  }
  price?: string
  category?: string
  rewardPool?: RewardPool
}

interface EventContextType {
  events: Event[]
  addEvent: (event: Event) => void
  getEvent: (id: string) => Event | undefined
  updateEvent: (id: string, updates: Partial<Event>) => void
  deleteEvent: (id: string) => void
  markAttendance: (eventId: string, attendee: string) => void
}

const EventContext = createContext<EventContextType | undefined>(undefined)

export function EventProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([])

  const addEvent = (event: Event) => {
    setEvents(prev => [...prev, event])
  }

  const getEvent = (id: string) => {
    return events.find(event => event.id === id)
  }

  const updateEvent = (id: string, updates: Partial<Event>) => {
    setEvents(prev => 
      prev.map(event => 
        event.id === id ? { ...event, ...updates } : event
      )
    )
  }

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id))
  }

  const markAttendance = (eventId: string, attendee: string) => {
    setEvents(prev =>
      prev.map(event => {
        if (event.id === eventId) {
          const attendance = event.attendance || []
          if (!attendance.includes(attendee)) {
            return { ...event, attendance: [...attendance, attendee] }
          }
        }
        return event
      })
    )
  }

  return (
    <EventContext.Provider value={{
      events,
      addEvent,
      getEvent,
      updateEvent,
      deleteEvent,
      markAttendance
    }}>
      {children}
    </EventContext.Provider>
  )
}

export function useEventContext() {
  const context = useContext(EventContext)
  if (context === undefined) {
    throw new Error('useEventContext must be used within an EventProvider')
  }
  return context
}