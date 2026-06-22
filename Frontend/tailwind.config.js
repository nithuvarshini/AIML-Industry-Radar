export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#070b16',
          900: '#0b1120',
          850: '#0f1729',
          800: '#131c33',
          700: '#1c2742',
          600: '#283353',
          500: '#3a4670',
        },
        brand: {
          50: '#eff4ff',
          100: '#dae6ff',
          200: '#bdd2ff',
          300: '#8fb4ff',
          400: '#5b8bff',
          500: '#3b66ff',
          600: '#2a47f5',
          700: '#2238d8',
          800: '#2130ad',
        },
        accent: {
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
      },
      boxShadow: {
        glow: '0 0 50px -12px rgba(91, 139, 255, 0.45)',
        'glow-accent': '0 0 50px -12px rgba(139, 92, 246, 0.5)',
        card: '0 10px 35px -10px rgba(0, 0, 0, 0.55)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #3b66ff 0%, #8b5cf6 100%)',
        'brand-gradient-soft':
          'linear-gradient(135deg, rgba(59,102,255,0.18) 0%, rgba(139,92,246,0.18) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out both',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        shimmer: 'shimmer 1.6s infinite linear',
        'spin-slow': 'spin 1.2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [],
};
