import { Configuration } from 'webpack';
import * as HtmlPlugin from 'html-webpack-plugin';
import * as path from 'path';

const src = path.join(__dirname, 'views');

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
        exclude: /node_modules/
      },
    ]
  },
  plugins: [
    new HtmlPlugin({ template: path.join(src, 'index.html') }),
  ],
  output: {
    filename: '[name].js',
  }
}

export default config;