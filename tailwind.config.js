/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        molkky: {
          wood: '#c98e57',
          woodDark: '#8a5a2b',
          green: '#3a8d4f',
          accent: '#f5b400',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Hiragino Sans"',
          '"Hiragino Kaku Gothic ProN"',
          '"Noto Sans JP"',
          'Meiryo',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
