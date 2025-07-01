'use client' 

import React, { createContext, useContext, useState, ReactNode } from "react"

export type Event = {
  id: string
  title: string
  description: string
  date: string
  time: string
  endTime: string
  location: string
  category: string
  capacity: string
  ticketPrice: string
  isFree: boolean
  requiresApproval: boolean
  isPrivate: boolean
  timezone: string
  attendees?: number
  [key: string]: any
}

type EventContextType = {
  events: Event[]
  addEvent: (event: Event) => void
}

const EventContext = createContext<EventContextType | undefined>(undefined)

export const useEventContext = () => {
  const ctx = useContext(EventContext)
  if (!ctx) throw new Error("useEventContext must be used within EventProvider")
  return ctx
}

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<Event[]>([])

  const addEvent = (event: Event) => setEvents((prev) => [...prev, event])

  return (
    <EventContext.Provider value={{ events, addEvent }}>
      {children}
    </EventContext.Provider>
  )
}