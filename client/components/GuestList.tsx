"use client"

import { useState, useEffect } from "react"
import { useEventContext } from "@/context/EventContext"
import useSuiLensTransaction from "@/hooks/useSuiLensTransaction"
import { formatAddress } from "@/lib/utils"
import { useUser } from "@/context/UserContext"
import { Download } from "lucide-react"

type GuestStatus = "New Member" | "Existing Member"

const statusStyles: Record<GuestStatus, string> = {
  "New Member": "bg-green-50 text-green-700 border border-green-100",
  "Existing Member": "bg-yellow-50 text-yellow-700 border border-yellow-100",
}

interface GuestRow {
  address: string
  name?: string
  email?: string
  status: GuestStatus
  date?: string
}

interface Props {
  eventId?: string | null
}

export default function GuestList({ eventId }: Props) {
  const { getEvent, markAttendance } = useEventContext()
  const { markAttendance: txMarkAttendance } = useSuiLensTransaction()
  const [guests, setGuests] = useState<GuestRow[]>([])
  const [marking, setMarking] = useState<string | null>(null)
  const { user } = useUser()
  const { events } = useEventContext()
  const [selectedLocalEventId, setSelectedLocalEventId] = useState<string | null>(eventId || null)

  const currentEvent = selectedLocalEventId ? getEvent(selectedLocalEventId) : null

  const userEvents = events.filter(e =>
    e.creator === user?.walletAddress ||
    e.organizer?.name === user?.walletAddress ||
    e.organizer?.name === user?.name
  )

  useEffect(() => {
    if (eventId) setSelectedLocalEventId(eventId)
  }, [eventId])

  useEffect(() => {
    const id = selectedLocalEventId
    if (!id) {
      setGuests([])
      return
    }

    const event = getEvent(id)
    if (!event || !event.rsvps || event.rsvps.length === 0) {
      setGuests([])
      return
    }

    const mapped: GuestRow[] = (event.rsvps || []).map((rsvp: any) => {
      // support both string RSVP entries and object entries with metadata
      if (typeof rsvp === 'string') {
        return {
          address: rsvp,
          name: formatAddress(rsvp),
          email: undefined,
          status: ((event.attendance || []).includes(rsvp) ? 'Existing Member' : 'New Member') as GuestStatus,
          date: (event.rsvpTimes && event.rsvpTimes[rsvp]) || undefined,
        }
      }

      // rsvp object shape: { address, name, email, registeredAt }
      const addr = rsvp.address || rsvp.addr || ''
      return {
        address: addr,
        
        email: rsvp.email,
        status: ((event.attendance || []).includes(addr) ? 'Existing Member' : 'New Member') as GuestStatus,
        date: rsvp.registeredAt || rsvp.date || rsvp.time || undefined,
      }
    })

    setGuests(mapped)
  }, [selectedLocalEventId, getEvent])

  const formatDate = (d?: string | number) => {
    if (!d && d !== 0) return '—'
    try {
      let dt: Date
      if (typeof d === 'number') {
        dt = new Date(d)
      } else if (/^\d+$/.test(d)) {
        // numeric string: decide seconds vs milliseconds
        const n = Number(d)
        dt = n > 1e12 ? new Date(n) : new Date(n * 1000)
      } else {
        dt = new Date(d)
      }

      if (isNaN(dt.getTime())) return String(d)
      return dt.toLocaleString()
    } catch (e) {
      return String(d)
    }
  }

  const downloadCsv = () => {
    if (!guests || guests.length === 0) return

    const headers = ["address", "name", "email", "status", "date"]
    const esc = (v?: string) => `"${String(v ?? "").replace(/"/g, '""')}"`

    const rows = guests.map(g => [g.address, g.name ?? '', g.email ?? '', g.status, g.date ?? ''].map(esc).join(','))
    const csv = [headers.join(','), ...rows].join('\r\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const safeTitle = (currentEvent?.title || selectedLocalEventId || 'guests').toString().replace(/\s+/g, '_')
    a.download = `${safeTitle}_guests.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const handleMarkAttendance = async (addr: string) => {
    const id = selectedLocalEventId
    if (!id) return
    try {
      setMarking(addr)
      // Try to perform on-chain attendance marking (if user has wallet permissions)
      await txMarkAttendance(id, addr)
      // Update local event state immediately for responsive UI
      markAttendance(id, addr)
    } catch (err) {
      // swallow - transaction hook handles toasts
      console.error('Failed to mark attendance', err)
    } finally {
      setMarking(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto pt-8">
      <h1 className="text-3xl font-bold mb-6 text-[#0B1620]">
        Guest List
        <span className="ml-3 inline-block text-sm font-medium text-gray-600">({guests.length})</span>
      </h1>

      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-600">Event:</label>
        <select
          value={selectedLocalEventId ?? ''}
          onChange={(e) => setSelectedLocalEventId(e.target.value || null)}
          className="border rounded px-2 py-1"
        >
          <option value="">-- Select Event --</option>
          {userEvents.map(ev => (
            <option key={ev.id} value={ev.id}>{ev.title || ev.id}</option>
          ))}
        </select>

        <button
          onClick={downloadCsv}
          disabled={!guests || guests.length === 0}
          className="w-30 h-10 flex items-center gap-2 ml-auto text-sm px-3 py-1 border rounded-lg bg-[#4DA2FF] text-[#FFFFFF] disabled:opacity-50 whitespace-nowrap"
        >
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {selectedLocalEventId && guests.length === 0 && (
        <div className="text-sm text-gray-500">No guests found for this event.</div>
      )}

      {guests.length > 0 && (
        <div className="mt-4">
          <div className="grid grid-cols-4 gap-4 text-sm font-semibold text-gray-600 px-4 py-2">
            <div>Address</div>
            <div>Registered Date</div>
            <div>Status</div>
            <div className="text-right">Actions</div>
          </div>

          <div className="space-y-3 mt-2">
            {guests.map((guest) => (
              <div key={guest.address} className="grid grid-cols-4 items-center bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
                <div className="text-sm font-mono text-gray-700">{formatAddress(guest.address)}</div>

                <div className="text-sm text-gray-500">{formatDate(guest.date)}</div>

                <div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold text-center ${statusStyles[guest.status]}`}>{guest.status}</span>
                </div>

                <div className="flex justify-end">
                  {guest.status === 'New Member' && (
                    <button
                      onClick={() => handleMarkAttendance(guest.address)}
                      disabled={marking === guest.address}
                      className="text-sm px-3 py-1 border rounded-lg bg-blue-50 text-blue-700"
                    >
                      {marking === guest.address ? 'Marking...' : 'Check in'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
