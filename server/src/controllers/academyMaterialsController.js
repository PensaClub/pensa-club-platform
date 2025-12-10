// server/src/controllers/academyMaterialsController.js

const academyMaterialsController = require('express').Router();
const { Op } = require('sequelize');
const path = require('path');

const {
  course_material,
  lesson_material,
  lecture_material,
  seminar_material,
  course,
  lesson,
  lecture,
  seminar,
  student,
  course_enrollment,
  student_lesson,
  student_lecture,
  student_seminar,
  user_account,
  sequelize,
} = require('../sequelize/models/index');

const { validateBody, validateParams } = require('../middlewares/validateRequest');
const {
  materialCreateSchema,
  materialUpdateSchema,
  materialReorderSchema,
  materialBulkCreateSchema,
  materialBulkDeleteSchema,
} = require('../schemas/academySchemas');

const isAuth = require('../middlewares/isAuth.js');
const rbac = require('../middlewares/rbac.js');

// Local schemas
const { z } = require('zod');

const entityTypeParamSchema = z.object({
  entityType: z.enum(['course', 'lesson', 'lecture', 'seminar']),
  entityId: z.coerce.number().int().positive(),
});

const materialParamSchema = entityTypeParamSchema.extend({
  materialId: z.coerce.number().int().positive(),
});

// ===============================
// HELPER: Get student by userId
// ===============================
const getStudentByUserId = async (userId) => {
  return await student.findOne({
    where: { userId },
  });
};

// ===============================
// HELPER: Find entity by slug or id
// ===============================
const findBySlugOrId = async (model, slugOrId) => {
  const where = isNaN(slugOrId) 
    ? { slug: slugOrId } 
    : { id: parseInt(slugOrId) };
  return await model.findOne({ where });
};

// ===============================
// HELPER: Check access to course materials
// ===============================
const checkCourseAccess = async (studentId, courseId) => {
  if (!studentId) return false;

  const enrollment = await course_enrollment.findOne({
    where: {
      studentId,
      courseId,
      status: { [Op.in]: ['active', 'completed'] },
    },
  });

  return !!enrollment;
};

// ===============================
// HELPER: Check access to lesson materials
// ===============================
const checkLessonAccess = async (studentId, lessonId) => {
  if (!studentId) return false;

  const lessonData = await lesson.findByPk(lessonId);
  if (!lessonData) return false;

  if (lessonData.isFree) return true;

  return await checkCourseAccess(studentId, lessonData.courseId);
};

// ===============================
// HELPER: Check access to lecture materials
// ===============================
const checkLectureAccess = async (studentId, lectureId) => {
  if (!studentId) return false;

  const registration = await student_lecture.findOne({
    where: { studentId, lectureId },
  });

  return !!registration;
};

// ===============================
// HELPER: Check access to seminar materials
// ===============================
const checkSeminarAccess = async (studentId, seminarId) => {
  if (!studentId) return false;

  const registration = await student_seminar.findOne({
    where: {
      studentId,
      seminarId,
      status: 'approved',
    },
  });

  return !!registration;
};

// ===============================
// HELPER: Get material model by entity type
// ===============================
const getMaterialModel = (entityType) => {
  const models = {
    course: course_material,
    lesson: lesson_material,
    lecture: lecture_material,
    seminar: seminar_material,
  };
  return models[entityType];
};

// ===============================
// HELPER: Get entity model by type
// ===============================
const getEntityModel = (entityType) => {
  const models = {
    course: course,
    lesson: lesson,
    lecture: lecture,
    seminar: seminar,
  };
  return models[entityType];
};

// ===============================
// HELPER: Get foreign key name
// ===============================
const getForeignKey = (entityType) => {
  return `${entityType}Id`;
};

// =========================================================
//                    STATIC ROUTES (must be before dynamic)
// =========================================================

