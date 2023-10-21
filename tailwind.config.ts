/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      colors: {
        mainBg: {
          light: '#F2E6CE',
          dark: '#352F44',
        },
        secondaryBg: {
          light: '#F26969',
          dark: '#4D3C77'
        },
        customText: {
          light: '#3F1D38',
          dark: '#F8F5EC'
        },
        customHighlight: '#6A6576',
        customHighlight2: '#837E90',
        btnBg: '#048B47',
        hoverBtnBg: '#03723B',
        hoverSecondaryBg: 'hsl(0, 84%, 60%)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}