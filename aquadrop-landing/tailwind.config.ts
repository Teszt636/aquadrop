import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#1e40af',
          light: '#dbeafe'
        },
        text: {
          dark: '#0f172a'
        },
        muted: {
          gray: '#94a3b8'
        },
        success: {
          green: '#16a34a'
        }
      },
      fontFamily: {
        heading: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        body: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 16px 32px -20px rgba(15, 23, 42, 0.35)'
      }
    }
  },
  plugins: []
};

export default config;
