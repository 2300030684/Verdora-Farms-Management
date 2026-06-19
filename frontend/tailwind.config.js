/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1c512c", // Verdora Forest Green
        secondary: "#12381e", // Verdora Deep Dark Green
        accent: "#d4a373", // Verdora Wheat/Gold Accent
        dark: "#141f17", // Slightly green-tinted dark
        light: "#f5f7f5" // Slightly green-tinted light
      }
    },
  },
  plugins: [],
}
