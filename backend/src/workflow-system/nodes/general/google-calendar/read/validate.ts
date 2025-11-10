import { z } from 'zod';

import {
	GeneralNodePropsType,
	GeneralNodeValidateReturnType,
	responderDataFormats,
} from 'src/workflow-system/workflow-system.type';
import { validate } from 'src/shared/utils/zod.util';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { isError } from 'src/shared/utils/error.util';

const googleCalendarReadValidationSchema = z.object({
	format: z.enum(responderDataFormats, { message: 'Invalid format' }),
	data: z.object(
		{ defaultData: z.unknown({ message: 'Invalid content' }) },
		{ message: 'Invalid google calendar read data' },
	),
	config: z
		.object({
			auth_type: z.enum(['google_signin', 'google_manual'], { message: 'Invalid auth type' }),
			access_token: z.string({ message: 'Invalid access token' }).min(1, { message: 'Access token is required' }),
			calendar_id: z.string({ message: 'Invalid calendar ID' }).min(1, { message: 'Calendar ID is required' }),
			time_min: z
				.number({ message: 'Invalid start date-time' })
				.min(1, { message: 'Start date-time are required' }),
			time_max: z.number({ message: 'Invalid end date-time' }).min(1, { message: 'End date-time are required' }),
			timezone: z.string({ message: 'Invalid timezone' }).min(1, { message: 'Timezone is required' }),
		})
		.refine((data) => !isNaN(new Date(data.time_min).getTime()), {
			message: 'Invalid start date and time format',
			path: ['time_min'],
		})
		.refine((data) => !isNaN(new Date(data.time_max).getTime()), {
			message: 'Invalid end date and time format',
			path: ['time_max'],
		})
		.refine((data) => data.time_max > data.time_min, {
			message: 'End date and time must be after start date and time',
			path: ['time_max'],
		}),
});

export type GoogleCalendarReadDataType = z.infer<typeof googleCalendarReadValidationSchema>['data'] & {
	defaultData: unknown;
};
export type GoogleCalendarReadConfigType = z.infer<typeof googleCalendarReadValidationSchema>['config'];

export const googleCalendarReadValidate = async ({
	format,
	data,
	config,
}: GeneralNodePropsType<GoogleCalendarReadDataType, GoogleCalendarReadConfigType>): Promise<
	DefaultReturnType<GeneralNodeValidateReturnType<GoogleCalendarReadDataType, GoogleCalendarReadConfigType>>
> => {
	const validationResult = validate({ data: { format, data, config }, schema: googleCalendarReadValidationSchema });
	if (isError(validationResult)) {
		return {
			...validationResult,
			trace: [...validationResult.trace, 'googleCalendarReadValidate - validate'],
		};
	}

	return {
		format: validationResult.format,
		data: { ...validationResult.data, defaultData: validationResult.data.defaultData },
		config: validationResult.config,
	};
};
