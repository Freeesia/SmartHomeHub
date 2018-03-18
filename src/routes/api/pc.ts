'use strict';

import * as express from 'express';
import * as url from 'url';
import * as bluebird from 'bluebird';
import * as wol from 'wol';
const wolAsync = bluebird.promisifyAll(wol);

let pc: {};

const router = express.Router();

router.post('/:pc/on', async (req, res, next) => {
  try {
    const mac = this.pc[req.params.pc];
    if (!mac) return res.status(403).send("Unknown PC");
    await wolAsync.wakeAsync(mac);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

export function init(config: {}) {
  this.pc = config;
}

export default router;