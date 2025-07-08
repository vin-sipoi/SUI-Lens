import { NextRequest, NextResponse } from 'next/server'
import { suilensService } from '@/lib/sui-client'
import formidable from 'formidable'

export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(request: NextRequest) {
  try {
    const form = new formidable.IncomingForm()
    const data = await new Promise((resolve, reject) => {
      form.parse(request as any, (err: any, fields: any, files: any) => {
        if (err) reject(err)
        else resolve({ fields, files })
      })
    })

    const { fields, files } = data as any

    // Generate a temporary event ID (you'll replace this with DB logic)
    const eventId = `event_${Date.now()}`

    // Handle file upload if any
    let poapImageUrl = ''
    if (files.poapImage) {
      const file = files.poapImage
      // Save file to disk or cloud storage here, for now just use file path
      poapImageUrl = file.filepath || ''
    }

    // Create transaction block for event creation
    const txb = await suilensService.createEvent({
      name: fields.title as string,
      description: fields.description as string,
      startTime: new Date(`${fields.date} ${fields.time}`).getTime(),
      endTime: new Date(`${fields.date} ${fields.endTime}`).getTime(),
      maxAttendees: parseInt(fields.capacity as string) || 100,
      poapTemplate: poapImageUrl,
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
