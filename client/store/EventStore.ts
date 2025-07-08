import { create } from "zustand"

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
  attendees:string
}

type EventStore = {
  myEvents: Event[]
  addEvent: (event: Event) => void
}

export const useEventStore = create<EventStore>((set) => ({
  myEvents: [],
  addEvent: (event) =>
    set((state) => ({
      myEvents: [...state.myEvents, event],
    })),
}))