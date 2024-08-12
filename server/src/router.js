const router = require('express').Router();

const errorHandler = require('./middlewares/errorHandler');
const userController = require('./controllers/userController');
const userDetailsController = require('./controllers/userDetailsController');
const adsController = require('./controllers/adsController');
const suggestUserController = require('./controllers/suggestUserController');
const adminController = require('./controllers/adminController');
const subscriberController = require('./controllers/subscribersController');
const authController = require('./controllers/authController');

router.use('/auth', userController);
router.use('/user', userDetailsController);
router.use('/ads', adsController);
router.use('/suggest', suggestUserController);
router.use('/admin', adminController);
router.use('/subscribe', subscriberController);
router.use('/token', authController);

router.use((err, req, res, next) => {
  errorHandler(err, req, res, err.statusCode || 500);
});

module.exports = router;
