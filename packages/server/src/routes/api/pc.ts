import "reflect-metadata";
import { JsonController, Param, Get, Post, NotFoundError } from "routing-controllers";
import wol from "wol";
import bluebird from "bluebird";
import ConfigService from "../../modules/configService";
const wolAsync = bluebird.promisifyAll(wol);

@JsonController("/pc")
export default class PcController {
  private config: PcConfig;

  constructor(configService: ConfigService) {
    this.config = configService.get<PcConfig>("pc");
  }

  @Get("/")
  getAll() {
    return Object.keys(this.config);
  }

  @Post("/:pc/on")
  async onPC(@Param("pc") pc: string) {
    const mac = this.config[pc];
    if (!mac) throw new NotFoundError("Unknown PC");
    await wolAsync.wakeAsync(mac);
  }
}

export interface PcConfig {
  [name: string]: string;
}
