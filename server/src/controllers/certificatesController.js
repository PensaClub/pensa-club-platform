// server/src/controllers/certificatesController.js

const certificatesController = require('express').Router();
const { Op } = require('sequelize');
const crypto = require('crypto');

const {
  certificate,
  course_enrollment,
  course,
  student,
  mentor,
  user_account,
  user_details,
  sequelize,
} = require('../sequelize/models/index');

const { validateBody, validateQuery } = require('../middlewares/validateRequest');
const {
  paginationSchema,
  certificateCreateSchema,
  certificateUpdateSchema,
  certificateGenerateSchema,
  certificateBulkGenerateSchema,
  certificateRevokeSchema,
} = require('../schemas/academySchemas');

const isAuth = require('../middlewares/isAuth.js');
const rbac = require('../middlewares/rbac.js');

// Local query schemas
const { z } = require('zod');

const myCertificatesQuerySchema = paginationSchema.extend({
  status: z.enum(['active', 'revoked', 'expired', 'all']).default('all'),
});

const adminCertificatesQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  status: z.enum(['active', 'revoked', 'expired', 'all']).default('all'),
  courseId: z.coerce.number().int().positive().optional(),
});

// ===============================
// HELPER: Generate unique certificate number
// ===============================
const generateCertificateNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `CERT-${timestamp}-${random}`;
};

// ===============================
// HELPER: Generate verification code
// ===============================
const generateVerificationCode = () => {
  return crypto.randomBytes(16).toString('hex');
};

// ===============================
// HELPER: Get student by userId
// ===============================
const getStudentByUserId = async (userId) => {
  return await student.findOne({
    where: { userId },
  });
};

// ===============================
// HELPER: Get student full name
// ===============================
const getStudentFullName = async (studentId) => {
  const studentData = await student.findByPk(studentId, {
    include: [
      {
        model: user_account,
        as: 'user',
        include: [
          {
            model: user_details,
            as: 'details',
          },
        ],
      },
    ],
  });

  if (!studentData) return 'Unknown';

  const details = studentData.user?.details;
  if (details?.firstName && details?.lastName) {
    return `${details.firstName} ${details.lastName}`;
  }
  if (details?.username) {
    return details.username;
  }
  return studentData.user?.email?.split('@')[0] || 'Unknown';
};

// =========================================================
//                    PUBLIC ENDPOINTS
// =========================================================

