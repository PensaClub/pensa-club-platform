const userDetailsController = require("express").Router();

const CustomError = require("../utils/customError");
const { user_details } = require("../sequelize/models/index");
const geoCoder = require("../utils/geoCoder");

userDetailsController.post("/details", async (req, res, next) => {
  try {
    const { region, municipality, settlement, district, block, street, streetNumber } = req.body;
    const data = await geoCoder({ region, municipality, settlement, district, block, street, streetNumber });
    // console.log(data[0].lat);
    // console.log(data[0].lon);
    // console.log(data);
    res.status(200).send({ message: "random-test", data });
  } catch (err) {
    next(err);
  }
});

module.exports = userDetailsController;
