const userDetailsController = require("express").Router();

const CustomError = require("../utils/customError");
const { user_details, user_account } = require("../sequelize/models/index");
const geoCoder = require("../utils/geoCoder");
const isAuth = require("../middlewares/isAuth.js");
const { where } = require("sequelize");

const notRequiredFields = ["block", "streetNumber", "firstName", "lastName", "district", "work"];

const usernameRegex = /^[a-zA-Zа-яА-Я][a-zA-Zа-яА-Я0-9_]{6,16}$/;
const phoneRegex = /^(?:\+\d{7,15}|\d{10})$/;
const nameRegex = /^[a-zA-Zа-яА-Я]{3,20}$/i;

userDetailsController.post("/details", isAuth, async (req, res, next) => {
  let errors = {};
  try {
    const { region, municipality, settlement, district, block, street, streetNumber, phoneNumber, username, work, hobby, interest, firstName, lastName } =
      req.body;

    Object.entries(req.body).forEach(([fieldName, value]) => {
      if (value === "" && !notRequiredFields.includes(fieldName)) {
        let error = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
        errors[fieldName] = `${error} is required.`;
      }
    });

    ["work", "hobby", "interest"].forEach((field) => {
      if (req.body[field] !== undefined && !Array.isArray(req.body[field])) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} must be an array.`;
      }
    });

    if (Object.keys(errors).length > 0) {
      throw new CustomError({ message: "Validation errors", statusCode: 400, details: errors });
    }

    if (phoneNumber && !phoneRegex.test(phoneNumber)) {
      errors.phoneNumber = "Invalid phone number.";
    }

    if (!usernameRegex.test(username)) {
      errors.username = "Username must be 6-16 chars, using letters, numbers, or underscores, and include both Cyrillic or Latin alphabets.";
    }

    if (firstName && !nameRegex.test(firstName)) {
      errors.firstName = "First name must be 3-20 chars, using letters, numbers, or underscores, and include both Cyrillic or Latin alphabets.";
    }

    if (lastName && !nameRegex.test(lastName)) {
      errors.lastName = "Last name must be 3-20 chars, using letters, numbers, or underscores, and include both Cyrillic or Latin alphabets.";
    }

    if (Object.keys(errors).length > 0) {
      throw new CustomError({ message: "Validation errors", statusCode: 400, details: errors });
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
      first_name: firstName,
      last_name: lastName,
      user_accounts_id: req.user.userId,
    };

    const details = await user_details.create(data);

    await user_account.update({ finished: true }, { where: { email: req.user.email }, returning: true, plain: true });

    const updatedDetails = { ...details.dataValues, enabled: true };
    res.status(200).send({ message: "Details successfully updated!", details: updatedDetails });
  } catch (err) {
    next(err);
  }
});

module.exports = userDetailsController;
