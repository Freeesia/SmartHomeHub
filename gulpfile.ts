import * as gulp from 'gulp';
import * as WebpackStream from 'webpack-stream';
import * as Webpack from 'webpack';
import * as ts from 'gulp-typescript';
import * as sourcemaps from 'gulp-sourcemaps';
import * as del from 'del';
import config from './src/webpack.config';

const tsProj = ts.createProject('./tsconfig.json');

gulp.task('clean', () => {
  return del('app/**/*');
});

gulp.task('build:client', ['clean'], () => {
  config.mode = <any>process.env.NODE_ENV;
  return WebpackStream(config, Webpack)
    .pipe(gulp.dest('./app/public'));
});

gulp.task('build:server', ['clean'], () => {
  return gulp.src('src/**/*.ts')
    .pipe(sourcemaps.init())
    .pipe(tsProj())
    .pipe(sourcemaps.write('.', { sourceRoot: 'src/' }))
    .pipe(gulp.dest('app/'));
});

gulp.task('build', ['build:client', 'build:server']);