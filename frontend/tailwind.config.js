/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4CAF50',  // Green color for the primary theme
        secondary: '#388E3C', // Darker green for secondary actions
      }
    },
  },
  plugins: [],
}

