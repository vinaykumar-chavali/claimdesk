import type { Config } from 'tailwindcss';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0F2D5E',
          50: '#eef3fc',
          100: '#d9e3f7',
          200: '#bbcbee',
          300: '#8eabe2',
          400: '#5a84d1',
          500: '#3863c0',
          600: '#274b9f',
          700: '#213d82',
          800: '#1e346b',
          900: '#1d2e56',
        },
        gold: {
          DEFAULT: '#C9A84C',
          50: '#fbf8f0',
          100: '#f5ecd9',
          200: '#ebd8b2',
          300: '#dfbe82',
          400: '#d3a158',
          500: '#c98a39',
          600: '#b9712f',
          700: '#9b5629',
          800: '#7f4728',
          900: '#673b23',
        }
      }
    },
  },
  plugins: [],
} satisfies Config;
