"use client"

import { useState, useEffect, useMemo } from "react"
import { useEventContext } from "@/context/EventContext"
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
  const { getEvent } = useEventContext()
  const [guests, setGuests] = useState<GuestRow[]>([])
  const { user } = useUser()
  const { events } = useEventContext()

  const userEvents = useMemo(() => 
    events.filter(e =>
      e.creator === user?.walletAddress ||
      e.organizer?.name === user?.walletAddress ||
      e.organizer?.name === user?.name
    ), [events, user?.walletAddress, user?.name]
  )

  useEffect(() => {
    // Collect all guests from all user events
    const allGuests: { [address: string]: { events: string[], latestDate?: string, name?: string, email?: string } } = {}

    userEvents.forEach(event => {
      if (!event.rsvps || event.rsvps.length === 0) return

      event.rsvps.forEach((rsvp: any) => {
        let address: string
        let name: string | undefined
        let email: string | undefined
        let date: string | undefined

        // Support both string RSVP entries and object entries with metadata
        if (typeof rsvp === 'string') {
          address = rsvp
          name = formatAddress(rsvp)
          date = (event.rsvpTimes && event.rsvpTimes[rsvp]) || undefined
        } else {
          address = rsvp.address || rsvp.addr || ''
          name = rsvp.name || formatAddress(address)
          email = rsvp.email
          date = rsvp.registeredAt || rsvp.date || rsvp.time || undefined
        }

        if (!allGuests[address]) {
          allGuests[address] = { events: [], name, email }
        }

        // Add this event to the guest's event list if not already there
        if (!allGuests[address].events.includes(event.id)) {
          allGuests[address].events.push(event.id)
        }

        // Update latest date if this one is more recent
        if (date && allGuests[address] && (!allGuests[address].latestDate || date > allGuests[address].latestDate!)) {
          allGuests[address].latestDate = date
        }
      })
    })

    // Convert to guest rows
    const mapped: GuestRow[] = Object.entries(allGuests).map(([address, data]) => ({
      address,
      name: data.name,
      email: data.email,
      status: (data.events.length > 1 ? 'Existing Member' : 'New Member') as GuestStatus,
      date: data.latestDate,
    }))

    setGuests(mapped)
  }, [userEvents])

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
    a.download = `all_event_guests.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-4xl mx-auto pt-8">
      <h1 className="text-3xl font-bold mb-6 text-[#0B1620]">
          GuestList
        <span className="ml-3 bg-[#4DA2FF] rounded-full inline-block text-sm font-medium text-gray-600">{guests.length}</span>
      </h1>

      <div className="flex items-center gap-3">

        <button
          onClick={downloadCsv}
          disabled={!guests || guests.length === 0}
          className="w-30 h-10 flex items-center gap-2 ml-auto text-sm px-3 py-1 border rounded-lg bg-[#4DA2FF] text-[#FFFFFF] disabled:opacity-50 whitespace-nowrap"
        >
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {guests.length === 0 && (
        <div className="text-sm text-gray-500">No guests found across your events.</div>
      )}

      {guests.length > 0 && (
        <div className="mt-4">
          <div className="grid grid-cols-3 gap-4 text-sm font-semibold text-gray-600 px-4 py-2">
            <div>Address</div>
            <div>Latest Registration</div>
            <div>Status</div>
          </div>

          <div className="space-y-3 mt-2">
            {guests.map((guest) => (
              <div key={guest.address} className="grid grid-cols-3 items-center bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
                <div className="text-sm font-mono text-gray-700">{formatAddress(guest.address)}</div>

                <div className="text-sm text-gray-500">{formatDate(guest.date)}</div>

                <div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold text-center ${statusStyles[guest.status]}`}>{guest.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
