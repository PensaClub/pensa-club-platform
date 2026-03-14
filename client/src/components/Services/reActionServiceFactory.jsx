import { requestFactory } from './requester';

const apiUrl = import.meta.env.VITE_API_URL;

export const reActionServiceFactory = (token) => {
  const requester = requestFactory(token);

  return {
    // ===============================
    // PUBLIC
    // ===============================
    getAvailability: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return requester.get(`${apiUrl}/reaction/availability${queryString ? '?' + queryString : ''}`);
    },

    submitRequest: async (data) => {
      return requester.post(`${apiUrl}/reaction/requests`, data);
    },

    trackRequest: async (code) => {
      return requester.get(`${apiUrl}/reaction/track/${code}`);
    },

    getTestimonials: async () => {
      return requester.get(`${apiUrl}/reaction/testimonials`);
    },

    submitTestimonial: async (data) => {
      return requester.post(`${apiUrl}/reaction/testimonials`, data);
    },

    getPublicStats: async () => {
      return requester.get(`${apiUrl}/reaction/stats`);
    },

    getGallery: async () => {
      return requester.get(`${apiUrl}/reaction/gallery`);
    },

    // ===============================
    // ADMIN
    // ===============================
    getAdminRequests: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return requester.get(`${apiUrl}/reaction/admin/requests?${queryString}`);
    },

    getAdminRequestById: async (id) => {
      return requester.get(`${apiUrl}/reaction/admin/requests/${id}`);
    },

    updateRequest: async (id, data) => {
      return requester.patch(`${apiUrl}/reaction/admin/requests/${id}`, data);
    },

    deleteRequest: async (id) => {
      return requester.del(`${apiUrl}/reaction/admin/requests/${id}`);
    },

    getCalendar: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return requester.get(`${apiUrl}/reaction/admin/calendar?${queryString}`);
    },

    getMentorsForDate: async (date) => {
      return requester.get(`${apiUrl}/reaction/admin/mentors-for-date/${date}`);
    },

    getAdminStats: async () => {
      return requester.get(`${apiUrl}/reaction/admin/stats`);
    },

    exportCSV: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return requester.get(`${apiUrl}/reaction/admin/export?${queryString}`);
    },

    getAdminTestimonials: async () => {
      return requester.get(`${apiUrl}/reaction/admin/testimonials`);
    },

    createTestimonial: async (data) => {
      return requester.post(`${apiUrl}/reaction/admin/testimonials`, data);
    },

    updateTestimonial: async (id, data) => {
      return requester.patch(`${apiUrl}/reaction/admin/testimonials/${id}`, data);
    },

    deleteTestimonial: async (id) => {
      return requester.del(`${apiUrl}/reaction/admin/testimonials/${id}`);
    },

    sendEmail: async (data) => {
      return requester.post(`${apiUrl}/reaction/admin/send-email`, data);
    },

    getAdminGallery: async () => {
      return requester.get(`${apiUrl}/reaction/admin/gallery`);
    },

    createGalleryItem: async (data) => {
      return requester.post(`${apiUrl}/reaction/admin/gallery`, data);
    },

    updateGalleryItem: async (id, data) => {
      return requester.patch(`${apiUrl}/reaction/admin/gallery/${id}`, data);
    },

    reorderGallery: async (items) => {
      return requester.patch(`${apiUrl}/reaction/admin/gallery/reorder`, { items });
    },

    deleteGalleryItem: async (id) => {
      return requester.del(`${apiUrl}/reaction/admin/gallery/${id}`);
    },

    // ===============================
    // MENTOR
    // ===============================
    getMentorAvailability: async () => {
      return requester.get(`${apiUrl}/reaction/mentor/availability`);
    },

    setMentorAvailability: async (data) => {
      return requester.put(`${apiUrl}/reaction/mentor/availability`, data);
    },

    getMentorAssignments: async () => {
      return requester.get(`${apiUrl}/reaction/mentor/assignments`);
    },

    confirmAssignment: async (id) => {
      return requester.patch(`${apiUrl}/reaction/mentor/assignments/${id}/confirm`);
    },

    reportProblem: async (id, data) => {
      return requester.patch(`${apiUrl}/reaction/mentor/assignments/${id}/report-problem`, data);
    },

    getMentorHistory: async () => {
      return requester.get(`${apiUrl}/reaction/mentor/history`);
    },

    submitFeedback: async (data) => {
      return requester.post(`${apiUrl}/reaction/mentor/feedback`, data);
    },

    cancelByCode: async (code, data = {}) => {
      return requester.patch(`${apiUrl}/reaction/track/${code}/cancel`, data);
    },

    // ===============================
    // USER (My Requests)
    // ===============================
    getMyRequests: async () => {
      return requester.get(`${apiUrl}/reaction/my`);
    },

    cancelMyRequest: async (id, data = {}) => {
      return requester.patch(`${apiUrl}/reaction/my/${id}/cancel`, data);
    },
  };
};

export default reActionServiceFactory;
