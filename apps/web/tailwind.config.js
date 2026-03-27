/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8fafc', // slate-50
        foreground: '#0f172a', // slate-900
        card: '#ffffff', // white
        'card-foreground': '#0f172a', // slate-900
        border: '#e2e8f0', // slate-200
        primary: {
          DEFAULT: '#4f46e5', // indigo-600
          foreground: '#ffffff',
        },
        muted: '#f1f5f9', // slate-100
        'muted-foreground': '#64748b', // slate-500
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
