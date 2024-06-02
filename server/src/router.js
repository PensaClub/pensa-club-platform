const router = require("express").Router();

const errorHandler = require("./middlewares/errorHandler");
const userController = require("./controllers/userController");
const userDetailsController = require("./controllers/userDetailsController");

router.use("/auth", userController);
router.use("/user", userDetailsController);

router.use((err, req, res, next) => {
  errorHandler(err, req, res, err.statusCode || 500);
});

module.exports = router;
