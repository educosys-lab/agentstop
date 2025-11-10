import { TIME } from '../constants/time.constant';

export const getTimestampAfterGivenMinutes = (minutes: number): number => {
	return Date.now() + minutes * TIME.MINUTE_IN_MS;
};
