export const URLS = {
	// App
	API: `${process.env.NEXT_PUBLIC_API_URL}`,
	BASE: `${process.env.NEXT_PUBLIC_BASE_URL}`,
	PYTHON: `${process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL}`,

	// Assets
	IMAGES: '/assets/images',
	VIDEOS: '/assets/videos',

	// Auth
	AUTH_ERROR: `${process.env.NEXT_PUBLIC_BASE_URL}/auth-error`,

	// Home
	ADMIN: `${process.env.NEXT_PUBLIC_BASE_URL}/admin`,
	CAMPAIGN_ANALYTICS: `${process.env.NEXT_PUBLIC_BASE_URL}/campaign-analytics`,
	CHAT: `${process.env.NEXT_PUBLIC_BASE_URL}/chat`,
	DASHBOARD: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
	DOCUMENTATION: `${process.env.NEXT_PUBLIC_BASE_URL}/documentation`,
	HOME: `${process.env.NEXT_PUBLIC_BASE_URL}`,
	PRIVACY: `${process.env.NEXT_PUBLIC_BASE_URL}/privacy`,
	TEMPLATE: `${process.env.NEXT_PUBLIC_BASE_URL}/template`,
	TERMS: `${process.env.NEXT_PUBLIC_BASE_URL}/terms-of-services`,
	WHATSAPP_CAMPAIGN: `${process.env.NEXT_PUBLIC_BASE_URL}/whatsapp-campaign`,
	WORKFLOW_EDIT: `${process.env.NEXT_PUBLIC_BASE_URL}/workflow/edit`,
	WORKFLOW_METRICS: `${process.env.NEXT_PUBLIC_BASE_URL}/workflow/metrics`,

	// Google Auth
	GOOGLE_OAUTH: `https://developers.google.com/oauthplayground/#step1&apisSelect=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fscript.deployments%2Chttps%3A%2F%2Fwww.googleapis.com%2Fauth%2Fscript.projects%2Chttps%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive%2Chttps%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgmail.modify%2Chttps%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcalendar.events%2Chttps%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email%2Chttps%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile&url=https%3A%2F%2F&content_type=application%2Fjson&http_method=GET&useDefaultOauthCred=unchecked&oauthEndpointSelect=Google&oauthAuthEndpointValue=https%3A%2F%2Faccounts.google.com%2Fo%2Foauth2%2Fv2%2Fauth&oauthTokenEndpointValue=https%3A%2F%2Foauth2.googleapis.com%2Ftoken&includeCredentials=unchecked&accessTokenType=bearer&autoRefreshToken=unchecked&accessType=offline&prompt=consent&response_type=code&wrapLines=on`,
};
