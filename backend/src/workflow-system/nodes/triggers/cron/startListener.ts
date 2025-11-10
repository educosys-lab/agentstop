import { TriggerStartListenerPropsType } from 'src/workflow-system/workflow-system.type';
import { CronStartListenerConfigType, cronStartListenerValidate } from './validate';
import { daysOfMonth } from './config';
import { months } from 'src/shared/data/date-time.data';
import { DefaultReturnType } from 'src/shared/types/return.type';
import { TIME } from 'src/shared/constants/time.constant';
import { returnErrorString } from 'src/shared/utils/return.util';
import { isError } from 'src/shared/utils/error.util';

const parseLocalDateTime = (dateTime: string, context: string): Date => {
	const utcDate = new Date(dateTime);
	if (isNaN(utcDate.getTime())) {
		throw new Error(`Invalid date-time format for ${context}: ${dateTime}!`);
	}
	return utcDate;
};

const parseTimeString = (timeString: string, context: string): [number, number, number] => {
	const cleanedTime = timeString.replace(/^T/, '').replace(/\.000Z$/, '');
	const [hours, minutes, seconds] = cleanedTime.split(':').map(Number);
	if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
		throw new Error(`Invalid time format for ${context}: ${cleanedTime}!`);
	}
	return [hours, minutes, seconds];
};

