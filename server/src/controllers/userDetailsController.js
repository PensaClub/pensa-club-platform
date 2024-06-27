const userDetailsController = require("express").Router();

const { user_details, user_account } = require("../sequelize/models/index");
const geoCoder = require("../utils/geoCoder");
const ageCalculate = require("../utils/ageCalculate");
const userDetailsValidator = require("../utils/userDetailsValidator");
const isAuth = require("../middlewares/isAuth.js");
const { where } = require("sequelize");
const { tokenCreator } = require("../utils/jwt.js");
const fieldSwap = require("../utils/fieldSwap.js");
const memoryCache = require("../middlewares/caching.js");

userDetailsController.post("/details", isAuth, async (req, res, next) => {
  if (req.user.enabled) {
    return res.status(403).send({ message: "User details have already been submitted once." });
  }

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

    const { id, user_accounts_id, ...restOfDetails } = details.dataValues;

    const user = await user_account.update({ finished: true }, { where: { id: req.user.userId }, returning: true, plain: true });

    const token = tokenCreator(user[1].dataValues);

    const updatedDetails = { ...fieldSwap(restOfDetails, "mapFromDb"), age: ageCalculate(restOfDetails.birth_date) };

    res.status(200).send({ message: "Details successfully updated!", user: { email: req.user.email, enabled: true, details: updatedDetails }, token });
  } catch (err) {
    next(err);
  }
});

userDetailsController.get("/all-users", memoryCache, async (req, res, next) => {
  try {
    const accounts = await user_account.findAll({
      attributes: ["email", ["finished", "enabled"]],
      include: [
        {
          model: user_details,
          as: "details",
          attributes: [
            ["phone_number", "phoneNumber"],
            "username",
            ["first_name", "firstName"],
            ["last_name", "lastName"],
            ["work_options", "workOptions"],
            "skills",
            ["interest_options", "interestOptions"],
            "location",
          ],
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

    const addressUpdate = ["region", "municipality", "settlement", "district", "block", "street", "streetNumber"];

    const addressData = {};

    Object.entries(req.body).forEach(([fieldName, value]) => {
      if (addressUpdate.includes(fieldName) && value !== undefined) {
        addressData[fieldName] = value;
      }
    });

    const data = fieldSwap(req.body, "mapToDb");

    let location;
    if (Object.keys(addressData).length > 0) {
      location = await geoCoder(addressData);
      data.location = location;
    }

    const [_, details] = await user_details.update(data, { where: { user_accounts_id: req.user.userId }, returning: true, plain: true });

    const updatedDetails = fieldSwap(details.dataValues, "mapFromDb");

    updatedDetails.age = ageCalculate(updatedDetails.birthDate);

    res.status(200).json({ message: "Details edited successfully!", details: updatedDetails });
  } catch (err) {
    next(err);
  }
});

userDetailsController.get("/single-user", isAuth, async (req, res, next) => {
  if (!req.user.userId) {
    return res.status(401).json({ message: "Authentication failed. User not found." });
  }

  try {
    const user = await user_account.findOne({
      where: { id: req.user.userId },
      attributes: ["email", ["finished", "enabled"]],
      include: [
        {
          model: user_details,
          as: "details",
          attributes: { exclude: ["user_accounts_id", "id"] },
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const details = fieldSwap(user.dataValues.details.dataValues, "mapFromDb");

    details.age = ageCalculate(details.birthDate);

    res.status(200).json({ message: "User data retrieved successfully.", user: { email: user.dataValues.email, enabled: user.dataValues.enabled, details } });
  } catch (err) {
    next(err);
  }
});

module.exports = userDetailsController;
