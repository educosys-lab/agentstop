import { padNumber } from '@/utils/number.util';

export const TimePickerHourData = Array.from({ length: 24 }, (item, index) => ({
	id: `hour-${index}`,
	value: padNumber(index),
}));

export const TimePickerMinuteData = Array.from({ length: 60 }, (item, index) => ({
	id: `minute-${index}`,
	value: padNumber(index),
}));
