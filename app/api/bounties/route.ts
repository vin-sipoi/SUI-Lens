import { NextResponse } from 'next/server';

let bounties = [
  {
    id: '1',
    title: 'Build a Sui Lens feature',
    reward_amount: 100,
    status: 'open',
    description: 'Implement a new feature for Sui Lens app',
  },
  {
    id: '2',
    title: 'Fix bugs in Sui Lens',
    reward_amount: 50,
    status: 'claimed',
    description: 'Fix reported bugs in the Sui Lens app',
  },
];

// GET /api/bounties
export async function GET() {
  return NextResponse.json(bounties);
}

// GET /api/bounties/:id
export async function GETById(request: Request, { params }: { params: { id: string } }) {
  const bounty = bounties.find((b) => b.id === params.id);
  if (!bounty) {
    return new Response('Not Found', { status: 404 });
  }
  return NextResponse.json(bounty);
}

// POST /api/bounties/:id/claim
export async function POSTClaim(request: Request, { params }: { params: { id: string } }) {
  const bountyIndex = bounties.findIndex((b) => b.id === params.id);
  if (bountyIndex === -1) {
    return new Response('Not Found', { status: 404 });
  }
  bounties[bountyIndex].status = 'claimed';
  return NextResponse.json({ message: 'Bounty claimed' });
}

// POST /api/bounties/:id/submit-proof
export async function POSTSubmitProof(request: Request, { params }: { params: { id: string } }) {
  const bountyIndex = bounties.findIndex((b) => b.id === params.id);
  if (bountyIndex === -1) {
    return new Response('Not Found', { status: 404 });
  }
  const body = await request.json();
  // Here you can handle the proof submission logic
  // For now, just mark bounty as completed
  bounties[bountyIndex].status = 'completed';
  return NextResponse.json({ message: 'Proof submitted' });
}
