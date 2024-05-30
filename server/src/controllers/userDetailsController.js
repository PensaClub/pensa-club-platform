const userDetailsController = require("express").Router();

const CustomError = require("../utils/customError");
const { user_details } = require("../sequelize/models/index");
const geoCoder = require("../utils/geoCoder");
const isAuth = require("../middlewares/isAuth.js");

//district, firstName, lastName to be added
const notRequiredFields = ["block", "streetNumber"];

const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]{5,15}$/;
const phoneRegex = /^(?:\+\d{7,15}|\d{10})$/;

userDetailsController.post("/details", isAuth, async (req, res, next) => {
  let errors = {};
  try {
    const { region, municipality, settlement, district, block, street, streetNumber, phoneNumber, username, work, hobby, interest } = req.body;

    Object.entries(req.body).forEach(([fieldName, value]) => {
      if (value === "" && !notRequiredFields.includes(fieldName)) {
        let error = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
        errors[fieldName] = `${error} is required.`;
      }
    });

    if (Object.keys(errors).length > 0) {
      throw new CustomError({ message: "Validation errors", statusCode: 400, details: errors });
    }

    if (phoneNumber && !phoneRegex.test(phoneNumber)) {
      errors.phoneNumber = "Invalid phone number.";
    }

    if (!usernameRegex.test(username)) {
      errors.username = "Username must start with a letter, be 6-16 characters long, and contain only letters, numbers, or underscores.";
    }

    const location = await geoCoder({ streetNumber, street, district, settlement, municipality, region });

    const data = {
      phone_number: phoneNumber,
      username,
      region,
      municipality,
      settlement,
      work,
      hobby,
      interest,
      district,
      block,
      street,
      street_number: streetNumber,
      location,
      user_accounts_id: req.user.userId,
    };

    const details = await user_details.create(data);

    res.status(200).send({ message: "Details successfully updated!", details });
  } catch (err) {
    next(err);
  }
});

module.exports = userDetailsController;
