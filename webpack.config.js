const path = require('path');

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';

module.exports = {
  mode: mode,

  // Don't actually need entry and output
  // entry: './src/index.js',
  // output: {
  //   filename: 'bundle.js',
  //   path: path.resolve(__dirname, 'public')
  // },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          //  without additional settings, this will reference a .babelrc
          loader: 'babel-loader'
        }
      }
    ]
  },

  devtool: 'source-map',

  devServer: {
    contentBase: './dist'  // Can also be pointed to ./dist
  }
}