// ===============================
// GET /api/academy/materials/stats/overview
// Статистики за материали
// ===============================
academyMaterialsController.get(
  '/stats/overview',
  isAuth,
  rbac.checkPermission('material', 'read'),
  async (req, res, next) => {
    try {
      const courseMaterialsCount = await course_material.count();
      const courseMaterialsDownloads = await course_material.sum('downloadCount');

      const lessonMaterialsCount = await lesson_material.count();
      const lessonMaterialsDownloads = await lesson_material.sum('downloadCount');

      const lectureMaterialsCount = await lecture_material.count();
      const lectureMaterialsDownloads = await lecture_material.sum('downloadCount');

      const seminarMaterialsCount = await seminar_material.count();
      const seminarMaterialsDownloads = await seminar_material.sum('downloadCount');

      const typeDistribution = await course_material.findAll({
        attributes: [
          'materialType',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        group: ['materialType'],
        raw: true,
      });

      const topDownloaded = await course_material.findAll({
        where: {
          downloadCount: { [Op.gt]: 0 },
        },
        include: [
          {
            model: course,
            as: 'course',
            attributes: ['id', 'name'],
          },
        ],
        order: [['downloadCount', 'DESC']],
        limit: 10,
      });

      res.status(200).json({
        success: true,
        statistics: {
          totals: {
            courseMaterials: courseMaterialsCount,
            lessonMaterials: lessonMaterialsCount,
            lectureMaterials: lectureMaterialsCount,
            seminarMaterials: seminarMaterialsCount,
            total:
              courseMaterialsCount +
              lessonMaterialsCount +
              lectureMaterialsCount +
              seminarMaterialsCount,
          },
          downloads: {
            courseMaterials: courseMaterialsDownloads || 0,
            lessonMaterials: lessonMaterialsDownloads || 0,
            lectureMaterials: lectureMaterialsDownloads || 0,
            seminarMaterials: seminarMaterialsDownloads || 0,
            total:
              (courseMaterialsDownloads || 0) +
              (lessonMaterialsDownloads || 0) +
              (lectureMaterialsDownloads || 0) +
              (seminarMaterialsDownloads || 0),
          },
          typeDistribution: typeDistribution.reduce((acc, t) => {
            acc[t.materialType || 'unknown'] = parseInt(t.count);
            return acc;
          }, {}),
          topDownloaded: topDownloaded.map((m) => ({
            id: m.id,
            title: m.title,
            courseName: m.course?.name,
            downloadCount: m.downloadCount,
          })),
        },
      });
    } catch (err) {
      console.error('❌ [GET MATERIAL STATS] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/materials/types
// Списък с типове материали
// ===============================
academyMaterialsController.get('/types', async (req, res, next) => {
  try {
    const types = [
      { value: 'document', label: 'Документ', icon: 'file-text' },
      { value: 'pdf', label: 'PDF', icon: 'file' },
      { value: 'video', label: 'Видео', icon: 'video' },
      { value: 'audio', label: 'Аудио', icon: 'headphones' },
      { value: 'image', label: 'Изображение', icon: 'image' },
      { value: 'presentation', label: 'Презентация', icon: 'presentation' },
      { value: 'spreadsheet', label: 'Таблица', icon: 'table' },
      { value: 'archive', label: 'Архив', icon: 'archive' },
      { value: 'code', label: 'Код', icon: 'code' },
      { value: 'link', label: 'Връзка', icon: 'link' },
      { value: 'embed', label: 'Вграден', icon: 'layout' },
      { value: 'other', label: 'Друго', icon: 'file' },
    ];

    res.status(200).json({
      success: true,
      types,
    });
  } catch (err) {
    console.error('❌ [GET MATERIAL TYPES] Error:', err);
    next(err);
  }
});

// =========================================================
//                    COURSE MATERIALS
// =========================================================

// ===============================
// GET /api/academy/materials/courses/:courseSlug
// Материали за курс (поддържа slug и id)
// ===============================
academyMaterialsController.get(
  '/courses/:courseSlug',
  isAuth,
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const { courseSlug } = req.params;

      const courseData = await findBySlugOrId(course, courseSlug);
      
      if (!courseData) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }

      const studentData = await getStudentByUserId(userId);

      const hasAccess = await checkCourseAccess(studentData?.id, courseData.id);
      const isAdmin = req.user.role === 'admin' || req.user.role === 'mentor';

      if (!hasAccess && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Enroll in the course to access materials.',
        });
      }

      const where = { courseId: courseData.id };

      if (!isAdmin) {
        where.status = 'active';
      }

      const materials = await course_material.findAll({
        where,
        order: [
          ['sortOrder', 'ASC'],
          ['createdAt', 'DESC'],
        ],
      });

      res.status(200).json({
        success: true,
        materials,
      });
    } catch (err) {
      console.error('❌ [GET COURSE MATERIALS] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/materials/courses/:courseSlug
// Добавяне на материал към курс (поддържа slug и id)
// ===============================
academyMaterialsController.post(
  '/courses/:courseSlug',
  isAuth,
  rbac.checkPermission('material', 'create'),
  validateBody(materialCreateSchema),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const { courseSlug } = req.params;

      const courseData = await findBySlugOrId(course, courseSlug);
      
      if (!courseData) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }

      const {
        title,
        description,
        materialType,
        fileUrl,
        fileName,
        fileSize,
        mimeType,
        externalUrl,
        embedCode,
        isDownloadable,
        isPreviewable,
        accessLevel,
      } = req.body;

      const maxSortOrder = await course_material.max('sortOrder', {
        where: { courseId: courseData.id },
      });

      const material = await course_material.create({
        courseId: courseData.id,
        uploadedBy: userId,
        title,
        description,
        materialType,
        fileUrl,
        fileName,
        fileSize,
        mimeType,
        externalUrl,
        embedCode,
        isDownloadable,
        isPreviewable,
        accessLevel,
        sortOrder: (maxSortOrder || 0) + 1,
        status: 'active',
      });

      res.status(201).json({
        success: true,
        message: 'Material added successfully',
        material,
      });
    } catch (err) {
      console.error('❌ [ADD COURSE MATERIAL] Error:', err);
      next(err);
    }
  }
);

// =========================================================
//                    LESSON MATERIALS
// =========================================================

// ===============================
// GET /api/academy/materials/lessons/:lessonSlug
// Материали за урок (поддържа slug и id)
// ===============================
academyMaterialsController.get(
  '/lessons/:lessonSlug',
  isAuth,
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const { lessonSlug } = req.params;

      const lessonData = await findBySlugOrId(lesson, lessonSlug);

      if (!lessonData) {
        return res.status(404).json({
          success: false,
          message: 'Lesson not found',
        });
      }

      const studentData = await getStudentByUserId(userId);

      const hasAccess = await checkLessonAccess(studentData?.id, lessonData.id);
      const isAdmin = req.user.role === 'admin' || req.user.role === 'mentor';

      if (!hasAccess && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Enroll in the course to access materials.',
        });
      }

      const where = { lessonId: lessonData.id };

      if (!isAdmin) {
        where.status = 'active';
      }

      const materials = await lesson_material.findAll({
        where,
        order: [
          ['sortOrder', 'ASC'],
          ['createdAt', 'DESC'],
        ],
      });

      res.status(200).json({
        success: true,
        materials,
      });
    } catch (err) {
      console.error('❌ [GET LESSON MATERIALS] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/materials/lessons/:lessonSlug
// Добавяне на материал към урок (поддържа slug и id)
// ===============================
academyMaterialsController.post(
  '/lessons/:lessonSlug',
  isAuth,
  rbac.checkPermission('material', 'create'),
  validateBody(materialCreateSchema),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const { lessonSlug } = req.params;

      const lessonData = await findBySlugOrId(lesson, lessonSlug);

      if (!lessonData) {
        return res.status(404).json({
          success: false,
          message: 'Lesson not found',
        });
      }

      const {
        title,
        description,
        materialType,
        fileUrl,
        fileName,
        fileSize,
        mimeType,
        externalUrl,
        embedCode,
        isDownloadable,
        isPreviewable,
      } = req.body;

      const maxSortOrder = await lesson_material.max('sortOrder', {
        where: { lessonId: lessonData.id },
      });

      const material = await lesson_material.create({
        lessonId: lessonData.id,
        uploadedBy: userId,
        title,
        description,
        materialType,
        fileUrl,
        fileName,
        fileSize,
        mimeType,
        externalUrl,
        embedCode,
        isDownloadable,
        isPreviewable,
        sortOrder: (maxSortOrder || 0) + 1,
        status: 'active',
      });

      res.status(201).json({
        success: true,
        message: 'Material added successfully',
        material,
      });
    } catch (err) {
      console.error('❌ [ADD LESSON MATERIAL] Error:', err);
      next(err);
    }
  }
);

