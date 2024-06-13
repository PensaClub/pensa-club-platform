const userDetailsController = require("express").Router();

const { user_details, user_account } = require("../sequelize/models/index");
const geoCoder = require("../utils/geoCoder");
const ageCalculate = require("../utils/ageCalculate");
const userDetailsValidator = require("../utils/userDetailsValidator");
const isAuth = require("../middlewares/isAuth.js");
const { where } = require("sequelize");

userDetailsController.post("/details", isAuth, async (req, res, next) => {
  try {
    userDetailsValidator(req.body, req.path);
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
      skills,
      interestOptions,
      firstName,
      lastName,
      gender,
      birthDate,
    } = req.body;

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

    await user_account.update({ finished: true }, { where: { id: req.user.userId } });

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
          attributes: ["phone_number", "username", "first_name", "last_name", "work_options", "skills", "interest_options", "location"],
        },
      ],
    });
    res.status(200).json({ message: "Users data retrieved successfully.", accounts });
  } catch (err) {
    next(err);
  }
});

userDetailsController.patch("/update-details", isAuth, async (req, res, next) => {
  try {
    userDetailsValidator(req.body, req.path);

    const data = {};

    const fieldMapping = {
      phoneNumber: "phone_number",
      username: "username",
      region: "region",
      municipality: "municipality",
      settlement: "settlement",
      workOptions: "work_options",
      skills: "skills",
      interestOptions: "interest_options",
      district: "district",
      block: "block",
      street: "street",
      streetNumber: "street_number",
      location: "location",
      firstName: "first_name",
      lastName: "last_name",
      gender: "gender",
      birthDate: "birth_date",
    };

    Object.keys(req.body).forEach((key) => {
      if (fieldMapping[key]) {
        data[fieldMapping[key]] = req.body[key];
      }
    });

    const [_, details] = await user_details.update(data, { where: { user_accounts_id: req.user.userId }, returning: true, plain: true });

    res.status(200).json({ message: "Details edited successfully!", details });
  } catch (err) {
    next(err);
  }
});

userDetailsController.get("/single-user", isAuth, async (req, res, next) => {
  try {
    const user = await user_account.findOne({
      where: { id: req.user.userId },
      attributes: ["id", "email", ["finished", "enabled"]],
      include: [
        {
          model: user_details,
          as: "details",
          attributes: ["phone_number", "username", "first_name", "last_name", "work_options", "skills", "interest_options", "location"],
        },
      ],
    });
    res.status(200).json({ message: "User data retrieved successfully.", user });
  } catch (err) {
    next(err);
  }
});

module.exports = userDetailsController;
