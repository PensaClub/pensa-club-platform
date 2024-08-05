const subscriberController = require('express').Router();
const isAuth = require('../middlewares/isAuth');
const { subscriber } = require('../sequelize/models/index');
const rbac = require('../middlewares/rbac');

const emailRegex =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const usernameRegex = /^[a-zA-Zа-яА-Я][a-zA-Zа-яА-Я0-9_]{2,16}$/;

subscriberController.post('/addSubscriber', async (req, res, next) => {
  try {
    const { username, email } = req.body;

    if (!username || !email) return res.status(400).json({ message: 'Username and email are required.' });
    if (!emailRegex.test(email)) return res.status(400).json({ message: 'Email format is incorrect.' });
    if (!usernameRegex.test(username))
      return res.status(400).json({
        message: 'Username must start with a letter, can only contain letters, numbers, and underscores, and must be between 3 and 16 characters long.',
      });

    const [_, created] = await subscriber.findOrCreate({ where: { email }, defaults: { username, email } });

    created === true ? res.status(201).json({ message: 'Subscriber added successfully.' }) : res.status(400).json({ message: 'Subscriber already exists.' });
  } catch (err) {
    next(err);
  }
});

subscriberController.get('/getSubscribers', isAuth, rbac.checkPermission('read_subscriptions'), async (req, res, next) => {
  try {
    const subscribers = await subscriber.findAll({
      attributes: { exclude: ['id'] },
    });

    if (!subscribers) return res.status(404).json({ message: 'No subscribers found.' });

    res.status(200).json({ message: 'Subscribers successfully retrieved.', subscribers });
  } catch (err) {
    next(err);
  }
});

module.exports = subscriberController;
