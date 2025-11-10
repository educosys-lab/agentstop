import { TIME } from 'src/shared/constants/time.constant';

export const AUTH = {
	ACCESS_TOKEN_VALIDITY: 1 * TIME.DAY_IN_MS, // 1s = 1 second, 1m = 1 minute, 1h = 1 hour, 1d = 1 day
	REFRESH_TOKEN_VALIDITY: 30 * TIME.DAY_IN_MS,
};
