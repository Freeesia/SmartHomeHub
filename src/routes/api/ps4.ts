'use strict';

import * as express from 'express';
import * as url from 'url';
import { Device } from 'ps4-waker';
const router = express.Router();
let ps4: Device;

router.post('/on', async (req, res, next) => {
  await this.ps4.turnOn();
  res.sendStatus(200);
});

router.post('/off', async (req, res, next) => {
  await this.ps4.turnOff();
  res.sendStatus(200);
});

router.post('/:title', async (req, res, next) => {
  if (!this.ps4.isConnected()) {
    await this.ps4.turnOn();
  }
  switch (req.params.title) {
    case 'youtube':
      await this.ps4.startTitle('CUSA01065');
      break;
  
    default:
      res.status(403).send('Unknown Title');
      return;
  }
  res.sendStatus(200);
});

export function init(config: any) {
  this.ps4 = new Device(config);
}

export default router;