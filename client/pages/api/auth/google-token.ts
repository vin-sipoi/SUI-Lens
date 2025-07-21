import { NextRequest, NextResponse } from 'next/server';

interface GoogleTokenRequest {
	token: string;
	userInfo: {
		sub: string;
		email: string;
		name: string;
		picture: string;
		email_verified: boolean;
		given_name: string;
		family_name: string;
		iat: number;
		exp: number;
	};
	timestamp: string;
}

export async function POST(request: NextRequest) {
	try {
		const body: GoogleTokenRequest = await request.json();
		const { token, userInfo, timestamp } = body;

		// Validate required fields
		if (!token || !userInfo || !userInfo.sub || !userInfo.email) {
			return NextResponse.json(
				{ error: 'Missing required fields' },
				{ status: 400 }
			);
		}
		
		// For demonstration purposes, we'll just log the data
		console.log('Google token stored successfully:', {
			userId: userInfo.sub,
			email: userInfo.email,
			tokenExpiry: new Date(userInfo.exp * 1000),
			timestamp,
		});

		return NextResponse.json({
			success: true,
			message: 'Token stored successfully',
			userId: userInfo.sub,
		});

	} catch (error) {
		console.error('Error storing Google token:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