// =========================================================
//                    LECTURE MATERIALS
// =========================================================

// ===============================
// GET /api/academy/materials/lectures/:lectureSlug
// Материали за лекция (поддържа slug и id)
// ===============================
academyMaterialsController.get(
  '/lectures/:lectureSlug',
  isAuth,
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const { lectureSlug } = req.params;

      const lectureData = await findBySlugOrId(lecture, lectureSlug);

      if (!lectureData) {
        return res.status(404).json({
          success: false,
          message: 'Lecture not found',
        });
      }

      const studentData = await getStudentByUserId(userId);

      const hasAccess = await checkLectureAccess(studentData?.id, lectureData.id);
      const isAdmin = req.user.role === 'admin' || req.user.role === 'mentor';

      if (!hasAccess && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Register for the lecture to access materials.',
        });
      }

      const where = { lectureId: lectureData.id };

      if (!isAdmin) {
        where.status = 'active';
      }

      const materials = await lecture_material.findAll({
        where,
        order: [
          ['sortOrder', 'ASC'],
          ['createdAt', 'DESC'],
        ],
      });

      res.status(200).json({
        success: true,
        materials,
      });
    } catch (err) {
      console.error('❌ [GET LECTURE MATERIALS] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/materials/lectures/:lectureSlug
// Добавяне на материал към лекция (поддържа slug и id)
// ===============================
academyMaterialsController.post(
  '/lectures/:lectureSlug',
  isAuth,
  rbac.checkPermission('material', 'create'),
  validateBody(materialCreateSchema),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const { lectureSlug } = req.params;

      const lectureData = await findBySlugOrId(lecture, lectureSlug);

      if (!lectureData) {
        return res.status(404).json({
          success: false,
          message: 'Lecture not found',
        });
      }

      const {
        title,
        description,
        materialType,
        fileUrl,
        fileName,
        fileSize,
        mimeType,
        externalUrl,
        embedCode,
        isDownloadable,
        isPreviewable,
        availableAfterLecture,
      } = req.body;

      const maxSortOrder = await lecture_material.max('sortOrder', {
        where: { lectureId: lectureData.id },
      });

      const material = await lecture_material.create({
        lectureId: lectureData.id,
        uploadedBy: userId,
        title,
        description,
        materialType,
        fileUrl,
        fileName,
        fileSize,
        mimeType,
        externalUrl,
        embedCode,
        isDownloadable,
        isPreviewable,
        availableAfterLecture,
        sortOrder: (maxSortOrder || 0) + 1,
        status: 'active',
      });

      res.status(201).json({
        success: true,
        message: 'Material added successfully',
        material,
      });
    } catch (err) {
      console.error('❌ [ADD LECTURE MATERIAL] Error:', err);
      next(err);
    }
  }
);

