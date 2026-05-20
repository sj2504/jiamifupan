/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Microsoft YaHei',
          'sans-serif',
        ],
      },
      colors: {
        ink: '#172033',
        muted: '#667085',
        line: '#e5e7eb',
        panel: '#ffffff',
        page: '#f6f7f9',
        positive: '#0f9f6e',
        negative: '#d92d20',
        accent: '#2563eb',
      },
    },
  },
  plugins: [],
};
