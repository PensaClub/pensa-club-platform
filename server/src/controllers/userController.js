const userController = require("express").Router();

const bcrypt = require("bcrypt");
const { tokenCreator } = require("../utils/jwt");
const CustomError = require("../utils/customError");

const userModel = undefined;

const phoneRegex = /^(\+359|0)(87|88|89)\d{7}$/;

userController.post("/register", async (req, res, next) => {
  let errors = {};
  try {
    const { phoneNumber, password, repeatPassword } = req.body;

    Object.entries(req.body).forEach(([fieldName, value]) => {
      if (value === "") {
        let error = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
        errors[fieldName] = `${error} is required.`;
      }
    });

    if (errors.length > 0) {
      throw new CustomError({ message: "Validation errors", statusCode: 400, details: errors });
    }

    if (!phoneRegex.test(phoneNumber)) {
      errors.phoneNumber = "Invalid phone number.";
    }

    if (password.length < 4) {
      errors.password = "Password must be at least 4 characters.";
    }

    if (password !== repeatPassword) {
      errors.repeatPassword = "Passwords do not match.";
    }

    if (errors.length > 0) {
      throw new CustomError({ message: "Validation errors", statusCode: 400, details: errors });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = userController;
