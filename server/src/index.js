require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });

const express = require("express");
const path = require("path");
const expressConfig = require("./config/expressConfig");

const router = require("./router");
const botDetector = require("./middlewares/botDetector");

const app = express();

// Serve OG images for social media bots
app.use('/images', express.static(path.join(__dirname, '../public/images')));

app.use(botDetector);

expressConfig(app);

app.use(router);

module.exports = app;