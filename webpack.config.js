const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devtool: 'eval-source-map', // Add the devtool option here
  module: {
    rules: [
      // Add your module rules (e.g., for JavaScript, JSX, CSS, etc.)
    ],
  },
  // Add any additional plugins, optimizations, or other configurations as needed
};