const express = require("express");

const { port, frontend_server } = require("./envConfig");

const cors = require("cors");
const cookieParser = require("cookie-parser");
const dataTrimmer = require("../middlewares/dataTrimmer");
const errorHandler = require("../middlewares/errorHandler");

const corsOptions = {
  origin: frontend_server,
  //   origin: function (origin, cb) {
  //     frontend_server === origin ? cb(null, true) : cb(new Error("Not allowed!"));
  //   },
  methods: "GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS",
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

module.exports = function expressConfig(app) {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(dataTrimmer);
  app.use(cors(corsOptions));
  app.use(cookieParser());
  app.use((err, req, res, next) => {
    errorHandler(err, req, res, err.statusCode || 500);
  });
  app.listen(port, () => console.log(`Server is listening on port: ${port}`));
};
