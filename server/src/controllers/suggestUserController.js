const suggestUserController = require('express').Router();

const { user_suggest } = require('../sequelize/models/index');
const { where } = require('sequelize');
const fieldSwap = require('../utils/fieldSwap.js');
const eventEmitter = require('../utils/eventEmitter.js');

suggestUserController.post('/', async (req, res, next) => {
  try {
    const { name, phoneNumber, message } = req.body;

    const data = {
      name,
      phone_number: phoneNumber,
      message,
    };

    const details = await user_suggest.create(data);

    eventEmitter.emit('userSuggested');

    res
      .status(200)
      .send({
        message: 'User successfully suggested!',
        data: { details },
      });
  } catch (err) {
    next(err);
  }
});

suggestUserController.get('/', async (req, res, next) => {
  try {
    const userData = await user_suggest.findAll({
      attributes: ['name', 'phone_number', 'message', 'resolved'],
    });

    res.status(200).json({ message: 'Suggested Users data retrieved successfully.', userData });
  } catch (err) {
    next(err);
  }
});

module.exports = suggestUserController;
