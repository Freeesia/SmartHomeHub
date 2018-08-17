import { Configuration, EnvironmentPlugin } from 'webpack';
import * as HtmlPlugin from 'html-webpack-plugin';
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';
import * as LiveReloadPlugin from 'webpack-livereload-plugin';
import { GenerateSW } from 'workbox-webpack-plugin';
import * as ManifestPwaPlugin from 'webpack-pwa-manifest';
import * as path from 'path';

const src = path.join(__dirname, '..', 'client');
const dst = path.join(__dirname, '..', 'app', 'public');

const isDev = process.env.NODE_ENV === 'development';
console.debug(`dev : ${isDev}`);

const config: Configuration = {
  context: src,
  entry: {
    'bundle': path.join(src, 'boot-app.ts'),
  },
  resolve: {
    extensions: ['.ts', '.js'],
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
      },
      {
        test: /\.(woff2?|eot|ttf|otf|svg)(\?.*)?$/,
        loader: 'file-loader',
        options: {
          name: 'assets/[name].[hash:7].[ext]',
        }
      }
    ]
  },
  devtool: isDev ? 'source-map' : false,
  plugins: [
    new EnvironmentPlugin([
      'NODE_ENV',
    ]),
    new MiniCssExtractPlugin({
      filename: '[name].[hash:7].css',
    }),
    new HtmlPlugin({
      template: path.join(src, 'index.html'),
      inject: true
    }),
    new ManifestPwaPlugin({
      name: 'Smart Home Hub',
      short_name: 'SmartHomeHub',
      theme_color: '#604f8e',
      background_color: '#604f8e',
      orientation: 'natural',
      display: 'fullscreen',
      icons: [
        {
          src: path.join(src, 'assets/SHH.png'),
          destination: 'assets',
          sizes: [96, 128, 192, 256, 384, 512]
        }
      ],
      inject: true,
    }),
  ].concat(
    isDev ? [
      new LiveReloadPlugin({ appendScriptTag: true }),
    ] : [
        new GenerateSW({
          importWorkboxFrom: 'local',
          skipWaiting: true,
          clientsClaim: true,
        }),
      ]
  ),
  output: {
    filename: '[name].[hash:7].js',
    path: dst,
    publicPath: '/',
  }
}
export default config;