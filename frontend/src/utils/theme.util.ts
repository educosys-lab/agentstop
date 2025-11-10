import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { TextType } from '@/types/text.type';

export const cn = (...inputs: ClassValue[]) => {
	return twMerge(clsx(inputs));
};

export const getTextVariantColor = (variant: TextType | undefined) => {
	const buttonTypeClassName = {
		success: 'text-success',
		warn: 'text-warn',
		destructive: 'text-destructive',
		default: '',
	};
	return buttonTypeClassName[variant || 'default'];
};

export const rgbToHex = (rgb: string) => {
	const rgbValue = rgb.replace('rgb(', '').replace(')', '');
	const [r, g, b] = rgbValue.split(',').map((val) => Number(val));
	return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};
