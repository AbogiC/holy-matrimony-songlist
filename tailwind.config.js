/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ivory: '#FAF7F2',
        champagne: '#F7E7CE',
        gold: '#C9A96E',
        'gold-dark': '#B8956A',
        charcoal: '#2C2C2C',
        'warm-gray': '#8A817C',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};