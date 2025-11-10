import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const code = searchParams.get('code');
	const state = searchParams.get('state');

	const errorParam = searchParams.get('error');
	const errorDescription = searchParams.get('error_description');
	if (errorParam) {
		return NextResponse.json(
			{ error: errorParam, description: errorDescription || 'Unknown error' },
			{ status: 400 },
		);
	}

	if (!code) {
		return NextResponse.json({ error: 'Authorization code not provided' }, { status: 400 });
	}
	if (!state) {
		return NextResponse.json({ error: 'Missing state parameter' }, { status: 400 });
	}

	try {
		const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/linkedin/token`;

		const tokenResponse = await axios.post(
			'https://www.linkedin.com/oauth/v2/accessToken',
			new URLSearchParams({
				grant_type: 'authorization_code',
				code,
				redirect_uri: redirectUri,
				client_id: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID!,
				client_secret: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_SECRET!,
			}),
			{ headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
		);

		const { access_token, expires_in } = tokenResponse.data;

		const decodedState = JSON.parse(decodeURIComponent(state));
		const { origin, nodeId } = decodedState;

		if (!origin || !nodeId) {
			return NextResponse.json({ error: 'Invalid state object' }, { status: 400 });
		}

		const redirectUrl = new URL(origin);
		redirectUrl.searchParams.set('nodeId', nodeId);
		redirectUrl.searchParams.set('access_token', access_token);
		redirectUrl.searchParams.set('expires_in', expires_in.toString());

		return NextResponse.redirect(redirectUrl);
	} catch (error: any) {
		console.error('LinkedIn token exchange failed:', error?.response?.data || error.message);
		return NextResponse.json({ error: 'Failed to authenticate with LinkedIn' }, { status: 500 });
	}
}
