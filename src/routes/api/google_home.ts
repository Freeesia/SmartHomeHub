'use strict';

import GoogleHomeNotifier from '../../modules/google_home_notifier';
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
    res.sendStatus(400);
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

export function init(baseUrl: string) {
  notifier = new GoogleHomeNotifier({
    baseUrl: baseUrl,
    googleHomeUrl: process.env.googleHomeUrl,
    voiceKey: process.env.voiceKey,
  })
}

export default router;