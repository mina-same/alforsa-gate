// Tailwind config configured for shadcn-style components with light/dark mode
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			// Existing shadcn colors (keep for backward compatibility)
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			},
  			// Xon Color System
  			xon: {
  				// Surface Colors
  				surface: 'var(--xon-color-surface)',
  				'surface-on': 'var(--xon-color-surface-on)',
  				'surface-hover': 'var(--xon-color-surface-hover)',
  				'surface-container': 'var(--xon-color-surface-container)',
  				'surface-container-hover': 'var(--xon-color-surface-container-hover)',
  				'surface-outline': 'var(--xon-color-surface-outline)',
  				'surface-outline-2': 'var(--xon-color-surface-outline-2)',
  				'surface-gray': 'var(--xon-color-surface-gray)',
  				// Brand Colors
  				green: 'var(--xon-color-surface-green)',
  				purple: 'var(--xon-color-surface-purple)',
  				blue: 'var(--xon-color-surface-blue)',
  				yellow: 'var(--xon-color-surface-yellow)',
  				red: 'var(--xon-color-surface-red)',
  				'red-hover': 'var(--xon-color-surface-red-hover)',
  				'red-select': 'var(--xon-color-surface-red-select)',
  				// Container Colors
  				'container-red': 'var(--xon-color-container-red)',
  				'container-green': 'var(--xon-color-container-green)',
  				'container-yellow': 'var(--xon-color-container-yellow)',
  				'container-blue': 'var(--xon-color-container-blue)',
  				'container-violet': 'var(--xon-color-container-violet)',
  				'container-purple': 'var(--xon-color-container-purple)',
  				// Text Colors
  				'text-primary': 'var(--xon-color-text-primary)',
  				'text-secondary': 'var(--xon-color-text-secondary)',
  				'text-tertiary': 'var(--xon-color-text-tertiary)',
  				'text-inverse': 'var(--xon-color-text-inverse)',
  				'text-green': 'var(--xon-color-text-green)',
  				'text-red': 'var(--xon-color-text-red)',
  				'text-yellow': 'var(--xon-color-text-yellow)',
  				'text-blue': 'var(--xon-color-text-blue)',
  				// Primary Palette
  				primary: 'var(--xon-color-primary)',
  				'primary-on': 'var(--xon-color-primary-on)',
  				'primary-logo': 'var(--xon-color-primary-logo)',
  				'primary-hover': 'var(--xon-color-primary-hover)',
  				// Card Icon Colors
  				'total-user-icon': 'var(--xon-total-user-icon-color)',
  				'total-user-icon-bg': 'var(--xon-total-user-icon-bg)',
  				'active-now-icon': 'var(--xon-active-now-icon-color)',
  				'active-now-icon-bg': 'var(--xon-active-now-icon-bg)',
  				'administrators-icon': 'var(--xon-administrators-icon-color)',
  				'administrators-icon-bg': 'var(--xon-administrators-icon-bg)',
  				'pending-approval-icon': 'var(--xon-pending-approval-icon-color)',
  				'pending-approval-icon-bg': 'var(--xon-pending-approval-icon-bg)',
  				// WhatsApp Colors
  				'whatsapp-green': 'var(--xon-whatsapp-green)',
  				'whatsapp-gray': 'var(--xon-whatsapp-gray)',
  				'msg-bg-sent': 'var(--xon-msg-bg-sent)',
  				'msg-bg-received': 'var(--xon-msg-bg-received)',
  				'chat-bg': 'var(--xon-chat-bg)',
  				'header-bg': 'var(--xon-header-bg)'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
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
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};