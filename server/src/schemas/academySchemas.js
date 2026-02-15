// server/src/schemas/academySchemas.js

const { z } = require('zod');

// =========================================================
//                    COMMON SCHEMAS
// =========================================================

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
});

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const slugParamSchema = z.object({
  slug: z.string().min(1),
});

// =========================================================
//                    COURSE SCHEMAS
// =========================================================

const courseCreateSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(200),
  shortDescription: z.string().max(500).optional(),
  description: z.string().optional(),
  category: z.string().max(100).optional(),
  courseType: z.enum(['online', 'offline', 'hybrid']).default('online'),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  videoProvider: z.enum(['youtube', 'vimeo', 'custom', 'none']).optional(),
  trailerUrl: z.string().url().optional().or(z.literal('')),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
  durationWeeks: z.coerce.number().int().positive().optional(),
  estimatedHours: z.coerce.number().positive().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  maxParticipants: z.coerce.number().int().positive().nullable().optional(),
  requiresApproval: z.boolean().default(false),
  isPublic: z.boolean().default(true),
  maxCredits: z.coerce.number().int().min(0).default(0),
  creditsForCompletion: z.coerce.number().int().min(0).default(0),
  hasCertificate: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  targetAudience: z.array(z.string()).default([]),
});

const courseUpdateSchema = courseCreateSchema.partial();

const courseQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'all']).optional(),
  status: z.enum(['draft', 'published', 'all']).optional(),
  sortBy: z.enum(['newest', 'oldest', 'name', 'rating', 'popular']).default('newest'),
});

// =========================================================
//                    MODULE SCHEMAS
// =========================================================

const moduleCreateSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(200),
  description: z.string().optional(),
  isPublished: z.boolean().default(false),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  estimatedHours: z.coerce.number().int().min(0).optional().nullable(),
});

const moduleUpdateSchema = moduleCreateSchema.partial();

const moduleReorderSchema = z.object({
  moduleIds: z.array(z.coerce.number().int().positive()),
});

// =========================================================
//                    LESSON SCHEMAS
// =========================================================

const lessonCreateSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(200),
  description: z.string().optional(),
  moduleId: z.coerce.number().int().positive().optional().nullable(),
  lessonType: z.enum(['video', 'text', 'live', 'quiz', 'assignment']).default('video'),
  videoProvider: z.enum(['youtube', 'vimeo', 'custom', 'none']).optional(),
  videoUrl: z.string().url().optional().or(z.literal('')),
  liveStreamUrl: z.string().url().optional().or(z.literal('')),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
  durationMinutes: z.coerce.number().int().positive().optional(),
  scheduledDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional().nullable(),
  maxCredits: z.coerce.number().int().min(0).default(0),
  creditsForCompletion: z.coerce.number().int().min(0).default(0),
  creditsForTest: z.coerce.number().int().min(0).default(0),
  hasTest: z.boolean().default(false),
  testPassingScore: z.coerce.number().int().min(0).max(100).optional(),
  requiresCompletion: z.boolean().default(true),
  prerequisiteLessonId: z.coerce.number().int().positive().optional().nullable(),
  isFree: z.boolean().default(false),
  mentorId: z.coerce.number().int().positive().optional().nullable(),
});

const lessonUpdateSchema = lessonCreateSchema.partial();

const lessonReorderSchema = z.object({
  lessonIds: z.array(z.coerce.number().int().positive()),
  moduleId: z.coerce.number().int().positive().optional().nullable(),
});

// =========================================================
//                    LECTURE SCHEMAS
// =========================================================

const lectureCreateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  shortDescription: z.string().max(500).optional(),
  description: z.string().optional(),
  category: z.string().max(100).optional(),
  courseId: z.coerce.number().int().positive().optional().nullable(),
  mentorId: z.coerce.number().int().positive().optional().nullable(),
  lectureType: z.enum(['lecture', 'webinar', 'workshop', 'masterclass']).default('lecture'),
  isOnline: z.boolean().default(true),
  location: z.string().max(200).optional(),
  address: z.string().max(500).optional(),
  meetingLink: z.string().url().optional().or(z.literal('')),
  meetingPassword: z.string().max(100).optional(),
  videoProvider: z.enum(['youtube', 'vimeo', 'zoom', 'meet', 'teams', 'custom']).optional(),
  videoUrl: z.string().url().optional().or(z.literal('')),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
  scheduledDate: z.coerce.date(),
  scheduledEndDate: z.coerce.date().optional(),
  durationMinutes: z.coerce.number().int().positive().default(60),
  timezone: z.string().default('Europe/Sofia'),
  maxParticipants: z.coerce.number().int().positive().nullable().optional(),
  requiresRegistration: z.boolean().default(true),
  isPublic: z.boolean().default(true),
  maxCredits: z.coerce.number().int().min(0).default(0),
  creditsForAttendance: z.coerce.number().int().min(0).default(0),
  creditsForTest: z.coerce.number().int().min(0).default(0),
  hasTest: z.boolean().default(false),
  testPassingScore: z.coerce.number().int().min(0).max(100).optional(),
  tags: z.array(z.string()).default([]),
});

const lectureUpdateSchema = lectureCreateSchema.partial();

const lectureQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  category: z.string().optional(),
  type: z.string().optional(),
  status: z.enum(['draft', 'published', 'scheduled', 'live', 'completed', 'cancelled', 'all']).optional(),
  sortBy: z.enum(['newest', 'oldest', 'title', 'rating', 'popular', 'upcoming']).default('newest'),
});

const lectureCancelSchema = z.object({
  reason: z.string().max(500).optional(),
});

// =========================================================
//                    SEMINAR SCHEMAS
// =========================================================

const seminarCreateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  shortDescription: z.string().max(500).optional(),
  description: z.string().optional(),
  category: z.string().max(100).optional(),
  courseId: z.coerce.number().int().positive().optional().nullable(),
  mentorId: z.coerce.number().int().positive().optional().nullable(),
  seminarType: z.enum(['workshop', 'discussion', 'hands_on', 'q_and_a']).default('workshop'),
  isOnline: z.boolean().default(true),
  location: z.string().max(200).optional(),
  address: z.string().max(500).optional(),
  meetingLink: z.string().url().optional().or(z.literal('')),
  meetingPassword: z.string().max(100).optional(),
  videoProvider: z.enum(['youtube', 'vimeo', 'zoom', 'meet', 'teams', 'custom']).optional(),
  videoUrl: z.string().url().optional().or(z.literal('')),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
  scheduledDate: z.coerce.date(),
  scheduledEndDate: z.coerce.date().optional(),
  durationMinutes: z.coerce.number().int().positive().default(90),
  timezone: z.string().default('Europe/Sofia'),
  maxParticipants: z.coerce.number().int().positive().nullable().optional(),
  minParticipants: z.coerce.number().int().positive().optional(),
  requiresRegistration: z.boolean().default(true),
  requiresApproval: z.boolean().default(false),
  isPublic: z.boolean().default(true),
  maxCredits: z.coerce.number().int().min(0).default(0),
  creditsForAttendance: z.coerce.number().int().min(0).default(0),
  creditsForParticipation: z.coerce.number().int().min(0).default(0),
  creditsForTest: z.coerce.number().int().min(0).default(0),
  hasTest: z.boolean().default(false),
  testPassingScore: z.coerce.number().int().min(0).max(100).optional(),
  hasAssignment: z.boolean().default(false),
  assignmentDescription: z.string().optional(),
  tags: z.array(z.string()).default([]),
  prerequisites: z.string().optional(),
  whatToBring: z.string().optional(),
});

const seminarUpdateSchema = seminarCreateSchema.partial();

const seminarQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  category: z.string().optional(),
  type: z.string().optional(),
  status: z.enum(['draft', 'published', 'scheduled', 'live', 'completed', 'cancelled', 'all']).optional(),
  sortBy: z.enum(['newest', 'oldest', 'title', 'rating', 'popular', 'upcoming']).default('newest'),
});

