import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
// import logger from '@/lib/logger'; // Uncomment if you have a logger

// POST /api/auth/wallet-login
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { walletAddress } = body;
    if (!walletAddress) {
      return NextResponse.json({ error: 'walletAddress is required' }, { status: 400 });
    }
    let user = await prisma.user.findUnique({ where: { walletAddress } });
    if (!user) {
      user = await prisma.user.create({ data: { walletAddress } });
      // logger?.info?.(`New user created with wallet: ${walletAddress}`);
    }
    // TODO: Set session/cookie here
    // logger?.info?.(`Wallet login: ${walletAddress}`);
    return NextResponse.json({ message: 'Wallet login successful', user });
  } catch (error) {
    // logger?.error?.('Error in walletLogin:', error);
    return NextResponse.json({ error: 'Could not login with wallet' }, { status: 500 });
  }
}
