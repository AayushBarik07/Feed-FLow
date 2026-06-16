/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter_400Regular', 'sans-serif'],
        medium: ['Inter_500Medium', 'sans-serif'],
        semibold: ['Inter_600SemiBold', 'sans-serif'],
        bold: ['Inter_700Bold', 'sans-serif'],
        black: ['Inter_900Black', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
