import { NextResponse } from 'next/server';
import { google } from 'googleapis';

const scopes = [
	'https://www.googleapis.com/auth/userinfo.email',
	'https://www.googleapis.com/auth/userinfo.profile',
	'https://www.googleapis.com/auth/calendar.events',
	'https://www.googleapis.com/auth/gmail.modify',
	'https://www.googleapis.com/auth/drive',
	'https://www.googleapis.com/auth/script.deployments',
	'https://www.googleapis.com/auth/script.projects',
];

function getOAuth2Client() {
	return new google.auth.OAuth2({
		clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
		clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
		redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/token`,
	});
}

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const origin = searchParams.get('origin');
	const nodeId = searchParams.get('nodeId');

	const oauth2Client = getOAuth2Client();

	const state = encodeURIComponent(JSON.stringify({ origin, nodeId }));
	const authUrl = oauth2Client.generateAuthUrl({
		access_type: 'offline',
		prompt: 'consent',
		scope: scopes,
		state,
	});

	return NextResponse.redirect(authUrl);
}
