module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        message: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "15%": { opacity: "1", transform: "translateY(0)" },
          "85%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(-8px)" },
        },
      },
      animation: {
        shimmer: "shimmer 2.2s linear infinite",
        message: "message 2.5s ease-in-out",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
