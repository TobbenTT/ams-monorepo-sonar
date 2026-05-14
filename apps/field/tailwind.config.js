/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // OCP branding
        ocp: {
          green: '#1B5E20',
          'green-light': '#2E7D32',
          'green-dark': '#0D3B12',
        },
      },
    },
  },
  plugins: [],
};
