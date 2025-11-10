export const padNumber = (value: string | number, size = 2) => {
	return value.toString().padStart(size, '0');
};
