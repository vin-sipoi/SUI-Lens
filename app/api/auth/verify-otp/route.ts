import { NextRequest, NextResponse } from 'next/server';
import { verifyOtp } from '@/lib/otpService';

// POST /api/auth/verify-otp
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp } = body;
    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }
    const valid = await verifyOtp(email, otp);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 });
    }
    // TODO: Set session/cookie here
    return NextResponse.json({ message: 'OTP verified successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
}
