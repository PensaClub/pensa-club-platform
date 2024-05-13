const router = require("express").Router();

const userController = require("./controllers/userController");

router.use("/auth", userController);

module.exports = router;
