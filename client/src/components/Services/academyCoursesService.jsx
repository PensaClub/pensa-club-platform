// src/services/academyCoursesService.js

import { requestFactory } from "./requester";

const apiUrl = import.meta.env.VITE_API_URL;

export const academyCoursesServiceFactory = () => {
  const requester = requestFactory();

  // Helper за query string
  const toQueryString = (params) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    return new URLSearchParams(cleanParams).toString();
  };

  return {
    // =========================================================
    //                    COURSES - PUBLIC
    // =========================================================

    getCourses: async (params = {}) => {
      const queryString = toQueryString(params);
      return requester.get(`${apiUrl}/academy/courses?${queryString}`);
    },

    getCourseBySlug: async (slug) => {
      return requester.get(`${apiUrl}/academy/courses/${slug}`);
    },

    getCourseCategories: async () => {
      return requester.get(`${apiUrl}/academy/courses/meta/categories`);
    },

    // =========================================================
    //                    COURSES - ADMIN
    // =========================================================

    getAdminCourses: async (params = {}) => {
      const queryString = toQueryString(params);
      return requester.get(`${apiUrl}/academy/courses/admin?${queryString}`);
    },

    createCourse: async (courseData) => {
      return requester.post(`${apiUrl}/academy/courses`, courseData);
    },

    updateCourse: async (courseId, courseData) => {
      return requester.put(`${apiUrl}/academy/courses/${courseId}`, courseData);
    },

    deleteCourse: async (courseId) => {
      return requester.del(`${apiUrl}/academy/courses/${courseId}`);
    },

    publishCourse: async (courseId) => {
      return requester.post(`${apiUrl}/academy/courses/${courseId}/publish`);
    },

    unpublishCourse: async (courseId) => {
      return requester.post(`${apiUrl}/academy/courses/${courseId}/unpublish`);
    },

    duplicateCourse: async (courseId) => {
      return requester.post(`${apiUrl}/academy/courses/${courseId}/duplicate`);
    },

    getCourseStatistics: async (courseId) => {
      return requester.get(`${apiUrl}/academy/courses/${courseId}/statistics`);

    },
    // =========================================================
    //                    COURSE MENTORS
    // =========================================================

    searchMentors: async (query = '', limit = 8) => {
      return requester.get(`${apiUrl}/academy/mentors?search=${encodeURIComponent(query)}&limit=${limit}&status=active`);
    },

    addCourseMentor: async (courseId, data) => {
      return requester.post(`${apiUrl}/academy/courses/${courseId}/mentors`, data);
    },

    updateCourseMentor: async (courseId, mentorCourseId, data) => {
      return requester.put(`${apiUrl}/academy/courses/${courseId}/mentors/${mentorCourseId}`, data);
    },

    removeCourseMentor: async (courseId, mentorCourseId) => {
      return requester.del(`${apiUrl}/academy/courses/${courseId}/mentors/${mentorCourseId}`);
    },

    // =========================================================
    //                    MODULES
    // =========================================================

    getCourseModules: async (courseId) => {
      return requester.get(`${apiUrl}/academy/courses/${courseId}/modules`);
    },

    createModule: async (courseId, moduleData) => {
      return requester.post(`${apiUrl}/academy/courses/${courseId}/modules`, moduleData);
    },

    updateModule: async (courseId, moduleId, moduleData) => {
      return requester.put(`${apiUrl}/academy/courses/${courseId}/modules/${moduleId}`, moduleData);
    },

    deleteModule: async (courseId, moduleId) => {
      return requester.del(`${apiUrl}/academy/courses/${courseId}/modules/${moduleId}`);
    },

    reorderModules: async (courseId, moduleIds) => {
      return requester.put(`${apiUrl}/academy/courses/${courseId}/modules/reorder`, { moduleIds });
    },

    // =========================================================
    //                    LESSONS
    // =========================================================

    getCourseLessons: async (courseSlug) => {
      return requester.get(`${apiUrl}/academy/courses/${courseSlug}/lessons`);
    },

    createLesson: async (courseSlug, lessonData) => {
      return requester.post(`${apiUrl}/academy/courses/${courseSlug}/lessons`, lessonData);
    },

    getLessonBySlug: async (courseSlug, lessonSlug) => {
      return requester.get(`${apiUrl}/academy/courses/${courseSlug}/lessons/${lessonSlug}`);
    },

    updateLesson: async (courseSlug, lessonSlug, lessonData) => {
      return requester.put(`${apiUrl}/academy/courses/${courseSlug}/lessons/${lessonSlug}`, lessonData);
    },

    deleteLesson: async (courseSlug, lessonSlug) => {
      return requester.del(`${apiUrl}/academy/courses/${courseSlug}/lessons/${lessonSlug}`);
    },

    reorderLessons: async (courseSlug, lessonIds, moduleId = null) => {
      return requester.put(`${apiUrl}/academy/courses/${courseSlug}/lessons/reorder`, { lessonIds, moduleId });
    },

    publishLesson: async (courseSlug, lessonSlug) => {
      return requester.post(`${apiUrl}/academy/courses/${courseSlug}/lessons/${lessonSlug}/publish`);
    },

    unpublishLesson: async (courseSlug, lessonSlug) => {
      return requester.post(`${apiUrl}/academy/courses/${courseSlug}/lessons/${lessonSlug}/unpublish`);
    },

    // =========================================================
    //                    LECTURES - PUBLIC
    // =========================================================

    getLectures: async (params = {}) => {
      const queryString = toQueryString(params);
      return requester.get(`${apiUrl}/academy/lectures?${queryString}`);
    },

    getLectureBySlug: async (slug) => {
      return requester.get(`${apiUrl}/academy/lectures/${slug}`);
    },

    getLectureCategories: async () => {
      return requester.get(`${apiUrl}/academy/lectures/meta/categories`);
    },

    // =========================================================
    //                    LECTURES - ADMIN
    // =========================================================

    getAdminLectures: async (params = {}) => {
      const queryString = toQueryString(params);
      return requester.get(`${apiUrl}/academy/lectures/admin?${queryString}`);
    },

    getLectureAdminById: async (lectureId) => {
      return requester.get(`${apiUrl}/academy/lectures/${lectureId}/admin`);
    },

    addLectureMentor: async (lectureId, data) => {
      return requester.post(`${apiUrl}/academy/lectures/${lectureId}/mentors`, data);
    },
    updateLectureMentor: async (lectureId, mentorLectureId, data) => {
      return requester.put(`${apiUrl}/academy/lectures/${lectureId}/mentors/${mentorLectureId}`, data);
    },
    removeLectureMentor: async (lectureId, mentorLectureId) => {
      return requester.del(`${apiUrl}/academy/lectures/${lectureId}/mentors/${mentorLectureId}`);
    },
    createLecture: async (lectureData) => {
      return requester.post(`${apiUrl}/academy/lectures`, lectureData);
    },

    updateLecture: async (lectureId, lectureData) => {
      return requester.put(`${apiUrl}/academy/lectures/${lectureId}`, lectureData);
    },

    deleteLecture: async (lectureId) => {
      return requester.del(`${apiUrl}/academy/lectures/${lectureId}`);
    },

    publishLecture: async (lectureId) => {
      return requester.post(`${apiUrl}/academy/lectures/${lectureId}/publish`);
    },
    getLectureById: async (id) => { 
      return requester.get(`${apiUrl}/academy/lectures/id/${id}`);
    },
    unpublishLecture: async (lectureId) => {
      return requester.post(`${apiUrl}/academy/lectures/${lectureId}/unpublish`);
    },

    cancelLecture: async (lectureId, reason = null) => {
      return requester.post(`${apiUrl}/academy/lectures/${lectureId}/cancel`, { reason });
    },

    startLecture: async (lectureId) => {
      return requester.post(`${apiUrl}/academy/lectures/${lectureId}/start`);
    },

    endLecture: async (lectureId) => {
      return requester.post(`${apiUrl}/academy/lectures/${lectureId}/end`);
    },

    getLectureStatistics: async (lectureId) => {
      return requester.get(`${apiUrl}/academy/lectures/${lectureId}/statistics`);
    },

    // =========================================================
    //                    LECTURE REGISTRATION
    // =========================================================

    getLectureAttendees: async (lectureId) => {
      return requester.get(`${apiUrl}/academy/lectures/${lectureId}/attendees`);
    },

    approveLectureAttendee: async (lectureId, attendeeId) => {
      return requester.post(`${apiUrl}/academy/lectures/${lectureId}/attendees/${attendeeId}/approve`);
    },

    // LECTURES - ENROLLMENT (поправени URLs)
    registerForLecture: async (lectureId) => {
      return requester.post(`${apiUrl}/academy/enrollment/lectures/${lectureId}/register`);
    },

    unregisterFromLecture: async (lectureId) => {
      return requester.post(`${apiUrl}/academy/enrollment/lectures/${lectureId}/unregister`);
    },

    checkLectureRegistration: async (lectureId) => {
      return requester.get(`${apiUrl}/academy/enrollment/lectures/${lectureId}/check`);
    },

    // =========================================================
    //                    SEMINARS - PUBLIC
    // =========================================================

    getSeminars: async (params = {}) => {
      const queryString = toQueryString(params);
      return requester.get(`${apiUrl}/academy/seminars?${queryString}`);
    },

    getSeminarBySlug: async (slug) => {
      return requester.get(`${apiUrl}/academy/seminars/${slug}`);
    },

    getSeminarCategories: async () => {
      return requester.get(`${apiUrl}/academy/seminars/meta/categories`);
    },

    // =========================================================
    //                    SEMINARS - ADMIN
    // =========================================================

    getAdminSeminars: async (params = {}) => {
      const queryString = toQueryString(params);
      return requester.get(`${apiUrl}/academy/seminars/admin?${queryString}`);
    },

    getSeminarAdminById: async (seminarId) => {
      return requester.get(`${apiUrl}/academy/seminars/${seminarId}/admin`);
    },

    createSeminar: async (seminarData) => {
      return requester.post(`${apiUrl}/academy/seminars`, seminarData);
    },

    updateSeminar: async (seminarId, seminarData) => {
      return requester.put(`${apiUrl}/academy/seminars/${seminarId}`, seminarData);
    },

    deleteSeminar: async (seminarId) => {
      return requester.del(`${apiUrl}/academy/seminars/${seminarId}`);
    },

    publishSeminar: async (seminarId) => {
      return requester.post(`${apiUrl}/academy/seminars/${seminarId}/publish`);
    },

    unpublishSeminar: async (seminarId) => {
      return requester.post(`${apiUrl}/academy/seminars/${seminarId}/unpublish`);
    },

    cancelSeminar: async (seminarId, reason = null) => {
      return requester.post(`${apiUrl}/academy/seminars/${seminarId}/cancel`, { reason });
    },

    startSeminar: async (seminarId) => {
      return requester.post(`${apiUrl}/academy/seminars/${seminarId}/start`);
    },

    endSeminar: async (seminarId) => {
      return requester.post(`${apiUrl}/academy/seminars/${seminarId}/end`);
    },

    getSeminarStatistics: async (seminarId) => {
      return requester.get(`${apiUrl}/academy/seminars/${seminarId}/statistics`);
    },

    // =========================================================
    //                    SEMINAR REGISTRATION
    // =========================================================

    registerForSeminar: async (seminarId) => {
      return requester.post(`${apiUrl}/academy/seminars/${seminarId}/register`);
    },

    unregisterFromSeminar: async (seminarId) => {
      return requester.del(`${apiUrl}/academy/seminars/${seminarId}/register`);
    },

    getSeminarAttendees: async (seminarId) => {
      return requester.get(`${apiUrl}/academy/seminars/${seminarId}/attendees`);
    },
searchSeminarStudents: async (seminarId, query) => {
      return requester.get(`${apiUrl}/academy/seminars/${seminarId}/search-students?q=${encodeURIComponent(query)}`);
    },

    bulkMixedAttendance: async (seminarId, data) => {
      return requester.post(`${apiUrl}/academy/seminars/${seminarId}/attendance/bulk-mixed`, data);
    },

    getFullAttendance: async (seminarId) => {
      return requester.get(`${apiUrl}/academy/seminars/${seminarId}/attendance/full`);
    },
    approveSeminarAttendee: async (seminarId, attendeeId) => {
      return requester.post(`${apiUrl}/academy/seminars/${seminarId}/attendees/${attendeeId}/approve`);
    },

    rejectSeminarAttendee: async (seminarId, attendeeId, reason = null) => {
      return requester.post(`${apiUrl}/academy/seminars/${seminarId}/attendees/${attendeeId}/reject`, { reason });
    },

    markSeminarAttended: async (seminarId, studentId, participationLevel = 'passive') => {
      return requester.post(`${apiUrl}/academy/seminars/${seminarId}/attendees/${studentId}/mark-attended`, { participationLevel });
    },

    markAllSeminarAttended: async (seminarId, studentIds, participationLevel = 'passive') => {
      return requester.post(`${apiUrl}/academy/seminars/${seminarId}/attendees/mark-all`, { studentIds, participationLevel });
    },

    // =========================================================
    //                    ENROLLMENT
    // =========================================================

    getMyEnrollments: async (params = {}) => {
      const queryString = toQueryString(params);
      return requester.get(`${apiUrl}/academy/enrollment/courses?${queryString}`);
    },

    enrollInCourse: async (courseId) => {
      return requester.post(`${apiUrl}/academy/enrollment/courses/${courseId}/enroll`);
    },

    dropCourse: async (courseId) => {
      return requester.post(`${apiUrl}/academy/enrollment/courses/${courseId}/drop`);
    },

    checkEnrollment: async (courseId) => {
      return requester.get(`${apiUrl}/academy/enrollment/courses/${courseId}/check`);
    },

    updateLessonProgress: async (lessonId, progressData) => {
      return requester.post(`${apiUrl}/academy/enrollment/lessons/${lessonId}/progress`, progressData);
    },

    completeLesson: async (lessonId) => {
      return requester.post(`${apiUrl}/academy/enrollment/lessons/${lessonId}/complete`);
    },
    // =========================================================
    //                    ENROLLMENT - SLUG BASED (НОВИ)
    // =========================================================

    // Обновява прогрес по урок (по slug)
    updateLessonProgressBySlug: async (lessonSlug, progressData) => {
      return requester.post(`${apiUrl}/academy/enrollment/lessons/${lessonSlug}/progress`, progressData);
    },

    // Завършва урок (по slug)
    completeLessonBySlug: async (lessonSlug) => {
      return requester.post(`${apiUrl}/academy/enrollment/lessons/${lessonSlug}/complete`);
    },
    // Admin enrollment management
    getCourseStudents: async (courseId, params = {}) => {
      const queryString = toQueryString(params);
      return requester.get(`${apiUrl}/academy/enrollment/admin/courses/${courseId}/students?${queryString}`);
    },

    approveEnrollment: async (courseId, studentId) => {
      return requester.post(`${apiUrl}/academy/enrollment/admin/courses/${courseId}/students/${studentId}/approve`);
    },

    rejectEnrollment: async (courseId, studentId, reason = null) => {
      return requester.post(`${apiUrl}/academy/enrollment/admin/courses/${courseId}/students/${studentId}/reject`, { reason });
    },
    startLessonBySlug: async (lessonSlug) => {
      return requester.post(`${apiUrl}/academy/enrollment/lessons/${lessonSlug}/start`);
    },
    startTestById: async (testId) => {
      return requester.post(`${apiUrl}/academy/tests/${testId}/start`);
    },
    // =========================================================
    //                    TESTS - ADMIN
    // =========================================================

    getTests: async (params = {}) => {
      const queryString = toQueryString(params);
      return requester.get(`${apiUrl}/academy/tests?${queryString}`);
    },
    getCourseTestStatus: async (courseId) => {
      return requester.get(`${apiUrl}/academy/tests/course/${courseId}/status`);
    },
    getTestById: async (testId) => {
      return requester.get(`${apiUrl}/academy/tests/${testId}`);
    },

    createTest: async (testData) => {
      return requester.post(`${apiUrl}/academy/tests`, testData);
    },

    updateTest: async (testId, testData) => {
      return requester.put(`${apiUrl}/academy/tests/${testId}`, testData);
    },

    deleteTest: async (testId) => {
      return requester.del(`${apiUrl}/academy/tests/${testId}`);
    },

    publishTest: async (testId) => {
      return requester.post(`${apiUrl}/academy/tests/${testId}/publish`);
    },

    unpublishTest: async (testId) => {
      return requester.post(`${apiUrl}/academy/tests/${testId}/unpublish`);
    },

    getTestAttempts: async (testId, params = {}) => {
      const queryString = toQueryString(params);
      return requester.get(`${apiUrl}/academy/tests/${testId}/attempts?${queryString}`);
    },

    // =========================================================
    //                    TEST QUESTIONS
    // =========================================================

    addQuestion: async (testId, questionData) => {
      return requester.post(`${apiUrl}/academy/tests/${testId}/questions`, questionData);
    },

    updateQuestion: async (testId, questionId, questionData) => {
      return requester.put(`${apiUrl}/academy/tests/${testId}/questions/${questionId}`, questionData);
    },

    deleteQuestion: async (testId, questionId) => {
      return requester.del(`${apiUrl}/academy/tests/${testId}/questions/${questionId}`);
    },

    reorderQuestions: async (testId, questionIds) => {
      return requester.put(`${apiUrl}/academy/tests/${testId}/questions/reorder`, { questionIds });
    },

    // =========================================================
    //                    TEST TAKING (Student)
    // =========================================================

    // academyCoursesService.js
    startTest: async (lessonId) => {
      return requester.post(`${apiUrl}/academy/tests/lesson/${lessonId}/start`);
    },

    getCurrentAttempt: async (testId) => {
      return requester.get(`${apiUrl}/academy/tests/${testId}/attempt`);
    },
    submitAnswer: async (testId, answerData) => {
      return requester.post(`${apiUrl}/academy/tests/${testId}/answer`, answerData);
    },

    submitTest: async (testId) => {
      return requester.post(`${apiUrl}/academy/tests/${testId}/submit`);
    },

    getTestResults: async (testId) => {
      return requester.get(`${apiUrl}/academy/tests/${testId}/results`);
    },
    getTestStatus: async (lessonId) => {
      return requester.get(`${apiUrl}/academy/tests/lesson/${lessonId}/status`);
    },

    // Резултат от конкретен опит
    getTestResultByAttempt: async (testId, attemptId) => {
      return requester.get(`${apiUrl}/academy/tests/${testId}/result/${attemptId}`);
    },
    // ============ LECTURE TESTS ============
    startLectureTest: async (lectureId) => {
      return requester.post(`${apiUrl}/academy/tests/lecture/${lectureId}/start`);
    },

    getLectureTestStatus: async (lectureId) => {
      return requester.get(`${apiUrl}/academy/tests/lecture/${lectureId}/status`);
    },

    getLectureAttempt: async (lectureId) => {
      return requester.get(`${apiUrl}/academy/tests/lecture/${lectureId}/attempt`);
    },
    // ============ LECTURE TESTS - НОВИ ============
    submitLectureAnswer: async (lectureTestId, answerData) => {
      return requester.post(`${apiUrl}/academy/tests/lecture/${lectureTestId}/answer`, answerData);
    },

    submitLectureTest: async (lectureTestId) => {
      return requester.post(`${apiUrl}/academy/tests/lecture/${lectureTestId}/submit`);
    },
    // =========================================================
    //                    CERTIFICATES
    // =========================================================

    getMyCertificates: async (params = {}) => {
      const queryString = toQueryString(params);
      return requester.get(`${apiUrl}/academy/my/certificates?${queryString}`);
    },

    verifyCertificate: async (code) => {
      return requester.get(`${apiUrl}/academy/certificates/verify/${code}`);
    },

    // Admin
    getAllCertificates: async (params = {}) => {
      const queryString = toQueryString(params);
      return requester.get(`${apiUrl}/academy/certificates?${queryString}`);
    },

    getCertificateById: async (certificateId) => {
      return requester.get(`${apiUrl}/academy/certificates/${certificateId}`);
    },

    createCertificate: async (certificateData) => {
      return requester.post(`${apiUrl}/academy/certificates`, certificateData);
    },

    generateCertificate: async (enrollmentId, options = {}) => {
      return requester.post(`${apiUrl}/academy/certificates/generate/${enrollmentId}`, options);
    },

    bulkGenerateCertificates: async (courseId, options = {}) => {
      return requester.post(`${apiUrl}/academy/certificates/bulk-generate`, { courseId, ...options });
    },

    updateCertificate: async (certificateId, certificateData) => {
      return requester.put(`${apiUrl}/academy/certificates/${certificateId}`, certificateData);
    },

    revokeCertificate: async (certificateId, reason = null) => {
      return requester.post(`${apiUrl}/academy/certificates/${certificateId}/revoke`, { reason });
    },

    deleteCertificate: async (certificateId) => {
      return requester.del(`${apiUrl}/academy/certificates/${certificateId}`);
    },

    getCertificateStats: async () => {
      return requester.get(`${apiUrl}/academy/certificates/stats/overview`);
    },

    // =========================================================
    //                    MATERIALS
    // =========================================================

    // Course materialss
    getCourseMaterials: async (courseSlug) => {
      return requester.get(`${apiUrl}/academy/materials/courses/${courseSlug}`);
    },

    addCourseMaterial: async (courseSlug, materialData) => {
      return requester.post(`${apiUrl}/academy/materials/courses/${courseSlug}`, materialData);
    },

    // Lesson materials
    getLessonMaterials: async (lessonSlug) => {
      return requester.get(`${apiUrl}/academy/materials/lessons/${lessonSlug}`);
    },

    addLessonMaterial: async (lessonSlug, materialData) => {
      return requester.post(`${apiUrl}/academy/materials/lessons/${lessonSlug}`, materialData);
    },

    // Lecture materials
    getLectureMaterials: async (lectureSlug) => {
      return requester.get(`${apiUrl}/academy/materials/lectures/${lectureSlug}`);
    },

    addLectureMaterial: async (lectureSlug, materialData) => {
      return requester.post(`${apiUrl}/academy/materials/lectures/${lectureSlug}`, materialData);
    },

    // Seminar materials
    getSeminarMaterials: async (seminarSlug) => {
      return requester.get(`${apiUrl}/academy/materials/seminars/${seminarSlug}`);
    },

    addSeminarMaterial: async (seminarSlug, materialData) => {
      return requester.post(`${apiUrl}/academy/materials/seminars/${seminarSlug}`, materialData);
    },

    // Generic material operations
    getMaterial: async (entityType, entityId, materialId) => {
      return requester.get(`${apiUrl}/academy/materials/${entityType}/${entityId}/${materialId}`);
    },

    updateMaterial: async (entityType, entityId, materialId, materialData) => {
      return requester.put(`${apiUrl}/academy/materials/${entityType}/${entityId}/${materialId}`, materialData);
    },

    deleteMaterial: async (entityType, entityId, materialId) => {
      return requester.del(`${apiUrl}/academy/materials/${entityType}/${entityId}/${materialId}`);
    },

    reorderMaterials: async (entityType, entityId, materialIds) => {
      return requester.put(`${apiUrl}/academy/materials/${entityType}/${entityId}/reorder`, { materialIds });
    },

    bulkAddMaterials: async (entityType, entityId, materials) => {
      return requester.post(`${apiUrl}/academy/materials/${entityType}/${entityId}/bulk`, { materials });
    },

    bulkDeleteMaterials: async (entityType, entityId, materialIds) => {
      return requester.del(`${apiUrl}/academy/materials/${entityType}/${entityId}/bulk`, { materialIds });
    },

    downloadMaterial: async (entityType, entityId, materialId) => {
      return requester.post(`${apiUrl}/academy/materials/${entityType}/${entityId}/${materialId}/download`);
    },

    getMaterialTypes: async () => {
      return requester.get(`${apiUrl}/academy/materials/types`);
    },

    getMaterialStats: async () => {
      return requester.get(`${apiUrl}/academy/materials/stats/overview`);
    },
    deleteLessonMaterial: async (lessonId, materialId) => {
      return requester.del(`${apiUrl}/academy/materials/lesson/${lessonId}/${materialId}`);
    },
    // =========================================================
    //                    MY ACADEMY (Student Dashboard)
    // =========================================================

    getMyDashboard: async () => {
      return requester.get(`${apiUrl}/academy/my/dashboard`);
    },

    getMyCourses: async (params = {}) => {
      const queryString = toQueryString(params);
      return requester.get(`${apiUrl}/academy/my/courses?${queryString}`);
    },

    getContinueCourses: async (limit = 3) => {
      return requester.get(`${apiUrl}/academy/my/courses/continue?limit=${limit}`);
    },

    getMyLectures: async (params = {}) => {
      const queryString = toQueryString(params);
      return requester.get(`${apiUrl}/academy/my/lectures?${queryString}`);
    },

    getUpcomingLectures: async (limit = 5) => {
      return requester.get(`${apiUrl}/academy/my/lectures/upcoming?limit=${limit}`);
    },

    getMySeminars: async (params = {}) => {
      const queryString = toQueryString(params);
      return requester.get(`${apiUrl}/academy/my/seminars?${queryString}`);
    },

    getUpcomingSeminars: async (limit = 5) => {
      return requester.get(`${apiUrl}/academy/my/seminars/upcoming?limit=${limit}`);
    },

    getMyAcademyCertificates: async (params = {}) => {
      const queryString = toQueryString(params);
      return requester.get(`${apiUrl}/academy/my/certificates?${queryString}`);
    },

    getMyProgress: async () => {
      return requester.get(`${apiUrl}/academy/my/progress`);
    },

    getMyCourseProgress: async (courseId) => {
      return requester.get(`${apiUrl}/academy/my/progress/course/${courseId}`);
    },

    updateMyLessonProgress: async (lessonId, progressData) => {
      return requester.post(`${apiUrl}/academy/my/progress/lesson/${lessonId}`, progressData);
    },

    completeMyLesson: async (lessonId) => {
      return requester.post(`${apiUrl}/academy/my/progress/lesson/${lessonId}/complete`);
    },

    getMySchedule: async (days = 30) => {
      return requester.get(`${apiUrl}/academy/my/schedule?days=${days}`);
    },
  };
};

export default academyCoursesServiceFactory;