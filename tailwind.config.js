/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0fb9b1',
        secondary: '#c19031',
        accent: '#e74c3c',
        warning: '#f39c12',
        success: '#2ecc71',
      },
    },
  },
  plugins: [],
}
