/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAFAFA",
        primary: "#28112B",
        accent: "#8DAA91",
        text: {
          DEFAULT: "#111827",
          secondary: "#6B7280",
        },
        border: "#E5E7EB",
        card: "#FFFFFF",
        success: "#22C55E",
        error: "#EF4444",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 10px 40px -10px rgba(0,0,0,0.08)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.05)',
      }
    },
  },
  plugins: [],
}
