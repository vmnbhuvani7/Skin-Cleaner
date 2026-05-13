/** @type {import('tailwindcss').Config} */

// Build a full 50..950 color scale that resolves to CSS variables declared in
// src/styles/theme.css. Using `rgb(var(--token) / <alpha-value>)` so opacity
// modifiers like `bg-primary-500/25` keep working.
const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const scale = (name) =>
  SHADES.reduce((acc, s) => {
    acc[s] = `rgb(var(--${name}-${s}) / <alpha-value>)`;
    return acc;
  }, {});

module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surface tokens (theme-aware, set in theme.css)
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "var(--surface)",
        border: "var(--border)",
        muted: "var(--text-muted)",

        // Brand + semantic color scales (full 50..950)
        primary: scale("primary"),
        danger:  scale("danger"),
        success: scale("success"),
        warning: scale("warning"),
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
      },
    },
  },
  plugins: [],
};
