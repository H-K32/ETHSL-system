/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff', 100: '#dae6ff', 500: '#3b6ef7', 600: '#2f5be0', 700: '#2548b8',
        },
      },
    },
  },
  plugins: [],
}
