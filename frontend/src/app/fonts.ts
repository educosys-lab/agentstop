import { Poppins } from 'next/font/google';

export const poppins = Poppins({
	weight: ['400', '500', '600', '700', '800', '900'],
	subsets: ['latin'],
	variable: '--font-primary',
	display: 'swap',
});
