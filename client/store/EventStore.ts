// store/EventStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  attendees?: number
  maxAttendees?: number
  category: string
  imageUrl?: string
  price?: number
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  createdBy: string
  createdAt: string
  updatedAt: string
  isPublic: boolean
  tags?: string[]
  venue?: {
    name: string
    address: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  registrationDeadline?: string
  requirements?: string[]
  organizer?: {
    id: string
    name: string
    email: string
    avatar?: string
  }
}

interface EventState {
  // Events created by the current user
  myEvents: Event[]
  
  // Events the user has registered for
  registeredEvents: Event[]
  
  // All available events (for discovery)
  allEvents: Event[]
  
  // Loading states
  isLoading: boolean
  error: string | null
  
  // Actions for managing user's own events
  addMyEvent: (event: Event) => void
  updateMyEvent: (id: string, updatedEvent: Partial<Event>) => void
  removeMyEvent: (id: string) => void
  
  // Actions for event registration
  registerForEvent: (eventId: string) => void
  unregisterFromEvent: (eventId: string) => void
  
  // Actions for managing all events
  setAllEvents: (events: Event[]) => void
  addEvent: (event: Event) => void
  updateEvent: (id: string, updatedEvent: Partial<Event>) => void
  
  // Utility actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  
  // Get events by various filters
  getEventsByCategory: (category: string) => Event[]
  getUpcomingEvents: () => Event[]
  getPastEvents: () => Event[]
  searchEvents: (query: string) => Event[]
}

export const useEventStore = create<EventState>()(
  persist(
    (set, get) => ({
      // Initial state
      myEvents: [],
      registeredEvents: [],
      allEvents: [],
      isLoading: false,
      error: null,

      // Actions for managing user's own events
      addMyEvent: (event) =>
        set((state) => ({
          myEvents: [...state.myEvents, event],
          allEvents: [...state.allEvents, event],
        })),

      updateMyEvent: (id, updatedEvent) =>
        set((state) => ({
          myEvents: state.myEvents.map((event) =>
            event.id === id ? { ...event, ...updatedEvent, updatedAt: new Date().toISOString() } : event
          ),
          allEvents: state.allEvents.map((event) =>
            event.id === id ? { ...event, ...updatedEvent, updatedAt: new Date().toISOString() } : event
          ),
        })),

      removeMyEvent: (id) =>
        set((state) => ({
          myEvents: state.myEvents.filter((event) => event.id !== id),
          allEvents: state.allEvents.filter((event) => event.id !== id),
          registeredEvents: state.registeredEvents.filter((event) => event.id !== id),
        })),

      // Actions for event registration
      registerForEvent: (eventId) =>
        set((state) => {
          const event = state.allEvents.find((e) => e.id === eventId)
          if (event && !state.registeredEvents.find((e) => e.id === eventId)) {
            return {
              registeredEvents: [...state.registeredEvents, event],
              allEvents: state.allEvents.map((e) =>
                e.id === eventId
                  ? { ...e, attendees: (e.attendees || 0) + 1 }
                  : e
              ),
            }
          }
          return state
        }),

      unregisterFromEvent: (eventId) =>
        set((state) => ({
          registeredEvents: state.registeredEvents.filter((event) => event.id !== eventId),
          allEvents: state.allEvents.map((e) =>
            e.id === eventId && e.attendees && e.attendees > 0
              ? { ...e, attendees: e.attendees - 1 }
              : e
          ),
        })),

      // Actions for managing all events
      setAllEvents: (events) =>
        set(() => ({
          allEvents: events,
        })),

      addEvent: (event) =>
        set((state) => ({
          allEvents: [...state.allEvents, event],
        })),

      updateEvent: (id, updatedEvent) =>
        set((state) => ({
          allEvents: state.allEvents.map((event) =>
            event.id === id ? { ...event, ...updatedEvent, updatedAt: new Date().toISOString() } : event
          ),
          myEvents: state.myEvents.map((event) =>
            event.id === id ? { ...event, ...updatedEvent, updatedAt: new Date().toISOString() } : event
          ),
          registeredEvents: state.registeredEvents.map((event) =>
            event.id === id ? { ...event, ...updatedEvent, updatedAt: new Date().toISOString() } : event
          ),
        })),

      // Utility actions
      setLoading: (loading) =>
        set(() => ({
          isLoading: loading,
        })),

      setError: (error) =>
        set(() => ({
          error,
        })),

      clearError: () =>
        set(() => ({
          error: null,
        })),

      // Get events by various filters
      getEventsByCategory: (category) =>
        get().allEvents.filter((event) => event.category === category),

      getUpcomingEvents: () =>
        get().allEvents.filter((event) => {
          const eventDate = new Date(event.date)
          const now = new Date()
          return eventDate > now && event.status === 'upcoming'
        }),

      getPastEvents: () =>
        get().allEvents.filter((event) => {
          const eventDate = new Date(event.date)
          const now = new Date()
          return eventDate < now || event.status === 'completed'
        }),

      searchEvents: (query) =>
        get().allEvents.filter((event) =>
          event.title.toLowerCase().includes(query.toLowerCase()) ||
          event.description.toLowerCase().includes(query.toLowerCase()) ||
          event.location.toLowerCase().includes(query.toLowerCase()) ||
          event.tags?.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
        ),
    }),
    {
      name: 'event-store', // name for localStorage key
      partialize: (state) => ({
        myEvents: state.myEvents,
        registeredEvents: state.registeredEvents,
        allEvents: state.allEvents,
      }),
    }
  )
)

export default useEventStore