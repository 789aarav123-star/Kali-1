/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./views/**/*.ejs', './public/js/**/*.js', './server.js'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0b1329',
          900: '#070c1c',
          800: '#0b1329',
          700: '#111b3d',
          600: '#1a2650',
          500: '#27356b',
        },
        gold: {
          DEFAULT: '#d4af37',
          300: '#e8ce72',
          400: '#dfbf56',
          500: '#d4af37',
          600: '#b28f22',
          700: '#8a6c17',
        },
        cream: '#f6f1e6',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      maxWidth: {
        container: '80rem',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #e8ce72 0%, #d4af37 45%, #a8821c 100%)',
        'navy-gradient': 'linear-gradient(180deg, rgba(11,19,41,0) 0%, rgba(11,19,41,0.95) 100%)',
      },
      boxShadow: {
        gold: '0 10px 40px -12px rgba(212,175,55,0.45)',
        card: '0 20px 45px -25px rgba(0,0,0,0.85)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'toast-in': {
          '0%': { opacity: '0', transform: 'translateY(14px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
        'toast-in': 'toast-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        'spin-slow': 'spin-slow 1.4s linear infinite',
      },
    },
  },
  plugins: [],
};
