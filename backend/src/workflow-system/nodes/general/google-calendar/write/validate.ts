import { z } from 'zod';

import { validate } from 'src/shared/utils/zod.util';
import {
	GeneralNodePropsType,
	GeneralNodeValidateReturnType,
	responderDataFormats,
} from 'src/workflow-system/workflow-system.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { isError } from 'src/shared/utils/error.util';

const googleCalendarWriteValidationSchema = z
	.object({
		format: z.enum(responderDataFormats, { message: 'Invalid format' }),
		data: z.object({
			defaultData: z.unknown({ message: 'Invalid default data' }),
			iso_time_min: z.string({ message: 'Invalid start time' }).optional(),
			iso_time_max: z.string({ message: 'Invalid end time' }).optional(),
			iana_timezone_id: z.string({ message: 'Invalid timezone' }).optional(),
			summary_of_event: z.string({ message: 'Invalid summary of event' }).optional(),
			description_of_event: z.string({ message: 'Invalid description of event' }).optional(),
			guest_email_ifAny: z.string({ message: 'Invalid guest email' }).optional(),
		}),
		config: z.object({
			auth_type: z.enum(['google_signin', 'google_manual'], { message: 'Invalid auth type' }),
			access_token: z.string({ message: 'Invalid access token' }).min(1, { message: 'Access token is required' }),
			calendar_id: z.string({ message: 'Invalid calendar ID' }).min(1, { message: 'Calendar ID is required' }),
			time_min_from_config: z.string({ message: 'Invalid start time' }).optional(),
			time_max_from_config: z.string({ message: 'Invalid end time' }).optional(),
			timezone_from_config: z.string({ message: 'Invalid timezone' }).optional(),
			summary_from_config: z.string({ message: 'Invalid summary of event' }).optional(),
			description_from_config: z.string({ message: 'Invalid description of event' }).optional(),
			guest_email_from_config: z.string({ message: 'Invalid guest email' }).optional(),
		}),
	})
	.refine(
		(props) => {
			const minTime = props.data.iso_time_min || props.config.time_min_from_config;
			const start = new Date(minTime!).getTime();
			return !isNaN(start);
		},
		{ message: 'Invalid start date and time', path: ['start time'] },
	)
	.refine(
		(props) => {
			const maxTime = props.data.iso_time_max || props.config.time_max_from_config;
			const end = new Date(maxTime!).getTime();
			return !isNaN(end);
		},
		{ message: 'Invalid end date and time', path: ['end time'] },
	)
	.refine(
		(props) => {
			const minTime = props.data.iso_time_min || props.config.time_min_from_config;
			const maxTime = props.data.iso_time_max || props.config.time_max_from_config;

			const start = new Date(minTime!).getTime();
			const end = new Date(maxTime!).getTime();
			return end > start;
		},
		{ message: 'End time must be after start time', path: ['end time'] },
	);

export type GoogleCalendarWriteDataType = z.infer<typeof googleCalendarWriteValidationSchema>['data'] & {
	defaultData: unknown;
};
export type GoogleCalendarWriteConfigType = z.infer<typeof googleCalendarWriteValidationSchema>['config'];

export const googleCalendarWriteValidate = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<GoogleCalendarWriteDataType, GoogleCalendarWriteConfigType>): Promise<
	DefaultReturnType<GeneralNodeValidateReturnType<GoogleCalendarWriteDataType, GoogleCalendarWriteConfigType>>
> => {
	const validationResult = validate({ data: { format, data, config }, schema: googleCalendarWriteValidationSchema });
	if (isError(validationResult)) {
		return {
			...validationResult,
			trace: [...validationResult.trace, 'googleCalendarWriteValidate - validate'],
		};
	}

	return {
		format: validationResult.format,
		data: { ...validationResult.data, defaultData: validationResult.data.defaultData },
		config: validationResult.config,
	};
};
