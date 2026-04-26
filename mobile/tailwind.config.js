/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          DEFAULT: '#0284C7',
        },
        background: '#F1F5F9',
        surface: {
          50: '#F9FAFB',
          100: '#F1F5F9',
          200: '#E2E8F0',
          DEFAULT: '#FFFFFF',
        },
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
