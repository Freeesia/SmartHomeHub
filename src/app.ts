'use strict';

import * as express from 'express';
import * as path from 'path';
import * as favicon from 'serve-favicon';
import * as logger from 'morgan';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const app: express.Express = express();

import * as webpack from 'webpack';
import * as webpackDevMiddleware from 'webpack-dev-middleware';
import wpConfig from './webpack.config';
if (process.env.NODE_ENV === 'development') {
  wpConfig.mode = 'development';
  const compiler = webpack(wpConfig);
  app.use(webpackDevMiddleware(compiler, {
    publicPath: wpConfig.output.publicPath
  }));
}

import * as googleHome from './routes/api/google_home';
import * as ps4 from './routes/api/ps4';
import * as pc from './routes/api/pc';
googleHome.init(config.googlehome);
ps4.init(config.ps4);
pc.init(config.pc);

//uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname,'public','favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/googlehome', googleHome.default);
app.use('/api/ps4', ps4.default);
app.use('/api/pc', pc.default);

//catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err['status'] = 404;
  next(err);
});

//error handlers

//development error handler
//will print stacktrace
if (process.env.NODE_ENV === 'development') {
  app.use((err: Error, req, res, next) => {
    res.status(err['status'] || 500);
    res.send(err);
  });
}

//production error handler
// no stacktrace leaked to user
app.use((err: Error, req, res, next) => {
  res.status(err['status'] || 500);
  res.send({
    title: 'error',
    message: err.message,
    error: {}
  });
});

export default app;
