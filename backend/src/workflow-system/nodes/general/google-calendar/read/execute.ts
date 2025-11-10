import { google } from 'googleapis';

import { GoogleCalendarReadConfigType, GoogleCalendarReadDataType, googleCalendarReadValidate } from './validate';
import { GeneralNodePropsType, GeneralNodeReturnType } from 'src/workflow-system/workflow-system.type';
import { getDateTime } from '../google-calendar.util';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';

export const googleCalendarReadExecute = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<GoogleCalendarReadDataType, GoogleCalendarReadConfigType>): Promise<
	DefaultReturnType<GeneralNodeReturnType>
> => {
	try {
		const validate = await googleCalendarReadValidate({
			format,
			data,
			config,
		});
		if (isError(validate)) {
			return {
				...validate,
				trace: [...validate.trace, 'googleCalendarReadExecute - googleCalendarReadValidate'],
			};
		}

		const { access_token, time_max, time_min, timezone, calendar_id } = validate.config;

		const oauth2Client = new google.auth.OAuth2();
		oauth2Client.setCredentials({ access_token });

		const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

		const startDateTime = new Date(time_min).toISOString();
		const endDateTime = new Date(time_max).toISOString();

		const response = await calendar.events.list({
			calendarId: calendar_id,
			timeMin: startDateTime,
			timeMax: endDateTime,
			timeZone: timezone,
			singleEvents: true,
			orderBy: 'startTime',
		});

		const content = response.data.items
			? response.data.items.map((event) => {
					return `Event: ${event.summary || 'No title'}\nStart: ${getDateTime(event.start?.dateTime || event.start?.date)}\nEnd: ${getDateTime(event.end?.dateTime || event.end?.date)}\nDescription: ${event.description || 'No description'}`;
				})
			: 'No events available';

		const contentString =
			typeof content === 'string' ? content : content.length > 1 ? content.join('\n\n') : content.toString();

		return { status: 'success', format: 'string', content: { defaultData: contentString } };
	} catch (error) {
		return {
			userMessage: 'Internal server error!',
			error: 'Internal server error!',
			errorType: 'InternalServerErrorException',
			errorData: {
				error: returnErrorString(error),
			},
			trace: ['googleCalendarReadExecute - catch'],
		};
	}
};
