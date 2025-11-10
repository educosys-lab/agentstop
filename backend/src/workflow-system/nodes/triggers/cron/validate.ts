import { z } from 'zod';

import { validate } from 'src/shared/utils/zod.util';
import {
	TriggerStartListenerDataPropsType,
	TriggerStartListenerValidateReturnType,
	TriggerStopListenerPropsType,
	TriggerStopListenerValidateReturnType,
} from 'src/workflow-system/workflow-system.type';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { isError } from 'src/shared/utils/error.util';

const timeTransform = (val: string): string => {
	try {
		const date = new Date(val);
		if (isNaN(date.getTime())) {
			throw new Error('Invalid date-time format');
		}
		return `${date.getUTCHours().toString().padStart(2, '0')}:${date
			.getUTCMinutes()
			.toString()
			.padStart(2, '0')}:${date.getUTCSeconds().toString().padStart(2, '0')}`;
	} catch {
		return val;
	}
};

const cronConfigValidationSchema = z
	.object(
		{
			schedule_type: z.enum(
				['regular_intervals', 'once', 'every_day', 'days_of_week', 'days_of_month', 'specified_dates'],
				{ message: 'Invalid schedule type' },
			),
			interval_minutes: z.string({ message: 'Invalid interval minutes' }).optional(),
			once_datetime: z.string({ message: 'Invalid once datetime' }).optional(),
			daily_time: z
				.string({ message: 'Invalid daily time' })
				.transform(timeTransform)
				.refine((val) => (!val ? true : /^T?\d{2}:\d{2}:\d{2}$/.test(val)), {
					message: 'Invalid time format for daily_time, expected HH:mm:ss',
				})
				.optional(),
			weekly_days: z
				.union(
					[
						z.array(z.string({ message: 'Invalid weekly days' })),
						z.string().transform((val): string[] => (val ? val.split(',').map((item) => item.trim()) : [])),
						z.literal('').transform((): string[] => []),
						z.undefined(),
					],
					{ message: 'Invalid weekly days' },
				)
				.optional(),
			weekly_time: z
				.string({ message: 'Invalid weekly time' })
				.transform(timeTransform)
				.refine((val) => (!val ? true : /^T?\d{2}:\d{2}:\d{2}$/.test(val)), {
					message: 'Invalid time format for weekly_time, expected HH:mm:ss',
				})
				.optional(),
			monthly_days: z
				.union(
					[
						z.array(z.string({ message: 'Invalid monthly days' })),
						z.string().transform((val): string[] => (val ? val.split(',').map((item) => item.trim()) : [])),
						z.literal('').transform((): string[] => []),
						z.undefined(),
					],
					{ message: 'Invalid monthly days' },
				)
				.optional(),
			monthly_time: z
				.string({ message: 'Invalid monthly time' })
				.transform(timeTransform)
				.refine((val) => (!val ? true : /^T?\d{2}:\d{2}:\d{2}$/.test(val)), {
					message: 'Invalid time format for monthly_time, expected HH:mm:ss',
				})
				.optional(),
			specific_months: z
				.union(
					[
						z.array(z.string({ message: 'Invalid specific months' })),
						z.string().transform((val): string[] => (val ? val.split(',').map((item) => item.trim()) : [])),
						z.literal('').transform((): string[] => []),
						z.undefined(),
					],
					{ message: 'Invalid specific months' },
				)
				.optional(),
			specific_days: z
				.union(
					[
						z.array(z.string({ message: 'Invalid specific days' })),
						z.string().transform((val): string[] => (val ? val.split(',').map((item) => item.trim()) : [])),
						z.literal('').transform((): string[] => []),
						z.undefined(),
					],
					{ message: 'Invalid specific days' },
				)
				.optional(),
			specific_time: z
				.string({ message: 'Invalid specific time' })
				.transform(timeTransform)
				.refine((val) => (!val ? true : /^T?\d{2}:\d{2}:\d{2}$/.test(val)), {
					message: 'Invalid time format for specific_time, expected HH:mm:ss',
				})
				.optional(),
		},
		{ message: 'Invalid cron config' },
	)
	.refine(
		(data) => {
			if (data.schedule_type === 'regular_intervals') {
				return !!data.interval_minutes;
			}
			if (data.schedule_type === 'once') {
				return !!data.once_datetime;
			}
			if (data.schedule_type === 'every_day') {
				return !!data.daily_time;
			}
			if (data.schedule_type === 'days_of_week') {
				return !!data.weekly_days && data.weekly_days.length > 0 && !!data.weekly_time;
			}
			if (data.schedule_type === 'days_of_month') {
				return !!data.monthly_days && data.monthly_days.length > 0 && !!data.monthly_time;
			}
			if (data.schedule_type === 'specified_dates') {
				return (
					!!data.specific_months &&
					data.specific_months.length > 0 &&
					!!data.specific_days &&
					data.specific_days.length > 0 &&
					!!data.specific_time
				);
			}
			return true;
		},
		{ message: 'Required fields are missing or invalid for the selected schedule type' },
	);

// Cron Start Listener Validate
const cronValidationSchema = z.object({
	userId: z.string({ message: 'Invalid user ID' }).min(1, { message: 'User ID is required' }),
	workflowId: z.string({ message: 'Invalid workflow ID' }).min(1, { message: 'Workflow ID is required' }),
	triggerNodeId: z.string({ message: 'Invalid trigger node ID' }).min(1, { message: 'Trigger node ID is required' }),
	config: cronConfigValidationSchema,
});

export type CronStartListenerConfigType = z.infer<typeof cronValidationSchema>['config'];

export const cronStartListenerValidate = async (
	data: TriggerStartListenerDataPropsType<CronStartListenerConfigType>,
): Promise<DefaultReturnType<TriggerStartListenerValidateReturnType<CronStartListenerConfigType>>> => {
	const validationResult = validate({ data, schema: cronValidationSchema });
	if (isError(validationResult)) {
		return {
			...validationResult,
			trace: ['cronStartListenerValidate - validate'],
		};
	}

	return validationResult;
};

// Cron Stop Listener Validate
const cronStopListenerValidationSchema = z.object({
	listener: z.any().optional(),
	triggerNodeId: z.string().optional(),
	config: cronConfigValidationSchema.optional(),
});

export type CronStopListenerDataType = z.infer<typeof cronStopListenerValidationSchema>;

export const cronStopListenerValidate = async (
	data: TriggerStopListenerPropsType<CronStopListenerDataType>,
): Promise<DefaultReturnType<TriggerStopListenerValidateReturnType<CronStopListenerDataType>>> => {
	const validationResult = validate({ data, schema: cronStopListenerValidationSchema });
	if (isError(validationResult)) {
		return {
			...validationResult,
			trace: ['cronStopListenerValidate - validate'],
		};
	}

	return validationResult;
};
