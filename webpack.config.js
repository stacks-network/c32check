module.exports = env => {
  env = env || {};
  const opts = {
    entry: './src/index.ts',
    node: false,
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.ts?$/,
          exclude: /node_modules/,
          use: { loader: 'ts-loader' },
        },
      ],
    },
    resolve: { extensions: ['.ts', '.js'] },
    output: {
      filename: 'c32check.js',
      path: require('path').resolve(__dirname, 'dist'),
      library: 'c32check',
      libraryTarget: 'umd',
      globalObject: 'this'
    },
    plugins: [],
  };

  if (process.env.ANALYZE || env.ANALYZE) {
    const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
    opts.plugins.push(new BundleAnalyzerPlugin());
  }

  return opts;
};
