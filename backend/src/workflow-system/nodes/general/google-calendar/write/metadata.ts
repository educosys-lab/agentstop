import { MetadataType } from 'src/workflow-system/workflow-system.type';

export const googleCalendarWriteMetadata: MetadataType = {
	type: 'google-calendar-write',
	label: 'Google Calendar Write',
	description: 'Create events on any Google Calendar',
	version: '1.0.0',
	category: 'Action',
	icon: `${process.env.BACKEND_URL}/assets/node-images/google-calender-write.svg`,
};