// =========================================================
//                    SEMINAR MATERIALS
// =========================================================

// ===============================
// GET /api/academy/materials/seminars/:seminarSlug
// Материали за семинар (поддържа slug и id)
// ===============================
academyMaterialsController.get(
  '/seminars/:seminarSlug',
  isAuth,
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const { seminarSlug } = req.params;

      const seminarData = await findBySlugOrId(seminar, seminarSlug);

      if (!seminarData) {
        return res.status(404).json({
          success: false,
          message: 'Seminar not found',
        });
      }

      const studentData = await getStudentByUserId(userId);

      const hasAccess = await checkSeminarAccess(studentData?.id, seminarData.id);
      const isAdmin = req.user.role === 'admin' || req.user.role === 'mentor';

      if (!hasAccess && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Register for the seminar to access materials.',
        });
      }

      const where = { seminarId: seminarData.id };

      if (!isAdmin) {
        where.status = 'active';
      }

      const materials = await seminar_material.findAll({
        where,
        order: [
          ['sortOrder', 'ASC'],
          ['createdAt', 'DESC'],
        ],
      });

      res.status(200).json({
        success: true,
        materials,
      });
    } catch (err) {
      console.error('❌ [GET SEMINAR MATERIALS] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/materials/seminars/:seminarSlug
// Добавяне на материал към семинар (поддържа slug и id)
// ===============================
academyMaterialsController.post(
  '/seminars/:seminarSlug',
  isAuth,
  rbac.checkPermission('material', 'create'),
  validateBody(materialCreateSchema),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const { seminarSlug } = req.params;

      const seminarData = await findBySlugOrId(seminar, seminarSlug);

      if (!seminarData) {
        return res.status(404).json({
          success: false,
          message: 'Seminar not found',
        });
      }

      const {
        title,
        description,
        materialType,
        fileUrl,
        fileName,
        fileSize,
        mimeType,
        externalUrl,
        embedCode,
        isDownloadable,
        isPreviewable,
        availableBeforeSeminar,
        isHomework,
      } = req.body;

      const maxSortOrder = await seminar_material.max('sortOrder', {
        where: { seminarId: seminarData.id },
      });

      const material = await seminar_material.create({
        seminarId: seminarData.id,
        uploadedBy: userId,
        title,
        description,
        materialType,
        fileUrl,
        fileName,
        fileSize,
        mimeType,
        externalUrl,
        embedCode,
        isDownloadable,
        isPreviewable,
        availableBeforeSeminar: availableBeforeSeminar !== false,
        isHomework,
        sortOrder: (maxSortOrder || 0) + 1,
        status: 'active',
      });

      res.status(201).json({
        success: true,
        message: 'Material added successfully',
        material,
      });
    } catch (err) {
      console.error('❌ [ADD SEMINAR MATERIAL] Error:', err);
      next(err);
    }
  }
);

