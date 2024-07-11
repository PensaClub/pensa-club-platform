const suggestUserController = require('express').Router();

const { user_suggest } = require('../sequelize/models/index');
const isAuth = require('../middlewares/isAuth.js');
const rbac = require('../middlewares/rbac');
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

suggestUserController.get('/resolved',rbac.checkPermission('approve_record'), isAuth, async (req, res, next) => {
  try {
    const userData = await user_suggest.findAll({
      where: { resolved: true },
    });

    if (userData.length === 0) {
      return res.status(404).json({ message: 'No resolved suggestions found' });
    }

    res.status(200).json({ message: 'Suggested Users data retrieved successfully.', userData });
  } catch (err) {
    next(err);
  }
});
suggestUserController.get('/unresolved',rbac.checkPermission('approve_record'), isAuth, async (req, res, next) => {
  try {
    const userData = await user_suggest.findAll({
      where: { resolved: false },
    });
    
    if (userData.length === 0) {
      return res.status(404).json({ message: 'No unresolved suggestions found' });
    }

    res.status(200).json({ message: 'Suggested Users data retrieved successfully.', userData });
  } catch (err) {
    next(err);
  }
});

suggestUserController.post('/delete', rbac.checkPermission('delete_record'), isAuth, async (req, res, next) => {
  try {
    const { id } = req.body;
    const entry = await user_suggest.findOne({ where: { id } });
    if (!entry) {
      res.status(400).json({ message: "ID doesn't match an existing entry." });    }
    
      await entry.destroy();

      eventEmitter.emit('entryDeleted', entry);

      res.status(200).json({ message: 'Suggestion has been deleted successfully.' });
    
  } catch (err) {
    next(err);
  }
});

module.exports = suggestUserController;
