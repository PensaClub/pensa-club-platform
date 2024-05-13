require("dotenv").config();

const express = require("express");
const expressConfig = require("./config/expressConfig");

const router = require("./router");

const app = express();

expressConfig(app);

app.use(router);
