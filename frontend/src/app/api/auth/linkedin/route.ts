import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const origin = searchParams.get('origin');
	const nodeId = searchParams.get('nodeId');

	if (!origin || !nodeId) {
		return NextResponse.json({ error: 'Missing origin or nodeId' }, { status: 400 });
	}

	const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
	const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/linkedin/token`;

	const scopes = ['w_member_social', 'profile', 'openid'];
	const scope = encodeURIComponent(scopes.join(' '));
	const state = encodeURIComponent(JSON.stringify({ origin, nodeId }));

	const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;

	return NextResponse.redirect(authUrl);
}
