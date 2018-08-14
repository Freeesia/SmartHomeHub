import { Configuration } from 'webpack';
import * as HtmlPlugin from 'html-webpack-plugin';
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';
import * as LiveReloadPlugin from 'webpack-livereload-plugin';
import * as path from 'path';

const src = path.join(__dirname, '..', 'client');
const dst = path.join(__dirname, '..', 'app', 'public');

const config: Configuration = {
  context: src,
  entry: {
    'bundle': path.join(src, 'boot-app.ts'),
  },
  resolve: {
    extensions: ['.ts'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
      },
      { test: /\.html/, loader: 'html-loader?minimize=false' },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
        ]
      }
    ]
  },
  devtool: 'source-map',
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new LiveReloadPlugin({ appendScriptTag: true }),
    new HtmlPlugin({ template: path.join(src, 'index.html') }),
  ],
  output: {
    filename: '[name].js',
    path: dst,
    publicPath: '/',
  }
}

export default config;