// =========================================================
//                    GENERIC MATERIAL OPERATIONS
// =========================================================

// ===============================
// GET /api/academy/materials/:entityType/:entityId/:materialId
// Детайли за материал
// ===============================
academyMaterialsController.get(
  '/:entityType/:entityId/:materialId',
  isAuth,
  validateParams(materialParamSchema),
  async (req, res, next) => {
    try {
      const { entityType, entityId, materialId } = req.params;

      const MaterialModel = getMaterialModel(entityType);
      const foreignKey = getForeignKey(entityType);

      const material = await MaterialModel.findOne({
        where: {
          id: materialId,
          [foreignKey]: entityId,
        },
      });

      if (!material) {
        return res.status(404).json({
          success: false,
          message: 'Material not found',
        });
      }

      await material.increment('downloadCount');

      res.status(200).json({
        success: true,
        material,
      });
    } catch (err) {
      console.error('❌ [GET MATERIAL] Error:', err);
      next(err);
    }
  }
);

// ===============================
// PUT /api/academy/materials/:entityType/:entityId/:materialId
// Редактиране на материал
// ===============================
academyMaterialsController.put(
  '/:entityType/:entityId/:materialId',
  isAuth,
  rbac.checkPermission('material', 'update'),
  validateParams(materialParamSchema),
  validateBody(materialUpdateSchema),
  async (req, res, next) => {
    try {
      const { entityType, entityId, materialId } = req.params;
      const updates = req.body;

      const MaterialModel = getMaterialModel(entityType);
      const foreignKey = getForeignKey(entityType);

      const material = await MaterialModel.findOne({
        where: {
          id: materialId,
          [foreignKey]: entityId,
        },
      });

      if (!material) {
        return res.status(404).json({
          success: false,
          message: 'Material not found',
        });
      }

      await material.update(updates);

      res.status(200).json({
        success: true,
        message: 'Material updated successfully',
        material,
      });
    } catch (err) {
      console.error('❌ [UPDATE MATERIAL] Error:', err);
      next(err);
    }
  }
);