const attendanceMarkSchema = z.object({
  participationLevel: z.enum(['active', 'moderate', 'passive']).optional(),
});

const bulkAttendanceSchema = z.object({
  studentIds: z.array(z.coerce.number().int().positive()),
  participationLevel: z.enum(['active', 'moderate', 'passive']).default('passive'),
});

// =========================================================
//                    TEST SCHEMAS
// =========================================================

const testBaseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().optional(),
  instructions: z.string().optional(),
  testType: z.enum(['quiz', 'exam', 'practice', 'survey']).default('quiz'),
  courseId: z.coerce.number().int().positive().optional().nullable(),
  lessonId: z.coerce.number().int().positive().optional().nullable(),
  lectureId: z.coerce.number().int().positive().optional().nullable(),
  seminarId: z.coerce.number().int().positive().optional().nullable(),
  timeLimitMinutes: z.coerce.number().int().positive().optional(),
  passingScore: z.coerce.number().int().min(0).max(100).default(60),
  maxAttempts: z.coerce.number().int().positive().default(3),
  shuffleQuestions: z.boolean().default(false),
  shuffleAnswers: z.boolean().default(false),
  showCorrectAnswers: z.boolean().default(true),
  requireCourseCompletion: z.boolean().optional(),
  showScore: z.boolean().default(true),
  allowReview: z.boolean().default(true),
  maxCredits: z.coerce.number().int().min(0).default(0),
  creditsForPassing: z.coerce.number().int().min(0).default(0),
});

const testCreateSchema = testBaseSchema.refine(
  (data) => data.courseId || data.lessonId || data.lectureId || data.seminarId,
  { message: 'Test must be associated with a course, lesson, lecture, or seminar' }
);

const testUpdateSchema = testBaseSchema.omit({
  courseId: true,
  lessonId: true,
  lectureId: true,
  seminarId: true,
}).partial();

const questionCreateSchema = z.object({
  questionText: z.string().min(5, 'Question must be at least 5 characters'),
  questionType: z.enum(['single_choice', 'multiple_choice', 'true_false', 'text']).default('single_choice'),
  explanation: z.string().optional(),
  hint: z.string().optional(),
  points: z.coerce.number().int().positive().default(1),
  imageUrl: z.string().url().optional().or(z.literal('')),
  answers: z.array(z.object({
    answerText: z.string().min(1),
    isCorrect: z.boolean().default(false),
    explanation: z.string().optional(),
  })).optional(),
});

const questionUpdateSchema = questionCreateSchema.partial();

const questionReorderSchema = z.object({
  questionIds: z.array(z.coerce.number().int().positive()),
});

const testAnswerSchema = z.object({
  questionId: z.coerce.number().int().positive(),
  answerId: z.union([
    z.coerce.number().int().positive(),
    z.array(z.coerce.number().int().positive()),
    z.null()
  ]).optional(),
  answer: z.union([
    z.coerce.number().int().positive(),
    z.array(z.coerce.number().int().positive()),
    z.null()
  ]).optional(),
  textAnswer: z.string().optional(),
});

// =========================================================
//                    CERTIFICATE SCHEMAS
// =========================================================

const certificateCreateSchema = z.object({
  studentId: z.coerce.number().int().positive(),
  courseId: z.coerce.number().int().positive(),
  enrollmentId: z.coerce.number().int().positive().optional(),
  recipientName: z.string().max(200).optional(),
  grade: z.string().max(50).optional(),
  finalScore: z.coerce.number().int().min(0).max(100).optional(),
  creditsEarned: z.coerce.number().int().min(0).optional(),
  completionDate: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional(),
  notes: z.string().max(1000).optional(),
});

const certificateUpdateSchema = z.object({
  recipientName: z.string().max(200).optional(),
  grade: z.string().max(50).optional(),
  finalScore: z.coerce.number().int().min(0).max(100).optional(),
  creditsEarned: z.coerce.number().int().min(0).optional(),
  completionDate: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional(),
  notes: z.string().max(1000).optional(),
  pdfUrl: z.string().url().optional(),
  templateId: z.coerce.number().int().positive().optional(),
});

