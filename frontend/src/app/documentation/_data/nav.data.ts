import { URLS } from '@/constants/url.constant';

export const topics = [
	{
		topic: 'Getting Started',
		link: `${URLS.DOCUMENTATION}/getting-started`,
		searchTerms: ['getting started', 'intro', 'details'],
		subTopics: [
			{ title: 'Intro', link: `${URLS.DOCUMENTATION}/getting-started/intro`, searchTerms: ['intro'] },
			{ title: 'Details', link: `${URLS.DOCUMENTATION}/getting-started/details`, searchTerms: ['details'] },
		],
	},
	// {
	// 	topic: 'Authentication',
	// 	link: `${URLS.DOCUMENTATION}/authentication`,
	// 	searchTerms: ['authentication'],
	// 	subTopics: [
	// 		{
	// 			title: 'Google Authentication',
	// 			link: `${URLS.DOCUMENTATION}/authentication/google-auth`,
	// 			searchTerms: ['google authentication', 'access token', 'refresh token'],
	// 		},
	// 	],
	// },
];
