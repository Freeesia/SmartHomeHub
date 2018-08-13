import { Configuration } from 'webpack';
import * as HtmlPlugin from 'html-webpack-plugin';
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';
import * as path from 'path';

const src = path.join(__dirname, 'client');

const config: Configuration = {
  context: src,
  entry: {
    'bundle': path.join(src, 'boot-app.ts'),
  },
  resolve: {
    extensions: ['.ts']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new HtmlPlugin({ template: path.join(src, 'index.html') }),
  ],
  output: {
    filename: '[name].js',
  }
}

export default config;