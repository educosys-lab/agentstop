const isOnServer = typeof window === 'undefined';

export const localStorageService = {
	set: (key: string, value: any) => {
		if (isOnServer) return;
		localStorage.setItem(key, JSON.stringify(value));
	},

	get: (key: string): any => {
		if (isOnServer) return null;
		return JSON.parse(localStorage.getItem(key)!);
	},

	remove: (key: string) => {
		if (isOnServer) return;
		localStorage.removeItem(key);
	},
};
