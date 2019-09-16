import { Device, Socket } from "ps4-waker";
import ConfigService from "../../modules/configService";
import {
  Get,
  JsonController,
  Post,
  Param,
  NotFoundError,
  OnUndefined
} from "routing-controllers";
import Axios from "axios";

@JsonController("/ps4")
export default class Ps4Controller {
  private readonly ps4: Device;
  private readonly appMeta: { [id: string]: string } = {};

  constructor(configService: ConfigService) {
    this.ps4 = new Device(configService.get<any>("ps4"));
  }

  async getAppMeta(id: string): Promise<any> {
    if (this.appMeta[id]) {
      return this.appMeta[id];
    }
    const res = await Axios.get(
      `https://ps4database.io/dataApi?id=${id}_00&env=NP&method=meta`
    );
    if (res.data.error) {
      return null;
    }
    this.appMeta[id] = res.data;
    return res.data;
  }

  @Get("/")
  async getStatus(): Promise<any> {
    const status = await this.ps4.getDeviceStatus();
    delete status["type"];
    delete status["statusLine"];
    delete status["host-request-port"];
    delete status["device-discovery-protocol-version"];
    delete status["system-version"];
    delete status["address"];
    delete status["port"];
    if (status.statusCode == 200 && status["running-app-titleid"]) {
      const meta = await this.getAppMeta(status["running-app-titleid"]);
      if (meta) {
        status["running-app-meta"] = meta;
      }
    }
    return status;
  }

  @Post("/on")
  @OnUndefined(200)
  async On(): Promise<void> {
    await this.ps4.turnOn();
  }

  @Post("/off")
  @OnUndefined(200)
  async Off(): Promise<void> {
    await this.ps4.turnOff();
  }

  @Post("/key/:key")
  @OnUndefined(200)
  async SendKey(@Param("key") key: string): Promise<void> {
    if (!this.ps4.isConnected) {
      await this.ps4.turnOn();
    }
    await this.ps4.sendKeys([key]);
  }

  @Post("/:title")
  @OnUndefined(200)
  async Launch(@Param("title") title: string): Promise<void> {
    if (!this.ps4.isConnected) {
      await this.ps4.turnOn();
    }
    switch (title) {
      case "youtube":
        await this.ps4.startTitle("CUSA01065");
        break;
      default:
        throw new NotFoundError();
    }
  }

  @Post("/login/:pin")
  @OnUndefined(200)
  async Login(@Param("pin") pin: string): Promise<void> {
    const socket = <Socket>await this.ps4.openSocket();
    return new Promise<void>((res, rej) => {
      socket.login(pin, err => {
        if (err) {
          rej(err);
        } else {
          res();
        }
      });
    });
  }
}
