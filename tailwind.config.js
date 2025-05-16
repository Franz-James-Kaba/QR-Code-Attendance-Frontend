/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: '#065186',
        secondary: '#E0F0FE',
        nspBg: '#F0F8FF',
        nspText: '#292929',
        lightGray: '#EFEFEF',
      },
      fontSize: {
        '10': '10px',
        '14': '14px',
      },
    },
  },
  plugins: [],
}
