/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["selector", "class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
  	container: {
  		center: 'true',
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
      fontFamily: {
        sans: ['var(--font-acari)'], // Default font
        heading: ['var(--font-nevermind)'], // For headings
        acari: ['var(--font-acari)'],
        nevermind: ['var(--font-nevermind)'],
      },
      colors: {
          first: {
            DEFAULT: "#FAF8EF",
            80: "rgba(250, 248, 239, 0.8)",
            50: "rgba(250, 248, 239, 0.5)",
            30: "rgba(250, 248, 239, 0.3)",
          },
          second: {
            DEFAULT: "#F0C548",
            80: "rgba(240, 197, 72, 0.8)",
            50: "rgba(240, 197, 72, 0.5)",
            30: "rgba(240, 197, 72, 0.3)",
          },
          third: {
            DEFAULT: "#31693C",
            80: "rgba(49, 105, 60, 0.8)",
            50: "rgba(49, 105, 60, 0.5)",
            30: "rgba(49, 105, 60, 0.3)",
          },
          fourth: {
            DEFAULT: "#05300E",
            80: "rgba(5, 48, 14, 0.8)",
            50: "rgba(5, 48, 14, 0.5)",
            30: "rgba(5, 48, 14, 0.3)",
          },
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
}
