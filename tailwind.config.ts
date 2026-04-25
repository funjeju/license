import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
  	container: {
  		center: true,
  		padding: '1rem',
  		screens: {
  			'2xl': '1440px'
  		}
  	},
  	extend: {
  		colors: {
  			// shadcn CSS variable mappings
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))',
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))',
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))',
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))',
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))',
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))',
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))',
  			},
  			// Brand colors
  			ink: {
  				'50': '#F2F3F8',
  				'100': '#D9DCE8',
  				'200': '#B3B9D1',
  				'300': '#8D96BA',
  				'400': '#6773A3',
  				'500': '#41508C',
  				'600': '#344070',
  				'700': '#263054',
  				'800': '#192038',
  				'900': '#0D163D',
  				DEFAULT: '#0D163D'
  			},
  			royal: {
  				'50': '#EEF2FB',
  				'100': '#D6DEF4',
  				'200': '#ADBCE9',
  				'300': '#8499DE',
  				'400': '#5B77D3',
  				'500': '#3256B6',
  				'600': '#2847A0',
  				'700': '#1E3A8A',
  				'800': '#172D6C',
  				'900': '#10204D',
  				DEFAULT: '#1E3A8A'
  			},
  			jade: {
  				'50': '#F0FDF4',
  				'100': '#DCFCE7',
  				'500': '#22C55E',
  				'600': '#16A34A',
  				'700': '#15803D',
  				DEFAULT: '#22C55E'
  			},
  			neutral: {
  				'50': '#F9FAFB',
  				'100': '#F3F4F6',
  				'200': '#E5E7EB',
  				'300': '#D1D5DB',
  				'400': '#9CA3AF',
  				'500': '#6B7280',
  				'600': '#4B5563',
  				'700': '#374151',
  				'800': '#1F2937',
  				'900': '#111827'
  			},
  			success: '#22C55E',
  			warning: '#F59E0B',
  			danger: '#DC2626',
  			info: '#1E3A8A'
  		},
  		fontFamily: {
  			sans: [
  				'Pretendard Variable',
  				'Pretendard',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'Segoe UI',
  				'sans-serif'
  			],
  			mono: [
  				'SF Mono',
  				'Monaco',
  				'JetBrains Mono',
  				'monospace'
  			]
  		},
  		fontSize: {
  			display: [
  				'48px',
  				{
  					lineHeight: '1.15',
  					fontWeight: '700'
  				}
  			],
  			h1: [
  				'32px',
  				{
  					lineHeight: '1.25',
  					fontWeight: '700'
  				}
  			],
  			h2: [
  				'24px',
  				{
  					lineHeight: '1.3',
  					fontWeight: '600'
  				}
  			],
  			h3: [
  				'20px',
  				{
  					lineHeight: '1.35',
  					fontWeight: '600'
  				}
  			],
  			h4: [
  				'16px',
  				{
  					lineHeight: '1.4',
  					fontWeight: '600'
  				}
  			],
  			'body-lg': [
  				'16px',
  				{
  					lineHeight: '1.6',
  					fontWeight: '400'
  				}
  			],
  			body: [
  				'14px',
  				{
  					lineHeight: '1.55',
  					fontWeight: '400'
  				}
  			],
  			label: [
  				'13px',
  				{
  					lineHeight: '1.4',
  					fontWeight: '500'
  				}
  			],
  			caption: [
  				'12px',
  				{
  					lineHeight: '1.4',
  					fontWeight: '400'
  				}
  			]
  		},
  		borderRadius: {
  			sm: '4px',
  			md: '8px',
  			lg: '12px',
  			xl: '16px'
  		},
  		transitionDuration: {
  			DEFAULT: '150ms'
  		},
  		keyframes: {
  			'field-flash': {
  				'0%': {
  					backgroundColor: 'rgba(30, 58, 138, 0.12)'
  				},
  				'100%': {
  					backgroundColor: 'transparent'
  				}
  			},
  			'check-pop': {
  				'0%': {
  					transform: 'scale(1)'
  				},
  				'50%': {
  					transform: 'scale(1.08)'
  				},
  				'100%': {
  					transform: 'scale(1)'
  				}
  			},
  			shimmer: {
  				'0%': {
  					backgroundPosition: '-200% 0'
  				},
  				'100%': {
  					backgroundPosition: '200% 0'
  				}
  			},
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'field-flash': 'field-flash 250ms ease-out forwards',
  			'check-pop': 'check-pop 200ms ease-out',
  			shimmer: 'shimmer 1.5s linear infinite',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
  ],
};

export default config;