const certificateGenerateSchema = z.object({
  expiresAt: z.coerce.date().optional(),
  notes: z.string().max(1000).optional(),
});

const certificateBulkGenerateSchema = z.object({
  courseId: z.coerce.number().int().positive(),
  expiresAt: z.coerce.date().optional(),
});

const certificateRevokeSchema = z.object({
  reason: z.string().max(500).optional(),
});

// =========================================================
//                    MATERIAL SCHEMAS
// =========================================================

const materialCreateSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(200),
  description: z.string().max(1000).optional(),
  materialType: z.enum([
    'document', 'pdf', 'video', 'audio', 'image',
    'presentation', 'spreadsheet', 'archive', 'code', 'link', 'embed', 'other'
  ]).default('document'),
  fileUrl: z.string().url().optional().or(z.literal('')),
  fileName: z.string().max(255).optional(),
  fileSize: z.coerce.number().int().min(0).optional(),
  mimeType: z.string().max(100).optional(),
  externalUrl: z.string().url().optional().or(z.literal('')),
  embedCode: z.string().optional(),
  isDownloadable: z.boolean().default(true),
  isPreviewable: z.boolean().default(false),
  accessLevel: z.enum(['public', 'enrolled', 'preview']).default('enrolled'),
  availableAfterLecture: z.boolean().optional(),
  availableBeforeSeminar: z.boolean().optional(),
  isHomework: z.boolean().optional(),
});

const materialUpdateSchema = materialCreateSchema.partial().extend({
  status: z.enum(['active', 'archived', 'deleted']).optional(),
});

const materialReorderSchema = z.object({
  materialIds: z.array(z.coerce.number().int().positive()),
});

const materialBulkCreateSchema = z.object({
  materials: z.array(materialCreateSchema),
});

const materialBulkDeleteSchema = z.object({
  materialIds: z.array(z.coerce.number().int().positive()),
});

// =========================================================
//                    ENROLLMENT SCHEMAS
// =========================================================

const enrollmentApproveRejectSchema = z.object({
  reason: z.string().max(500).optional(),
});

// =========================================================
//                    PROGRESS SCHEMAS
// =========================================================

const lessonProgressUpdateSchema = z.object({
  watchedSeconds: z.coerce.number().int().min(0).optional(),
  progressPercentage: z.coerce.number().int().min(0).max(100).optional(),
  videoPosition: z.coerce.number().int().min(0).optional(),
});

// =========================================================
//                    EXPORTS
// =========================================================

module.exports = {
  // Common
  paginationSchema,
  idParamSchema,
  slugParamSchema,

  // Courses
  courseCreateSchema,
  courseUpdateSchema,
  courseQuerySchema,

  // Modules
  moduleCreateSchema,
  moduleUpdateSchema,
  moduleReorderSchema,

  // Lessons
  lessonCreateSchema,
  lessonUpdateSchema,
  lessonReorderSchema,

  // Lectures
  lectureCreateSchema,
  lectureUpdateSchema,
  lectureQuerySchema,
  lectureCancelSchema,

  // Seminars
  seminarCreateSchema,
  seminarUpdateSchema,
  seminarQuerySchema,
  attendanceMarkSchema,
  bulkAttendanceSchema,

  // Tests
  testCreateSchema,
  testUpdateSchema,
  questionCreateSchema,
  questionUpdateSchema,
  questionReorderSchema,
  testAnswerSchema,

  // Certificates
  certificateCreateSchema,
  certificateUpdateSchema,
  certificateGenerateSchema,
  certificateBulkGenerateSchema,
  certificateRevokeSchema,

  // Materials
  materialCreateSchema,
  materialUpdateSchema,
  materialReorderSchema,
  materialBulkCreateSchema,
  materialBulkDeleteSchema,

  // Enrollment
  enrollmentApproveRejectSchema,

  // Progress
  lessonProgressUpdateSchema,
};