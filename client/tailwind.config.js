/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B1220', // deep navy background
        surface: '#101B2D', // slightly lifted panel color
        blue: {
          DEFAULT: '#1D4ED8',
          light: '#60A5FA',
          bright: '#38BDF8',
        },
        spark: '#8B5CF6', // AI / purple accent
        mist: '#F1F5F9', // near-white for light surfaces / text on dark
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #1D4ED8 0%, #38BDF8 100%)',
        'spark-gradient': 'linear-gradient(135deg, #8B5CF6 0%, #38BDF8 100%)',
      },
      boxShadow: {
        card: '0 8px 30px -8px rgba(29, 78, 216, 0.35)',
        glow: '0 0 40px -8px rgba(56, 189, 248, 0.45)',
      },
    },
  },
  plugins: [],
};
