/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4a7c59',
        'primary-dark': '#3d6a4a',
        cream: '#faf8f3',
        charcoal: '#1a1f1c',
        amber: '#d97706',
        'soft-red': '#dc2626',
        'soft-red/10': 'rgba(220, 38, 38, 0.1)',
      },
      fontFamily: {
        fraunces: ['Fraunces', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px rgba(26, 31, 28, 0.06)',
        'card-hover': '0 8px 24px rgba(26, 31, 28, 0.12)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}