// ===============================
// GET /api/academy/certificates/verify/:code
// Публична верификация на сертификат
// ===============================
certificatesController.get('/verify/:code', async (req, res, next) => {
  try {
    const { code } = req.params;

    const cert = await certificate.findOne({
      where: {
        [Op.or]: [
          { certificateNumber: code },
          { verificationCode: code },
        ],
      },
      include: [
        {
          model: course,
          as: 'course',
          attributes: ['id', 'name', 'slug', 'category', 'difficultyLevel'],
        },
        {
          model: student,
          as: 'student',
          include: [
            {
              model: user_account,
              as: 'user',
              attributes: ['email'],
              include: [
                {
                  model: user_details,
                  as: 'details',
                  attributes: ['firstName', 'lastName', 'username'],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!cert) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: 'Certificate not found',
      });
    }

    if (cert.status === 'revoked') {
      return res.status(200).json({
        success: true,
        valid: false,
        message: 'This certificate has been revoked',
        revokedAt: cert.revokedAt,
        revokeReason: cert.revokeReason,
      });
    }

    if (cert.expiresAt && new Date(cert.expiresAt) < new Date()) {
      return res.status(200).json({
        success: true,
        valid: false,
        message: 'This certificate has expired',
        expiredAt: cert.expiresAt,
      });
    }

    const details = cert.student?.user?.details;
    const recipientName =
      cert.recipientName ||
      (details?.firstName && details?.lastName
        ? `${details.firstName} ${details.lastName}`
        : details?.username || 'Unknown');

    res.status(200).json({
      success: true,
      valid: true,
      certificate: {
        certificateNumber: cert.certificateNumber,
        recipientName,
        courseName: cert.course?.name,
        courseCategory: cert.course?.category,
        courseDifficulty: cert.course?.difficultyLevel,
        issuedAt: cert.issuedAt,
        expiresAt: cert.expiresAt,
        grade: cert.grade,
        finalScore: cert.finalScore,
        creditsEarned: cert.creditsEarned,
        completionDate: cert.completionDate,
      },
    });
  } catch (err) {
    console.error('❌ [VERIFY CERTIFICATE] Error:', err);
    next(err);
  }
});

// =========================================================
//                    STUDENT ENDPOINTS
// =========================================================

// ===============================
// GET /api/academy/certificates/my
// Моите сертификати
// ===============================
certificatesController.get(
  '/my',
  isAuth,
  validateQuery(myCertificatesQuerySchema),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const { page, limit, status } = req.query;

      const offset = (page - 1) * limit;

      const studentData = await getStudentByUserId(userId);

      if (!studentData) {
        return res.status(200).json({
          success: true,
          certificates: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        });
      }

      const where = { studentId: studentData.id };

      if (status && status !== 'all') {
        where.status = status;
      }

      const { count, rows: certificates } = await certificate.findAndCountAll({
        where,
        include: [
          {
            model: course,
            as: 'course',
            attributes: ['id', 'name', 'slug', 'thumbnailUrl', 'category', 'difficultyLevel'],
          },
        ],
        limit,
        offset,
        order: [['issuedAt', 'DESC']],
        distinct: true,
      });

      const totalPages = Math.ceil(count / limit);

      res.status(200).json({
        success: true,
        certificates,
        pagination: {
          page,
          limit,
          total: count,
          totalPages,
        },
      });
    } catch (err) {
      console.error('❌ [GET MY CERTIFICATES] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/certificates/my/:id
// Детайли за мой сертификат
// ===============================
certificatesController.get('/my/:id', isAuth, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const certId = parseInt(req.params.id);

    const studentData = await getStudentByUserId(userId);

    if (!studentData) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    const cert = await certificate.findOne({
      where: {
        id: certId,
        studentId: studentData.id,
      },
      include: [
        {
          model: course,
          as: 'course',
          attributes: ['id', 'name', 'slug', 'thumbnailUrl', 'category', 'difficultyLevel', 'description'],
        },
        {
          model: course_enrollment,
          as: 'enrollment',
          attributes: ['enrolledAt', 'completedAt', 'progressPercentage', 'totalCreditsEarned'],
        },
      ],
    });

    if (!cert) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      });
    }

    res.status(200).json({
      success: true,
      certificate: cert,
    });
  } catch (err) {
    console.error('❌ [GET MY CERTIFICATE] Error:', err);
    next(err);
  }
});

// ===============================
// GET /api/academy/certificates/my/:id/download
// Сваляне на сертификат (URL за PDF)
// ===============================
certificatesController.get('/my/:id/download', isAuth, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const certId = parseInt(req.params.id);

    const studentData = await getStudentByUserId(userId);

    if (!studentData) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    const cert = await certificate.findOne({
      where: {
        id: certId,
        studentId: studentData.id,
        status: 'active',
      },
    });

    if (!cert) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found or not active',
      });
    }

    if (cert.pdfUrl) {
      return res.status(200).json({
        success: true,
        downloadUrl: cert.pdfUrl,
      });
    }

    return res.status(404).json({
      success: false,
      message: 'PDF not available yet',
    });
  } catch (err) {
    console.error('❌ [DOWNLOAD CERTIFICATE] Error:', err);
    next(err);
  }
});

// =========================================================
//                    STATISTICS (must be before /:id)
// =========================================================

