import { Client as minio, ClientOptions } from 'minio';
import { Client as castv2, DefaultMediaReceiver } from 'castv2-client';
import * as googletts from 'google-tts-api';
import * as voicetext from 'voicetext';
const SPEAKER = voicetext.prototype.SPEAKER;
const EMOTION = voicetext.prototype.EMOTION;
const EMOTION_LEVEL = voicetext.prototype.EMOTION_LEVEL;

export default class GoogleHomeNotifier {

  private options: GoogleHomeNotifierOptions;

  constructor(options: GoogleHomeNotifierOptions) {
    this.options = options;
  }

  private async speak(text: string) {
    return new Promise((resolve, reject) => {
      const voice = new voicetext(this.options.voiceKey);
      voice
        .speaker(SPEAKER.HIKARI)
        .emotion(EMOTION.HAPPINESS)
        .emotion_level(EMOTION_LEVEL.HIGH)
        .speak(text, (err, buf) => {
          if (err) return reject(err);
          resolve(buf);
        });
    });
  }

  private async putObject(buf): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const op = this.options.minioOptions;
      const client = new minio(op);
      client.putObject('google-home', 'tmp.wav', buf, (err, res) => {
        if (err) return reject(err);
        // TODO : 合ってる？
        const proto = op.secure ? 'https' : 'http'
        resolve(`${proto}://${op.endPoint}:${op.port}/google-home/tmp.wav`);
      });
    });
  }

  public async notify(text: string, language: string) {
    const url = await googletts(text, language, 1, 1000);
    return await this.onDeviceUp(this.options.googleHomeUrl, url);
  };

  public async play(text: string) {
    const buf = await this.speak(text);
    const url = await this.putObject(buf);
    return await this.onDeviceUp(this.options.googleHomeUrl, url);
  };

  private async onDeviceUp(host: string, url: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      var client = new castv2();
      client.connect(host, () => {
        client.launch(DefaultMediaReceiver, (err, player) => {
          var media = {
            contentId: url,
            contentType: 'audio/mp3',
            streamType: 'BUFFERED' // or LIVE
          };
          player.load(media, { autoplay: true }, (err, status) => {
            client.close();
            resolve('Device notified');
          });
        });
      });
      (<any>client).on('error', (err) => {
        client.close();
        reject(err);
      });
    });
  }
}

export interface GoogleHomeNotifierOptions {
  voiceKey: string;
  googleHomeUrl: string;
  minioOptions: ClientOptions;
}