export const cronStartListener = async ({
	triggerCallback,
	storeListener,
	...data
}: TriggerStartListenerPropsType<CronStartListenerConfigType>): Promise<DefaultReturnType<{ [key: string]: any }>> => {
	try {
		const validate = await cronStartListenerValidate(data);
		if (isError(validate)) {
			return {
				...validate,
				trace: ['cronStartListener - validate'],
			};
		}

		const { userId, workflowId, triggerNodeId, config } = validate;
		const {
			schedule_type,
			interval_minutes,
			once_datetime,
			daily_time,
			weekly_days,
			weekly_time,
			monthly_days,
			monthly_time,
			specific_months,
			specific_days,
			specific_time,
		} = config;

		let intervalId: NodeJS.Timeout | null = null;

		const triggerWorkflow = async () => {
			await triggerCallback({
				userId,
				workflowId,
				data: 'Cron job triggered',
				format: 'string',
				triggerDetails: { type: 'cron', nodeId: triggerNodeId },
			});
		};

		const scheduleJob = () => {
			const now = new Date();

			if (schedule_type === 'regular_intervals') {
				const minutes = parseInt(interval_minutes!, 10);
				intervalId = setInterval(() => {
					triggerWorkflow().catch((err) => {
						console.error('Error in triggerWorkflow:', err);
					});
				}, minutes * TIME.MINUTE_IN_MS);
			} else if (schedule_type === 'once') {
				const targetDate = parseLocalDateTime(once_datetime!, 'once');
				const targetTime = targetDate.getTime();
				const nowTime = now.getTime();

				let delay = targetTime - nowTime;

				if (delay <= 0) {
					targetDate.setDate(targetDate.getDate() + 1);
					delay = targetDate.getTime() - nowTime;
				}

				intervalId = setTimeout(() => {
					triggerWorkflow().catch((err) => {
						console.error('Error in triggerWorkflow:', err);
					});
				}, delay);
			} else if (schedule_type === 'every_day') {
				const [hours, minutes, seconds] = parseTimeString(daily_time!, 'every_day');

				let targetTime = new Date(
					now.getFullYear(),
					now.getMonth(),
					now.getDate(),
					hours,
					minutes,
					seconds,
				).getTime();
				let delay = targetTime - now.getTime();

				if (delay <= 0) {
					targetTime += TIME.DAY_IN_MS;
					delay += TIME.DAY_IN_MS;
				}

				intervalId = setTimeout(() => {
					triggerWorkflow().catch((err) => {
						console.error('Error in initial triggerWorkflow:', err);
					});

					intervalId = setInterval(() => {
						triggerWorkflow().catch((err) => {
							console.error('Error in recurring triggerWorkflow:', err);
						});
					}, TIME.DAY_IN_MS);
				}, delay);
			} else if (schedule_type === 'days_of_week') {
				const [hours, minutes, seconds] = parseTimeString(weekly_time!, 'days_of_week');
				const daysMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
				const targetDays = weekly_days!.map((day) => daysMap.indexOf(day));

				const checkNextRun = () => {
					const currentDay = now.getDay();
					const currentTime = now.getTime();
					let minDelay = Infinity;
					let nextRunTime: Date | null = null;
					for (const targetDay of targetDays) {
						let dayDiff = targetDay - currentDay;
						if (dayDiff <= 0) dayDiff += 7;
						const targetTime = new Date(
							now.getFullYear(),
							now.getMonth(),
							now.getDate() + dayDiff,
							hours,
							minutes,
							seconds,
						).getTime();
						const delay = targetTime - currentTime;
						if (delay < minDelay) {
							minDelay = delay;
							// eslint-disable-next-line @typescript-eslint/no-unused-vars
							nextRunTime = new Date(targetTime);
						}
					}

					intervalId = setTimeout(() => {
						triggerWorkflow().catch((err) => {
							console.error('Error in triggerWorkflow:', err);
						});

						now.setTime(Date.now());
						checkNextRun();
					}, minDelay);
				};
				checkNextRun();
			} else if (schedule_type === 'days_of_month') {
				const [hours, minutes, seconds] = parseTimeString(monthly_time!, 'days_of_month');
				const targetDays = monthly_days!.map((day) => parseInt(day, 10));

				const checkNextRun = () => {
					const currentTime = now.getTime();
					let minDelay = Infinity;
					let nextRunTime: Date | null = null;
					for (const targetDay of targetDays) {
						const targetTime = new Date(
							now.getFullYear(),
							now.getMonth(),
							targetDay,
							hours,
							minutes,
							seconds,
						).getTime();
						let delay = targetTime - currentTime;
						if (delay <= 0) {
							const nextMonth = new Date(
								now.getFullYear(),
								now.getMonth() + 1,
								targetDay,
								hours,
								minutes,
								seconds,
							);
							delay = nextMonth.getTime() - currentTime;
						}
						if (delay < minDelay) {
							minDelay = delay;
							// eslint-disable-next-line @typescript-eslint/no-unused-vars
							nextRunTime = new Date(targetTime);
						}
					}

					intervalId = setTimeout(() => {
						triggerWorkflow().catch(() => {
							console.error('Error in triggerWorkflow');
						});

						now.setTime(Date.now());
						checkNextRun();
					}, minDelay);
				};
				checkNextRun();
			} else if (schedule_type === 'specified_dates') {
				const [hours, minutes, seconds] = parseTimeString(specific_time!, 'specified_dates');
				const targetMonths = (specific_months as string[]).includes('all')
					? months.map((m) => m.toLowerCase())
					: (specific_months as string[]);
				const targetDays = (specific_days as string[]).includes('all')
					? daysOfMonth
					: (specific_days as string[]);
				const targetMonthIndices = targetMonths.map((month) =>
					months.findIndex((m) => m.toLowerCase() === month),
				);

				const checkNextRun = () => {
					const currentTime = now.getTime();
					let minDelay = Infinity;
					let nextRunTime: Date | null = null;
					for (const monthIndex of targetMonthIndices) {
						for (const day of targetDays) {
							const targetTime = new Date(
								now.getFullYear(),
								monthIndex,
								parseInt(day, 10),
								hours,
								minutes,
								seconds,
							).getTime();
							let delay = targetTime - currentTime;
							if (delay <= 0) {
								const nextYear = new Date(
									now.getFullYear() + 1,
									monthIndex,
									parseInt(day, 10),
									hours,
									minutes,
									seconds,
								);
								delay = nextYear.getTime() - currentTime;
							}
							if (delay < minDelay) {
								minDelay = delay;
								// eslint-disable-next-line @typescript-eslint/no-unused-vars
								nextRunTime = new Date(targetTime);
							}
						}
					}

					intervalId = setTimeout(() => {
						triggerWorkflow().catch((err) => {
							console.error('Error in triggerWorkflow:', err);
						});

						now.setTime(Date.now());
						checkNextRun();
					}, minDelay);
				};
				checkNextRun();
			}
		};

		scheduleJob();

		const response = await storeListener({
			triggerNodeId,
			triggerType: 'cron',
			uniqueKey: triggerNodeId,
			listener: { intervalId },
		});
		if (isError(response)) {
			if (intervalId) clearTimeout(intervalId);
			return { ...response, trace: ['cronStartListener - storeListener'] };
		}

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const shutdown = async (signal: string) => {
			if (intervalId) clearTimeout(intervalId);
			process.exit(0);
		};

		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		process.off('SIGINT', shutdown);
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		process.off('SIGTERM', shutdown);
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		process.on('SIGINT', () => shutdown('SIGINT'));
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		process.on('SIGTERM', () => shutdown('SIGTERM'));

		// setInterval(() => {
		// 	console.log('Heartbeat: Cron job is active', {
		// 		uptime: process.uptime(),
		// 		memory: process.memoryUsage().rss,
		// 	});
		// }, 30 * DATA.MINUTE_IN_MS);

		return {};
	} catch (error) {
		return {
			userMessage: 'Failed to start cron listener!',
			error: 'Failed to start cron listener!',
			errorType: 'InternalServerErrorException',
			errorData: {
				error: returnErrorString(error),
			},
			trace: ['cronStartListener - catch'],
		};
	}
};
