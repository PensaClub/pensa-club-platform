const userDetailsController = require("express").Router();

const CustomError = require("../utils/customError");
const { user_details, user_account } = require("../sequelize/models/index");
const geoCoder = require("../utils/geoCoder");
const ageCalculate = require("../utils/ageCalculate");
const isAuth = require("../middlewares/isAuth.js");
const { where } = require("sequelize");

const notRequiredFields = ["block", "streetNumber", "firstName", "lastName", "district", "work", "gender", "birthDate"];

const usernameRegex = /^[a-zA-Zа-яА-Я][a-zA-Zа-яА-Я0-9_]{6,16}$/;
const phoneRegex = /^(?:\+\d{7,15}|\d{10})$/;
const nameRegex = /^[a-zA-Zа-яА-Я0-9_]+(-[a-zA-Zа-яА-Я0-9_]+)*$/i;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

userDetailsController.post("/details", isAuth, async (req, res, next) => {
  let errors = {};
  try {
    const {
      region,
      municipality,
      settlement,
      district,
      block,
      street,
      streetNumber,
      phoneNumber,
      username,
      workOptions,
      skills, // da e skills - hobby
      interestOptions,
      firstName,
      lastName,
      gender,
      birthDate,
    } = req.body;

    Object.entries(req.body).forEach(([fieldName, value]) => {
      if (value === "" && !notRequiredFields.includes(fieldName)) {
        let error = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
        errors[fieldName] = `${error} is required.`;
      }
    });

    ["workOptions", "skills", "interestOptions"].forEach((field) => {
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

    if (gender && (gender !== "male" || gender !== "female" || gender !== "other")) {
      errors.gender = "Gender must be 'male', 'female', or 'other'.";
    }

    if (birthDate && (!dateRegex.test(birthDate) || new Date(birthDate) > new Date() || isNaN(new Date(birthDate).getTime()))) {
      errors.birthDate = "Date format must be YYYY-MM-DD and cannot be in the future.";
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
      work_options: workOptions,
      skills,
      interest_options: interestOptions,
      district,
      block,
      street,
      street_number: streetNumber,
      location,
      first_name: firstName,
      last_name: lastName,
      gender,
      birth_date: birthDate,
      user_accounts_id: req.user.userId,
    };

    const details = await user_details.create(data);
    const { birth_date, ...restOfDetails } = details.dataValues;

    await user_account.update({ finished: true }, { where: { email: req.user.email }, returning: true, plain: true });

    const updatedDetails = { ...restOfDetails, age: ageCalculate(birth_date), enabled: true };

    res.status(200).send({ message: "Details successfully updated!", details: updatedDetails });
  } catch (err) {
    next(err);
  }
});

userDetailsController.get("/all-users", async (req, res, next) => {
  try {
    const accounts = await user_account.findAll({
      attributes: ["id", "email", ["finished", "enabled"]],
      include: [
        {
          model: user_details,
          as: "details",
          attributes: ["phone_number", "username", "first_name", "last_name", "work", "hobby", "interest", "location"],
        },
      ],
    });
    res.status(200).json({ message: "User data retrieved successfully.", accounts });
  } catch (err) {
    next(err);
  }
});

module.exports = userDetailsController;
