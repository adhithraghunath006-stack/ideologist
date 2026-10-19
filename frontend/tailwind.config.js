/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070A12', // Deep editorial canvas
          900: '#0D1322', // Primary surface
          850: '#131B2E', // Secondary surface / card
          800: '#1A253D', // Elevated / hover
          750: '#233250',
          700: '#2D3E63', // Border standard
          600: '#465D8B', // Border subtle / muted
        },
        ivory: {
          DEFAULT: '#FAF8F5',
          muted: '#E6E1D8',
          dark: '#BDB6A8'
        },
        brand: {
          emerald: '#0D9488', // Restrained teal/emerald
          emeraldDark: '#0F766E',
          emeraldLight: '#14B8A6',
          amber: '#D97706', // Restrained warm amber
          amberDark: '#B45309',
          blue: '#2563EB',
          blueDark: '#1D4ED8',
          offWhite: '#F8F7F4'
        }
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'Cambria', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
