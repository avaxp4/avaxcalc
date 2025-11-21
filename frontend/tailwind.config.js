/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        matrix: {
          black: '#0d0d0d',
          dark: '#001a00',
          green: '#00ff41',
          dim: '#003b00',
        }
      },
      fontFamily: {
        mono: ['Courier New', 'Courier', 'monospace'],
      },
      boxShadow: {
        'glow': '0 0 10px #00ff41',
        'glow-sm': '0 0 5px #00ff41',
      }
    },
  },
  plugins: [],
}