const userController = require("express").Router();

const bcrypt = require("bcrypt");
const { tokenCreator } = require("../utils/jwt");
const CustomError = require("../utils/customError");

const { where } = require("sequelize");
const { user_account } = require("../sequelize/models/index");

const isAuth = require("../middlewares/isAuth");

const emailRegex =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//Example - john.doe@example.com

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

userController.post("/register", async (req, res, next) => {
  let errors = {};
  try {
    const { email, password, rePassword } = req.body;

    Object.entries(req.body).forEach(([fieldName, value]) => {
      if (value === "") {
        let error = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
        errors[fieldName] = `${error} is required.`;
      }
    });

    if (Object.keys(errors).length > 0) {
      throw new CustomError({ message: "Validation errors", statusCode: 400, details: errors });
    }

    if (!emailRegex.test(email)) {
      errors.email = "Invalid email.";
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

    const userExist = await user_account.findOne({ where: { email } });

    if (userExist) {
      return res.status(401).json({ message: "User already exists with this email." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await user_account.create({ email, password: hashedPassword });

    const token = tokenCreator(user);

    const data = {
      userId: user.id,
      email: user.email,
    };
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(201).json({ message: "User successfully created!", data, token });
  } catch (err) {
    next(err);
  }
});

userController.post("/login", async (req, res, next) => {
  let errors = {};
  try {
    const { email, password } = req.body;
    Object.entries(req.body).forEach(([fieldName, value]) => {
      if (value === "") {
        let error = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
        errors[fieldName] = `${error} is required.`;
      }
    });

    if (Object.keys(errors).length > 0) {
      throw new CustomError({ message: "Validation errors", statusCode: 400, details: errors });
    }

    const user = await user_account.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Email or password are invalid." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Email or password are invalid." });
    }
    const data = {
      userId: user.id,
      email: user.email,
    };
    const token = tokenCreator(user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ message: "User successfully logged in!", data, token });
  } catch (err) {
    next(err);
  }
});

userController.post("/logout", isAuth, async (req, res, next) => {
  try {
    if (req.user) {
      res.status(200).json({ message: "Logout successful." });
    } else {
      throw new CustomError({ message: "Invalid or missing token!", statusCode: 401 });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = userController;
