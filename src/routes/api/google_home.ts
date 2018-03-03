'use strict';

import GoogleHomeNotifier from '../../modules/google_home_notifier';
import * as express from 'express';
const router = express.Router();
const notifier = new GoogleHomeNotifier({
  voiceKey: process.env.voiceKey,
  googleHomeUrl: process.env.googleHomeUrl,
  minioOptions: {
    endPoint: process.env.minioUrl,
    port: +process.env.minioPort,
    secure: process.env.minioSecure.toLowerCase() === "true",
    accessKey: process.env.accessKey,
    secretKey: process.env.secretKey,
  }
});

/* GET home page. */
router.post('/', async (req, res, next) => {
  await notifier.play(req.body.text);
  res.sendStatus(200);
});

export default router;