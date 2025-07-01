export async function POST(req: Request) {
  const data = await req.json()
  // Connect to your backend service
  // Example: const response = await suiClient.createEvent(data)
  return Response.json({ success: true, eventId: "generated-id" })
}