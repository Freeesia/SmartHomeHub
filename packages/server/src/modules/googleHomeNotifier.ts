import { Client as castv2, DefaultMediaReceiver } from "castv2-client";
import { getAudioUrl } from "google-tts-api";
import voicetext from "voicetext";
import crypto from "node:crypto";
const SPEAKER = voicetext.prototype.SPEAKER;
const EMOTION = voicetext.prototype.EMOTION;
const EMOTION_LEVEL = voicetext.prototype.EMOTION_LEVEL;

export default class GoogleHomeNotifier {
  private options: GoogleHomeNotifierOptions;
  public dic: Record<string, Buffer> = {};

  constructor(options: GoogleHomeNotifierOptions) {
    this.options = options;
  }

  private async speak(text: string): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const voice = new voicetext(this.options.voiceKey);
      voice
        .speaker(SPEAKER.HIKARI)
        .emotion(EMOTION.HAPPINESS)
        .emotion_level(EMOTION_LEVEL.HIGH)
        .speak(text, (err: unknown, buf: Buffer) => {
          if (err) return reject(err);
          resolve(buf);
        });
    });
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
