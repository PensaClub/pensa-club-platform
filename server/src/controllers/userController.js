const userController = require("express").Router();

userController.get("/test", async (req, res, next) => {
  res.status(200).json({ message: "test" });
});

module.exports = userController;
