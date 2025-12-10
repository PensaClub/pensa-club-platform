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
const storyController = require('./controllers/storyController');
const clubController = require('./controllers/clubController');
const academyController = require('./controllers/academyController');
const reviewsController = require('./controllers/reviewsController');
const userNotificationsController = require('./controllers/userNotificationsController'); 
const mentorDashboardController = require('./controllers/mentorDashboardController');
const coursesController = require('./controllers/coursesController');
const lecturesController = require('./controllers/lecturesController');
const seminarsController = require('./controllers/seminarsController');
const academyEnrollmentController = require('./controllers/academyEnrollmentController');
const academyTestsController = require('./controllers/academyTestsController');
const certificatesController = require('./controllers/certificatesController');
const academyMaterialsController = require('./controllers/academyMaterialsController');
const academyMyController = require('./controllers/academyMyController');

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
router.use('/stories', storyController);
router.use('/clubs', clubController);
router.use('/academy', academyController); 
router.use('/reviews', reviewsController);
router.use('/user-notifications', userNotificationsController); 
router.use('/mentors/dashboard', mentorDashboardController);

// Academy routes
router.use('/academy/courses', coursesController);
router.use('/academy/lectures', lecturesController);
router.use('/academy/seminars', seminarsController);
router.use('/academy/enrollment', academyEnrollmentController);
router.use('/academy/tests', academyTestsController);
router.use('/academy/certificates', certificatesController);
router.use('/academy/materials', academyMaterialsController);
router.use('/academy/my', academyMyController);

router.use((err, req, res, next) => {
    errorHandler(err, req, res, err.statusCode || 500);
});

module.exports = router;