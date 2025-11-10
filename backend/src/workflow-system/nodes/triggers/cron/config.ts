import { daysOfWeek, months } from 'src/shared/data/date-time.data';
import { NodeConfigType } from 'src/workflow-system/workflow-system.type';
import { cronScheduleOptions } from './cron.data';

export const daysOfMonth = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

export const cronTriggerConfig: NodeConfigType[] = [
	{
		name: 'schedule_type',
		label: 'Run scenario',
		description: 'Select how often the workflow should run.',
		type: 'select',
		placeholder: 'Select schedule type',
		defaultValue: 'once',
		options: cronScheduleOptions,
		validation: [
			{
				field: 'schedule_type',
				label: 'Schedule type',
				type: 'string',
				validValues: cronScheduleOptions.map((option) => option.value),
			},
		],
	},
	{
		name: 'interval_minutes',
		label: 'Minutes',
		description: 'Enter the interval in minutes for the workflow to run.',
		type: 'text',
		placeholder: 'Enter minutes (e.g., 15)',
		showWhen: { field: 'schedule_type', value: 'regular_intervals' },
		validation: [
			{
				field: 'interval_minutes',
				label: 'Interval minutes',
				type: 'string',
			},
		],
	},
	// Once: Date, time, and timezone
	{
		name: 'once_datetime',
		label: 'Date & Time',
		description: 'Select the date and time for the workflow to run once.',
		type: 'date-time',
		showWhen: { field: 'schedule_type', value: 'once' },
		validation: [
			{
				field: 'once_datetime',
				label: 'Date and time',
				type: 'string',
			},
		],
	},
	// Every day: Time and timezone
	{
		name: 'daily_time',
		label: 'Time',
		description: 'Select the time of day for the workflow to run every day.',
		type: 'date-time',
		showWhen: { field: 'schedule_type', value: 'every_day' },
		validation: [
			{
				field: 'daily_time',
				label: 'Daily time',
				type: 'string',
			},
		],
	},
	// Days of the week: Days, time, and timezone
	{
		name: 'weekly_days',
		label: 'Days',
		description: 'Select the days of the week for the workflow to run.',
		type: 'checkbox',
		options: daysOfWeek.map((day) => ({ value: day.toLowerCase(), label: day })),
		showWhen: { field: 'schedule_type', value: 'days_of_week' },
		validation: [
			{
				field: 'weekly_days',
				label: 'Weekly days',
				type: 'string',
			},
		],
	},
	{
		name: 'weekly_time',
		label: 'Time',
		description: 'Select the time for the workflow to run on the selected days.',
		type: 'date-time',
		showWhen: { field: 'schedule_type', value: 'days_of_week' },
		validation: [
			{
				field: 'weekly_time',
				label: 'Weekly time',
				type: 'string',
			},
		],
	},
	// Days of the month: Days, time, and timezone
	{
		name: 'monthly_days',
		label: 'Days',
		description: 'Select the days of the month for the workflow to run.',
		type: 'checkbox',
		options: daysOfMonth.map((day) => ({ value: day, label: day })),
		showWhen: { field: 'schedule_type', value: 'days_of_month' },
		validation: [
			{
				field: 'monthly_days',
				label: 'Monthly days',
				type: 'string',
			},
		],
	},
	{
		name: 'monthly_time',
		label: 'Time',
		description: 'Select the time for the workflow to run on the selected days.',
		type: 'date-time',
		showWhen: { field: 'schedule_type', value: 'days_of_month' },
		validation: [
			{
				field: 'monthly_time',
				label: 'Monthly time',
				type: 'string',
			},
		],
	},
	// Specified dates: Months, days, time, and timezone
	{
		name: 'specific_months',
		label: 'Months',
		description: 'Select the months for the workflow to run.',
		type: 'checkbox',
		options: [
			{ value: 'all', label: 'Select All' },
			...months.map((month) => ({ value: month.toLowerCase(), label: month })),
		],
		showWhen: { field: 'schedule_type', value: 'specified_dates' },
		validation: [
			{
				field: 'specific_months',
				label: 'Specific months',
				type: 'string',
			},
		],
	},
	{
		name: 'specific_days',
		label: 'Days',
		description: 'Select the days for the workflow to run.',
		type: 'checkbox',
		options: [{ value: 'all', label: 'Select All' }, ...daysOfMonth.map((day) => ({ value: day, label: day }))],
		showWhen: { field: 'schedule_type', value: 'specified_dates' },
		validation: [
			{
				field: 'specific_days',
				label: 'Specific days',
				type: 'string',
			},
		],
	},
	{
		name: 'specific_time',
		label: 'Time',
		description: 'Select the time for the workflow to run on the specified dates.',
		type: 'date-time',
		showWhen: { field: 'schedule_type', value: 'specified_dates' },
		validation: [
			{
				field: 'specific_time',
				label: 'Specific time',
				type: 'string',
			},
		],
	},
];
