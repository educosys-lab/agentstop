import { NextResponse } from 'next/server';
import { google } from 'googleapis';

function getOAuth2Client() {
	return new google.auth.OAuth2({
		clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
		clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
		redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/token`,
	});
}

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const code = searchParams.get('code');
	const state = searchParams.get('state');

	if (!code) {
		return NextResponse.json({ error: 'Authorization code not provided' }, { status: 400 });
	}

	try {
		const oauth2Client = getOAuth2Client();
		const { tokens } = await oauth2Client.getToken(code);
		oauth2Client.setCredentials(tokens);

		const { access_token, refresh_token, id_token } = tokens;

		const decodedState = decodeURIComponent(state || '');
		if (!decodedState) {
			return NextResponse.json({ error: 'Invalid state parameter' }, { status: 400 });
		}

		const { origin, nodeId } = JSON.parse(decodedState);

		const redirectUrl = new URL(origin);
		redirectUrl.searchParams.set('nodeId', nodeId);
		redirectUrl.searchParams.set('access_token', access_token || '');
		redirectUrl.searchParams.set('refresh_token', refresh_token || '');
		redirectUrl.searchParams.set('id_token', id_token || '');

		return NextResponse.redirect(redirectUrl);
	} catch (error) {
		console.error('Error exchanging code for Google token:', error);
		return NextResponse.json({ error: 'Failed to authenticate with Google' }, { status: 500 });
	}
}
