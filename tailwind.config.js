/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          DEFAULT: '#6366F1',
        },
        secondary: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        success: {
          DEFAULT: '#10B981',
          light: '#34D399',
        },
        danger: {
          DEFAULT: '#EF4444',
          light: '#F87171',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
        },
        neutral: {
          DEFAULT: '#6B7280',
          light: '#9CA3AF',
        },
        glass: {
          DEFAULT: 'rgba(255, 255, 255, 0.6)',
          hover: 'rgba(255, 255, 255, 0.8)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 10px 30px rgba(0, 0, 0, 0.05)',
        'medium': '0 20px 40px rgba(0, 0, 0, 0.08)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.08)',
      },
      backdropBlur: {
        'glass': '20px',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6366F1, #8B5CF6)',
        'gradient-main': 'linear-gradient(135deg, #FFFFFF, #F5F7FA)',
        'gradient-card': 'linear-gradient(135deg, rgba(99, 102, 241, 0.95), rgba(139, 92, 246, 0.95))',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}