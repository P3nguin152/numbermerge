/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFF5F5',
          100: '#FED7D7',
          200: '#FEB2B2',
          300: '#FC8181',
          400: '#F56565',
          500: '#E53E3E',
          600: '#E8624A',
          700: '#C53030',
          800: '#9B2C2C',
          900: '#742A2A',
        },
        accent: {
          50: '#EBF8FF',
          100: '#BEE3F8',
          200: '#90CDF4',
          300: '#63B3ED',
          400: '#4299E1',
          500: '#3182CE',
          600: '#3A6EEA',
          700: '#2B6CB0',
          800: '#2C5282',
          900: '#2A4365',
        },
        dark: {
          50: '#F7FAFC',
          100: '#EDF2F7',
          200: '#E2E8F0',
          300: '#CBD5E0',
          400: '#A0AEC0',
          500: '#718096',
          600: '#4A5568',
          700: '#2D3748',
          800: '#1E1E1E',
          900: '#171923',
        },
      },
      fontFamily: {
        sans: ['System'],
        bold: ['System'],
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'glow': '0 0 30px rgba(232, 98, 74, 0.3)',
        'glow-accent': '0 0 30px rgba(58, 110, 234, 0.3)',
      },
    },
  },
  plugins: [],
}
