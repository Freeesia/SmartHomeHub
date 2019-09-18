import "reflect-metadata";
import { useExpressServer, useContainer } from "routing-controllers";
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

const config = JSON.parse(fs.readFileSync("config.json", "utf8"));
Container.set(ConfigService, new ConfigService(config));
useContainer(Container);
const app = express();
useExpressServer(app, {
  routePrefix: "/api",
  controllers: [PcController, GoogleHomeController, Ps4Controller]
});

//uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname,'public','favicon.ico')));
app.use(compression());
app.use(history());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

export default app;
