/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        nunito: ["'Nunito'", 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        buildy: {
          purple:       '#8B5CF6',
          'purple-deep':'#6D28D9',
          'purple-soft':'#A78BFA',
          yellow:       '#FCD34D',
          'yellow-warm':'#FBBF24',
          success:      '#34D399',
          danger:       '#F87171',
        },
      },
    },
  },
  plugins: [],
};
