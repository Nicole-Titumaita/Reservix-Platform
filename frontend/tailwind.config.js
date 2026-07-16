/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        paper: '#f8fafc',
        accent: '#2563eb',
        accent2: '#0ea5e9'
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(37,99,235,.08), 0 20px 45px rgba(15,23,42,.12)'
      }
    }
  },
  plugins: []
};
