'use strict';

import GoogleHomeNotifier, { GoogleHomeNotifierOptions } from '../../modules/google_home_notifier';
import { DialogflowApp } from 'actions-on-google';
import * as express from 'express';
import * as url from 'url';
const router = express.Router();
let notifier: GoogleHomeNotifier;

router.post('/', async (req, res, next) => {
  await notifier.play(req.body.text);
  res.sendStatus(200);
});

router.post('/twitter', async (req, res, next) => {
  if (req.body.user === "FreesiaDevelop") {
    res.sendStatus(200);
  } else {
    const re = /^@.*?\s/;
    const text = `${req.body.user}が\n${req.body.text.replace(re, '')}\nだって`
    await notifier.play(text);
    res.sendStatus(200);
  }
});

router.get('/:md5', (req, res, next) => {
  res.contentType('mp3');
  res.send(notifier.pop(req.params.md5));
});

router.post('/dialogflow', async (req, res) => {
  console.log(req.body);
  const app = new DialogflowApp({
    request: req,
    response: res
  });

  const map = new Map();
  map.set("pc", pc);
  map.set("greet", greet);

  app.handleRequest(map);
});

function pc(app: DialogflowApp) {
  const target = app.getArgument("target");
  const action = app.getArgument("pc-action");

  app.tell(`${target}を${action}します`);
}

function greet(app: DialogflowApp) {
  const greet = app.getArgument("greet").toString();
  switch (greet) {
    case "おはよう":
      app.tell("おはおう！今日も良い天気！");
      break;
    case "おやすみ":
      app.tell("おやすみなさい。明日もいい日でありますように。");
      break;
    case "ただいま":
      app.tell("おかえりなさい。今日も一日お疲れ様。");
      break;
    case "いってきます":
      app.tell("いってらっしゃーい。今日も一日、頑張って！");
      break;
    default:
      app.ask("え？なに？");
      break;
  }
}

router.post('/notify', async (req, res, next) => {
  await notifier.notify(req.body.text, 'ja');
  res.sendStatus(200);
});

export function init(config: GoogleHomeNotifierOptions) {
  config.baseUrl = url.resolve('http://' + config.baseUrl, 'api/googlehome/')
  notifier = new GoogleHomeNotifier(config);
}

export default router;