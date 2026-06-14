const pxtorem = require('postcss-pxtorem');

module.exports = {
  // You can specify any options from https://postcss.org/api/#processoptions here
  // parser: 'sugarss',
  plugins: [
    // Plugins for PostCSS
    'autoprefixer',

    pxtorem({
      rootValue: 16,
      propList: ['font', 'font-size'], // which needed to transform
      // minPixelValue: 4, // woundn't transform when the value equal or less than 4px
      exclude: /node_modules/i,
    }),
  ],
};
