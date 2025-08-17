import { requestFactory } from "./requester";

const apiUrl = import.meta.env.VITE_API_URL;

export const clubServiceFactory = (token) => {
  const requester = requestFactory(token);

  return {
    // ===============================
    // ОСНОВНИ CRUD ОПЕРАЦИИ
    // ===============================
    
    createClub: async (clubData) => {
      return requester.post(`${apiUrl}/clubs/create`, clubData);
    },

    getAllClubs: async (page = 1, limit = 12) => {
      return requester.get(`${apiUrl}/clubs/all?page=${page}&limit=${limit}`);
    },

    getClubByIdentifier: async (identifier) => {
      return requester.get(`${apiUrl}/clubs/single/${identifier}`);
    },

    updateClub: async (identifier, clubData) => {
      // identifier може да е ID или slug
      return requester.put(`${apiUrl}/clubs/${identifier}`, clubData);
    },

    deleteClub: async (identifier) => {
      // identifier може да е ID или slug
      return requester.del(`${apiUrl}/clubs/${identifier}`);
    },

    // ===============================
    // DRAFT ФУНКЦИОНАЛНОСТИ
    // ===============================

    saveDraftClub: async (draftData) => {
      return requester.post(`${apiUrl}/clubs/draft/save`, draftData);
    },

    updateDraftClub: async (id, draftData) => {
      return requester.post(`${apiUrl}/clubs/draft/save/${id}`, draftData);
    },

    getAllDrafts: async (page = 1, limit = 12) => {
      return requester.get(`${apiUrl}/clubs/drafts?page=${page}&limit=${limit}`);
    },

    getDraftById: async (id) => {
      return requester.get(`${apiUrl}/clubs/draft/${id}`);
    },

    deleteDraftClub: async (draftId) => {
      return requester.del(`${apiUrl}/clubs/draft/${draftId}`);
    },

    toggleDraftStatus: async (identifier) => {
      return requester.patch(`${apiUrl}/clubs/toggle-draft/${identifier}`);
    },

    // ===============================
    // FAVORITES/BOOKMARKS
    // ===============================

    toggleBookmarkClub: async (slug) => {
      return requester.post(`${apiUrl}/clubs/bookmark/${slug}`);
    },

    getAllBookmarkedClubs: async (email) => {
      return requester.get(`${apiUrl}/clubs/user-bookmarks/${email}`);
    },

    getUserClubs: async (email) => {
      return requester.get(`${apiUrl}/clubs/user-clubs/${email}`);
    },

    // ===============================
    // ТЪРСЕНЕ И ФИЛТРИРАНЕ
    // ===============================

    getClubsByCategory: async (category, page = 1, limit = 12) => {
      return requester.get(`${apiUrl}/clubs/category/${category}?page=${page}&limit=${limit}`);
    },

    getClubsByRegion: async (region, page = 1, limit = 12) => {
      return requester.get(`${apiUrl}/clubs/region/${region}?page=${page}&limit=${limit}`);
    },

    getClubsByCity: async (city, page = 1, limit = 12) => {
      return requester.get(`${apiUrl}/clubs/city/${city}?page=${page}&limit=${limit}`);
    },

    searchClubs: async (searchParams) => {
      // searchParams: { query, category, region, city, tags, page, limit }
      const queryString = new URLSearchParams(searchParams).toString();
      return requester.get(`${apiUrl}/clubs/search?${queryString}`);
    },

    getFeaturedClubs: async (limit = 6) => {
      return requester.get(`${apiUrl}/clubs/featured?limit=${limit}`);
    },

    getActiveClubs: async (page = 1, limit = 12) => {
      return requester.get(`${apiUrl}/clubs/active?page=${page}&limit=${limit}`);
    },

    // ===============================
    // КЛУБНИ СЪБИТИЯ И ДЕЙНОСТИ  
    // ===============================

    getClubEvents: async (clubId, page = 1, limit = 10) => {
      return requester.get(`${apiUrl}/clubs/${clubId}/events?page=${page}&limit=${limit}`);
    },

    getClubActivities: async (clubId) => {
      return requester.get(`${apiUrl}/clubs/${clubId}/activities`);
    },

    getClubTrips: async (clubId) => {
      return requester.get(`${apiUrl}/clubs/${clubId}/trips`);
    },

    getClubCourses: async (clubId) => {
      return requester.get(`${apiUrl}/clubs/${clubId}/courses`);
    },

    // ===============================
    // ЧЛЕНОВЕ (ако е разрешено)
    // ===============================

    getClubMembers: async (clubId, page = 1, limit = 20) => {
      return requester.get(`${apiUrl}/clubs/${clubId}/members?page=${page}&limit=${limit}`);
    },

    getClubManagement: async (clubId) => {
      return requester.get(`${apiUrl}/clubs/${clubId}/management`);
    },

    // ===============================
    // КОМЕНТАРИ СИСТЕМА
    // ===============================

    createComment: async (commentData) => {
      // commentData: { clubId, content, parentId? }
      return requester.post(`${apiUrl}/clubs/comments/create`, commentData);
    },

    getClubComments: async (clubId, page = 1, limit = 10) => {
      return requester.get(`${apiUrl}/clubs/${clubId}/comments?page=${page}&limit=${limit}`);
    },

    updateComment: async (commentId, commentData) => {
      // commentData: { content }
      return requester.patch(`${apiUrl}/clubs/comments/${commentId}`, commentData);
    },

    deleteComment: async (commentId) => {
      return requester.del(`${apiUrl}/clubs/comments/${commentId}`);
    },

    likeComment: async (commentId) => {
      return requester.post(`${apiUrl}/clubs/comments/like/${commentId}`);
    },

    getSingleComment: async (commentId) => {
      return requester.get(`${apiUrl}/clubs/comments/single/${commentId}`);
    },

    // ===============================
    // MAILING СИСТЕМА
    // ===============================

    // Контактна форма
    sendContactForm: async (clubId, contactData) => {
      // contactData: { name, email, phone, subject, message, preferredContact }
      return requester.post(`${apiUrl}/clubs/${clubId}/contact`, contactData);
    },

    // Кандидатстване за членство
    sendMembershipApplication: async (clubId, applicationData) => {
      // applicationData: { name, email, phone, age, address, motivation, experience }
      return requester.post(`${apiUrl}/clubs/${clubId}/membership-application`, applicationData);
    },

    // Записване за newsletter
    subscribeToNewsletter: async (clubId, subscriptionData) => {
      // subscriptionData: { email, name?, preferences? }
      return requester.post(`${apiUrl}/clubs/${clubId}/newsletter-subscribe`, subscriptionData);
    },

    // Отписване от newsletter
    unsubscribeFromNewsletter: async (clubId, email) => {
      return requester.post(`${apiUrl}/clubs/${clubId}/newsletter-unsubscribe`, { email });
    },

    // Кандидатстване за доброволчество
    sendVolunteerApplication: async (clubId, volunteerData) => {
      // volunteerData: { name, email, phone, skills, availability, motivation }
      return requester.post(`${apiUrl}/clubs/${clubId}/volunteer-application`, volunteerData);
    },

    // Запитване за партньорство
    sendPartnershipInquiry: async (clubId, partnershipData) => {
      // partnershipData: { organizationName, contactPerson, email, phone, proposalType, description }
      return requester.post(`${apiUrl}/clubs/${clubId}/partnership-inquiry`, partnershipData);
    },

    // Запитване за спонсорство
    sendSponsorshipInquiry: async (clubId, sponsorshipData) => {
      // sponsorshipData: { companyName, contactPerson, email, phone, sponsorshipType, amount, description }
      return requester.post(`${apiUrl}/clubs/${clubId}/sponsorship-inquiry`, sponsorshipData);
    },

    // Записване за събитие
    registerForEvent: async (clubId, eventId, registrationData) => {
      // registrationData: { name, email, phone, numberOfParticipants?, specialRequests? }
      return requester.post(`${apiUrl}/clubs/${clubId}/events/${eventId}/register`, registrationData);
    },

    // Записване за курс
    registerForCourse: async (clubId, courseId, registrationData) => {
      // registrationData: { name, email, phone, experience, expectations }
      return requester.post(`${apiUrl}/clubs/${clubId}/courses/${courseId}/register`, registrationData);
    },

    // Записване за екскурзия
    registerForTrip: async (clubId, tripId, registrationData) => {
      // registrationData: { name, email, phone, numberOfParticipants, emergencyContact, specialRequests }
      return requester.post(`${apiUrl}/clubs/${clubId}/trips/${tripId}/register`, registrationData);
    },

    // ===============================
    // АДМИНИСТРАТИВНИ ФУНКЦИИ
    // ===============================

    toggleClubStatus: async (clubId, status) => {
      // status: 'active', 'inactive', 'suspended'
      return requester.patch(`${apiUrl}/clubs/${clubId}/status`, { status });
    },

    verifyClub: async (clubId) => {
      return requester.patch(`${apiUrl}/clubs/${clubId}/verify`);
    },

    approveClub: async (clubId) => {
      return requester.patch(`${apiUrl}/clubs/${clubId}/approve`);
    },

    rejectClub: async (clubId, reason) => {
      return requester.patch(`${apiUrl}/clubs/${clubId}/reject`, { reason });
    },

    // ===============================
    // BULK ОПЕРАЦИИ
    // ===============================

    bulkUpdateClubs: async (clubIds, updateData) => {
      return requester.patch(`${apiUrl}/clubs/bulk-update`, { clubIds, updateData });
    },

    bulkDeleteClubs: async (clubIds) => {
      return requester.del(`${apiUrl}/clubs/bulk-delete`, { clubIds });
    },

    bulkApproveClubs: async (clubIds) => {
      return requester.patch(`${apiUrl}/clubs/bulk-approve`, { clubIds });
    },

  };
};


export default clubServiceFactory;