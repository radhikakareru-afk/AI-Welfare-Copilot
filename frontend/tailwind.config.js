/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          green: {
            DEFAULT: '#16a34a', // Green 600
            dark: '#15803d',    // Green 700
            light: '#f0fdf4',   // Green 50
          },
          purple: {
            DEFAULT: '#7c3aed', // Purple 600
            dark: '#6d28d9',    // Purple 700
            light: '#f5f3ff',   // Purple 50
          },
          dark: '#0f172a',      // Slate 900
          navy: '#1e293b',      // Slate 800
          steel: '#334155',     // Slate 700
          light: '#f8fafc',     // Slate 50
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 4px 20px rgba(0, 0, 0, 0.02)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.04)',
      }
    },
  },
  plugins: [],
}
