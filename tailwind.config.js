/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef5ff",
          100: "#d9e8ff",
          200: "#b9d1ff",
          300: "#8db2ff",
          400: "#5c8dff",
          500: "#3570ff",
          600: "#1f5bff",
          700: "#1a49d8",
          800: "#1a3aa8",
          900: "#152f7a",
          950: "#0b1b3b",
        },
        success: {
          50: "#ecfdf3",
          100: "#d1fae5",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
        },
        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        },
        error: {
          50: "#fef2f2",
          100: "#fee2e2",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
        },
      },
    },
  },
  plugins: [],
};
