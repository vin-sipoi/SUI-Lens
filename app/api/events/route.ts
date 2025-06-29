import { NextRequest, NextResponse } from 'next/server'
import { suilensService } from '@/lib/sui-client'

export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json()
    
    // Generate a temporary event ID (you'll replace this with DB logic)
    const eventId = `event_${Date.now()}`
    
    // Create transaction block for event creation
    const txb = await suilensService.createEvent({
      name: eventData.title, // Note: using 'title' from your form
      description: eventData.description,
      startTime: new Date(`${eventData.date} ${eventData.time}`).getTime(),
      endTime: new Date(`${eventData.date} ${eventData.endTime}`).getTime(),
      maxAttendees: parseInt(eventData.capacity) || 100,
      poapTemplate: eventData.poapImageUrl || '',
    })

    return NextResponse.json({
      success: true,
      eventId: eventId,
      transactionBlock: txb.serialize(),
    })
  } catch (error) {
    console.error('Event creation error:', error)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const eventId = searchParams.get('id')
  
  if (eventId) {
    // For now, return mock data - replace with real DB query
    return NextResponse.json({
      event: {
        id: eventId,
        name: 'Sample Event',
        description: 'Sample Description',
        // Add other event fields
      },
    })
  }
  
  return NextResponse.json({ events: [] })
}
