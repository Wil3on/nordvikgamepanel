module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4dabf5',
          main: '#2196f3',
          dark: '#1769aa',
          contrastText: '#fff',
        },
        secondary: {
          light: '#ff4081',
          main: '#f50057',
          dark: '#c51162',
          contrastText: '#fff',
        },
      },
    },
  },
  plugins: [],
  important: true,
  corePlugins: {
    preflight: false,
  },
} 