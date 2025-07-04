import { NextRequest, NextResponse } from 'next/server';
import { sendOtp } from '@/lib/otpService';

// POST /api/auth/request-otp
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await sendOtp(email, otp);
    // Optionally, send OTP via email here using your emailService
    return NextResponse.json({ message: 'OTP sent successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
