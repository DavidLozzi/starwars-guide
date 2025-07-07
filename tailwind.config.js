/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./_layouts/**/*.html",
    "./_includes/**/*.html",
    "./_posts/**/*.{md,html}",
    "./*.{md,html}",
    "./character/**/*.{md,html}",
    "./comics/**/*.{md,html}",
    "./admin/**/*.{md,html}",
    "./assets/js/**/*.js"
  ],
  theme: {
    extend: {
      fontFamily: {
        'mono': ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      colors: {
        'sw-black': '#000000',
        'sw-white': '#ffffff',
        'sw-red': {
          400: '#f87171',
          500: '#ef4444',
        },
        'sw-yellow': {
          400: '#facc15',
          500: '#eab308',
        },
        'sw-blue': {
          400: '#60a5fa',
          500: '#3b82f6',
        },
        'sw-green': {
          400: '#4ade80',
          500: '#22c55e',
        },
        'sw-pink': {
          400: '#f472b6',
        },
        'sw-orange': {
          400: '#fb923c',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      screens: {
        'nav': '1000px', // Custom breakpoint for navigation
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}