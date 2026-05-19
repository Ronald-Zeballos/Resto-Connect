/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#20211d",
        herb: "#2f6f4e",
        tomato: "#c7442f",
        maize: "#e3a62f",
        cream: "#f8f5ef",
        mist: "#ece8df"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(32, 33, 29, 0.08)"
      }
    }
  },
  plugins: []
};
