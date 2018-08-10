import * as gulp from 'gulp';
import * as WebpackStream from 'webpack-stream';
import * as Webpack from 'webpack';
import config from './webpack.config';

gulp.task('build:dev', () => {
  config.mode = 'development';
  return WebpackStream(config, Webpack)
    .pipe(gulp.dest('./app/views'));
});

gulp.task('build:back', () => {

});