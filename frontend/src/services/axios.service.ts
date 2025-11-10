import axios from 'axios';

import { URLS } from '@/constants/url.constant';

import { signOutUser } from '@/hooks/useUser.hook';

export const api = axios.create({ withCredentials: true });

let isRefreshing = false;
let refreshSubscribers: Array<() => void> = [];

const subscribeTokenRefresh = (cb: () => void) => {
	refreshSubscribers.push(cb);
};

const onRefreshed = () => {
	refreshSubscribers.forEach((cb) => cb());
	refreshSubscribers = [];
};

api.interceptors.response.use(
	(response) => response, // Success → Return normally

	async (error) => {
		const originalRequest = error.config;

		if (
			error.response?.status === 401 &&
			!originalRequest._retry &&
			!originalRequest.url.includes('/auth/refresh')
		) {
			if (isRefreshing) {
				// Another refresh request in progress → Wait for it
				return new Promise((resolve) => {
					subscribeTokenRefresh(() => {
						resolve(api(originalRequest)); // Retry original request after refresh
					});
				});
			}

			originalRequest._retry = true;
			isRefreshing = true;

			try {
				// await api.get(`${URLS.API}/auth/refresh`, {
				// 	_retry: true, // avoid re-intercepting this request
				// });

				await axios.get(`${URLS.API}/auth/refresh`, { withCredentials: true });

				isRefreshing = false;
				onRefreshed();

				return api(originalRequest); // Retry original request
			} catch (refreshError) {
				console.error(' refreshError', refreshError);
				isRefreshing = false;

				// Redirect to login page on refresh failure
				signOutUser();
				return Promise.reject(refreshError);
			}
		}

		return Promise.reject(error);
	},
);
