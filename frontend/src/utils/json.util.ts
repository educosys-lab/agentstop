export const parseJson = (jsonString: string, caller: string) => {
	try {
		return JSON.parse(jsonString);
	} catch (error) {
		console.error(`Error parsing JSON in ${caller}:`, error);
		return null;
	}
};

export const isJson = (jsonString: string) => {
	try {
		JSON.parse(jsonString);
	} catch (error) {
		console.error(' error', error);
		return false;
	}
	return true;
};
