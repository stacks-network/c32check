module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        exclude: /node_modules/,
        use: { loader: 'ts-loader' }
      },
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: { presets: ['@babel/preset-env'] }
        }
      }
    ]
  },
  resolve: { extensions: ['.ts', '.js'] },
  output: {
    filename: 'c32check.js',
    path: require('path').resolve(__dirname, 'dist'),
    library: 'c32check',
    libraryTarget: 'umd',
    globalObject: 'this'
  }
}