// ===============================
// DELETE /api/academy/materials/:entityType/:entityId/:materialId
// Изтриване на материал
// ===============================
academyMaterialsController.delete(
  '/:entityType/:entityId/:materialId',
  isAuth,
  rbac.checkPermission('material', 'delete'),
  validateParams(materialParamSchema),
  async (req, res, next) => {
    try {
      const { entityType, entityId, materialId } = req.params;

      const MaterialModel = getMaterialModel(entityType);
      const foreignKey = getForeignKey(entityType);

      const material = await MaterialModel.findOne({
        where: {
          id: materialId,
          [foreignKey]: entityId,
        },
      });

      if (!material) {
        return res.status(404).json({
          success: false,
          message: 'Material not found',
        });
      }

      await material.destroy();

      res.status(200).json({
        success: true,
        message: 'Material deleted successfully',
      });
    } catch (err) {
      console.error('❌ [DELETE MATERIAL] Error:', err);
      next(err);
    }
  }
);

// ===============================
// PUT /api/academy/materials/:entityType/:entityId/reorder
// Пренареждане на материали
// ===============================
academyMaterialsController.put(
  '/:entityType/:entityId/reorder',
  isAuth,
  rbac.checkPermission('material', 'update'),
  validateParams(entityTypeParamSchema),
  validateBody(materialReorderSchema),
  async (req, res, next) => {
    try {
      const { entityType, entityId } = req.params;
      const { materialIds } = req.body;

      const MaterialModel = getMaterialModel(entityType);
      const foreignKey = getForeignKey(entityType);

      for (let i = 0; i < materialIds.length; i++) {
        await MaterialModel.update(
          { sortOrder: i + 1 },
          {
            where: {
              id: materialIds[i],
              [foreignKey]: entityId,
            },
          }
        );
      }

      res.status(200).json({
        success: true,
        message: 'Materials reordered successfully',
      });
    } catch (err) {
      console.error('❌ [REORDER MATERIALS] Error:', err);
      next(err);
    }
  }
);

// =========================================================
//                    BULK OPERATIONS
// =========================================================

