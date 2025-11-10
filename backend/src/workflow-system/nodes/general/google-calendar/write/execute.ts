import { google, calendar_v3 } from 'googleapis';

import { GoogleCalendarWriteConfigType, GoogleCalendarWriteDataType, googleCalendarWriteValidate } from './validate';
import { GeneralNodePropsType, GeneralNodeReturnType } from 'src/workflow-system/workflow-system.type';
import { REGEX } from 'src/shared/constants/regex.constant';
import { getDateTime } from '../google-calendar.util';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';

export const googleCalendarWriteExecute = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<GoogleCalendarWriteDataType, GoogleCalendarWriteConfigType>): Promise<
	DefaultReturnType<GeneralNodeReturnType>
> => {
	try {
		const validate = await googleCalendarWriteValidate({
			format,
			data,
			config,
		});
		if (isError(validate)) {
			return {
				...validate,
				trace: [...validate.trace, 'googleCalendarWriteExecute - googleCalendarWriteValidate'],
			};
		}

		const {
			access_token,
			calendar_id,
			time_min_from_config,
			time_max_from_config,
			timezone_from_config,
			summary_from_config,
			description_from_config,
			guest_email_from_config,
		} = validate.config;
		const {
			iso_time_min,
			iso_time_max,
			iana_timezone_id,
			summary_of_event,
			description_of_event,
			guest_email_ifAny,
		} = validate.data;

		const time_min = time_min_from_config || iso_time_min;
		const time_max = time_max_from_config || iso_time_max;
		const timezone = timezone_from_config || iana_timezone_id;
		const summary = summary_from_config || summary_of_event;
		const description = description_from_config || description_of_event;
		const guest_email = guest_email_from_config || guest_email_ifAny;

		const oauth2Client = new google.auth.OAuth2();
		oauth2Client.setCredentials({ access_token });

		const calendarClient = google.calendar({ version: 'v3', auth: oauth2Client });

		const startDateTime = new Date(time_min!).toISOString();
		const endDateTime = new Date(time_max!).toISOString();

		const event: calendar_v3.Schema$Event = {
			summary: summary,
			description: description,
			start: { dateTime: startDateTime, timeZone: timezone },
			end: { dateTime: endDateTime, timeZone: timezone },
		};

		let validGuestEmails: string[] = [];
		if (guest_email) {
			validGuestEmails = guest_email
				.split(',')
				.map((email) => email.trim())
				.filter((email) => email && REGEX.EMAIL.test(email));

			if (validGuestEmails.length > 0) {
				event.attendees = validGuestEmails.map((email) => ({ email }));
				event.guestsCanModify = false;
			}
		}

		const params: calendar_v3.Params$Resource$Events$Insert = {
			calendarId: calendar_id,
			requestBody: event,
			sendNotifications: validGuestEmails.length > 0 ? true : undefined,
		};

		await calendarClient.events.insert(params);

		const content = `Event: ${summary}\nStart: ${getDateTime(event.start?.dateTime)}\nEnd: ${getDateTime(event.end?.dateTime)}\nDescription: ${description}\n${validGuestEmails.length > 0 ? `Guests Invited: ${validGuestEmails.join(', ')}` : ''}`;

		return { status: 'success', format: 'string', content: { defaultData: content } };
	} catch (error) {
		return {
			userMessage: 'Internal server error!',
			error: 'Internal server error!',
			errorType: 'InternalServerErrorException',
			errorData: {
				error: returnErrorString(error),
			},
			trace: ['googleCalendarWriteExecute - catch'],
		};
	}
};
