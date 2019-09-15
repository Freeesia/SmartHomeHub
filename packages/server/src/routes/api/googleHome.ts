import "reflect-metadata";
import ConfigService from "../../modules/configService";
import GoogleHomeNotifier, {
  GoogleHomeNotifierOptions
} from "../../modules/googleHomeNotifier";
import url from "url";
import {
  Post,
  BodyParam,
  JsonController,
  Param,
  Get
} from "routing-controllers";

@JsonController("/googlehome")
export default class GoogleHomeController {
  private notifier: GoogleHomeNotifier;

  constructor(configService: ConfigService) {
    const config = configService.get<GoogleHomeNotifierOptions>("googlehome");
    config.baseUrl = url.resolve("http://" + config.baseUrl, "api/googlehome/");
    this.notifier = new GoogleHomeNotifier(config);
  }

  @Post("/")
  Play(@BodyParam("text") text: string) {
    return this.notifier.play(text);
  }

  @Post("/twitter")
  ToTwitter(@BodyParam("user") user: string, @BodyParam("text") text: string) {
    if (user === "FreesiaDevelop") {
      return;
    }
    const re = /^@.*?\s/;
    return this.notifier.play(`${user}が\n${text.replace(re, "")}\nだって`);
  }

  @Get("/:md5")
  GetMd5(@Param("md5") md5: string) {
    return this.notifier.pop(md5);
  }

  @Post("/notify")
  Notify(@BodyParam("text") text: string) {
    return this.notifier.notify(text, "ja");
  }
}