// ===============================
// POST /api/academy/materials/:entityType/:entityId/bulk
// Bulk добавяне на материали
// ===============================
academyMaterialsController.post(
  '/:entityType/:entityId/bulk',
  isAuth,
  rbac.checkPermission('material', 'create'),
  validateParams(entityTypeParamSchema),
  validateBody(materialBulkCreateSchema),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const { entityType, entityId } = req.params;
      const { materials } = req.body;

      const MaterialModel = getMaterialModel(entityType);
      const EntityModel = getEntityModel(entityType);

      const entity = await EntityModel.findByPk(entityId);
      if (!entity) {
        return res.status(404).json({
          success: false,
          message: `${entityType} not found`,
        });
      }

      const foreignKey = getForeignKey(entityType);

      const maxSortOrder = await MaterialModel.max('sortOrder', {
        where: { [foreignKey]: entityId },
      });

      const created = [];
      const errors = [];

      for (let i = 0; i < materials.length; i++) {
        const mat = materials[i];

        try {
          const material = await MaterialModel.create({
            [foreignKey]: entityId,
            uploadedBy: userId,
            title: mat.title,
            description: mat.description,
            materialType: mat.materialType || 'document',
            fileUrl: mat.fileUrl,
            fileName: mat.fileName,
            fileSize: mat.fileSize,
            mimeType: mat.mimeType,
            externalUrl: mat.externalUrl,
            embedCode: mat.embedCode,
            isDownloadable: mat.isDownloadable !== false,
            isPreviewable: mat.isPreviewable || false,
            sortOrder: (maxSortOrder || 0) + i + 1,
            status: 'active',
          });

          created.push(material);
        } catch (error) {
          errors.push({ index: i, error: error.message });
        }
      }

      res.status(201).json({
        success: true,
        message: `Created ${created.length} materials`,
        created: created.length,
        materials: created,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (err) {
      console.error('❌ [BULK ADD MATERIALS] Error:', err);
      next(err);
    }
  }
);

// ===============================
// DELETE /api/academy/materials/:entityType/:entityId/bulk
// Bulk изтриване на материали
// ===============================
academyMaterialsController.delete(
  '/:entityType/:entityId/bulk',
  isAuth,
  rbac.checkPermission('material', 'delete'),
  validateParams(entityTypeParamSchema),
  validateBody(materialBulkDeleteSchema),
  async (req, res, next) => {
    try {
      const { entityType, entityId } = req.params;
      const { materialIds } = req.body;

      const MaterialModel = getMaterialModel(entityType);
      const foreignKey = getForeignKey(entityType);

      const deleted = await MaterialModel.destroy({
        where: {
          id: materialIds,
          [foreignKey]: entityId,
        },
      });

      res.status(200).json({
        success: true,
        message: `Deleted ${deleted} materials`,
        deleted,
      });
    } catch (err) {
      console.error('❌ [BULK DELETE MATERIALS] Error:', err);
      next(err);
    }
  }
);

// =========================================================
//                    DOWNLOAD TRACKING
// =========================================================

// ===============================
// POST /api/academy/materials/:entityType/:entityId/:materialId/download
// Регистриране на сваляне
// ===============================
academyMaterialsController.post(
  '/:entityType/:entityId/:materialId/download',
  isAuth,
  validateParams(materialParamSchema),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const { entityType, entityId, materialId } = req.params;

      const MaterialModel = getMaterialModel(entityType);
      const foreignKey = getForeignKey(entityType);

      const material = await MaterialModel.findOne({
        where: {
          id: materialId,
          [foreignKey]: entityId,
          status: 'active',
        },
      });

      if (!material) {
        return res.status(404).json({
          success: false,
          message: 'Material not found',
        });
      }

      if (!material.isDownloadable) {
        return res.status(403).json({
          success: false,
          message: 'This material is not downloadable',
        });
      }

      const studentData = await getStudentByUserId(userId);
      let hasAccess = false;

      switch (entityType) {
        case 'course':
          hasAccess = await checkCourseAccess(studentData?.id, entityId);
          break;
        case 'lesson':
          hasAccess = await checkLessonAccess(studentData?.id, entityId);
          break;
        case 'lecture':
          hasAccess = await checkLectureAccess(studentData?.id, entityId);
          break;
        case 'seminar':
          hasAccess = await checkSeminarAccess(studentData?.id, entityId);
          break;
      }

      const isAdmin = req.user.role === 'admin' || req.user.role === 'mentor';

      if (!hasAccess && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }

      await material.increment('downloadCount');

      res.status(200).json({
        success: true,
        downloadUrl: material.fileUrl || material.externalUrl,
        fileName: material.fileName,
        mimeType: material.mimeType,
      });
    } catch (err) {
      console.error('❌ [DOWNLOAD MATERIAL] Error:', err);
      next(err);
    }
  }
);

module.exports = academyMaterialsController;