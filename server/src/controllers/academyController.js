
const academyController = require('express').Router();

const { mentor_application, mentor, mentor_course, user_account } = require('../sequelize/models/index');
const isAuth = require('../middlewares/isAuth.js');
const rbac = require('../middlewares/rbac.js');
const { mentorApplicationSchema } = require('../schemas/mentorApplication.schema');



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
    // Валидирам с Zod
    const validationResult = mentorApplicationSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      throw validationResult.error;
    }

    const userId = req.user.userId;

    // Проверявам дали user вече има pending или approved кандидатура
    
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

module.exports = academyController;