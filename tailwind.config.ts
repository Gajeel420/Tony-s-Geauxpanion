import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'lsu-purple': '#461D7C',
        'lsu-purple-light': '#5a2a9a',
        'lsu-gold': '#FDD023',
        'lsu-gold-dark': '#c9a81a',
        'lsu-dark': '#1a0a2e',
        'lsu-darker': '#0d0517',
      },
      animation: {
        'pulse-gold': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'vote-grow': 'voteGrow 0.6s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        voteGrow: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--vote-pct)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
