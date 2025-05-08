// https://docs.astro.build/en/guides/styling/#postcss

module.exports = {
  plugins: [
    require('autoprefixer'),
    require('cssnano'),
  ],
};