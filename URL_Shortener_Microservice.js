require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dns = require("dns");
const shortId = require("shortid");
const bodyParser = require("body-parser");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const urlSchema = new mongoose.Schema({
  originalUrl: String,
  shortUrl: String,
});
let Url = mongoose.model("Url", urlSchema);

app.use("/public", express.static(`${process.cwd()}/public`));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", async (req, res) => {
  const { url } = req.body;
  const urlPattern = new RegExp(
    "^(http://www.|https://www.|http://|https://)[a-z0-9]+([-.]{1}[a-z0-9]+)*.[a-z]{2,5}(:[0-9]{1,5})?(/.*)?$"
  );

  if (!urlPattern.test(url)) {
    return res.json({ error: "invalid url" });
  }

  const parsedUrl = new URL(url);
  dns.lookup(parsedUrl.hostname, async (err) => {
    if (err) {
      return res.json({ error: "invalid url" });
    } else {
      try {
        let oneUrl = await Url.findOne({ originalUrl: url });
        if (oneUrl) {
          res.json({
            original_url: oneUrl.originalUrl,
            short_url: oneUrl.shortUrl,
          });
        } else {
          const shortUrl = shortId.generate();
          oneUrl = new Url({ originalUrl: url, shortUrl: shortUrl });
          await oneUrl.save();
          res.json({ original_url: url, short_url: shortUrl });
        }
      } catch (err) {
        res.status(500).json("Server error");
      }
    }
  });
});

app.get("/api/shorturl/:short_url", async (req, res) => {
  const { short_url } = req.params;
  try {
    const result = await Url.findOne({ shortUrl: short_url });
    if (result) {
      return res.redirect(result.originalUrl);
    } else {
      return res.status(404).json("No URL found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Server error");
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
