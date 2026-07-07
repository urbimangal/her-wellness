/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#6B2FA8',
          purpleDark: '#4A1F7A',
          purpleLight: '#F3EBFF',
          pink: '#F06292',
          pinkLight: '#FDEEF3',
          rose: '#FF6F8E',
        },
      },
      fontFamily: {
        display: ['"Poppins"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px rgba(107, 47, 168, 0.08)',
        cardHover: '0 10px 30px rgba(107, 47, 168, 0.15)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
}
