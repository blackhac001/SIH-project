/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        connectx: {
          bg: '#080C15',
          card: '#0D1322',
          cardHover: '#131B2E',
          border: '#1E293B',
          borderGlow: '#06B6D4',
          cyan: '#06B6D4',
          cyanLight: '#22D3EE',
          blue: '#3B82F6',
          blueLight: '#60A5FA',
          purple: '#8B5CF6',
          purpleLight: '#A855F7',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
          slate: '#94A3B8',
          textMuted: '#64748B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.35)',
        'glow-blue': '0 0 25px -5px rgba(59, 130, 246, 0.35)',
        'glow-purple': '0 0 25px -5px rgba(139, 92, 246, 0.35)',
        'glow-sm': '0 0 10px rgba(6, 182, 212, 0.2)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-cyber': 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 50%, #8B5CF6 100%)',
        'gradient-dark': 'linear-gradient(180deg, #080C15 0%, #0D1322 100%)',
      }
    },
  },
  plugins: [],
}
