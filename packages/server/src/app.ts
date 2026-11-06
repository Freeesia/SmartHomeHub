import "reflect-metadata";
import {
  useExpressServer,
  useContainer,
  Action,
  NotFoundError
} from "routing-controllers";
import express from "express";
import path from "node:path";
import logger from "morgan";
import cookieParser from "cookie-parser";
import history from "connect-history-api-fallback";
import compression from "compression";
import fs from "node:fs";
import { Container } from "typedi";
import ConfigService from "./modules/configService";
import PcController from "./routes/api/pc";
import GoogleHomeController from "./routes/api/googleHome";
import passport from "passport";
import LdapStrategy from "passport-ldapauth";
import {
  Strategy as JwtStrategy,
  StrategyOptionsWithoutRequest as JwtOptions,
  ExtractJwt
} from "passport-jwt";
import UserController from "./routes/api/user";
import session from "express-session";
import { createOidcRouter, oidcSettingsFromEnv } from "./modules/oidc";
import AuthMethods from "./modules/authMethods";

const config = JSON.parse(fs.readFileSync("config.json", "utf8"));
Container.set(ConfigService, new ConfigService(config));
// Password (LDAP) sign-in can be turned off with LDAP_ENABLED=false; OIDC is on when OIDC_* is set.
const oidcSettings = oidcSettingsFromEnv();
const authMethods = new AuthMethods(process.env.LDAP_ENABLED !== "false" && !!config.ldap, !!oidcSettings);
Container.set(AuthMethods, authMethods);
useContainer(Container);
const app = express();

//uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname,'public','favicon.ico')));
app.use(
  session({
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 365 },
    secret: config.sessionSecret,
    rolling: true,
    resave: false,
    saveUninitialized: false
  })
);
app.use(compression());
// Keep /api (including the OIDC browser redirects) out of the SPA fallback.
app.use(history({ rewrites: [{ from: /^\/api\/.*$/, to: (context) => context.parsedUrl.path ?? "/" }] }));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(passport.initialize());
app.use(passport.session());
if (oidcSettings) {
  app.use("/api/user/oidc", createOidcRouter(oidcSettings));
}

useExpressServer(app, {
  routePrefix: "/api",
  controllers: [
    PcController,
    GoogleHomeController,
    UserController
  ],
  authorizationChecker: (action: Action) =>
    new Promise<boolean>((resolve) => {
      if (action.request.user) {
        return resolve(true);
      }
      passport.authenticate("jwt", { session: false }, (err: unknown, user: Express.User | false) => {
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

if (authMethods.password) {
  passport.use(
    new LdapStrategy({
      server: config.ldap
    })
  );
}

const jwtConfig: JwtOptions = {
  ...config.jwt,
  jwtFromRequest: ExtractJwt.fromExtractors([
    ExtractJwt.fromAuthHeaderAsBearerToken(),
    ExtractJwt.fromUrlQueryParameter("token"),
  ]),
  passReqToCallback: false,
};

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
