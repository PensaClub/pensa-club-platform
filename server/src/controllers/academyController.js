
const academyController = require('express').Router();
const { Op } = require('sequelize');

const { mentor_application, mentor, mentor_course, user_account, admin_notification, sequelize, user_notification,student,user_details } = require('../sequelize/models/index');
const { getFirebaseDb } = require('../firebase/firebaseAdmin');
const isAuth = require('../middlewares/isAuth.js');
const rbac = require('../middlewares/rbac.js');
const { statisticsCache } = require('../middlewares/statisticsCache');
const { mentorApplicationSchema } = require('../schemas/mentorApplication.schema');
const { initializeFirebaseAdmin } = require('../firebase/firebaseAdmin');
const {
  getMentorCombinedStats,
  getAllMentorsCombinedStats,
  updateMentorCachedStats
} = require('../services/mentorActivityService');

initializeFirebaseAdmin();
// Директно създаване на ментор (БЕЗ кандидатура)
// ===============================
academyController.post('/mentors', isAuth, rbac.checkPermission('mentor', 'create'), async (req, res, next) => {

  try {
    const {
      userId,
      name,
      email,
      phone,
      age,
      country,
      photoUrl,
      specialization,
      education,
      experience,
      motivation,
      availability,
      languages,
      viber,
      facebook,
      linkedin,
      otherContact,
      priorityContact,
      cvUrl,
      cvOriginalName,
      adminNotes,
    } = req.body;

    // Валидация
    if (!userId || !name || !email || !phone || !age) {
      return res.status(400).json({
        message: 'Missing required fields: userId, name, email, phone, age'
      });
    }

    const user = await user_account.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const existingMentor = await mentor.findOne({
      where: { userId }
    });

    if (existingMentor) {
      return res.status(400).json({
        message: 'User is already a mentor.'
      });
    }

    const mentorData = {
      userId,
      applicationId: null,
      name,
      email,
      phone,
      age,
      country: country || 'BG',
      photoUrl: photoUrl || null,
      specialization: specialization || null,
      education: education || null,
      experience: experience || null,
      motivation: motivation || null,
      availability: availability || null,
      languages: languages || [],
      viber: viber || null,
      facebook: facebook || null,
      linkedin: linkedin || null,
      otherContact: otherContact || null,
      priorityContact: priorityContact || 'email',
      cvUrl: cvUrl || null,
      cvOriginalName: cvOriginalName || null,
      adminNotes: adminNotes || null,
      approvedAt: new Date(),
      status: 'active',
    };

    const newMentor = await mentor.create(mentorData);

    if (user.role === 'user' || user.role === 'guest') {
      await user_account.update(
        {
          role: 'mentor',
          isMentor: true
        },
        { where: { id: userId } }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Mentor created successfully!',
      mentor: newMentor,
    });

  } catch (err) {
    console.error('❌ [CREATE MENTOR] Error:', err);
    next(err);
  }
});

// ===============================
// GET /api/academy/mentors
// Преглед на всички ментори с filtering
// ===============================
academyController.get('/mentors', async (req, res, next) => {

  try {
    const {
      page = 1,
      limit = 12,
      search = '',
      specialization = '',
      status = 'all',
      sortBy = 'newest',
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Build WHERE clause
    const where = {};

    // Filter by status
    if (status && status !== 'all') {
      where.status = status;
    }

    // Filter by specialization
    if (specialization && specialization !== 'all') {
      where.specialization = specialization;
    }

    // Search by name or email
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Sort order
    let order = [['createdAt', 'DESC']];

    switch (sortBy) {
      case 'oldest':
        order = [['createdAt', 'ASC']];
        break;
      case 'name':
        order = [['name', 'ASC']];
        break;
      case 'rating':
        order = [['rating', 'DESC']];
        break;
      case 'students':
        order = [['studentsCount', 'DESC']];
        break;
      default:
        order = [['createdAt', 'DESC']];
    }

    const { count, rows: mentors } = await mentor.findAndCountAll({
      where,
      include: [
        {
          model: user_account,
          as: 'user',
          attributes: ['id', 'email', 'role'],
        },
        {
          model: mentor_course,
          as: 'courses',
          attributes: ['id', 'courseName', 'courseCategory', 'enrolledStudents', 'status'],
        },
      ],
      limit: limitNum,
      offset,
      order,
      distinct: true,
    });

    const totalPages = Math.ceil(count / limitNum);

    res.status(200).json({
      success: true,
      mentors,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages,
      },
    });

  } catch (err) {
    console.error('❌ [GET MENTORS] Error:', err);
    next(err);
  }
});

// ===============================
// PATCH /api/academy/mentors/:id
// Редактиране на ментор
// ===============================
academyController.patch('/mentors/:id', isAuth, rbac.checkPermission('mentor', 'update'), async (req, res, next) => {

  try {
    const mentorId = parseInt(req.params.id);
    const updates = req.body;

    const mentorData = await mentor.findByPk(mentorId);

    if (!mentorData) {
      return res.status(404).json({ message: 'Mentor not found.' });
    }

    // Allowed fields to update
    const allowedFields = [
      'name',
      'email',
      'phone',
      'age',
      'country',
      'photoUrl',
      'specialization',
      'education',
      'experience',
      'motivation',
      'availability',
      'languages',
      'viber',
      'facebook',
      'linkedin',
      'otherContact',
      'priorityContact',
      'cvUrl',
      'cvOriginalName',
      'isOnline',
      'adminNotes',
      'status',
    ];

    // Filter only allowed fields
    const filteredUpdates = {};
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    });

    // Update mentor
    await mentorData.update(filteredUpdates);

    res.status(200).json({
      success: true,
      message: 'Mentor updated successfully!',
      mentor: mentorData,
    });

  } catch (err) {
    console.error('❌ [UPDATE MENTOR] Error:', err);
    next(err);
  }
});

// ===============================
// DELETE /api/academy/mentors/:id
// Изтриване на ментор
// ===============================
academyController.delete('/mentors/:id', isAuth, rbac.checkPermission('mentor', 'delete'), async (req, res, next) => {

  try {
    const mentorId = parseInt(req.params.id);

    const mentorData = await mentor.findByPk(mentorId);

    if (!mentorData) {
      return res.status(404).json({ message: 'Mentor not found.' });
    }

    const userId = mentorData.userId;

    await mentorData.destroy();

    // Обновявам user role обратно на 'user' (ако не е admin/moderator)
    const user = await user_account.findByPk(userId);
    if (user && user.role === 'mentor') {
      await user_account.update(
        {
          role: 'user',
          isMentor: false
        },
        { where: { id: userId } }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Mentor deleted successfully!',
    });

  } catch (err) {
    console.error('❌ [DELETE MENTOR] Error:', err);
    next(err);
  }
});
// ===============================
// POST /api/academy/mentors/apply
// Кандидатстване за ментор
// ===============================
// server/controllers/academyController.js

academyController.post('/mentors/apply', isAuth, async (req, res, next) => {
  try {
    const validationResult = mentorApplicationSchema.safeParse(req.body);

    if (!validationResult.success) {
      throw validationResult.error;
    }

    const userId = req.user.userId;

    const existingApplication = await mentor_application.findOne({
      where: {
        userId,
        status: ['pending', 'approved']
      }
    });

    if (existingApplication) {
      if (existingApplication.status === 'approved') {
        return res.status(400).json({
          message: 'You are already an approved mentor.'
        });
      }
      return res.status(400).json({
        message: 'You already have a pending mentor application.'
      });
    }

    const applicationData = {
      userId,
      ...validationResult.data,
      country: validationResult.data.country || 'BG', // ✅ ДОБАВЕНО
    };

    const application = await mentor_application.create(applicationData);

    res.status(201).json({
      message: 'Mentor application submitted successfully!',
      applicationId: application.id,
      status: 'pending'
    });

  } catch (err) {
    next(err);
  }
});

// ===============================
// GET /api/academy/mentors/applications/pending
// Admin: Вземи всички pending кандидатури
// ===============================
academyController.get('/mentors/applications/pending',
  isAuth,
  rbac.checkPermission('mentorApplication', 'read'),
  async (req, res, next) => {
    try {
      const applications = await mentor_application.findAll({
        where: { status: 'pending' },
        include: [
          {
            model: user_account,
            as: 'user',
            attributes: ['id', 'email', 'role', 'createdAt'],
          }
        ],
        order: [['createdAt', 'DESC']],
      });

      res.status(200).json({
        success: true,
        applications,
        total: applications.length,
      });

    } catch (err) {
      next(err);
    }
  }
);
// ===============================
// GET /api/academy/mentors/applications/rejected
// Вземане на отхвърлени кандидатури
// ===============================
academyController.get('/mentors/applications/rejected',
  isAuth,
  rbac.checkPermission('mentorApplication', 'read'),
  async (req, res, next) => {

    try {
      const applications = await mentor_application.findAll({
        where: { status: 'rejected' },
        include: [
          {
            model: user_account,
            as: 'user',
            attributes: ['id', 'email', 'role'],
          },
        ],
        order: [['rejectedAt', 'DESC']],
      });

      res.status(200).json({
        success: true,
        applications,
        total: applications.length,
      });

    } catch (err) {
      console.error('❌ [GET REJECTED APPLICATIONS] Error:', err);
      next(err);
    }
  }
);
// ===============================
// POST /api/academy/mentors/applications/:id/approve
// Admin: Одобри кандидатура
// ===============================
academyController.post('/mentors/applications/:applicationId/approve',
  isAuth,
  rbac.checkPermission('mentorApplication', 'approve'),
  async (req, res, next) => {

    try {
      const applicationId = parseInt(req.params.applicationId);

      const application = await mentor_application.findByPk(applicationId, {
        include: [
          {
            model: user_account,
            as: 'user',
          },
        ],
      });

      if (!application) {
        return res.status(404).json({ message: 'Application not found.' });
      }

      if (application.status === 'approved') {
        return res.status(400).json({ message: 'Application is already approved.' });
      }

      // Провери дали user вече е ментор
      const existingMentor = await mentor.findOne({
        where: { userId: application.userId }
      });

      if (existingMentor) {
        return res.status(400).json({
          message: 'User is already a mentor.'
        });
      }

      await application.update({
        status: 'approved',
        approvedAt: new Date(),
        rejectionReason: null,
        rejectedAt: null,
      });

      // Създай ментор запис
      const mentorData = {
        userId: application.userId,
        applicationId: application.id,
        name: application.name,
        email: application.email,
        phone: application.phone,
        age: application.age,
        country: application.country || 'BG',
        photoUrl: application.photoUrl,
        specialization: application.specialization,
        education: application.education,
        experience: application.experience,
        motivation: application.motivation,
        availability: application.availability,
        languages: application.languages || [],
        viber: application.viber,
        facebook: application.facebook,
        linkedin: application.linkedin,
        otherContact: application.otherContact,
        priorityContact: application.priorityContact || 'email',
        cvUrl: application.cvUrl,
        cvOriginalName: application.cvOriginalName,
        status: 'active',
        approvedAt: new Date(),
      };

      const newMentor = await mentor.create(mentorData);

      // Обнови user role
      const user = application.user;
      if (user && (user.role === 'user' || user.role === 'guest')) {
        await user_account.update(
          {
            role: 'mentor',
            isMentor: true  //
          },
          { where: { id: application.userId } }
        );
      }
      // const { user_notification } = require('../sequelize/models/index');

      await user_notification.create({
        userId: application.userId,
        type: 'mentor_application_approved',
        title: 'Поздравления! Вашата кандидатура за ментор беше одобрена! 🎉',
        message: 'Добре дошли в екипа на менторите на DigiBridge Academy! Вече можете да започнете да помагате на ученици и да споделяте знанията си.',
        data: {
          applicationId: application.id,
          mentorId: newMentor.id,
          specialization: application.specialization
        },
        read: false
      });
      res.status(201).json({
        success: true,
        message: 'Mentor application approved successfully!',
        mentor: newMentor,
      });

    } catch (err) {
      console.error('❌ [APPROVE MENTOR APPLICATION] Error:', err);
      next(err);
    }
  }
);

