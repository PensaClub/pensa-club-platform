
const academyController = require('express').Router();
const { Op } = require('sequelize');

const { mentor_application, mentor, mentor_course, user_account, admin_notification, sequelize } = require('../sequelize/models/index');
const isAuth = require('../middlewares/isAuth.js');
const rbac = require('../middlewares/rbac.js');
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
        { role: 'mentor' },
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
        { role: 'user' },
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
academyController.get(
  '/mentors/applications/pending', 
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
academyController.get(
  '/mentors/applications/rejected',
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
academyController.post(
  '/mentors/applications/:applicationId/approve',
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
          { role: 'mentor' },
          { where: { id: application.userId } }
        );
      }

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
// ===============================
// GET /api/academy/mentors/statistics/overview
// Dashboard Overview Cards
// ===============================
academyController.get(
  '/mentors/statistics/overview',
  isAuth,
  rbac.checkPermission('mentor', 'read'),
  async (req, res, next) => {
    try {
      // Брой активни ментори
      const activeMentors = await mentor.count({
        where: { status: 'active' }
      });

      // Общ брой ментори
      const totalMentors = await mentor.count();

      // Общ брой студенти
      const mentorsData = await mentor.findAll({
        attributes: [[sequelize.fn('SUM', sequelize.col('students_count')), 'totalStudents']]
      });
      const totalStudents = parseInt(mentorsData[0].dataValues.totalStudents) || 0;

      // Средна оценка
      const ratingData = await mentor.findAll({
        attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']]
      });
      const averageRating = parseFloat(ratingData[0].dataValues.avgRating) || 0;

      // Завършени курсове
      const coursesData = await mentor_course.findAll({
        attributes: [[sequelize.fn('SUM', sequelize.col('completed_count')), 'totalCompleted']]
      });
      const totalCoursesCompleted = parseInt(coursesData[0].dataValues.totalCompleted) || 0;

      // Активни курсове
      const totalCoursesActive = await mentor_course.count({
        where: { status: 'active' }
      });

      // Общ брой сесии (от mentors таблица)
      const sessionsData = await mentor.findAll({
        attributes: [[sequelize.fn('SUM', sequelize.col('sessions_count')), 'totalSessions']]
      });
      const totalSessionsThisMonth = parseInt(sessionsData[0].dataValues.totalSessions) || 0;

      // Online hours (засега 0, чака ФАЗА 2)
      const totalOnlineHours = 0;

      // Completion rate (засега средна стойност)
      const averageCompletionRate = 95;

      // Общ брой отзиви (засега 0)
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
          totalOnlineHours,
          averageCompletionRate,
          totalReviews
        }
      });

    } catch (err) {
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
  rbac.checkPermission('mentor', 'read'),
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
  isAuth,
  rbac.checkPermission('mentor', 'read'),
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

// ===============================
// GET /api/academy/mentors/:id/firebase-stats
// Детайлни Firebase статистики за конкретен ментор
// ===============================
academyController.get(
  '/mentors/:id/firebase-stats',
  isAuth,
  rbac.checkPermission('mentor', 'read'),
  async (req, res, next) => {
    try {
      const mentorId = parseInt(req.params.id);
      
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
  rbac.checkPermission('mentor', 'update'),
  async (req, res, next) => {
    try {
      const mentorId = parseInt(req.params.id);

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
  rbac.checkPermission('mentor', 'read'),
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
  rbac.checkPermission('mentor', 'read'),
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
  rbac.checkPermission('mentor', 'read'),
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
  rbac.checkPermission('mentor', 'read'),
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
  rbac.checkPermission('mentor', 'read'),
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
  rbac.checkPermission('mentor', 'read'),
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
module.exports = academyController;