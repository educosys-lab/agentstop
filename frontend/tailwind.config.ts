import type { Config } from 'tailwindcss';

const config = {
	darkMode: ['class'],
	content: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
	prefix: '',

	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},

		extend: {
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'spin-slow': 'spin 10s linear infinite',
			},

			aspectRatio: {
				meeting: '4/2.5',
			},

			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},

			colors: {
				foreground: 'hsl(var(--foreground))',

				background: {
					DEFAULT: 'hsl(var(--background))',
					dark: 'hsl(var(--background-dark))',
				},

				primary: {
					DEFAULT: 'hsl(var(--primary))',
					dark: 'hsl(var(--primary-dark))',
					light: 'hsl(var(--primary-light))',
					foreground: 'hsl(var(--primary-foreground))',
				},

				success: {
					DEFAULT: 'hsl(var(--success))',
					dark: 'hsl(var(--success-dark))',
					foreground: 'hsl(var(--success-foreground))',
				},

				warn: {
					DEFAULT: 'hsl(var(--warn))',
					dark: 'hsl(var(--warn-dark))',
					foreground: 'hsl(var(--warn-foreground))',
				},

				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					dark: 'hsl(var(--destructive-dark))',
					foreground: 'hsl(var(--destructive-foreground))',
				},

				muted: {
					DEFAULT: 'hsl(var(--muted))',
					dark: 'hsl(var(--muted-dark))',
					foreground: 'hsl(var(--muted-foreground))',
				},

				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},

				light: 'hsl(var(--light))',
				dark: 'hsl(var(--dark))',
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				scrollbar: 'hsl(var(--scrollbar))',

				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},

				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
				},

				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
				},
			},

			fontFamily: {
				poppins: ['Poppins', 'sans-serif'],
			},

			fontSize: {
				xxs: '0.625rem',
			},

			height: {
				18: '4.5rem',
			},

			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' },
				},
			},

			screens: {
				sm: '576px',
				tablet: '768px',
				laptop: '1280px',
				wide: '1400px',
			},

			width: {
				18: '4.5rem',
			},
		},
	},

	// eslint-disable-next-line @typescript-eslint/no-require-imports
	plugins: [require('tailwindcss-animate')],
} satisfies Config;

export default config;
