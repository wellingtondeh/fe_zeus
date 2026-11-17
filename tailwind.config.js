/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        google: '#4285F4',
        microsoft: '#0078D4',
        facebook: '#1877F2',
      },
    },
    fontFamily: {
      sans: ['var(--font-roboto)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
    },
  },
  plugins: [],
}
