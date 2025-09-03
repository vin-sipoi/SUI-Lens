import { NextRequest, NextResponse } from 'next/server'
import { suilensService } from '@/lib/sui-client'

export async function POST(request: NextRequest) {
  try {
    // Parse JSON data from the request body
    const eventData = await request.json()

    // Extract form fields from JSON
    const {
      title,
      description,
      bannerUrl = '',
      nftImageUrl = '',
      poapImageUrl = '',
      location = '',
      category = 'General',
      startDate,
      endDate,
      capacity = '100',
      ticketPrice = '0',
      requiresApproval = false,
      poapTemplate = ''
    } = eventData

    // Generate a temporary event ID (you'll replace this with DB logic)
    const eventId = `event_${Date.now()}`

    // Create transaction block for event creation
    const txb = await suilensService.createEvent({
      name: title,
      description: description,
      bannerUrl: bannerUrl,
      nftImageUrl: nftImageUrl,
      poapImageUrl: poapImageUrl,
      location: location,
      category: category,
      startTime: new Date(startDate).getTime(),
      endTime: new Date(endDate).getTime(),
      maxAttendees: parseInt(capacity) || 100,
      ticketPrice: parseFloat(ticketPrice) || 0,
      requiresApproval: requiresApproval,
      poapTemplate: poapTemplate || poapImageUrl,
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
