export const convertFileToBase64 = (file: File): Promise<string> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			if (reader.result && typeof reader.result === 'string') {
				resolve(reader.result);
			} else {
				reject('Error reading the image, please try again');
			}
		};
		reader.onerror = () => reject('Error reading the image, please try again');
		reader.readAsDataURL(file);
	});
};

export const convertDocsToBase64 = (file: File): Promise<string> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = () => {
			if (reader.result && typeof reader.result === 'string') {
				// Remove the data URL prefix (e.g., "data:application/pdf;base64,")
				const base64String = reader.result.split(',')[1];
				if (base64String) {
					resolve(base64String);
				} else {
					reject('Failed to extract base64 data from file');
				}
			} else {
				reject('Error reading the file, please try again');
			}
		};

		reader.onerror = () => reject('Error reading the file, please try again');

		// Use readAsDataURL to get the full data URL, then extract base64
		reader.readAsDataURL(file);
	});
};
