require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });

const express = require("express");
const expressConfig = require("./config/expressConfig");

const router = require("./router");
const botDetector = require("./middlewares/botDetector");
const app = express();

expressConfig(app);
app.use(botDetector);
app.use(router);
module.exports = app;