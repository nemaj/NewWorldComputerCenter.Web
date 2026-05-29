import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#172026',
        mist: '#f5f7f8',
        line: '#dbe2e6',
        teal: '#0f766e',
        coral: '#e76f51',
        amber: '#f4a261'
      },
      boxShadow: {
        panel: '0 14px 40px rgba(23, 32, 38, 0.08)'
      }
    }
  },
  plugins: []
};

export default config;
