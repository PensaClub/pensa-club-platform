// src/services/academyService.js

import { requestFactory } from "./requester";

const apiUrl = import.meta.env.VITE_API_URL;

export const academyServiceFactory = () => {
  const requester = requestFactory();

  return {
    // ===============================
    // LANDING PAGE (TODO)
    // ===============================

    getStats: async () => {
      return requester.get(`${apiUrl}/academy/stats`);
      /* BACKEND TODO: GET /api/academy/stats */
    },

    getFeaturedTestimonials: async (limit = 5) => {
      return requester.get(`${apiUrl}/academy/testimonials/featured?limit=${limit}`);
      /* BACKEND TODO: GET /api/academy/testimonials/featured */
    },

    getFeaturedMentors: async (limit = 3) => {
      return requester.get(`${apiUrl}/academy/mentors/featured?limit=${limit}`);
      /* BACKEND TODO: GET /api/academy/mentors/featured */
    },

    // ===============================
    // MENTORS - ГОТОВИ ✅
    // ===============================

    getAllMentors: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return requester.get(`${apiUrl}/academy/mentors?${queryString}`);
    },

    createMentor: async (mentorData) => {
      return requester.post(`${apiUrl}/academy/mentors`, mentorData);
    },

    getMentorById: async (mentorId) => {
      return requester.get(`${apiUrl}/academy/mentors/${mentorId}`);
    },

    updateMentor: async (mentorId, data) => {
      return requester.patch(`${apiUrl}/academy/mentors/${mentorId}`, data);
    },

    activateMentor: async (mentorId) => {
      return requester.patch(`${apiUrl}/academy/mentors/${mentorId}/activate`);
    },

    deactivateMentor: async (mentorId) => {
      return requester.patch(`${apiUrl}/academy/mentors/${mentorId}/deactivate`);
    },

    deleteMentor: async (mentorId) => {
      return requester.del(`${apiUrl}/academy/mentors/${mentorId}`);
    },

    bulkDeleteMentors: async (mentorIds) => {
      return requester.post(`${apiUrl}/academy/mentors/bulk-delete`, { mentorIds });
    },

    updateMentorAdminNotes: async (mentorId, notes) => {
      return requester.patch(`${apiUrl}/academy/mentors/${mentorId}/admin-notes`, { adminNotes: notes });
    },

    updateMentorPriorityContact: async (mentorId, priorityContact) => {
      return requester.patch(`${apiUrl}/academy/mentors/${mentorId}/priority-contact`, { priorityContact });
    },

    // ===============================
    // MENTOR APPLICATIONS - ГОТОВИ ✅
    // ===============================
    applyAsMentor: async (applicationData) => {

      return requester.post(`${apiUrl}/academy/mentors/apply`, applicationData);
    },

    getPendingMentorApplications: async () => {
      return requester.get(`${apiUrl}/academy/mentors/applications/pending`);
    },

    getApprovedMentors: async () => {
      return requester.get(`${apiUrl}/academy/mentors/approved`);
    },

    getRejectedMentorApplications: async () => {
      return requester.get(`${apiUrl}/academy/mentors/applications/rejected`);
    },

    approveMentor: async (applicationId) => {
      return requester.post(`${apiUrl}/academy/mentors/applications/${applicationId}/approve`);
    },

    rejectMentorApplication: async (applicationId, rejectionReason) => {
      return requester.post(`${apiUrl}/academy/mentors/applications/${applicationId}/reject`, {
        rejectionReason
      });
    },

    // ===============================
    // MENTOR CONTACT (TODO)
    // ===============================

    contactMentor: async (mentorId, contactData) => {
      return requester.post(`${apiUrl}/academy/mentors/${mentorId}/contact`, contactData);
      /* BACKEND TODO: POST /api/academy/mentors/:mentorId/contact */
    },

    // ===============================
    // MENTOR STATISTICS (TODO)
    // ===============================

    getMentorStatistics: async (timeFilter = 'thisMonth') => {
      return requester.get(`${apiUrl}/academy/mentors/statistics?timeFilter=${timeFilter}`);
      /* BACKEND TODO: GET /api/academy/mentors/statistics */
    },

    getMentorStatisticsOverview: async () => {
      return requester.get(`${apiUrl}/academy/mentors/statistics/overview`);

    },

    getMentorsBySpecialization: async () => {
      return requester.get(`${apiUrl}/academy/mentors/statistics/by-specialization`);

    },

    getMentorActivityTrend: async (months = 6) => {
      return requester.get(`${apiUrl}/academy/mentors/statistics/activity-trend?months=${months}`);

    },

    getMentorDetailedStatistics: async (mentorId) => {
      return requester.get(`${apiUrl}/academy/mentors/${mentorId}/detailed-statistics`);
      /* BACKEND TODO: GET /api/academy/mentors/:id/detailed-statistics */
    },

    getMentorsStats: async () => {
      return requester.get(`${apiUrl}/academy/mentors/stats`);

    },

    // ===============================
    // ADMIN NOTIFICATIONS 
    // ===============================

    createAdminNotification: async (notificationData) => {
      return requester.post(`${apiUrl}/academy/admin/notifications`, notificationData);
      /* BACKEND TODO: POST /api/academy/admin/notifications */
    },

    getAdminNotifications: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return requester.get(`${apiUrl}/academy/admin/notifications?${queryString}`);
      /* BACKEND TODO: GET /api/academy/admin/notifications */
    },

    markNotificationAsRead: async (notificationId) => {
      return requester.put(`${apiUrl}/academy/admin/notifications/${notificationId}/read`);
      /* BACKEND TODO: PUT /api/academy/admin/notifications/:id/read */
    },

    markAllNotificationsAsRead: async () => {
      return requester.put(`${apiUrl}/academy/admin/notifications/mark-all-read`);

    },

    deleteNotification: async (notificationId) => {
      return requester.del(`${apiUrl}/academy/admin/notifications/${notificationId}`);

    },
    // ===============================
    // FIREBASE STATISTICS 🔥
    // ===============================

    getAllMentorsWithStats: async () => {
      return requester.get(`${apiUrl}/academy/mentors/all-with-stats`);
    },

    getMentorFirebaseStats: async (mentorId) => {
      return requester.get(`${apiUrl}/academy/mentors/${mentorId}/firebase-stats`);
    },

    refreshMentorStats: async (mentorId) => {
      return requester.post(`${apiUrl}/academy/mentors/${mentorId}/refresh-stats`);
    },

    getFirebaseOverviewStats: async () => {
      return requester.get(`${apiUrl}/academy/mentors/statistics/firebase-overview`);
    },
    // ===============================
    // ACTIVITY TRACKING & CHARTS - ФАЗА 2.2 📊
    // ===============================

    getTopMentorsByOnlineTime: async (limit = 5) => {
      return requester.get(`${apiUrl}/academy/mentors/statistics/top-by-online-time?limit=${limit}`);
    },

    getResponseTimesStats: async () => {
      return requester.get(`${apiUrl}/academy/mentors/statistics/response-times`);
    },

    getActivityTrend: async (months = 6) => {
      return requester.get(`${apiUrl}/academy/mentors/statistics/activity-trend?months=${months}`);
    },

    getSessionQuality: async () => {
      return requester.get(`${apiUrl}/academy/mentors/statistics/session-quality`);
    },
    getAllMentorsWithStatsFiltered: async (timeFilter) => {
      return requester.get(`${apiUrl}/academy/mentors/all-with-stats-filtered?timeFilter=${timeFilter}`);
    },
    // ===============================
    // SESSION SYNC 🔄
    // ===============================

    syncSession: async (sessionId, mentorEmail) => {
      return requester.post(`${apiUrl}/academy/sync-session`, {
        sessionId,
        mentorEmail
      });
    },
    // ===============================
    // ACADEMY REVIEWS ✨
    // ===============================

    createAcademyReview: async (reviewData) => {
      return requester.post(`${apiUrl}/reviews/academy`, reviewData);
    },

    getApprovedAcademyReviews: async () => {
      return requester.get(`${apiUrl}/reviews/academy/approved`);
    },

    checkUserAcademyReviewStatus: async () => {
      return requester.get(`${apiUrl}/reviews/academy/user-status`);
    },

    // COURSE REVIEWS
    createCourseReview: async (courseId, reviewData) => {
      return requester.post(`${apiUrl}/reviews/course/${courseId}`, reviewData);
    },

    getApprovedCourseReviews: async (courseId, limit = 20) => {
      return requester.get(`${apiUrl}/reviews/course/${courseId}/approved?limit=${limit}`);
    },

    getCourseReviewStats: async (courseId) => {
      return requester.get(`${apiUrl}/reviews/course/${courseId}/stats`);
    },

    checkUserCourseReviewStatus: async (courseId) => {
      return requester.get(`${apiUrl}/reviews/course/${courseId}/user-status`);
    },

    // USER'S OWN REVIEWS
    getUserReviews: async () => {
      return requester.get(`${apiUrl}/reviews/my`);
    },

    // LECTURE REVIEWS
    createLectureReview: async (lectureId, reviewData) => {
      return requester.post(`${apiUrl}/reviews/lecture/${lectureId}`, reviewData);
    },

    getApprovedLectureReviews: async (lectureId, limit = 20) => {
      return requester.get(`${apiUrl}/reviews/lecture/${lectureId}/approved?limit=${limit}`);
    },

    getLectureReviewStats: async (lectureId) => {
      return requester.get(`${apiUrl}/reviews/lecture/${lectureId}/stats`);
    },

    checkUserLectureReviewStatus: async (lectureId) => {
      return requester.get(`${apiUrl}/reviews/lecture/${lectureId}/user-status`);
    },

    // MENTOR REVIEWS

    createMentorReview: async (mentorId, reviewData) => {
      return requester.post(`${apiUrl}/reviews/mentor/${mentorId}`, reviewData);
    },

    getApprovedMentorReviews: async (mentorId, limit = 10) => {
      return requester.get(`${apiUrl}/reviews/mentor/${mentorId}/approved?limit=${limit}`);
    },

    getMentorReviewStats: async (mentorId) => {
      return requester.get(`${apiUrl}/reviews/mentor/${mentorId}/stats`);
    },
    checkUserMentorReviewStatus: async (mentorId) => {
      return requester.get(`${apiUrl}/reviews/mentor/${mentorId}/user-status`);
    },
    getPendingReviews: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();

      return requester.get(`${apiUrl}/reviews/admin/all?${queryString}`);
    },

    approveReview: async (reviewId) => {
      return requester.patch(`${apiUrl}/reviews/${reviewId}/approve`);
    },

    rejectReview: async (reviewId, rejectionReason) => {
      return requester.patch(`${apiUrl}/reviews/${reviewId}/reject`, { rejectionReason });
    },

    deleteReview: async (reviewId) => {
      return requester.del(`${apiUrl}/reviews/${reviewId}`);
    },

    // ✅ НОВИ ENDPOINTS:

    getMentorDashboardStats: async () => {
      return requester.get(`${apiUrl}/mentors/dashboard/stats`);
    },
    getMentorRecentActivity: async (limit = 10) => {
      return requester.get(`${apiUrl}/mentors/dashboard/recent-activity?limit=${limit}`);
    },
    getMentorUpcomingSessions: async (limit = 10) => {
      return requester.get(`${apiUrl}/mentors/dashboard/upcoming-sessions?limit=${limit}`);
    },
    getMentorStudents: async () => {
      return requester.get(`${apiUrl}/mentors/dashboard/students`);
    },
    getMentorPerformanceData: async () => {
      return requester.get(`${apiUrl}/mentors/dashboard/performance`);
    },
    // MENTOR MEETINGS ENDPOINTS
    getMentorMeetings: async (status = null) => {
      const query = status ? `?status=${status}` : '';
      return requester.get(`${apiUrl}/mentors/dashboard/meetings${query}`);
    },

    createMentorMeeting: async (meetingData) => {
      return requester.post(`${apiUrl}/mentors/dashboard/meetings`, meetingData);
    },

    updateMentorMeeting: async (meetingId, meetingData) => {
      return requester.patch(`${apiUrl}/mentors/dashboard/meetings/${meetingId}`, meetingData);
    },

    completeMentorMeeting: async (meetingId, completionData) => {
      return requester.post(`${apiUrl}/mentors/dashboard/meetings/${meetingId}/complete`, completionData);
    },

    cancelMentorMeeting: async (meetingId) => {
      return requester.patch(`${apiUrl}/mentors/dashboard/meetings/${meetingId}/cancel`);
    },

    deleteMentorMeeting: async (meetingId) => {
      return requester.del(`${apiUrl}/mentors/dashboard/meetings/${meetingId}`);
    },
    // MENTOR PROFILE EDIT
    getMentorProfile: async () => {
      return requester.get(`${apiUrl}/mentors/dashboard/my-profile`);
    },

    updateMentorProfile: async (profileData) => {
      return requester.patch(`${apiUrl}/mentors/dashboard/my-profile`, profileData);
    },
    // STUDENT DETAILS
    getStudentDetails: async (studentId) => {
      return requester.get(`${apiUrl}/mentors/dashboard/students/${studentId}/details`);
    },
    getStudentNotes: async (studentId) => {
      return requester.get(`${apiUrl}/mentors/dashboard/students/${studentId}/notes`);
    },
    applyForMentor: async (mentorId) => {
      return requester.post(`${apiUrl}/academy/mentors/${mentorId}/apply-student`);
    },
    createStudentNote: async (studentId, noteData) => {
      return requester.post(`${apiUrl}/mentors/dashboard/students/${studentId}/notes`, noteData);
    },

    updateStudentNote: async (noteId, noteData) => {
      return requester.patch(`${apiUrl}/mentors/dashboard/notes/${noteId}`, noteData);
    },

    deleteStudentNote: async (noteId) => {
      return requester.del(`${apiUrl}/mentors/dashboard/notes/${noteId}`);
    },
    acceptStudent: async (studentId) => {
      return requester.post(`${apiUrl}/mentors/dashboard/students/${studentId}/accept`);
    },

    removeStudent: async (studentId) => {
      return requester.post(`${apiUrl}/mentors/dashboard/students/${studentId}/remove`);
    },
    getMentorOwnReviews: async (limit = 100) => {
      return requester.get(`${apiUrl}/mentors/dashboard/my-reviews?limit=${limit}`);
    },

    getMentorOwnReviewStats: async () => {
      return requester.get(`${apiUrl}/mentors/dashboard/my-reviews/stats`);
    },
    // ===============================
    // MENTOR: MANAGE STUDENT APPLICATIONS (за следващ етап)
    // ===============================

    getStudentApplications: async () => {
      return requester.get(`${apiUrl}/mentors/dashboard/student-applications`);
    },

    approveStudentApplication: async (applicationId) => {
      return requester.post(`${apiUrl}/mentors/dashboard/student-applications/${applicationId}/approve`);
    },

    rejectStudentApplication: async (applicationId, reason) => {
      return requester.post(`${apiUrl}/mentors/dashboard/student-applications/${applicationId}/reject`, { rejectionReason: reason });
    },

    deleteStudentApplication: async (applicationId) => {
      return requester.del(`${apiUrl}/mentors/dashboard/student-applications/${applicationId}`);
    },
    reapproveStudentApplication: async (applicationId) => {
      return requester.post(`${apiUrl}/mentors/dashboard/student-applications/${applicationId}/reapprove`);
    },

    // ===============================
    // ADMIN STUDENTS MANAGEMENT 📚
    // ===============================

    getAllStudents: async (params = {}) => {
      // Филтрирай undefined/null/'' преди URLSearchParams
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
      );
      const queryString = new URLSearchParams(cleanParams).toString();
      return requester.get(`${apiUrl}/academy/admin/students?${queryString}`);
    },

    getStudentById: async (studentId) => {
      return requester.get(`${apiUrl}/academy/admin/students/${studentId}`);
    },

    updateStudent: async (studentId, data) => {
      return requester.patch(`${apiUrl}/academy/admin/students/${studentId}`, data);
    },

    deleteStudent: async (studentId) => {
      return requester.del(`${apiUrl}/academy/admin/students/${studentId}`);
    },

    updateStudentStatus: async (studentId, status) => {
      return requester.patch(`${apiUrl}/academy/admin/students/${studentId}/status`, { status });
    },

    assignMentorToStudent: async (studentId, newMentorId) => {
      return requester.post(`${apiUrl}/academy/admin/students/${studentId}/assign-mentor`, { newMentorId });
    },

    sendEmailToStudent: async (studentId, emailData) => {
      return requester.post(`${apiUrl}/academy/admin/students/${studentId}/send-email`, emailData);
    },

    // ===============================
    // ADMIN STUDENT NOTES 📝
    // ===============================

    updateAdminStudentNote: async (studentId, noteId, noteData) => {
      return requester.patch(`${apiUrl}/academy/admin/students/${studentId}/notes/${noteId}`, noteData);
    },

    // ===============================
    // STUDENT STATISTICS 📊
    // ===============================

    getStudentStatisticsOverview: async () => {
      return requester.get(`${apiUrl}/academy/admin/students/statistics/overview`);
    },
    getMyMentor: async () => {
      return requester.get(`${apiUrl}/academy/my/mentor`);
    },
    getStudentsByStatus: async () => {
      return requester.get(`${apiUrl}/academy/admin/students/statistics/by-status`);
    },

    getStudentsByMentor: async () => {
      return requester.get(`${apiUrl}/academy/admin/students/statistics/by-mentor`);
    },

    getStudentsCreditsDistribution: async () => {
      return requester.get(`${apiUrl}/academy/admin/students/statistics/credits-distribution`);
    },

    getStudentsAttendanceTrends: async () => {
      return requester.get(`${apiUrl}/academy/admin/students/statistics/attendance-trends`);
    },

    getTopPerformingStudents: async (limit = 10) => {
      return requester.get(`${apiUrl}/academy/admin/students/statistics/top-performers?limit=${limit}`);
    },

    getStudentsEngagement: async () => {
      return requester.get(`${apiUrl}/academy/admin/students/statistics/engagement`);
    },
    // ===============================
    // ADMIN: STUDENT APPLICATIONS (за /admin/student-applications)
    // ===============================

    getAllStudentApplications: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return requester.get(`${apiUrl}/academy/admin/student-applications?${queryString}`);
    },

    approveStudentApplicationByAdmin: async (applicationId) => {
      return requester.post(`${apiUrl}/academy/admin/student-applications/${applicationId}/approve`);
    },

    rejectStudentApplicationByAdmin: async (applicationId, rejectionReason) => {
      return requester.post(`${apiUrl}/academy/admin/student-applications/${applicationId}/reject`, {
        rejectionReason
      });
    },

    deleteStudentApplicationByAdmin: async (applicationId) => {
      return requester.del(`${apiUrl}/academy/admin/student-applications/${applicationId}`);
    },
    reapproveStudentApplicationByAdmin: async (applicationId) => {
      return requester.post(`${apiUrl}/academy/admin/student-applications/${applicationId}/reapprove`);
    },
    // ===============================
    // ADMIN STUDENT NOTES 📝 
    // ===============================

    getAdminStudentNotes: async (studentId) => {
      return requester.get(`${apiUrl}/academy/admin/students/${studentId}/notes`);
    },

    createAdminStudentNote: async (studentId, noteData) => {
      return requester.post(`${apiUrl}/academy/admin/students/${studentId}/notes`, noteData);
    },

    // updateAdminStudentNote: async (studentId, noteId, noteData) => {
    //   return requester.patch(`${apiUrl}/academy/admin/students/${studentId}/notes/${noteId}`, noteData);
    // },

    deleteAdminStudentNote: async (studentId, noteId) => {
      return requester.del(`${apiUrl}/academy/admin/students/${studentId}/notes/${noteId}`);
    },
  };
};

export default academyServiceFactory;