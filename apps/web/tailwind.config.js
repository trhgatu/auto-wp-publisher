/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b', // zinc-950
        foreground: '#fafafa', // zinc-50
        card: '#18181b', // zinc-900
        'card-foreground': '#fafafa', // zinc-50
        border: '#27272a', // zinc-800
        primary: {
          DEFAULT: '#6366f1', // indigo-500
          foreground: '#ffffff',
        },
        muted: '#27272a', // zinc-800
        'muted-foreground': '#a1a1aa', // zinc-400
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
