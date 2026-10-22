import { Client as castv2, DefaultMediaReceiver } from "castv2-client";
import { getAudioUrl } from "google-tts-api";
import crypto from "node:crypto";

const VOICETEXT_API_URL = "https://api.voicetext.jp/v1/tts";

export default class GoogleHomeNotifier {
  private options: GoogleHomeNotifierOptions;
  public dic: Record<string, Buffer> = {};

  constructor(options: GoogleHomeNotifierOptions) {
    this.options = options;
  }

  private async speak(text: string): Promise<Buffer> {
    if (!text) {
      throw new Error("invalid argument. text: null");
    }
    const params = new URLSearchParams({
      text: text.slice(0, 200),
      speaker: "hikari",
      emotion: "happiness",
      emotion_level: "2",
      format: "wav",
      pitch: "100",
      speed: "100",
      volume: "100",
    });
    const res = await fetch(VOICETEXT_API_URL, {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(`${this.options.voiceKey}:`).toString("base64"),
      },
      body: params,
    });
    if (!res.ok) {
      throw new Error(`VoiceText API error ${res.status}: ${await res.text()}`);
    }
    return Buffer.from(await res.arrayBuffer());
  }

  public async notify(text: string, language: string): Promise<string> {
    const url = getAudioUrl(text, { lang: language });
    return await this.onDeviceUp(this.options.googleHomeUrl, url);
  }

  public async play(text: string): Promise<string> {
    const buf = await this.speak(text);
    const md5sum = crypto.createHash("md5");
    md5sum.update(buf);
    const md5 = md5sum.digest("hex");
    this.dic[md5] = buf;
    return await this.onDeviceUp(
      this.options.googleHomeUrl,
      new URL(md5, this.options.baseUrl).href
    );
  }

  public pop(md5: string): Buffer {
    const buf = this.dic[md5];
    delete this.dic[md5];
    return buf;
  }

  private async onDeviceUp(host: string, url: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const client = new castv2();
      client.connect(host, () => {
        client.launch(DefaultMediaReceiver, (err: unknown, player: any) => {
          if (err) {
            client.close();
            return reject(err);
          }
          const media = {
            contentId: url,
            contentType: "audio/mp3",
            streamType: "BUFFERED" // or LIVE
          };
          player.load(media, { autoplay: true }, (err: unknown) => {
            client.close();
            if (err) {
              return reject(err);
            }
            resolve("Device notified");
          });
        });
      });
      client.on("error", (err: unknown) => {
        client.close();
        reject(err);
      });
    });
  }
}

export interface GoogleHomeNotifierOptions {
  googleHomeUrl: string;
  baseUrl: string;
  voiceKey: string;
}
