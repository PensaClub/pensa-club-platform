const router = require('express').Router();

const errorHandler = require('./middlewares/errorHandler');
const authController = require('./controllers/authController');
const userController = require('./controllers/userController');
const adsController = require('./controllers/adsController');
const suggestUserController = require('./controllers/suggestUserController');
const adminController = require('./controllers/adminController');
const subscriberController = require('./controllers/subscribersController');
const articleController = require('./controllers/articleController');
const initiativeController = require('./controllers/initiativeController');
const commentController = require('./controllers/commentController');
const publicationController = require('./controllers/publicationController');
const projectController = require('./controllers/projectController');
const applicationController = require('./controllers/applicationController');

router.use('/auth', authController);
router.use('/user', userController);
router.use('/ads', adsController);
router.use('/suggest', suggestUserController);
router.use('/admin', adminController);
router.use('/subscribe', subscriberController);
router.use('/articles', articleController);
router.use('/initiatives', initiativeController);
router.use('/comments', commentController);
router.use('/projects', projectController);
router.use('/publications', publicationController);
router.use('/applications', applicationController);

router.use((err, req, res, next) => {
    errorHandler(err, req, res, err.statusCode || 500);
});

module.exports = router;
