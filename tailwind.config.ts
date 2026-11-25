import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B0B0C',
        paper: '#EDEBE6',
        red: { DEFAULT: '#EC0000', deep: '#C40000', glow: '#FF2A1A' },
        mute: { dark: '#B9B5AE', light: '#4A4741' },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Arial Black', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      maxWidth: { page: '1280px' },
    },
  },
  plugins: [],
};

export default config;
