const colors = require('tailwindcss/colors')

module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '976px',
      xl: '1440px',
    },
    colors: {
      backgroundColor: '#212626',
      textColor: '#f4e6d4',
      gray: colors.coolGray,
      blue: colors.sky,
      red: colors.rose,
      pink: colors.fuchsia,
      green: colors.green,
      white: colors.white,
      black: colors.black
    },
    fontFamily: {
      sans: ['Graphik', 'sans-serif'],
      serif: ['Merriweather', 'serif'],
      poppins: ['Poppins', 'Poppins'],
    },
    extend: {
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        '4xl': '2rem',
      }
    }
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
