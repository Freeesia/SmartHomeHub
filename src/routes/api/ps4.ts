"use strict";

import * as express from "express";
import * as url from "url";
import { Device, Socket } from "ps4-waker";
import * as bluebird from "bluebird";
import Axios from "axios";

const router = express.Router();
const login = bluebird.promisify<any, Device, number>(
  async (ps4, pinCode, callback) => {
    const socket = <Socket>await ps4.openSocket();
    socket.login(pinCode, callback);
  }
);

let ps4: Device; // TODO: いらない？
const appMetaDic = {};

async function getAppMeta(id: string): Promise<object> {
  if (appMetaDic[id]) {
    return appMetaDic[id];
  }
  const res = await Axios.get(
    `https://ps4database.io/dataApi?id=${id}_00&env=NP&method=meta`
  );
  if (res.data.error) {
    console.log(res.data);
    return null;
  }
  appMetaDic[id] = res.data;
  return res.data;
}

router.get("/", async (req, res, next) => {
  try {
    const status = await this.ps4.getDeviceStatus();
    delete status["type"];
    delete status["statusLine"];
    delete status["host-request-port"];
    delete status["device-discovery-protocol-version"];
    delete status["system-version"];
    delete status["address"];
    delete status["port"];
    if (status.statusCode == 200 && status["running-app-titleid"]) {
      const meta = await getAppMeta(status["running-app-titleid"]);
      if (meta) {
        status["running-app-meta"] = meta;
      }
    }
    res.json(status);
  } catch (error) {
    next(error);
  }
});

router.post("/on", async (req, res, next) => {
  try {
    await this.ps4.turnOn();
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

router.post("/off", async (req, res, next) => {
  try {
    await this.ps4.turnOff();
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

router.post("/key/:key", async (req, res, next) => {
  try {
    if (!this.ps4.isConnected) {
      await this.ps4.turnOn();
    }
    await this.ps4.sendKeys([req.params["key"]]);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

router.post("/:title", async (req, res, next) => {
  try {
    if (!this.ps4.isConnected) {
      await this.ps4.turnOn();
    }
    switch (req.params["title"]) {
      case "youtube":
        await this.ps4.startTitle("CUSA01065");
        break;

      default:
        res.status(403).send("Unknown Title");
        return;
    }
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

router.post("/login/:pin", async (req, res, next) => {
  try {
    await login(this.ps4, req.params["pin"]);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

router.use((err, req, res, next) => {
  if (!err) return next();
  if (err.status) {
    err.ps4Status = err.status;
    delete err.status;
  }
  next(err);
});

export function init(config: any) {
  this.ps4 = new Device(config);
}

export default router;
