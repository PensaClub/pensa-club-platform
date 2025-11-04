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
      /* BACKEND TODO: GET /api/academy/mentors/statistics/overview */
    },

    getMentorsBySpecialization: async () => {
      return requester.get(`${apiUrl}/academy/mentors/statistics/by-specialization`);
      /* BACKEND TODO: GET /api/academy/mentors/statistics/by-specialization */
    },

    getMentorActivityTrend: async (months = 6) => {
      return requester.get(`${apiUrl}/academy/mentors/statistics/activity-trend?months=${months}`);
      /* BACKEND TODO: GET /api/academy/mentors/statistics/activity-trend */
    },

    getMentorDetailedStatistics: async (mentorId) => {
      return requester.get(`${apiUrl}/academy/mentors/${mentorId}/detailed-statistics`);
      /* BACKEND TODO: GET /api/academy/mentors/:id/detailed-statistics */
    },

    getMentorsStats: async () => {
      return requester.get(`${apiUrl}/academy/mentors/stats`);
      /* BACKEND TODO: GET /api/academy/mentors/stats */
    },

    // ===============================
    // ADMIN NOTIFICATIONS (TODO - ПРАВИМ СЕГА)
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
      /* BACKEND TODO: PUT /api/academy/admin/notifications/mark-all-read */
    },

    deleteNotification: async (notificationId) => {
      return requester.del(`${apiUrl}/academy/admin/notifications/${notificationId}`);
      /* BACKEND TODO: DELETE /api/academy/admin/notifications/:id */
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
  };
};

export default academyServiceFactory;