// https://docs.astro.build/en/guides/styling/#postcss

module.exports = {
  plugins: [
    require('autoprefixer'),
    // https://cssnano.github.io/cssnano/
    require('cssnano'),
  ],
};