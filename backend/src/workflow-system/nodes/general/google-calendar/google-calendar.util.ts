import { formatDateTime } from '@sgx4u/date-time-utils';

export const getDateTime = (dateTime: string | null | undefined) => {
	if (!dateTime) return 'Unknown';
	const date = new Date(dateTime);
	if (isNaN(date.getTime())) return 'Unknown';

	const timezone = date.toTimeString().split(' ').slice(1).join(' ');
	const time = formatDateTime({
		date,
		format: 'dd MMM yyyy - HH:mm:ss',
	});

	return `${time} - ${timezone}`;
};
