export default {
  plugins: {
    'tailwindcss': {},
    'autoprefixer': {},
    'postcss-import': {},
    'postcss-preset-env': {
      features: { 'nesting-rules': false }
    }
  }
};
