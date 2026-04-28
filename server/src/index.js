require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });

const express = require("express");
const path = require("path");
const expressConfig = require("./config/expressConfig");

const router = require("./router");
const botDetector = require("./middlewares/botDetector");
const goneUrls = require("./middlewares/goneUrls");

const app = express();

// Serve OG images for social media bots
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// 410 Gone for permanently removed URLs — runs BEFORE bot detection so Google
// stops re-crawling them (404 keeps re-trying for months, 410 drops faster).
app.use(goneUrls);

app.use(botDetector);

expressConfig(app);

app.use(router);

module.exports = app;