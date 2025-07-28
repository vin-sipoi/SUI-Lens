// Using Prisma or similar ORM
export interface Event {
  id: string
  name: string
  description: string
  creator_address: string
  start_time: Date
  end_time: Date
  max_attendees: number
  poap_image_url: string
  sui_event_id: string // Object ID from Sui
  created_at: Date
  updated_at: Date
}

export interface POAPClaim {
  id: string
  event_id: string
  attendee_address: string
  poap_object_id: string
  transaction_hash: string
  claimed_at: Date
}