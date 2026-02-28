import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'spark-amber': '#F59E0B',
        'spark-orange': '#F97316',
        'spark-cream': '#FFFBF0',
        'spark-dark': '#1A1A2E',
        'spark-muted': '#6B7280',
        'spark-light': '#F3F4F6',
        gold: {
          50: '#FFF9E6',
          100: '#FFF0BF',
          200: '#FFE699',
          300: '#FFD966',
          400: '#FFCC33',
          500: '#F5B800',
          600: '#CC9900',
          700: '#997300',
          800: '#664D00',
          900: '#332600',
        },
        storybook: {
          bg: '#FFF8F0',
          text: '#2D1B4E',
          accent: '#F5B800',
          border: '#E8D5B7',
        },
      },
      fontFamily: {
        heading: ['system-ui', 'sans-serif'],
        story: ['Georgia', 'Cambria', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config
