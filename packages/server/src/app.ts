import "reflect-metadata";
import {
  useExpressServer,
  useContainer,
  Action,
  NotFoundError
} from "routing-controllers";
import express from "express";
import path from "path";
import logger from "morgan";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import history from "connect-history-api-fallback";
import compression from "compression";
import fs from "fs";
import { Container } from "typedi";
import ConfigService from "./modules/configService";
import PcController from "./routes/api/pc";
import GoogleHomeController from "./routes/api/googleHome";
import Ps4Controller from "./routes/api/ps4";
import passport from "passport";
import LdapStrategy from "passport-ldapauth";
import {
  Strategy as JwtStrategy,
  StrategyOptions as JwtOptions,
  ExtractJwt
} from "passport-jwt";
import UserController from "./routes/api/user";
import session from "express-session";

const config = JSON.parse(fs.readFileSync("config.json", "utf8"));
Container.set(ConfigService, new ConfigService(config));
useContainer(Container);
const app = express();

//uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname,'public','favicon.ico')));
app.use(
  session({
    secret: config.sessionSecret,
    rolling: true,
    resave: false,
    saveUninitialized: false
  })
);
app.use(compression());
app.use(history());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(passport.initialize());
app.use(passport.session());

useExpressServer(app, {
  routePrefix: "/api",
  controllers: [
    PcController,
    GoogleHomeController,
    Ps4Controller,
    UserController
  ],
  authorizationChecker: (action: Action) =>
    new Promise<boolean>((resolve) => {
      if (action.request.user) {
        return resolve(true);
      }
      passport.authenticate("jwt", { session: false }, (err, user) => {
        if (err || !user) {
          return resolve(false);
        } else {
          action.request.user = user;
          return resolve(true);
        }
      })(action.request, action.response, action.next);
    }),
  currentUserChecker: (action: Action) => action.request.user
});

passport.use(
  new LdapStrategy({
    server: config.ldap
  })
);

let jwtConfig = <JwtOptions>config.jwt;
jwtConfig.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();

passport.use(
  new JwtStrategy(
    jwtConfig,
    (payload: any, done: (error: any, user?: any, info?: any) => void) => {
      delete payload.iat;
      delete payload.nbf;
      delete payload.exp;
      delete payload.aud;
      delete payload.iss;
      done(null, payload);
    }
  )
);

const users: { [uid: string]: any } = {};

passport.serializeUser((user: any, done: (err: any, id?: any) => void) => {
  users[user.uid] = user;
  done(null, user.uid);
});

passport.deserializeUser((id: any, done: (err: any, user?: any) => void) => {
  const user = users[id];
  done(user ? null : new NotFoundError(id), user);
});

export default app;
