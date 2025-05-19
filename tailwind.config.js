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
        accent: "#F472B6",
        neutral: "#374151",
        "base-light": "#FFFFFF",
        "base-dark": "#131927",
        info: "#3ABFF8",
        success: "#36D399",
        warning: "#FBBD23",
        error: "#F87272",
      },
      fontSize: {
        '10': '10px',
        '14': '14px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
        mono: ['Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
