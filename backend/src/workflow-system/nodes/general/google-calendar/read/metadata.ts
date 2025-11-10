import { MetadataType } from 'src/workflow-system/workflow-system.type';

export const googleCalendarReadMetadata: MetadataType = {
	type: 'google-calendar-read',
	label: 'Google Calendar Read',
	description: 'Read events from any Google Calendar',
	version: '1.0.0',
	category: 'Action',
	icon: `${process.env.BACKEND_URL}/assets/node-images/google-calender-read.svg`,
};
