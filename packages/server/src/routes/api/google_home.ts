import GoogleHomeNotifier, {
  GoogleHomeNotifierOptions
} from "../../modules/google_home_notifier";
import express from "express";
import url from "url";
const router = express.Router();
let notifier: GoogleHomeNotifier;

router.post("/", async (req, res, next) => {
  await notifier.play(req.body.text);
  res.sendStatus(200);
});

router.post("/twitter", async (req, res, next) => {
  if (req.body.user === "FreesiaDevelop") {
    res.sendStatus(200);
  } else {
    const re = /^@.*?\s/;
    const text = `${req.body.user}が\n${req.body.text.replace(re, "")}\nだって`;
    await notifier.play(text);
    res.sendStatus(200);
  }
});

router.get("/:md5", (req, res, next) => {
  res.contentType("mp3");
  res.send(notifier.pop(req.params["md5"]));
});

router.post("/notify", async (req, res, next) => {
  await notifier.notify(req.body.text, "ja");
  res.sendStatus(200);
});

export function init(config: GoogleHomeNotifierOptions) {
  config.baseUrl = url.resolve("http://" + config.baseUrl, "api/googlehome/");
  notifier = new GoogleHomeNotifier(config);
}

export default router;
