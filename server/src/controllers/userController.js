const userController = require("express").Router();

const bcrypt = require("bcrypt");
const { tokenCreator } = require("../utils/jwt");
const CustomError = require("../utils/customError");

const userModel = require("../sequelize/models/user_account");

// const phoneRegex = /^(\+359|0)(87|88|89)\d{7}$/;
const phoneRegex = /^(\+?\d{1,3})?\s*\d{9}$/;

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

    if (Object.keys(errors).length > 0) {
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

    if (Object.keys(errors).length > 0) {
      throw new CustomError({ message: "Validation errors", statusCode: 400, details: errors });
    }

    const userExist = await userModel.findOne({ where: { phoneNumber } });

    if (userExist) {
      return res.status(401).json({ message: "User already exists with this phone number." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({ phoneNumber, password: hashedPassword });

    const token = tokenCreator(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(201).json({ message: "User successfully created!", data: user });
  } catch (err) {
    next(err);
  }
});

module.exports = userController;