// ===============================
// PATCH /api/academy/mentors/:id/activate
// Активиране на деактивиран ментор
// ===============================
academyController.patch(
  '/mentors/:id/activate',
  isAuth,
  rbac.checkPermission('mentor', 'update'),
  async (req, res, next) => {

    try {
      const mentorId = parseInt(req.params.id);

      const mentorData = await mentor.findByPk(mentorId);

      if (!mentorData) {
        return res.status(404).json({ message: 'Mentor not found.' });
      }

      // Активирай ментора
      await mentorData.update({ status: 'active' });


      res.status(200).json({
        success: true,
        message: 'Mentor activated successfully!',
        mentor: mentorData,
      });

    } catch (err) {
      console.error('❌ [ACTIVATE MENTOR] Error:', err);
      next(err);
    }
  }
);


// ===============================
// PATCH /api/academy/mentors/:id/deactivate
// Деактивиране на ментор
// ===============================
academyController.patch(
  '/mentors/:id/deactivate',
  isAuth,
  rbac.checkPermission('mentor', 'update'),
  async (req, res, next) => {

    try {
      const mentorId = parseInt(req.params.id);

      const mentorData = await mentor.findByPk(mentorId);

      if (!mentorData) {
        return res.status(404).json({ message: 'Mentor not found.' });
      }

      // Деактивирай ментора
      await mentorData.update({ status: 'inactive' });

      res.status(200).json({
        success: true,
        message: 'Mentor deactivated successfully!',
        mentor: mentorData,
      });

    } catch (err) {
      console.error('❌ [DEACTIVATE MENTOR] Error:', err);
      next(err);
    }
  }
);
// ===============================
// POST /api/academy/mentors/applications/:id/reject
// Admin: Отхвърли кандидатура
// ===============================
academyController.post(
  '/mentors/applications/:id/reject',
  isAuth,
  rbac.checkPermission('mentorApplication', 'update'),
  async (req, res, next) => {
    try {
      const applicationId = parseInt(req.params.id);
      const { rejectionReason } = req.body;

      if (!rejectionReason) {
        return res.status(400).json({
          message: 'Rejection reason is required.'
        });
      }

      const application = await mentor_application.findByPk(applicationId);

      if (!application) {
        return res.status(404).json({ message: 'Application not found.' });
      }

      if (application.status !== 'pending') {
        return res.status(400).json({
          message: `Application is already ${application.status}.`
        });
      }

      application.status = 'rejected';
      application.rejectionReason = rejectionReason;
      application.rejectedAt = new Date();
      await application.save();

      // const { user_notification } = require('../sequelize/models/index');

      await user_notification.create({
        userId: application.userId,
        type: 'mentor_application_rejected',
        title: 'Вашата кандидатура за ментор не беше одобрена',
        message: 'За съжаление, вашата кандидатура за ментор не отговаря на нашите изисквания в момента.',
        data: {
          applicationId: application.id,
          rejectionReason: rejectionReason,
          specialization: application.specialization
        },
        read: false
      });
      res.status(200).json({
        success: true,
        message: 'Mentor application rejected successfully.',
        applicationId: application.id,
      });

    } catch (err) {
      next(err);
    }
  }
);
// ===============================
// POST /api/academy/admin/notifications
// Създаване на нова нотификация
// ===============================
academyController.post(
  '/admin/notifications',
  isAuth,
  rbac.checkPermission('notification', 'create'),
  async (req, res, next) => {

    try {
      const { type, title, message, data } = req.body;

      // Validation
      if (!type || !title || !message) {
        return res.status(400).json({
          message: 'Type, title, and message are required.'
        });
      }

      const notification = await admin_notification.create({
        type,
        title,
        message,
        data: data || {},
        read: false,
      });

      res.status(201).json({
        success: true,
        message: 'Notification created successfully!',
        notification,
      });

    } catch (err) {
      console.error('❌ [CREATE NOTIFICATION] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/admin/notifications
// Вземане на нотификации с филтриране
// ===============================
academyController.get(
  '/admin/notifications',
  isAuth,
  rbac.checkPermission('notification', 'read'),
  async (req, res, next) => {

    try {
      const {
        page = 1,
        limit = 20,
        read,
        type,
      } = req.query;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;

      // Build WHERE clause
      const where = {};

      if (read !== undefined) {
        where.read = read === 'true';
      }

      if (type) {
        where.type = type;
      }

      // Fetch notifications
      const { count, rows: notifications } = await admin_notification.findAndCountAll({
        where,
        limit: limitNum,
        offset,
        order: [['createdAt', 'DESC']],
      });

      // Count unread
      const unreadCount = await admin_notification.count({
        where: { read: false },
      });

      const totalPages = Math.ceil(count / limitNum);

      res.status(200).json({
        success: true,
        notifications,
        unreadCount,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count,
          totalPages,
        },
      });

    } catch (err) {
      console.error('❌ [GET NOTIFICATIONS] Error:', err);
      next(err);
    }
  }
);

// ===============================
// PUT /api/academy/admin/notifications/:id/read
// Маркиране на нотификация като прочетена
// ===============================
academyController.put(
  '/admin/notifications/:id/read',
  isAuth,
  rbac.checkPermission('notification', 'update'),
  async (req, res, next) => {

    try {
      const notificationId = parseInt(req.params.id);

      const notification = await admin_notification.findByPk(notificationId);

      if (!notification) {
        return res.status(404).json({ message: 'Notification not found.' });
      }

      await notification.update({
        read: true,
        readAt: new Date(),
      });

      res.status(200).json({
        success: true,
        message: 'Notification marked as read.',
        notification,
      });

    } catch (err) {
      console.error('❌ [MARK AS READ] Error:', err);
      next(err);
    }
  }
);

// ===============================
// PUT /api/academy/admin/notifications/mark-all-read
// Маркиране на всички нотификации като прочетени
// ===============================
academyController.put(
  '/admin/notifications/mark-all-read',
  isAuth,
  rbac.checkPermission('notification', 'update'),
  async (req, res, next) => {

    try {
      const [updatedCount] = await admin_notification.update(
        {
          read: true,
          readAt: new Date(),
        },
        {
          where: { read: false },
        }
      );

      res.status(200).json({
        success: true,
        message: `${updatedCount} notifications marked as read.`,
        markedCount: updatedCount,
      });

    } catch (err) {
      console.error('❌ [MARK ALL AS READ] Error:', err);
      next(err);
    }
  }
);

// ===============================
// DELETE /api/academy/admin/notifications/:id
// Изтриване на нотификация
// ===============================
academyController.delete(
  '/admin/notifications/:id',
  isAuth,
  rbac.checkPermission('notification', 'delete'),
  async (req, res, next) => {

    try {
      const notificationId = parseInt(req.params.id);

      const notification = await admin_notification.findByPk(notificationId);

      if (!notification) {
        return res.status(404).json({ message: 'Notification not found.' });
      }

      await notification.destroy();

      res.status(200).json({
        success: true,
        message: 'Notification deleted successfully.',
      });

    } catch (err) {
      console.error('❌ [DELETE NOTIFICATION] Error:', err);
      next(err);
    }
  }
);
academyController.post(
  '/mentors/bulk-delete',
  isAuth,
  rbac.checkPermission('mentor', 'delete'),
  async (req, res, next) => {
    try {
      const { mentorIds } = req.body;

      if (!mentorIds || !Array.isArray(mentorIds) || mentorIds.length === 0) {
        return res.status(400).json({
          message: 'mentorIds array is required and must not be empty.'
        });
      }

      const deletedCount = await mentor.destroy({
        where: {
          id: mentorIds
        }
      });

      res.status(200).json({
        success: true,
        message: `Successfully deleted ${deletedCount} mentors.`,
        deletedCount
      });

    } catch (err) {
      next(err);
    }
  }
);
academyController.get('/stats', async (req, res, next) => {
  try {
    const totalMentors = await mentor.count();
    const activeMentors = await mentor.count({
      where: { status: 'active' }
    });

    const mentorsData = await mentor.findAll({
      attributes: [[sequelize.fn('SUM', sequelize.col('students_count')), 'totalStudents']]
    });
    const totalStudents = parseInt(mentorsData[0].dataValues.totalStudents) || 0;

    const totalCourses = await mentor_course.count();

    const ratingData = await mentor.findAll({
      attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']]
    });
    const averageRating = parseFloat(ratingData[0].dataValues.avgRating) || 0;

    // ✅ РЕАЛНО ИЗЧИСЛЕНИЕ НА ДЪРЖАВИ
    const countriesData = await mentor.findAll({
      attributes: ['country'],
      where: {
        country: {
          [Op.ne]: null
        }
      },
      group: ['country'],
      raw: true
    });
    const countries = countriesData.length;

    res.status(200).json({
      success: true,
      stats: {
        totalMentors,
        activeMentors,
        totalStudents,
        totalCourses,
        averageRating: parseFloat(averageRating.toFixed(1)),
        countries, // ✅ РЕАЛНО ОТ БАЗАТА
        satisfaction: 100
      }
    });

  } catch (err) {
    next(err);
  }
});
academyController.get(
  '/mentors/statistics/overview',
  isAuth,
  rbac.checkPermission('statistics', 'read'),
  statisticsCache(300),
  async (req, res, next) => {
    try {
      const db = getFirebaseDb();

      // ✅ 1. ОСНОВНИ COUNTS
      const activeMentors = await mentor.count({
        where: { status: 'active' }
      });

      const totalMentors = await mentor.count();

      // ✅ 2. ОБЩ БРОЙ СТУДЕНТИ
      const mentorsData = await mentor.findAll({
        attributes: [[sequelize.fn('SUM', sequelize.col('students_count')), 'totalStudents']]
      });
      const totalStudents = parseInt(mentorsData[0].dataValues.totalStudents) || 0;

      // ✅ 3. СРЕДНА ОЦЕНКА
      const ratingData = await mentor.findAll({
        attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']]
      });
      const averageRating = parseFloat(ratingData[0].dataValues.avgRating) || 0;

      // ✅ 4. ЗАВЪРШЕНИ КУРСОВЕ
      const coursesData = await mentor_course.findAll({
        attributes: [[sequelize.fn('SUM', sequelize.col('completed_count')), 'totalCompleted']]
      });
      const totalCoursesCompleted = parseInt(coursesData[0].dataValues.totalCompleted) || 0;

      // ✅ 5. ОБЩ БРОЙ СЕСИИ
      const sessionsData = await mentor.findAll({
        attributes: [[sequelize.fn('SUM', sequelize.col('sessions_count')), 'totalSessions']]
      });
      const totalSessionsThisMonth = parseInt(sessionsData[0].dataValues.totalSessions) || 0;

      // ✅ 6. ONLINE HOURS - КОМБИНИРАНИ (PostgreSQL + Firebase)
      // 6.1. ACCUMULATED ОТ PostgreSQL
      const onlineMinutesData = await mentor.findAll({
        attributes: [[sequelize.fn('SUM', sequelize.col('accumulated_online_minutes')), 'totalAccumulatedMinutes']]
      });
      const totalAccumulatedMinutes = parseInt(onlineMinutesData[0].dataValues.totalAccumulatedMinutes) || 0;

      // 6.2. CURRENT ОТ Firebase (active/completed sessions)
      let currentFirebaseMinutes = 0;

      const allMentors = await mentor.findAll({
        where: { status: 'active' },
        include: [
          {
            model: user_account,
            as: 'user',
            attributes: ['email']
          }
        ]
      });

      for (const mentorData of allMentors) {
        const firebaseMentorId = mentorData.user.email
          .replace(/\./g, '_dot_')
          .replace(/@/g, '_at_');

        const sessionsRef = db.ref(`mentor_sessions/${firebaseMentorId}`);
        const sessionsSnapshot = await sessionsRef.once('value');
        const sessions = sessionsSnapshot.val() || {};

        Object.values(sessions).forEach(session => {
          if (session.endTime && session.startTime) {
            const durationMs = session.endTime - session.startTime;
            const durationMinutes = Math.floor(durationMs / 60000);
            currentFirebaseMinutes += durationMinutes;
          }
        });
      }

      // 6.3. КОМБИНИРАЙ
      const totalOnlineMinutes = totalAccumulatedMinutes + currentFirebaseMinutes;
      const totalOnlineHours = Math.round((totalOnlineMinutes / 60) * 100) / 100;

      // ✅ 7. COMPLETION RATE (засега средна стойност)
      const averageCompletionRate = 95;

      // ✅ 8. ОБЩ БРОЙ ОТЗИВИ (засега 0)
      const totalReviews = 0;

      res.status(200).json({
        success: true,
        stats: {
          activeMentors,
          totalMentors,
          totalStudents,
          averageRating: parseFloat(averageRating.toFixed(1)),
          totalCoursesCompleted,
          totalSessionsThisMonth,
          totalOnlineHours, // ✅ FIXED!
          averageCompletionRate,
          totalReviews
        }
      });

    } catch (err) {
      console.error('❌ Error fetching overview stats:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/mentors/statistics/by-specialization
// Ментори по специализация
// ===============================
academyController.get(
  '/mentors/statistics/by-specialization',
  isAuth,
  rbac.checkPermission('statistics', 'read'),
  statisticsCache(600),
  async (req, res, next) => {
    try {
      const specializations = await mentor.findAll({
        attributes: [
          'specialization',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('students_count')), 'totalStudents'],
          [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating']
        ],
        where: {
          specialization: {
            [Op.ne]: null
          }
        },
        group: ['specialization'],
        order: [[sequelize.literal('count'), 'DESC']],
        raw: true
      });

      const formattedData = specializations.map(spec => ({
        specialization: spec.specialization,
        count: parseInt(spec.count),
        totalStudents: parseInt(spec.totalStudents) || 0,
        averageRating: parseFloat(parseFloat(spec.averageRating).toFixed(1))
      }));

      res.status(200).json({
        success: true,
        specializations: formattedData
      });

    } catch (err) {
      console.error('❌ [BY-SPECIALIZATION] Error:', err);
      next(err);
    }
  }
);
// ===============================
// GET /api/academy/mentors/all-with-stats
// Всички ментори с Firebase статистики (за DetailedMentorsTable)
// ===============================
academyController.get(
  '/mentors/all-with-stats',
  statisticsCache(120),
  isAuth,
  rbac.checkPermission('statistics', 'read'),
  async (req, res, next) => {
    try {

      const mentors = await getAllMentorsCombinedStats();

      res.status(200).json({
        success: true,
        mentors,
        total: mentors.length
      });

    } catch (err) {
      console.error('❌ [ALL-WITH-STATS] Error:', err);
      next(err);
    }
  }
);

academyController.get(
  '/mentors/:id/firebase-stats',
  isAuth,
  rbac.checkPermission('statistics', 'readOwn'),
  statisticsCache(120),
  async (req, res, next) => {
    try {
      const mentorId = parseInt(req.params.id);
      const requestingUserId = req.user.userId;
      const requestingUserRole = req.user.role;

      // ✅ CHECK: Mentor може да вижда САМО СВОИТЕ stats
      if (requestingUserRole !== 'admin') {
        const mentorRecord = await mentor.findOne({
          where: { userId: requestingUserId }
        });

        if (!mentorRecord || mentorRecord.id !== mentorId) {
          return res.status(403).json({
            success: false,
            message: 'You can only view your own statistics'
          });
        }
      }

      // ✅ Admin или собственикът стигат до тук
      const stats = await getMentorCombinedStats(mentorId);

      res.status(200).json({
        success: true,
        mentor: stats
      });

    } catch (err) {
      console.error('❌ [FIREBASE-STATS] Error:', err);

      if (err.message === 'Mentor not found') {
        return res.status(404).json({
          success: false,
          message: 'Mentor not found'
        });
      }

      next(err);
    }
  }
);
// ===============================
// POST /api/academy/mentors/:id/refresh-stats
// Обнови кеширани статистики от Firebase
// ===============================
academyController.post(
  '/mentors/:id/refresh-stats',
  isAuth,
  rbac.checkPermission('statistics', 'readOwn'), // ✅ Admin или mentor
  async (req, res, next) => {
    try {
      const mentorId = parseInt(req.params.id);
      const requestingUserId = req.user.userId;
      const requestingUserRole = req.user.role;

      // ✅ CHECK: Mentor може да refresh-ва САМО СВОИТЕ stats
      if (requestingUserRole !== 'admin') {
        const mentorRecord = await mentor.findOne({
          where: { userId: requestingUserId }
        });

        if (!mentorRecord || mentorRecord.id !== mentorId) {
          return res.status(403).json({
            success: false,
            message: 'You can only refresh your own statistics'
          });
        }
      }

      // ✅ Admin или собственикът стигат до тук
      const mentorData = await mentor.findByPk(mentorId, {
        include: [
          {
            model: user_account,
            as: 'user',
            attributes: ['email']
          }
        ]
      });

      if (!mentorData) {
        return res.status(404).json({
          success: false,
          message: 'Mentor not found'
        });
      }

      const email = mentorData.user.email;
      const firebaseMentorId = email
        .replace(/\./g, '_dot_')
        .replace(/@/g, '_at_');

      // Обнови статистиките
      const result = await updateMentorCachedStats(mentorId, firebaseMentorId);

      res.status(200).json({
        success: true,
        message: 'Stats refreshed successfully',
        stats: result.stats
      });

    } catch (err) {
      console.error('❌ [REFRESH-STATS] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/mentors/statistics/firebase-overview
// Общи Firebase статистики (за Dashboard)
// ===============================

academyController.get(
  '/mentors/statistics/firebase-overview',
  isAuth,
  rbac.checkPermission('statistics', 'read'),
  statisticsCache(180),
  async (req, res, next) => {
    try {
      const mentors = await getAllMentorsCombinedStats();

      // Изчисли агрегирани статистики
      let totalSessions = 0;
      let totalOnlineHours = 0;
      let totalMessages = 0;
      let totalActiveSessions = 0;
      let responseTimes = [];

      mentors.forEach(mentor => {
        const stats = mentor.firebaseStats;
        totalSessions += stats.totalSessions || 0;
        totalOnlineHours += stats.totalOnlineHours || 0;
        totalMessages += stats.totalMessages || 0;
        totalActiveSessions += stats.activeSessions || 0;

        if (stats.averageResponseTime > 0) {
          responseTimes.push(stats.averageResponseTime);
        }
      });

      const averageResponseTime = responseTimes.length > 0
        ? Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length)
        : 0;

      res.status(200).json({
        success: true,
        stats: {
          totalMentors: mentors.length,
          totalSessions,
          totalActiveSessions,
          totalOnlineHours,
          averageResponseTime,
          totalMessages
        }
      });

    } catch (err) {
      console.error('❌ [FIREBASE-OVERVIEW] Error:', err);
      next(err);
    }
  }
);
// ===============================
// GET /api/academy/mentors/statistics/top-by-online-time
// Топ ментори по онлайн време
// ===============================
academyController.get(
  '/mentors/statistics/top-by-online-time',
  isAuth,
  rbac.checkPermission('statistics', 'read'),
  statisticsCache(300),
  async (req, res, next) => {
    try {
      const { limit = 10 } = req.query;

      const mentors = await getAllMentorsCombinedStats();

      const topMentors = mentors
        .sort((a, b) => {
          const aHours = a.firebaseStats.totalOnlineHours || 0;
          const bHours = b.firebaseStats.totalOnlineHours || 0;
          return bHours - aHours;
        })
        .slice(0, parseInt(limit))
        .map(mentor => ({
          id: mentor.id,
          name: mentor.name,
          photoUrl: mentor.photoUrl,
          specialization: mentor.specialization,
          // ✅ ФОРМАТ КАКЪВТО ОЧАКВА КОМПОНЕНТА
          onlineTime: {
            thisMonth: mentor.firebaseStats.totalOnlineHours || 0,  // TODO: Разделяне на месеци идва от historical tracking
            total: mentor.firebaseStats.totalOnlineHours || 0
          }
        }));

      res.status(200).json({
        success: true,
        mentors: topMentors,
        total: topMentors.length
      });

    } catch (err) {
      console.error('❌ [TOP-BY-ONLINE-TIME] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/mentors/statistics/response-times
// Response time статистики
// ===============================
academyController.get(
  '/mentors/statistics/response-times',
  isAuth,
  rbac.checkPermission('statistics', 'read'),
  statisticsCache(300),
  async (req, res, next) => {
    try {

      const mentors = await getAllMentorsCombinedStats();

      // Групирай по response time ranges
      const ranges = {
        excellent: [], // <= 10 min
        good: [],      // 11-15 min
        average: [],   // 16-20 min
        slow: []       // > 20 min
      };

      mentors.forEach(mentor => {
        const responseTime = mentor.firebaseStats.averageResponseTime || 0;

        if (responseTime === 0) return; // Skip ако няма данни

        const mentorData = {
          id: mentor.id,
          name: mentor.name,
          responseTime,
          totalMessages: mentor.firebaseStats.totalMessages
        };

        if (responseTime <= 10) {
          ranges.excellent.push(mentorData);
        } else if (responseTime <= 15) {
          ranges.good.push(mentorData);
        } else if (responseTime <= 20) {
          ranges.average.push(mentorData);
        } else {
          ranges.slow.push(mentorData);
        }
      });

      const stats = {
        excellent: ranges.excellent.length,
        good: ranges.good.length,
        average: ranges.average.length,
        slow: ranges.slow.length,
        totalMentorsWithData: mentors.filter(m => m.firebaseStats.averageResponseTime > 0).length,
        mentorsByRange: ranges
      };

      res.status(200).json({
        success: true,
        stats
      });

    } catch (err) {
      console.error('❌ [RESPONSE-TIMES] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/mentors/statistics/activity-trend
// Activity trend (реални исторически данни от snapshots)
// ===============================
academyController.get(
  '/mentors/statistics/activity-trend',
  isAuth,
  rbac.checkPermission('statistics', 'read'),
  statisticsCache(600),
  async (req, res, next) => {
    try {
      const { months = 6 } = req.query;

      const { getActivityTrendData } = require('../services/mentorActivitySnapshotService');
      const trend = await getActivityTrendData(parseInt(months));

      // ✅ Ако няма snapshots, върни текущите данни като fallback
      if (trend.length === 0) {

        const mentors = await getAllMentorsCombinedStats();
        const totalSessions = mentors.reduce((sum, m) => sum + (m.sessionsCount || 0), 0);
        const totalOnlineHours = mentors.reduce((sum, m) => sum + (m.firebaseStats.totalOnlineHours || 0), 0);
        const totalMessages = mentors.reduce((sum, m) => sum + (m.firebaseStats.totalMessages || 0), 0);
        const currentMonth = new Date().toISOString().slice(0, 7);

        return res.status(200).json({
          success: true,
          trend: [
            {
              month: currentMonth,
              sessions: totalSessions,
              onlineHours: Math.round(totalOnlineHours),
              messages: totalMessages,
              activeMentors: mentors.length
            }
          ],
          note: 'No historical data yet. First snapshot will be created at 00:05 tonight. You can create a manual snapshot using POST /mentors/statistics/create-snapshot'
        });
      }

      res.status(200).json({
        success: true,
        trend
      });

    } catch (err) {
      console.error('❌ [ACTIVITY-TREND] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/mentors/statistics/session-quality
// Session quality metrics
// ===============================
academyController.get(
  '/mentors/statistics/session-quality',
  isAuth,
  rbac.checkPermission('statistics', 'read'),
  statisticsCache(300),
  async (req, res, next) => {
    try {

      const mentors = await getAllMentorsCombinedStats();

      let totalSessions = 0;
      let completedSessions = 0;
      let activeSessions = 0;
      let totalRatings = 0;
      let ratedMentors = 0;

      mentors.forEach(mentor => {
        totalSessions += mentor.sessionsCount || 0;
        completedSessions += mentor.firebaseStats.completedSessions || 0;
        activeSessions += mentor.firebaseStats.activeSessions || 0;

        if (mentor.rating > 0) {
          totalRatings += mentor.rating;
          ratedMentors++;
        }
      });

      const completionRate = totalSessions > 0
        ? Math.round((completedSessions / totalSessions) * 100)
        : 0;

      const averageRating = ratedMentors > 0
        ? (totalRatings / ratedMentors).toFixed(1)
        : 0;

      res.status(200).json({
        success: true,
        quality: {
          totalSessions,
          completedSessions,
          activeSessions,
          completionRate,
          averageRating,
          totalMentors: mentors.length,
          ratedMentors
        }
      });

    } catch (err) {
      console.error('❌ [SESSION-QUALITY] Error:', err);
      next(err);
    }
  }
);
// ===============================
// POST /api/academy/mentors/statistics/create-snapshot
// Manual snapshot creation (за testing и пропуснати дни)
// ===============================
academyController.post(
  '/mentors/statistics/create-snapshot',
  isAuth,
  rbac.checkPermission('mentor', 'update'),
  async (req, res, next) => {
    try {

      const { createDailySnapshots } = require('../services/mentorActivitySnapshotService');
      const result = await createDailySnapshots();

      res.status(200).json({
        success: true,
        message: 'Snapshot created successfully',
        count: result.count,
        date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      console.error('❌ [CREATE-SNAPSHOT] Error:', err);
      next(err);
    }
  }
);
// ===============================
// POST /api/academy/sync-session
// SYNC SESSION STATS - извиква се от frontend след session end
// ===============================
academyController.post('/sync-session', async (req, res, next) => {

  try {
    const { sessionId, mentorEmail } = req.body;

    if (!sessionId || !mentorEmail) {
      return res.status(400).json({
        success: false,
        error: 'Missing sessionId or mentorEmail'
      });
    }

    const { syncCompletedSessionStats } = require('../services/sessionSyncService');

    // Вземи PostgreSQL mentor ID
    const userAccount = await user_account.findOne({
      where: { email: mentorEmail }
    });

    if (!userAccount) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const mentorRecord = await mentor.findOne({
      where: { userId: userAccount.id }
    });

    if (!mentorRecord) {
      return res.status(404).json({
        success: false,
        error: 'Mentor not found'
      });
    }

    // Firebase mentor ID
    const mentorFirebaseId = mentorEmail
      .replace(/\./g, '_dot_')
      .replace(/@/g, '_at_');

    // Sync stats
    const result = await syncCompletedSessionStats(
      sessionId,
      mentorFirebaseId,
      mentorRecord.id
    );

    return res.json(result);

  } catch (error) {
    console.error('❌ Error syncing session stats:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
// ===============================
// GET /api/academy/mentors/all-with-stats-filtered
// Ментори с филтрирани статистики по период
// ===============================
academyController.get(
  '/mentors/all-with-stats-filtered',
  isAuth,
  rbac.checkPermission('statistics', 'read'),
  statisticsCache(120),
  async (req, res, next) => {
    try {
      const { timeFilter = 'thisMonth' } = req.query;

      // Изчисли date range
      const now = new Date();
      let startDate;

      switch (timeFilter) {
        case 'thisMonth':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'lastMonth':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          break;
        case 'last3Months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          break;
        case 'allTime':
          startDate = new Date(2020, 0, 1); // От началото на проекта
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      const { getFilteredMentorStats } = require('../services/mentorActivitySnapshotService');
      const mentors = await getFilteredMentorStats(startDate, now);

      res.status(200).json({
        success: true,
        mentors,
        total: mentors.length,
        timeFilter,
        startDate: startDate.toISOString(),
        endDate: now.toISOString()
      });

    } catch (err) {
      console.error('❌ [FILTERED-STATS] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/mentors/:mentorId/apply-student
// Student applies to a mentor
// ===============================
academyController.post(
  '/mentors/:mentorId/apply-student',
  isAuth,
  async (req, res, next) => {
    try {
      const mentorId = parseInt(req.params.mentorId);
      const userId = req.user.userId;
      const userRole = req.user.role;

      const {
        student_mentor_application,
        mentor,
        user_account,
        student
      } = require('../sequelize/models/index');

      // ✅ 1. ПРОВЕРКА: Admin и Mentor НЕ могат да кандидатстват
      if (userRole === 'admin' || userRole === 'mentor') {
        return res.status(403).json({
          success: false,
          message: 'Administrators and mentors cannot apply for mentors'
        });
      }

      // ✅ 2. ПРОВЕРКА: Менторът съществува и е активен
      const mentorData = await mentor.findByPk(mentorId);

      if (!mentorData) {
        return res.status(404).json({
          success: false,
          message: 'Mentor not found'
        });
      }

      if (mentorData.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'This mentor is not currently accepting students'
        });
      }

      // ✅ 3. ПРОВЕРКА: Дали вече има pending заявка към ТОЗИ ментор
      const existingApplication = await student_mentor_application.findOne({
        where: {
          userId: userId,
          mentorId: mentorId,
          status: 'pending'
        }
      });

      if (existingApplication) {
        return res.status(400).json({
          success: false,
          message: 'You already have a pending application to this mentor'
        });
      }
      // ✅ 3.5. ПРОВЕРКА: Дали има APPROVED заявка към ТОЗИ ментор
      const approvedApplication = await student_mentor_application.findOne({
        where: {
          userId: userId,
          mentorId: mentorId,
          status: 'approved'
        }
      });

      if (approvedApplication) {
        return res.status(400).json({
          success: false,
          message: 'You are already assigned to this mentor'
        });
      }

      // ✅ 4. СЪЗДАЙ APPLICATION
      const newApplication = await student_mentor_application.create({
        userId: userId,
        mentorId: mentorId,
        status: 'pending'
      });

      // ✅ 5. СЪЗДАЙ ADMIN NOTIFICATION
      await require('../sequelize/models/index').admin_notification.create({
        type: 'student_application',
        title: 'New Student Application',
        message: `User applied to mentor ${mentorData.name}`,
        data: {
          applicationId: newApplication.id,
          userId: userId,
          mentorId: mentorId
        },
        isRead: false
      });

      res.status(201).json({
        success: true,
        message: 'Application sent successfully',
        application: newApplication
      });

    } catch (err) {
      console.error('❌ [APPLY FOR MENTOR] Error:', err);
      next(err);
    }
  }
);
// ===============================
// GET /api/academy/admin/student-applications
// Admin: Вземи всички student applications (всички ментори)
// ===============================
academyController.get(
  '/admin/student-applications',
  isAuth,
  rbac.checkPermission('studentApplication', 'readAll'),
  async (req, res, next) => {
    try {
      const { status } = req.query; // optional filter: pending, approved, rejected

      const {
        student_mentor_application,
        user_account,
        user_details,
        mentor
      } = require('../sequelize/models/index');

      // Build where clause
      const where = {};
      if (status && status !== 'all') {
        where.status = status;
      }

      // Вземи всички заявки
      const applications = await student_mentor_application.findAll({
        where,
        include: [
          {
            model: user_account,
            as: 'user',
            attributes: ['id', 'email', 'role'],
            include: [
              {
                model: user_details,
                as: 'details',
                attributes: ['username', 'firstName', 'lastName', 'imageURL', 'phoneNumber']
              }
            ]
          },
          {
            model: mentor,
            as: 'mentor',
            attributes: ['id', 'name', 'email', 'photoUrl', 'specialization', 'phone']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      // Форматирай резултата
      const formattedApplications = applications.map(app => {
        const appData = app.get({ plain: true });
        const userName = appData.user?.details?.username ||
          `${appData.user?.details?.firstName || ''} ${appData.user?.details?.lastName || ''}`.trim() ||
          appData.user?.email?.split('@')[0] ||
          'Unknown';

        return {
          id: appData.id,
          // User data
          userId: appData.userId,
          userName: userName,
          userEmail: appData.user?.email,
          userAvatar: appData.user?.details?.imageURL,
          userPhone: appData.user?.details?.phoneNumber,
          userRole: appData.user?.role,
          // Mentor data
          mentorId: appData.mentorId,
          mentorName: appData.mentor?.name,
          mentorEmail: appData.mentor?.email,
          mentorPhoto: appData.mentor?.photoUrl,
          mentorSpecialization: appData.mentor?.specialization,
          mentorPhone: appData.mentor?.phone,
          // Application status
          status: appData.status,
          rejectionReason: appData.rejectionReason,
          approvedAt: appData.approvedAt,
          rejectedAt: appData.rejectedAt,
          createdAt: appData.createdAt,
          updatedAt: appData.updatedAt
        };
      });

      res.status(200).json({
        success: true,
        applications: formattedApplications,
        total: formattedApplications.length,
        statusCounts: {
          pending: formattedApplications.filter(a => a.status === 'pending').length,
          approved: formattedApplications.filter(a => a.status === 'approved').length,
          rejected: formattedApplications.filter(a => a.status === 'rejected').length
        }
      });

    } catch (err) {
      console.error('❌ [GET ALL STUDENT APPLICATIONS] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/admin/student-applications/:id/approve
// Admin: Одобри заявка (same logic as mentor)
// ===============================
academyController.post(
  '/admin/student-applications/:id/approve',
  isAuth,
  rbac.checkPermission('studentApplication', 'update'),
  async (req, res, next) => {
    try {
      const applicationId = parseInt(req.params.id);

      const {
        student_mentor_application,
        student,
        user_account,
        mentor,
        mentor_history
      } = require('../sequelize/models/index');
      const { tokenGenerator } = require('../utils/jwt');
      const { refreshToken } = require('../sequelize/models/index');

      // ✅ 1. ВЗЕМИ APPLICATION
      const application = await student_mentor_application.findByPk(applicationId);

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      if (application.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Application is already processed'
        });
      }

      // ✅ 2. ВЗЕМИ USER DATA
      const user = await user_account.findByPk(application.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // ✅ 3. ПРОМЕНИ ROLE НА 'student' (ако не е вече)
      if (user.role !== 'student') {
        await user.update({ role: 'student' });

        // ✅ ГЕНЕРИРАЙ НОВИ TOKENS с обновена роля
        const { token } = tokenGenerator('access', user.dataValues);
        const { token: refreshJwtToken, refreshTokenId, expiryDate } = tokenGenerator('refresh', user.dataValues);

        await refreshToken.destroy({ where: { userId: user.id } });
        await refreshToken.create({
          userId: user.id,
          token: refreshTokenId,
          expiryDate
        });
      }

      // ✅ 4. ПРОВЕРИ ДАЛИ СТУДЕНТЪТ ВЕЧЕ СЪЩЕСТВУВА
      let studentData = await student.findOne({
        where: { userId: application.userId }
      });

      const isNewStudent = !studentData;
      const oldMentorId = studentData?.currentMentorId || null;

      if (studentData) {
        // ✅ СТУДЕНТЪТ СЪЩЕСТВУВА - ЗАМЕНИ МЕНТОРА

        // Намали studentsCount на стария ментор
        if (studentData.currentMentorId) {
          const oldMentor = await mentor.findByPk(studentData.currentMentorId);
          if (oldMentor) {
            await oldMentor.update({
              studentsCount: Math.max(0, oldMentor.studentsCount - 1)
            });
          }
        }

        // Обнови студента с новия ментор
        await studentData.update({
          currentMentorId: application.mentorId,
          mentorAssignedDate: new Date(),
          status: 'active'
        });

      } else {
        // ✅ СТУДЕНТЪТ НЕ СЪЩЕСТВУВА - СЪЗДАЙ ГО
        studentData = await student.create({
          userId: application.userId,
          currentMentorId: application.mentorId,
          mentorAssignedDate: new Date(),
          status: 'active',
          country: 'BG'
        });
      }

      // ✅ 5. УВЕЛИЧИ studentsCount НА НОВИЯ МЕНТОР
      const mentorData = await mentor.findByPk(application.mentorId);
      await mentorData.update({
        studentsCount: mentorData.studentsCount + 1
      });

      // ✅ 5.5. СЪЗДАЙ MENTOR HISTORY ЗАПИС

      // Ако студентът вече съществуваше и сменихме ментора
      if (!isNewStudent && oldMentorId && oldMentorId !== application.mentorId) {
        // Завърши стария период
        const oldHistory = await mentor_history.findOne({
          where: {
            studentId: studentData.id,
            periodEnd: null
          },
          order: [['periodStart', 'DESC']]
        });

        if (oldHistory) {
          await oldHistory.update({
            periodEnd: new Date(),
            reason: 'Reassigned to new mentor'
          });
        }
      }

      // Създай нов history запис за новия ментор
      await mentor_history.create({
        studentId: studentData.id,
        mentorId: application.mentorId,
        mentorName: mentorData.name,
        periodStart: new Date(),
        periodEnd: null,
        reason: isNewStudent ? 'Initial assignment' : 'Reassigned from another mentor'
      });

      // ✅ 6. ОБНОВИ APPLICATION STATUS
      await application.update({
        status: 'approved',
        approvedAt: new Date()
      });

      // ✅ 7. СЪЗДАЙ ADMIN NOTIFICATION
      await require('../sequelize/models/index').admin_notification.create({
        type: 'student_application_approved_by_admin',
        title: 'Student Application Approved by Admin',
        message: `Admin approved student application to mentor ${mentorData.name}`,
        data: {
          applicationId: application.id,
          userId: application.userId,
          mentorId: application.mentorId,
          studentId: studentData.id,
          approvedBy: 'admin'
        },
        isRead: false
      });

      res.status(200).json({
        success: true,
        message: 'Application approved successfully',
        application: application,
        student: studentData
      });

    } catch (err) {
      console.error('❌ [ADMIN APPROVE APPLICATION] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/admin/student-applications/:id/reject
// Admin: Отхвърли заявка
// ===============================
academyController.post(
  '/admin/student-applications/:id/reject',
  isAuth,
  rbac.checkPermission('studentApplication', 'update'),
  async (req, res, next) => {
    try {
      const applicationId = parseInt(req.params.id);

      const { rejectApplicationSchema } = require('../schemas/studentMentorApplication.schema');
      const { student_mentor_application, mentor } = require('../sequelize/models/index');

      // Валидация
      const validationResult = rejectApplicationSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationResult.error.errors
        });
      }

      // Вземи application
      const application = await student_mentor_application.findByPk(applicationId);

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      if (application.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Application is already processed'
        });
      }

      // Обнови application
      await application.update({
        status: 'rejected',
        rejectionReason: validationResult.data.rejectionReason,
        rejectedAt: new Date()
      });

      // Създай admin notification
      const mentorData = await mentor.findByPk(application.mentorId);
      await require('../sequelize/models/index').admin_notification.create({
        type: 'student_application_rejected_by_admin',
        title: 'Student Application Rejected by Admin',
        message: `Admin rejected student application to mentor ${mentorData.name}`,
        data: {
          applicationId: application.id,
          userId: application.userId,
          mentorId: application.mentorId,
          rejectionReason: validationResult.data.rejectionReason,
          rejectedBy: 'admin'
        },
        isRead: false
      });

      res.status(200).json({
        success: true,
        message: 'Application rejected successfully',
        application: application
      });

    } catch (err) {
      console.error('❌ [ADMIN REJECT APPLICATION] Error:', err);
      next(err);
    }
  }
);

// ===============================
// DELETE /api/academy/admin/student-applications/:id
// Admin: Изтрий заявка
// ===============================
academyController.delete(
  '/admin/student-applications/:id',
  isAuth,
  rbac.checkPermission('studentApplication', 'delete'),
  async (req, res, next) => {
    try {
      const applicationId = parseInt(req.params.id);

      const { student_mentor_application } = require('../sequelize/models/index');

      // Намери application
      const application = await student_mentor_application.findByPk(applicationId);

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      // Изтрий application
      await application.destroy();

      res.status(200).json({
        success: true,
        message: 'Application deleted successfully'
      });

    } catch (err) {
      console.error('❌ [ADMIN DELETE APPLICATION] Error:', err);
      next(err);
    }
  }
);
// ===============================
// ============ ADMIN STUDENTS MANAGEMENT ============
// ===============================

// ===============================
// GET /api/academy/admin/students
// Вземи всички студенти с филтри и пагинация
// ===============================
academyController.get(
  '/admin/students',
  isAuth,
  rbac.checkPermission('student', 'read'),
  async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 12,
        search = '',
        status = 'all',
        mentorId = null,
        sortBy = 'newest',
      } = req.query;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;

      // Build WHERE clause
      const where = {};

      // Filter by status
      if (status && status !== 'all') {
        where.status = status;
      }

      // Filter by mentor
      if (mentorId && mentorId !== 'all') {
        where.currentMentorId = parseInt(mentorId);
      }

      // Search by name or email
      if (search) {
        where[Op.or] = [
          { '$user.details.username$': { [Op.iLike]: `%${search}%` } },
          { '$user.details.firstName$': { [Op.iLike]: `%${search}%` } },
          { '$user.details.lastName$': { [Op.iLike]: `%${search}%` } },
          { '$user.email$': { [Op.iLike]: `%${search}%` } },
        ];
      }

      // Sort order
      let order = [['createdAt', 'DESC']];

      switch (sortBy) {
        case 'oldest':
          order = [['createdAt', 'ASC']];
          break;
        case 'name':
          order = [[{ model: user_account, as: 'user' }, { model: user_details, as: 'details' }, 'username', 'ASC']];
          break;
        case 'credits':
          order = [['totalCreditsEarned', 'DESC']];
          break;
        case 'attendance':
          order = [['attendedSessions', 'DESC']];
          break;
        default:
          order = [['createdAt', 'DESC']];
      }

      const { count, rows: students } = await student.findAndCountAll({
        where,
        include: [
          {
            model: user_account,
            as: 'user',
            attributes: ['id', 'email', 'role'],
            required: true,
            include: [
              {
                model: user_details,
                as: 'details',
                required: false,
                attributes: ['username', 'firstName', 'lastName', 'imageURL', 'phoneNumber']
              }
            ]
          },
          {
            model: mentor,
            as: 'currentMentor',
            required: false,
            attributes: ['id', 'name', 'email', 'photoUrl']
          }
        ],
        limit: limitNum,
        offset,
        order,
        distinct: true,
        subQuery: false
      });

      // Форматирай резултата
      const formattedStudents = students.map(s => {
        const studentData = s.get({ plain: true });
        const name = studentData.user?.details?.username ||
          `${studentData.user?.details?.firstName || ''} ${studentData.user?.details?.lastName || ''}`.trim() ||
          studentData.user?.email?.split('@')[0] ||
          'Unknown';

        const attendanceRate = studentData.totalScheduledSessions > 0
          ? Math.round((studentData.attendedSessions / studentData.totalScheduledSessions) * 100)
          : 0;

        return {
          id: studentData.id,
          name: name,
          email: studentData.user?.email,
          avatar: studentData.avatar || studentData.user?.details?.imageURL || null,
          phone: studentData.phone || studentData.user?.details?.phoneNumber || null,
          status: studentData.status,
          totalCreditsEarned: studentData.totalCreditsEarned,
          attendanceRate: attendanceRate,
          currentMentor: studentData.currentMentor ? {
            id: studentData.currentMentor.id,
            name: studentData.currentMentor.name,
            photoUrl: studentData.currentMentor.photoUrl
          } : null,
          registrationDate: studentData.registrationDate,
          lastActiveAt: studentData.lastActiveAt
        };
      });

      const totalPages = Math.ceil(count / limitNum);

      res.status(200).json({
        success: true,
        students: formattedStudents,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count,
          totalPages,
        },
      });

    } catch (err) {
      console.error('❌ [GET ADMIN STUDENTS] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/admin/students/:id
// Детайли за студент (ПЪЛНИ)
// ===============================
academyController.get(
  '/admin/students/:id',
  isAuth,
  rbac.checkPermission('student', 'read'),
  async (req, res, next) => {
    try {
      const studentId = parseInt(req.params.id);

      const {
        student_course,
        course,
        student_lecture,
        lecture,
        student_seminar,
        seminar,
        student_presentation,
        presentation,
        mentor_history
      } = require('../sequelize/models/index');

      const studentData = await student.findByPk(studentId, {
        include: [
          {
            model: user_account,
            as: 'user',
            attributes: ['id', 'email', 'role'],
            required: true,
            include: [
              {
                model: user_details,
                as: 'details',
                required: false,
                attributes: ['username', 'firstName', 'lastName', 'phoneNumber', 'imageURL', 'birthDate', 'region']
              }
            ]
          },
          {
            model: mentor,
            as: 'currentMentor',
            required: false,
            attributes: ['id', 'name', 'email', 'photoUrl', 'specialization']
          },
          {
            model: student_course,
            as: 'courses',
            required: false,
            include: [
              {
                model: course,
                as: 'course',
                required: false,
                attributes: ['id', 'name', 'category', 'thumbnailUrl']
              }
            ]
          },
          {
            model: student_lecture,
            as: 'lectures',
            required: false,
            include: [
              {
                model: lecture,
                as: 'lecture',
                required: false,
                attributes: ['id', 'title', 'scheduledDate', 'durationMinutes']
              }
            ]
          },
          {
            model: student_seminar,
            as: 'seminars',
            required: false,
            include: [
              {
                model: seminar,
                as: 'seminar',
                required: false,
                attributes: ['id', 'title', 'scheduledDate', 'durationMinutes']
              }
            ]
          },
          {
            model: student_presentation,
            as: 'presentations',
            required: false,
            include: [
              {
                model: presentation,
                as: 'presentation',
                required: false,
                attributes: ['id', 'title', 'dueDate', 'maxCredits']
              }
            ]
          },
          {
            model: mentor_history,
            as: 'mentorHistory',
            required: false,
            include: [
              {
                model: mentor,
                as: 'mentor',
                required: false,
                attributes: ['id', 'name', 'photoUrl']
              }
            ]
          }
        ]
      });

      if (!studentData) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      const studentObj = studentData.get({ plain: true });

      const attendanceRate = studentObj.totalScheduledSessions > 0
        ? Math.round((studentObj.attendedSessions / studentObj.totalScheduledSessions) * 100)
        : 0;

      const studentName = studentObj.user?.details?.username ||
        `${studentObj.user?.details?.firstName || ''} ${studentObj.user?.details?.lastName || ''}`.trim() ||
        studentObj.user?.email?.split('@')[0] ||
        'Unknown';

      const formattedCourses = (studentObj.courses || []).map(sc => ({
        id: sc.id,
        courseId: sc.courseId,
        courseName: sc.course?.name || 'Unknown Course',
        category: sc.course?.category || null,
        thumbnailUrl: sc.course?.thumbnailUrl || null,
        status: sc.status,
        progress: sc.progress,
        completedLessons: sc.completedLessons,
        totalLessons: sc.totalLessons,
        earnedCredits: sc.earnedCredits,
        maxCredits: sc.maxCredits,
        startDate: sc.startDate,
        endDate: sc.endDate
      }));

      const formattedLectures = (studentObj.lectures || []).map(sl => ({
        id: sl.id,
        lectureId: sl.lectureId,
        title: sl.lecture?.title || 'Unknown Lecture',
        date: sl.lecture?.scheduledDate || null,
        duration: sl.lecture?.durationMinutes || 0,
        attended: sl.attended,
        attendedAt: sl.attendedAt,
        earnedCredits: sl.earnedCredits
      }));

      const formattedSeminars = (studentObj.seminars || []).map(ss => ({
        id: ss.id,
        seminarId: ss.seminarId,
        title: ss.seminar?.title || 'Unknown Seminar',
        date: ss.seminar?.scheduledDate || null,
        duration: ss.seminar?.durationMinutes || 0,
        attended: ss.attended,
        attendedAt: ss.attendedAt,
        earnedCredits: ss.earnedCredits
      }));

      const formattedPresentations = (studentObj.presentations || []).map(sp => ({
        id: sp.id,
        presentationId: sp.presentationId,
        title: sp.presentation?.title || 'Unknown Presentation',
        dueDate: sp.presentation?.dueDate || null,
        status: sp.status,
        submittedAt: sp.submittedAt,
        gradedAt: sp.gradedAt,
        earnedCredits: sp.earnedCredits,
        maxCredits: sp.presentation?.maxCredits || 0
      }));

      const formattedMentorHistory = (studentObj.mentorHistory || []).map(mh => ({
        id: mh.id,
        mentorId: mh.mentorId,
        mentorName: mh.mentorName,
        mentorPhoto: mh.mentor?.photoUrl || null,
        periodStart: mh.periodStart,
        periodEnd: mh.periodEnd,
        reason: mh.reason
      }));

      const formattedStudent = {
        id: studentObj.id,
        name: studentName,
        avatar: studentObj.avatar || studentObj.user?.details?.imageURL || null,
        status: studentObj.status,
        registrationDate: studentObj.registrationDate,
        user: {
          id: studentObj.user.id,
          email: studentObj.user.email,
          phone: studentObj.phone || studentObj.user?.details?.phoneNumber || null,
          details: studentObj.user.details ? {
            username: studentObj.user.details.username,
            firstName: studentObj.user.details.firstName,
            lastName: studentObj.user.details.lastName,
            birthDate: studentObj.user.details.birthDate,
            region: studentObj.user.details.region
          } : null
        },
        credits: {
          totalEarned: studentObj.totalCreditsEarned,
          totalPossible: studentObj.totalCreditsPossible,
          breakdown: {
            fromCourses: studentObj.creditsFromCourses,
            fromLectures: studentObj.creditsFromLectures,
            fromSeminars: studentObj.creditsFromSeminars,
            fromPresentations: studentObj.creditsFromPresentations
          }
        },
        currentMentor: studentObj.currentMentor ? {
          id: studentObj.currentMentor.id,
          name: studentObj.currentMentor.name,
          email: studentObj.currentMentor.email,
          photoUrl: studentObj.currentMentor.photoUrl,
          specialization: studentObj.currentMentor.specialization,
          assignedDate: studentObj.mentorAssignedDate
        } : null,
        attendance: {
          totalScheduledSessions: studentObj.totalScheduledSessions,
          attendedSessions: studentObj.attendedSessions,
          missedSessions: studentObj.missedSessions,
          attendanceRate: attendanceRate
        },
        mentorHelp: {
          totalChatSessions: studentObj.totalChatSessions,
          totalChatHours: parseFloat(studentObj.totalChatHours),
          lastChatDate: studentObj.lastChatDate,
          scheduledMeetings: studentObj.scheduledMeetings,
          completedMeetings: studentObj.completedMeetings
        },
        adminNotes: studentObj.adminNotes,
        specialNeeds: studentObj.specialNeeds,
        courses: formattedCourses,
        lectures: formattedLectures,
        seminars: formattedSeminars,
        presentations: formattedPresentations,
        mentorHistory: formattedMentorHistory
      };

      res.status(200).json({
        success: true,
        student: formattedStudent
      });

    } catch (err) {
      console.error('❌ [GET ADMIN STUDENT DETAILS] Error:', err);
      next(err);
    }
  }
);

// ===============================
// PATCH /api/academy/admin/students/:id
// Редактирай студент
// ===============================
academyController.patch(
  '/admin/students/:id',
  isAuth,
  rbac.checkPermission('student', 'update'),
  async (req, res, next) => {
    try {
      const studentId = parseInt(req.params.id);
      const updates = req.body;

      const studentData = await student.findByPk(studentId);

      if (!studentData) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      const allowedFields = [
        'phone',
        'avatar',
        'address',
        'city',
        'country',
        'status',
        'specialNeeds',
        'adminNotes',
        'emergencyContactName',
        'emergencyContactPhone',
        'preferredLanguage',
        'preferredContactMethod',
        'availabilityNotes'
      ];

      const filteredUpdates = {};
      allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
          filteredUpdates[field] = updates[field];
        }
      });

      if (Object.keys(filteredUpdates).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid fields to update'
        });
      }

      await studentData.update(filteredUpdates);

      await admin_notification.create({
        type: 'student_updated',
        title: 'Student Updated',
        message: `Student profile was updated by admin`,
        data: {
          studentId: studentData.id,
          updatedFields: Object.keys(filteredUpdates)
        },
        read: false
      });

      res.status(200).json({
        success: true,
        message: 'Student updated successfully',
        student: studentData
      });

    } catch (err) {
      console.error('❌ [UPDATE STUDENT] Error:', err);
      next(err);
    }
  }
);

// ===============================
// DELETE /api/academy/admin/students/:id
// Изтрий студент
// ===============================
academyController.delete(
  '/admin/students/:id',
  isAuth,
  rbac.checkPermission('student', 'delete'),
  async (req, res, next) => {
    try {
      const studentId = parseInt(req.params.id);

      const studentData = await student.findByPk(studentId, {
        include: [
          {
            model: user_account,
            as: 'user',
            attributes: ['email']
          }
        ]
      });

      if (!studentData) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      const studentEmail = studentData.user.email;
      const mentorId = studentData.currentMentorId;

      if (mentorId) {
        const mentorData = await mentor.findByPk(mentorId);
        if (mentorData) {
          await mentorData.update({
            studentsCount: Math.max(0, mentorData.studentsCount - 1)
          });
        }
      }

      await studentData.destroy();

      await admin_notification.create({
        type: 'student_deleted',
        title: 'Student Deleted',
        message: `Student ${studentEmail} was deleted by admin`,
        data: {
          studentId: studentId,
          studentEmail: studentEmail,
          mentorId: mentorId
        },
        read: false
      });

      res.status(200).json({
        success: true,
        message: 'Student deleted successfully'
      });

    } catch (err) {
      console.error('❌ [DELETE STUDENT] Error:', err);
      next(err);
    }
  }
);

// ===============================
// PATCH /api/academy/admin/students/:id/status
// Смени статус
// ===============================
academyController.patch(
  '/admin/students/:id/status',
  isAuth,
  rbac.checkPermission('student', 'update'),
  async (req, res, next) => {
    try {
      const studentId = parseInt(req.params.id);
      const { status } = req.body;

      const validStatuses = ['active', 'inactive', 'graduated', 'suspended'];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Status must be one of: ${validStatuses.join(', ')}`
        });
      }

      const studentData = await student.findByPk(studentId, {
        include: [
          {
            model: user_account,
            as: 'user',
            attributes: ['id', 'email'],
            include: [
              {
                model: user_details,
                as: 'details',
                attributes: ['username', 'firstName', 'lastName']
              }
            ]
          }
        ]
      });

      if (!studentData) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      const oldStatus = studentData.status;
      await studentData.update({ status });

      const studentName = studentData.user?.details?.username ||
        `${studentData.user?.details?.firstName || ''} ${studentData.user?.details?.lastName || ''}`.trim() ||
        studentData.user?.email?.split('@')[0] ||
        'Unknown';

      await admin_notification.create({
        type: 'student_status_changed',
        title: 'Student Status Changed',
        message: `${studentName}'s status changed from ${oldStatus} to ${status}`,
        data: {
          studentId: studentData.id,
          oldStatus: oldStatus,
          newStatus: status
        },
        read: false
      });

      await user_notification.create({
        userId: studentData.userId,
        type: 'status_changed',
        title: 'Вашият статус е променен',
        message: `Вашият статус е променен на "${status}"`,
        data: {
          oldStatus: oldStatus,
          newStatus: status
        },
        read: false
      });

      res.status(200).json({
        success: true,
        message: 'Student status updated successfully',
        student: studentData
      });

    } catch (err) {
      console.error('❌ [CHANGE STUDENT STATUS] Error:', err);
      next(err);
    }
  }
);
// ===============================
// POST /api/academy/admin/students/:id/assign-mentor
// Присвои/смени ментор на студент
// ===============================
academyController.post(
  '/admin/students/:id/assign-mentor',
  isAuth,
  rbac.checkPermission('student', 'update'),
  async (req, res, next) => {
    try {
      const studentId = parseInt(req.params.id);
      const { newMentorId } = req.body;

      if (!newMentorId) {
        return res.status(400).json({
          success: false,
          message: 'newMentorId is required'
        });
      }

      const { mentor_history, user_details } = require('../sequelize/models/index');

      const studentData = await student.findByPk(studentId, {
        include: [
          {
            model: user_account,
            as: 'user',
            attributes: ['id', 'email'],
            include: [
              {
                model: user_details,
                as: 'details',
                attributes: ['username', 'firstName', 'lastName']
              }
            ]
          }
        ]
      });

      if (!studentData) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      const newMentor = await mentor.findByPk(newMentorId);

      if (!newMentor) {
        return res.status(404).json({
          success: false,
          message: 'Mentor not found'
        });
      }

      const oldMentorId = studentData.currentMentorId;

      // Намали studentsCount на стария ментор
      if (oldMentorId) {
        const oldMentor = await mentor.findByPk(oldMentorId);
        if (oldMentor) {
          await oldMentor.update({
            studentsCount: Math.max(0, oldMentor.studentsCount - 1)
          });

          // Завърши стария history запис
          const oldHistory = await mentor_history.findOne({
            where: {
              studentId: studentData.id,
              periodEnd: null
            },
            order: [['periodStart', 'DESC']]
          });

          if (oldHistory) {
            await oldHistory.update({
              periodEnd: new Date(),
              reason: 'Reassigned to new mentor by admin'
            });
          }
        }
      }

      // Увеличи studentsCount на новия ментор
      await newMentor.update({
        studentsCount: newMentor.studentsCount + 1
      });

      // Обнови студента
      await studentData.update({
        currentMentorId: newMentorId,
        mentorAssignedDate: new Date()
      });

      // Създай нов history запис
      await mentor_history.create({
        studentId: studentData.id,
        mentorId: newMentorId,
        mentorName: newMentor.name,
        periodStart: new Date(),
        periodEnd: null,
        reason: oldMentorId ? 'Reassigned by admin' : 'Initial assignment by admin'
      });

      const studentName = studentData.user?.details?.username ||
        `${studentData.user?.details?.firstName || ''} ${studentData.user?.details?.lastName || ''}`.trim() ||
        studentData.user?.email?.split('@')[0] ||
        'Unknown';

      // Admin notification
      await admin_notification.create({
        type: 'student_mentor_assigned',
        title: 'Mentor Assigned to Student',
        message: `${studentName} was assigned to mentor ${newMentor.name}`,
        data: {
          studentId: studentData.id,
          oldMentorId: oldMentorId,
          newMentorId: newMentorId,
          mentorName: newMentor.name
        },
        read: false
      });

      // User notification (за студента)
      await user_notification.create({
        userId: studentData.userId,
        type: 'mentor_assigned',
        title: 'Вашият ментор е назначен',
        message: `Вашият нов ментор е ${newMentor.name}`,
        data: {
          mentorId: newMentorId,
          mentorName: newMentor.name,
          mentorEmail: newMentor.email,
          mentorPhoto: newMentor.photoUrl
        },
        read: false
      });

      res.status(200).json({
        success: true,
        message: 'Mentor assigned successfully',
        student: studentData
      });

    } catch (err) {
      console.error('❌ [ASSIGN MENTOR] Error:', err);
      next(err);
    }
  }
);
// ===============================
// POST /api/academy/admin/students/:id/assign-mentor
// Присвои ментор
// ===============================
academyController.post(
  '/admin/students/:id/assign-mentor',
  isAuth,
  rbac.checkPermission('student', 'assignMentor'),
  async (req, res, next) => {
    try {
      const studentId = parseInt(req.params.id);
      const { newMentorId } = req.body;

      if (!newMentorId) {
        return res.status(400).json({
          success: false,
          message: 'newMentorId is required'
        });
      }

      const { mentor_history } = require('../sequelize/models/index');

      const studentData = await student.findByPk(studentId, {
        include: [
          {
            model: user_account,
            as: 'user',
            attributes: ['id', 'email'],
            include: [
              {
                model: user_details,
                as: 'details',
                attributes: ['username', 'firstName', 'lastName']
              }
            ]
          }
        ]
      });

      if (!studentData) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      const newMentor = await mentor.findByPk(newMentorId);

      if (!newMentor) {
        return res.status(404).json({
          success: false,
          message: 'Mentor not found'
        });
      }

      const oldMentorId = studentData.currentMentorId;

      if (oldMentorId) {
        const oldMentor = await mentor.findByPk(oldMentorId);
        if (oldMentor) {
          await oldMentor.update({
            studentsCount: Math.max(0, oldMentor.studentsCount - 1)
          });

          const oldHistory = await mentor_history.findOne({
            where: {
              studentId: studentData.id,
              periodEnd: null
            },
            order: [['periodStart', 'DESC']]
          });

          if (oldHistory) {
            await oldHistory.update({
              periodEnd: new Date(),
              reason: 'Reassigned to new mentor by admin'
            });
          }
        }
      }

      await newMentor.update({
        studentsCount: newMentor.studentsCount + 1
      });

      await studentData.update({
        currentMentorId: newMentorId,
        mentorAssignedDate: new Date()
      });

      await mentor_history.create({
        studentId: studentData.id,
        mentorId: newMentorId,
        mentorName: newMentor.name,
        periodStart: new Date(),
        periodEnd: null,
        reason: oldMentorId ? 'Reassigned by admin' : 'Initial assignment by admin'
      });

      const studentName = studentData.user?.details?.username ||
        `${studentData.user?.details?.firstName || ''} ${studentData.user?.details?.lastName || ''}`.trim() ||
        studentData.user?.email?.split('@')[0] ||
        'Unknown';

      await admin_notification.create({
        type: 'student_mentor_assigned',
        title: 'Mentor Assigned to Student',
        message: `${studentName} was assigned to mentor ${newMentor.name}`,
        data: {
          studentId: studentData.id,
          oldMentorId: oldMentorId,
          newMentorId: newMentorId,
          mentorName: newMentor.name
        },
        read: false
      });

      await user_notification.create({
        userId: studentData.userId,
        type: 'mentor_assigned',
        title: 'Вашият ментор е назначен',
        message: `Вашият нов ментор е ${newMentor.name}`,
        data: {
          mentorId: newMentorId,
          mentorName: newMentor.name,
          mentorEmail: newMentor.email,
          mentorPhoto: newMentor.photoUrl
        },
        read: false
      });

      res.status(200).json({
        success: true,
        message: 'Mentor assigned successfully',
        student: studentData
      });

    } catch (err) {
      console.error('❌ [ASSIGN MENTOR] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/admin/students/:id/send-email
// Изпрати имейл
// ===============================
academyController.post(
  '/admin/students/:id/send-email',
  isAuth,
  rbac.checkPermission('student', 'sendEmail'),
  async (req, res, next) => {
    try {
      const studentId = parseInt(req.params.id);
      const { subject, message } = req.body;

      if (!subject || !message) {
        return res.status(400).json({
          success: false,
          message: 'Subject and message are required'
        });
      }

      if (subject.length > 200) {
        return res.status(400).json({
          success: false,
          message: 'Subject must not exceed 200 characters'
        });
      }

      if (message.length > 10000) {
        return res.status(400).json({
          success: false,
          message: 'Message must not exceed 10000 characters'
        });
      }

      const studentData = await student.findByPk(studentId, {
        include: [
          {
            model: user_account,
            as: 'user',
            attributes: ['id', 'email'],
            include: [
              {
                model: user_details,
                as: 'details',
                attributes: ['username', 'firstName', 'lastName']
              }
            ]
          }
        ]
      });

      if (!studentData) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      const studentEmail = studentData.user.email;
      const studentName = studentData.user?.details?.username ||
        `${studentData.user?.details?.firstName || ''} ${studentData.user?.details?.lastName || ''}`.trim() ||
        'Student';

      const emailData = {
        from: 'info@pensa.club',
        to: studentEmail,
        subject: subject,
        message: `Здравейте ${studentName},

${message}

---
С уважение,
DigiBridge Academy Team`
      };

      await admin_notification.create({
        type: 'student_email_sent',
        title: 'Email Sent to Student',
        message: `Email sent to ${studentName}`,
        data: {
          studentId: studentData.id,
          studentEmail: studentEmail,
          subject: subject,
          emailData: emailData
        },
        read: false
      });

      res.status(200).json({
        success: true,
        message: 'Email prepared successfully',
        emailData: emailData
      });

    } catch (err) {
      console.error('❌ [SEND EMAIL TO STUDENT] Error:', err);
      next(err);
    }
  }
);
// ===============================
// ============ ADMIN STUDENT NOTES ============
// ===============================

// ===============================
// GET /api/academy/admin/students/:id/notes
// Вземи админ бележки за студент
// ===============================
academyController.get(
  '/admin/students/:id/notes',
  isAuth,
  rbac.checkPermission('student', 'read'),
  async (req, res, next) => {
    try {
      const studentId = parseInt(req.params.id);

      const { admin_student_note } = require('../sequelize/models/index');

      const studentData = await student.findByPk(studentId);

      if (!studentData) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      const notes = await admin_student_note.findAll({
        where: {
          studentId: studentId
        },
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        notes: notes,
        total: notes.length
      });

    } catch (err) {
      console.error('❌ [GET ADMIN STUDENT NOTES] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/admin/students/:id/notes
// Създай админ бележка
// ===============================
academyController.post(
  '/admin/students/:id/notes',
  isAuth,
  rbac.checkPermission('student', 'update'),
  async (req, res, next) => {
    try {
      const studentId = parseInt(req.params.id);
      const { text } = req.body;

      const { createAdminNoteSchema } = require('../schemas/adminStudentNotes.schema');
      const { admin_student_note } = require('../sequelize/models/index');

      const validationResult = createAdminNoteSchema.safeParse({ text });

      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationResult.error.errors
        });
      }

      const studentData = await student.findByPk(studentId);

      if (!studentData) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      const newNote = await admin_student_note.create({
        studentId: studentId,
        text: validationResult.data.text
      });

      await admin_notification.create({
        type: 'admin_note_created',
        title: 'Admin Note Created',
        message: `Admin note added for student`,
        data: {
          studentId: studentId,
          noteId: newNote.id
        },
        read: false
      });

      res.status(201).json({
        success: true,
        message: 'Admin note created successfully',
        note: newNote
      });

    } catch (err) {
      console.error('❌ [CREATE ADMIN NOTE] Error:', err);
      next(err);
    }
  }
);

// ===============================
// PATCH /api/academy/admin/students/:id/notes/:noteId
// Редактирай админ бележка
// ===============================
academyController.patch(
  '/admin/students/:id/notes/:noteId',
  isAuth,
  rbac.checkPermission('student', 'update'),
  async (req, res, next) => {
    try {
      const studentId = parseInt(req.params.id);
      const noteId = parseInt(req.params.noteId);
      const { text } = req.body;

      const { updateAdminNoteSchema } = require('../schemas/adminStudentNotes.schema');
      const { admin_student_note } = require('../sequelize/models/index');

      const validationResult = updateAdminNoteSchema.safeParse({ text });

      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationResult.error.errors
        });
      }

      const note = await admin_student_note.findOne({
        where: {
          id: noteId,
          studentId: studentId
        }
      });

      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Admin note not found'
        });
      }

      await note.update({
        text: validationResult.data.text
      });

      res.status(200).json({
        success: true,
        message: 'Admin note updated successfully',
        note: note
      });

    } catch (err) {
      console.error('❌ [UPDATE ADMIN NOTE] Error:', err);
      next(err);
    }
  }
);

// ===============================
// DELETE /api/academy/admin/students/:id/notes/:noteId
// Изтрий админ бележка
// ===============================
academyController.delete(
  '/admin/students/:id/notes/:noteId',
  isAuth,
  rbac.checkPermission('student', 'update'),
  async (req, res, next) => {
    try {
      const studentId = parseInt(req.params.id);
      const noteId = parseInt(req.params.noteId);

      const { admin_student_note } = require('../sequelize/models/index');

      const note = await admin_student_note.findOne({
        where: {
          id: noteId,
          studentId: studentId
        }
      });

      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Admin note not found'
        });
      }

      await note.destroy();

      res.status(200).json({
        success: true,
        message: 'Admin note deleted successfully'
      });

    } catch (err) {
      console.error('❌ [DELETE ADMIN NOTE] Error:', err);
      next(err);
    }
  }
);
// ===============================
// ============ STUDENT STATISTICS ============
// ===============================

// ===============================
// GET /api/academy/admin/students/statistics/overview
// Overview статистики за студенти
// ===============================
academyController.get(
  '/admin/students/statistics/overview',
  isAuth,
  rbac.checkPermission('student', 'read'),
  async (req, res, next) => {
    try {
      const { student_course, student_lecture, student_seminar, student_presentation } = require('../sequelize/models/index');

      // 1. Общ брой студенти
      const totalStudents = await student.count();

      // 2. Активни студенти
      const activeStudents = await student.count({
        where: { status: 'active' }
      });

      // 3. Студенти с ментор
      const studentsWithMentor = await student.count({
        where: {
          currentMentorId: {
            [Op.ne]: null
          }
        }
      });

      // 4. Общи кредити
      const creditsData = await student.findAll({
        attributes: [
          [sequelize.fn('SUM', sequelize.col('total_credits_earned')), 'totalCredits'],
          [sequelize.fn('AVG', sequelize.col('total_credits_earned')), 'avgCredits']
        ],
        raw: true
      });

      const totalCreditsEarned = parseInt(creditsData[0].totalCredits) || 0;
      const averageCreditsPerStudent = parseFloat(creditsData[0].avgCredits) || 0;

      // 5. Общо посещения
      const attendanceData = await student.findAll({
        attributes: [
          [sequelize.fn('SUM', sequelize.col('attended_sessions')), 'totalAttended'],
          [sequelize.fn('SUM', sequelize.col('total_scheduled_sessions')), 'totalScheduled']
        ],
        raw: true
      });

      const totalAttendedSessions = parseInt(attendanceData[0].totalAttended) || 0;
      const totalScheduledSessions = parseInt(attendanceData[0].totalScheduled) || 0;

      const averageAttendanceRate = totalScheduledSessions > 0
        ? Math.round((totalAttendedSessions / totalScheduledSessions) * 100)
        : 0;

      // 6. Активни курсове
      const activeCourses = await student_course.count({
        where: {
          status: 'in_progress'
        }
      });

      // 7. Завършени курсове
      const completedCourses = await student_course.count({
        where: {
          status: 'completed'
        }
      });

      // 8. Среден прогрес
      const progressData = await student_course.findAll({
        attributes: [
          [sequelize.fn('AVG', sequelize.col('progress')), 'avgProgress']
        ],
        where: {
          status: 'in_progress'
        },
        raw: true
      });

      const averageProgress = Math.round(parseFloat(progressData[0].avgProgress) || 0);

      res.status(200).json({
        success: true,
        stats: {
          totalStudents,
          activeStudents,
          studentsWithMentor,
          totalCreditsEarned,
          averageCreditsPerStudent: Math.round(averageCreditsPerStudent),
          totalAttendedSessions,
          totalScheduledSessions,
          averageAttendanceRate,
          activeCourses,
          completedCourses,
          averageProgress
        }
      });

    } catch (err) {
      console.error('❌ [STUDENT STATISTICS OVERVIEW] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/admin/students/statistics/by-status
// Студенти по статус
// ===============================
academyController.get(
  '/admin/students/statistics/by-status',
  isAuth,
  rbac.checkPermission('student', 'read'),
  async (req, res, next) => {
    try {
      const statistics = await student.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      });

      const formattedStats = statistics.map(stat => ({
        status: stat.status,
        count: parseInt(stat.count)
      }));

      res.status(200).json({
        success: true,
        statistics: formattedStats
      });

    } catch (err) {
      console.error('❌ [STUDENTS BY STATUS] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/admin/students/statistics/by-mentor
// Студенти по ментор
// ===============================
academyController.get(
  '/admin/students/statistics/by-mentor',
  isAuth,
  rbac.checkPermission('student', 'read'),
  async (req, res, next) => {
    try {
      const statistics = await student.findAll({
        attributes: [
          'currentMentorId',
          [sequelize.fn('COUNT', sequelize.col('student.id')), 'count']
        ],
        include: [
          {
            model: mentor,
            as: 'currentMentor',
            attributes: ['id', 'name', 'photoUrl'],
            required: false
          }
        ],
        where: {
          currentMentorId: {
            [Op.ne]: null
          }
        },
        group: ['currentMentorId', 'currentMentor.id', 'currentMentor.name', 'currentMentor.photoUrl'],
        raw: false
      });

      const formattedStats = statistics.map(stat => {
        const statData = stat.get({ plain: true });
        return {
          mentorId: statData.currentMentorId,
          mentorName: statData.currentMentor?.name || 'Unknown',
          mentorPhoto: statData.currentMentor?.photoUrl || null,
          studentCount: parseInt(statData.count)
        };
      });

      res.status(200).json({
        success: true,
        statistics: formattedStats
      });

    } catch (err) {
      console.error('❌ [STUDENTS BY MENTOR] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/admin/students/statistics/credits-distribution
// Разпределение на кредити
// ===============================
academyController.get(
  '/admin/students/statistics/credits-distribution',
  isAuth,
  rbac.checkPermission('student', 'read'),
  async (req, res, next) => {
    try {
      const students = await student.findAll({
        attributes: ['totalCreditsEarned'],
        raw: true
      });

      const ranges = {
        '0-50': 0,
        '51-100': 0,
        '101-200': 0,
        '201-300': 0,
        '300+': 0
      };

      students.forEach(s => {
        const credits = s.totalCreditsEarned || 0;
        if (credits <= 50) ranges['0-50']++;
        else if (credits <= 100) ranges['51-100']++;
        else if (credits <= 200) ranges['101-200']++;
        else if (credits <= 300) ranges['201-300']++;
        else ranges['300+']++;
      });

      res.status(200).json({
        success: true,
        distribution: ranges
      });

    } catch (err) {
      console.error('❌ [CREDITS DISTRIBUTION] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/admin/students/statistics/attendance-trends
// Attendance trends (последните 6 месеца)
// ===============================
academyController.get(
  '/admin/students/statistics/attendance-trends',
  isAuth,
  rbac.checkPermission('student', 'read'),
  async (req, res, next) => {
    try {
      // TODO: Implement historical tracking
      // За сега връщаме текущите данни
      const currentData = await student.findAll({
        attributes: [
          [sequelize.fn('SUM', sequelize.col('attended_sessions')), 'totalAttended'],
          [sequelize.fn('SUM', sequelize.col('total_scheduled_sessions')), 'totalScheduled']
        ],
        raw: true
      });

      const totalAttended = parseInt(currentData[0].totalAttended) || 0;
      const totalScheduled = parseInt(currentData[0].totalScheduled) || 0;
      const rate = totalScheduled > 0 ? Math.round((totalAttended / totalScheduled) * 100) : 0;

      const currentMonth = new Date().toISOString().slice(0, 7);

      res.status(200).json({
        success: true,
        trends: [
          {
            month: currentMonth,
            attendanceRate: rate,
            totalAttended: totalAttended,
            totalScheduled: totalScheduled
          }
        ]
      });

    } catch (err) {
      console.error('❌ [ATTENDANCE TRENDS] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/admin/students/statistics/top-performers
// Топ студенти
// ===============================
academyController.get(
  '/admin/students/statistics/top-performers',
  isAuth,
  rbac.checkPermission('student', 'read'),
  async (req, res, next) => {
    try {
      const { limit = 10 } = req.query;

      const topStudents = await student.findAll({
        attributes: [
          'id',
          'userId',
          'avatar',
          'totalCreditsEarned',
          'attendedSessions',
          'totalScheduledSessions'
        ],
        include: [
          {
            model: user_account,
            as: 'user',
            attributes: ['email'],
            include: [
              {
                model: user_details,
                as: 'details',
                attributes: ['username', 'firstName', 'lastName', 'imageURL']
              }
            ]
          },
          {
            model: mentor,
            as: 'currentMentor',
            attributes: ['id', 'name']
          }
        ],
        order: [['totalCreditsEarned', 'DESC']],
        limit: parseInt(limit),
        raw: false
      });

      const formattedStudents = topStudents.map(s => {
        const studentData = s.get({ plain: true });
        const name = studentData.user?.details?.username ||
          `${studentData.user?.details?.firstName || ''} ${studentData.user?.details?.lastName || ''}`.trim() ||
          studentData.user?.email?.split('@')[0] ||
          'Unknown';

        const attendanceRate = studentData.totalScheduledSessions > 0
          ? Math.round((studentData.attendedSessions / studentData.totalScheduledSessions) * 100)
          : 0;

        return {
          id: studentData.id,
          name: name,
          avatar: studentData.avatar || studentData.user?.details?.imageURL || null,
          totalCredits: studentData.totalCreditsEarned || 0,
          attendanceRate: attendanceRate,
          mentorName: studentData.currentMentor?.name || 'No mentor'
        };
      });

      res.status(200).json({
        success: true,
        topPerformers: formattedStudents
      });

    } catch (err) {
      console.error('❌ [TOP PERFORMERS] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/admin/students/statistics/engagement
// Student engagement метрики
// ===============================
academyController.get(
  '/admin/students/statistics/engagement',
  isAuth,
  rbac.checkPermission('student', 'read'),
  async (req, res, next) => {
    try {
      const totalStudents = await student.count();

      const activeLastWeek = await student.count({
        where: {
          lastActiveAt: {
            [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      });

      const activeLastMonth = await student.count({
        where: {
          lastActiveAt: {
            [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      });

      const chatSessionsData = await student.findAll({
        attributes: [
          [sequelize.fn('SUM', sequelize.col('total_chat_sessions')), 'totalChats'],
          [sequelize.fn('AVG', sequelize.col('total_chat_sessions')), 'avgChats']
        ],
        raw: true
      });

      const totalChatSessions = parseInt(chatSessionsData[0].totalChats) || 0;
      const averageChatsPerStudent = parseFloat(chatSessionsData[0].avgChats) || 0;

      res.status(200).json({
        success: true,
        engagement: {
          totalStudents,
          activeLastWeek,
          activeLastMonth,
          weeklyEngagementRate: totalStudents > 0 ? Math.round((activeLastWeek / totalStudents) * 100) : 0,
          monthlyEngagementRate: totalStudents > 0 ? Math.round((activeLastMonth / totalStudents) * 100) : 0,
          totalChatSessions,
          averageChatsPerStudent: Math.round(averageChatsPerStudent)
        }
      });

    } catch (err) {
      console.error('❌ [ENGAGEMENT] Error:', err);
      next(err);
    }
  }
);
module.exports = academyController;