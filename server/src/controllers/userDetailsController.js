const userDetailsController = require("express").Router();

const CustomError = require("../utils/customError");
const { user_details } = require("../sequelize/models/index");
const geoCoder = require("../utils/geoCoder");

userDetailsController.post("/details", async (req, res, next) => {
  let errors = {};
  try {
    const { region, municipality, settlement, district, block, street, streetNumber } = req.body;

    Object.entries(req.body).forEach(([fieldName, value]) => {
      if (value === "" && fieldName !== "block" && fieldName !== "district") {
        let error = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
        errors[fieldName] = `${error} is required.`;
      }
    });

    if (Object.keys(errors).length > 0) {
      throw new CustomError({ message: "Validation errors", statusCode: 400, details: errors });
    }

    const data = await geoCoder({ streetNumber, street, district, settlement, municipality, region });
    // console.log(data[0].lat);
    // console.log(data[0].lon);
    // console.log(data);
    res.status(200).send({ message: "random-test", data });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

module.exports = userDetailsController;
