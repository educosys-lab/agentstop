export const generateRandomString = (length: number) => {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return result;
};

export const splitText = (text: string, limit: number): string[] => {
	const result: string[] = [];
	let currentIndex = 0;

	while (currentIndex < text.length) {
		// Determine the next chunk boundary
		const nextIndex = currentIndex + limit;

		if (nextIndex >= text.length) {
			result.push(text.slice(currentIndex));
			break;
		}

		// Try to split at the last whitespace (space, newline, tab) before the limit
		const lastWhitespace = text.lastIndexOf(' ', nextIndex);
		const lastNewline = text.lastIndexOf('\n', nextIndex);
		let splitIndex = Math.max(lastWhitespace, lastNewline);

		// no whitespace found, we have to split at hard limit
		if (splitIndex <= currentIndex) splitIndex = nextIndex;

		result.push(text.slice(currentIndex, splitIndex));
		currentIndex = splitIndex;

		// skip over the whitespace character if it's a space or newline
		if (text[currentIndex] === ' ' || text[currentIndex] === '\n') currentIndex++;
	}

	return result;
};