// ===============================
// GET /api/academy/certificates/stats/overview
// Статистики за сертификати
// ===============================
certificatesController.get(
  '/stats/overview',
  isAuth,
  rbac.checkPermission('certificate', 'read'),
  async (req, res, next) => {
    try {
      const { courseId } = req.query;

      const where = {};
      if (courseId) {
        where.courseId = parseInt(courseId);
      }

      const totalCertificates = await certificate.count({ where });

      const activeCertificates = await certificate.count({
        where: { ...where, status: 'active' },
      });

      const revokedCertificates = await certificate.count({
        where: { ...where, status: 'revoked' },
      });

      const expiredCertificates = await certificate.count({
        where: {
          ...where,
          status: 'active',
          expiresAt: { [Op.lt]: new Date() },
        },
      });

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const issuedThisMonth = await certificate.count({
        where: {
          ...where,
          issuedAt: { [Op.gte]: startOfMonth },
        },
      });

      const gradeDistribution = await certificate.findAll({
        where: { ...where, status: 'active' },
        attributes: [
          'grade',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        group: ['grade'],
        raw: true,
      });

      const topCourses = await certificate.findAll({
        where: { status: 'active' },
        attributes: [
          'courseId',
          [sequelize.fn('COUNT', sequelize.col('certificate.id')), 'count'],
        ],
        include: [
          {
            model: course,
            as: 'course',
            attributes: ['name'],
          },
        ],
        group: ['courseId', 'course.id'],
        order: [[sequelize.fn('COUNT', sequelize.col('certificate.id')), 'DESC']],
        limit: 5,
        raw: true,
      });

      res.status(200).json({
        success: true,
        statistics: {
          total: totalCertificates,
          active: activeCertificates,
          revoked: revokedCertificates,
          expired: expiredCertificates,
          issuedThisMonth,
          gradeDistribution: gradeDistribution.reduce((acc, g) => {
            acc[g.grade || 'Unknown'] = parseInt(g.count);
            return acc;
          }, {}),
          topCourses: topCourses.map((c) => ({
            courseId: c.courseId,
            courseName: c['course.name'],
            count: parseInt(c.count),
          })),
        },
      });
    } catch (err) {
      console.error('❌ [GET CERTIFICATE STATS] Error:', err);
      next(err);
    }
  }
);

// =========================================================
//                    ADMIN ENDPOINTS
// =========================================================

// ===============================
// GET /api/academy/certificates
// Списък с всички сертификати (admin)
// ===============================
certificatesController.get(
  '/',
  isAuth,
  rbac.checkPermission('certificate', 'read'),
  validateQuery(adminCertificatesQuerySchema),
  async (req, res, next) => {
    try {
      const { page, limit, search, status, courseId } = req.query;

      const offset = (page - 1) * limit;

      const where = {};

      if (status && status !== 'all') {
        where.status = status;
      }

      if (courseId) {
        where.courseId = courseId;
      }

      if (search) {
        where[Op.or] = [
          { certificateNumber: { [Op.iLike]: `%${search}%` } },
          { recipientName: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const { count, rows: certificates } = await certificate.findAndCountAll({
        where,
        include: [
          {
            model: course,
            as: 'course',
            attributes: ['id', 'name', 'slug'],
          },
          {
            model: student,
            as: 'student',
            include: [
              {
                model: user_account,
                as: 'user',
                attributes: ['email'],
                include: [
                  {
                    model: user_details,
                    as: 'details',
                    attributes: ['firstName', 'lastName', 'username'],
                  },
                ],
              },
            ],
          },
          {
            model: user_account,
            as: 'issuer',
            attributes: ['email'],
          },
        ],
        limit,
        offset,
        order: [['issuedAt', 'DESC']],
        distinct: true,
      });

      const totalPages = Math.ceil(count / limit);

      const formattedCertificates = certificates.map((c) => {
        const data = c.get({ plain: true });
        const studentData = data.student;
        const userDetails = studentData?.user?.details || {};

        return {
          id: data.id,
          certificateNumber: data.certificateNumber,
          studentId: data.studentId,
          studentName:
            data.recipientName ||
            (userDetails.firstName && userDetails.lastName
              ? `${userDetails.firstName} ${userDetails.lastName}`
              : userDetails.username || studentData?.user?.email?.split('@')[0] || 'Unknown'),
          studentEmail: studentData?.user?.email,
          courseName: data.course?.name,
          courseId: data.courseId,
          status: data.status,
          grade: data.grade,
          finalScore: data.finalScore,
          issuedAt: data.issuedAt,
          expiresAt: data.expiresAt,
          issuerEmail: data.issuer?.email,
        };
      });

      res.status(200).json({
        success: true,
        certificates: formattedCertificates,
        pagination: {
          page,
          limit,
          total: count,
          totalPages,
        },
      });
    } catch (err) {
      console.error('❌ [GET ALL CERTIFICATES] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/certificates/:id
// Детайли за сертификат (admin)
// ===============================
certificatesController.get(
  '/:id',
  isAuth,
  rbac.checkPermission('certificate', 'read'),
  async (req, res, next) => {
    try {
      const certId = parseInt(req.params.id);

      const cert = await certificate.findByPk(certId, {
        include: [
          {
            model: course,
            as: 'course',
          },
          {
            model: student,
            as: 'student',
            include: [
              {
                model: user_account,
                as: 'user',
                attributes: ['email'],
                include: [
                  {
                    model: user_details,
                    as: 'details',
                  },
                ],
              },
            ],
          },
          {
            model: course_enrollment,
            as: 'enrollment',
          },
          {
            model: user_account,
            as: 'issuer',
            attributes: ['id', 'email'],
          },
          {
            model: user_account,
            as: 'revoker',
            attributes: ['id', 'email'],
          },
        ],
      });

      if (!cert) {
        return res.status(404).json({
          success: false,
          message: 'Certificate not found',
        });
      }

      res.status(200).json({
        success: true,
        certificate: cert,
      });
    } catch (err) {
      console.error('❌ [GET CERTIFICATE] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/certificates
// Ръчно издаване на сертификат
// ===============================
certificatesController.post(
  '/',
  isAuth,
  rbac.checkPermission('certificate', 'create'),
  validateBody(certificateCreateSchema),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;

      const {
        studentId,
        courseId,
        enrollmentId,
        recipientName,
        grade,
        finalScore,
        creditsEarned,
        completionDate,
        expiresAt,
        notes,
      } = req.body;

      const studentData = await student.findByPk(studentId);
      if (!studentData) {
        return res.status(404).json({
          success: false,
          message: 'Student not found',
        });
      }

      const courseData = await course.findByPk(courseId);
      if (!courseData) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        });
      }

      if (enrollmentId) {
        const existingCert = await certificate.findOne({
          where: {
            enrollmentId,
            status: 'active',
          },
        });

        if (existingCert) {
          return res.status(400).json({
            success: false,
            message: 'Active certificate already exists for this enrollment',
            certificate: existingCert,
          });
        }
      }

      const finalRecipientName = recipientName || (await getStudentFullName(studentId));

      const cert = await certificate.create({
        studentId,
        courseId,
        enrollmentId: enrollmentId || null,
        issuedBy: userId,
        certificateNumber: generateCertificateNumber(),
        verificationCode: generateVerificationCode(),
        recipientName: finalRecipientName,
        courseName: courseData.name,
        grade,
        finalScore,
        creditsEarned,
        completionDate: completionDate || new Date(),
        issuedAt: new Date(),
        expiresAt: expiresAt || null,
        status: 'active',
        notes,
      });

      res.status(201).json({
        success: true,
        message: 'Certificate issued successfully',
        certificate: cert,
      });
    } catch (err) {
      console.error('❌ [CREATE CERTIFICATE] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/certificates/generate/:enrollmentId
// Автоматично генериране на сертификат от enrollment
// ===============================
certificatesController.post(
  '/generate/:enrollmentId',
  isAuth,
  rbac.checkPermission('certificate', 'create'),
  validateBody(certificateGenerateSchema),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const enrollmentId = parseInt(req.params.enrollmentId);

      const { expiresAt, notes } = req.body;

      const enrollment = await course_enrollment.findByPk(enrollmentId, {
        include: [
          {
            model: course,
            as: 'course',
          },
          {
            model: student,
            as: 'student',
          },
        ],
      });

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment not found',
        });
      }

      if (enrollment.status !== 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Cannot generate certificate for incomplete enrollment',
        });
      }

      if (!enrollment.course.hasCertificate) {
        return res.status(400).json({
          success: false,
          message: 'This course does not offer certificates',
        });
      }

      const existingCert = await certificate.findOne({
        where: {
          enrollmentId,
          status: 'active',
        },
      });

      if (existingCert) {
        return res.status(400).json({
          success: false,
          message: 'Certificate already exists for this enrollment',
          certificate: existingCert,
        });
      }

      const recipientName = await getStudentFullName(enrollment.studentId);

      let grade = 'Pass';
      const score = enrollment.progressPercentage || 0;
      if (score >= 90) grade = 'Excellent';
      else if (score >= 75) grade = 'Very Good';
      else if (score >= 60) grade = 'Good';

      const cert = await certificate.create({
        studentId: enrollment.studentId,
        courseId: enrollment.courseId,
        enrollmentId,
        issuedBy: userId,
        certificateNumber: generateCertificateNumber(),
        verificationCode: generateVerificationCode(),
        recipientName,
        courseName: enrollment.course.name,
        grade,
        finalScore: score,
        creditsEarned: enrollment.totalCreditsEarned || 0,
        completionDate: enrollment.completedAt || new Date(),
        issuedAt: new Date(),
        expiresAt: expiresAt || null,
        status: 'active',
        notes,
      });

      await enrollment.update({
        certificateId: cert.id,
        certificateIssuedAt: new Date(),
      });

      res.status(201).json({
        success: true,
        message: 'Certificate generated successfully',
        certificate: cert,
      });
    } catch (err) {
      console.error('❌ [GENERATE CERTIFICATE] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/certificates/bulk-generate
// Bulk генериране за всички завършили курс
// ===============================
certificatesController.post(
  '/bulk-generate',
  isAuth,
  rbac.checkPermission('certificate', 'create'),
  validateBody(certificateBulkGenerateSchema),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const { courseId, expiresAt } = req.body;

      const courseData = await course.findByPk(courseId);
      if (!courseData) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        });
      }

      if (!courseData.hasCertificate) {
        return res.status(400).json({
          success: false,
          message: 'This course does not offer certificates',
        });
      }

      const enrollments = await course_enrollment.findAll({
        where: {
          courseId,
          status: 'completed',
          certificateId: null,
        },
        include: [
          {
            model: student,
            as: 'student',
          },
        ],
      });

      if (enrollments.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'No eligible enrollments found',
          generated: 0,
        });
      }

      const generated = [];
      const errors = [];

      for (const enrollment of enrollments) {
        try {
          const recipientName = await getStudentFullName(enrollment.studentId);

          let grade = 'Pass';
          const score = enrollment.progressPercentage || 0;
          if (score >= 90) grade = 'Excellent';
          else if (score >= 75) grade = 'Very Good';
          else if (score >= 60) grade = 'Good';

          const cert = await certificate.create({
            studentId: enrollment.studentId,
            courseId,
            enrollmentId: enrollment.id,
            issuedBy: userId,
            certificateNumber: generateCertificateNumber(),
            verificationCode: generateVerificationCode(),
            recipientName,
            courseName: courseData.name,
            grade,
            finalScore: score,
            creditsEarned: enrollment.totalCreditsEarned || 0,
            completionDate: enrollment.completedAt || new Date(),
            issuedAt: new Date(),
            expiresAt: expiresAt || null,
            status: 'active',
          });

          await enrollment.update({
            certificateId: cert.id,
            certificateIssuedAt: new Date(),
          });

          generated.push(cert.id);
        } catch (error) {
          errors.push({
            enrollmentId: enrollment.id,
            error: error.message,
          });
        }
      }

      res.status(200).json({
        success: true,
        message: `Generated ${generated.length} certificates`,
        generated: generated.length,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (err) {
      console.error('❌ [BULK GENERATE CERTIFICATES] Error:', err);
      next(err);
    }
  }
);

// ===============================
// PUT /api/academy/certificates/:id
// Редактиране на сертификат
// ===============================
certificatesController.put(
  '/:id',
  isAuth,
  rbac.checkPermission('certificate', 'create'),
  validateBody(certificateUpdateSchema),
  async (req, res, next) => {
    try {
      const certId = parseInt(req.params.id);
      const updates = req.body;

      const cert = await certificate.findByPk(certId);

      if (!cert) {
        return res.status(404).json({
          success: false,
          message: 'Certificate not found',
        });
      }

      if (cert.status === 'revoked') {
        return res.status(400).json({
          success: false,
          message: 'Cannot edit a revoked certificate',
        });
      }

      await cert.update(updates);

      res.status(200).json({
        success: true,
        message: 'Certificate updated successfully',
        certificate: cert,
      });
    } catch (err) {
      console.error('❌ [UPDATE CERTIFICATE] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/certificates/:id/revoke
// Отмяна на сертификат
// ===============================
certificatesController.post(
  '/:id/revoke',
  isAuth,
  rbac.checkPermission('certificate', 'revoke'),
  validateBody(certificateRevokeSchema),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const certId = parseInt(req.params.id);
      const { reason } = req.body;

      const cert = await certificate.findByPk(certId);

      if (!cert) {
        return res.status(404).json({
          success: false,
          message: 'Certificate not found',
        });
      }

      if (cert.status === 'revoked') {
        return res.status(400).json({
          success: false,
          message: 'Certificate is already revoked',
        });
      }

      await cert.update({
        status: 'revoked',
        revokedAt: new Date(),
        revokedBy: userId,
        revokeReason: reason || 'No reason provided',
      });

      if (cert.enrollmentId) {
        await course_enrollment.update(
          { certificateId: null },
          { where: { id: cert.enrollmentId } }
        );
      }

      res.status(200).json({
        success: true,
        message: 'Certificate revoked successfully',
        certificate: cert,
      });
    } catch (err) {
      console.error('❌ [REVOKE CERTIFICATE] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/certificates/:id/reinstate
// Възстановяване на отменен сертификат
// ===============================
certificatesController.post(
  '/:id/reinstate',
  isAuth,
  rbac.checkPermission('certificate', 'revoke'),
  async (req, res, next) => {
    try {
      const certId = parseInt(req.params.id);

      const cert = await certificate.findByPk(certId);

      if (!cert) {
        return res.status(404).json({
          success: false,
          message: 'Certificate not found',
        });
      }

      if (cert.status !== 'revoked') {
        return res.status(400).json({
          success: false,
          message: 'Certificate is not revoked',
        });
      }

      await cert.update({
        status: 'active',
        revokedAt: null,
        revokedBy: null,
        revokeReason: null,
      });

      if (cert.enrollmentId) {
        await course_enrollment.update(
          { certificateId: cert.id },
          { where: { id: cert.enrollmentId } }
        );
      }

      res.status(200).json({
        success: true,
        message: 'Certificate reinstated successfully',
        certificate: cert,
      });
    } catch (err) {
      console.error('❌ [REINSTATE CERTIFICATE] Error:', err);
      next(err);
    }
  }
);

// ===============================
// DELETE /api/academy/certificates/:id
// Изтриване на сертификат (само draft или revoked)
// ===============================
certificatesController.delete(
  '/:id',
  isAuth,
  rbac.checkPermission('certificate', 'revoke'),
  async (req, res, next) => {
    try {
      const certId = parseInt(req.params.id);

      const cert = await certificate.findByPk(certId);

      if (!cert) {
        return res.status(404).json({
          success: false,
          message: 'Certificate not found',
        });
      }

      if (cert.status === 'active') {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete an active certificate. Revoke it first.',
        });
      }

      if (cert.enrollmentId) {
        await course_enrollment.update(
          { certificateId: null },
          { where: { id: cert.enrollmentId } }
        );
      }

      await cert.destroy();

      res.status(200).json({
        success: true,
        message: 'Certificate deleted successfully',
      });
    } catch (err) {
      console.error('❌ [DELETE CERTIFICATE] Error:', err);
      next(err);
    }
  }
);

module.exports = certificatesController;