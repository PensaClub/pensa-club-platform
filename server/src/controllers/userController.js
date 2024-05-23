const userController = require("express").Router();

const bcrypt = require("bcrypt");
const { tokenCreator } = require("../utils/jwt");
const CustomError = require("../utils/customError");

const { where } = require("sequelize");
const { user_account } = require("../sequelize/models/index");

// const phoneRegex = /^(\+359|0)(87|88|89)\d{7}$/;
const phoneRegex = /^(?:\+\d{7,15}|\d{10})$/;

userController.post("/register", async (req, res, next) => {
  let errors = {};
  try {
    const { phoneNumber, password, rePassword } = req.body;

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

    if (!passwordRegex.test(password)) {
      errors.password = "Password must be at least 8 characters long, contain at least one letter and one number.";
    }

    if (password !== rePassword) {
      errors.rePassword = "Passwords do not match.";
    }

    if (Object.keys(errors).length > 0) {
      throw new CustomError({ message: "Validation errors", statusCode: 400, details: errors });
    }

    const userExist = await user_account.findOne({ where: { phone_number: phoneNumber } });

    if (userExist) {
      return res.status(401).json({ message: "User already exists with this phone number." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await user_account.create({ phone_number: phoneNumber, password: hashedPassword });

    const token = tokenCreator(user);

    const data = {
      userId: user.id,
      phoneNumber: user.phone_number,
    };
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(201).json({ message: "User successfully created!", data,token });
  } catch (err) {
    next(err);
  }
});

userController.post("/login", async (req, res, next) => {
  let errors = {};
  try {
    const { phoneNumber, password } = req.body;

    Object.entries(req.body).forEach(([fieldName, value]) => {
      if (value === "") {
        let error = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
        errors[fieldName] = `${error} is required.`;
      }
    });

    if (Object.keys(errors).length > 0) {
      throw new CustomError({ message: "Validation errors", statusCode: 400, details: errors });
    }

    const user = await user_account.findOne({ where: { phone_number: phoneNumber } });

    if (!user) {
      return res.status(401).json({ message: "Phone number or password are invalid" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Phone number or password are invalid" });
    }
    const data = {
      userId: user.id,
      phoneNumber: user.phone_number,
    };
    const token = tokenCreator(user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ message: "User successfully logged in!", data,token });
  } catch (err) {
    next(err);
  }
});

module.exports = userController;
