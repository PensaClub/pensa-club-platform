import { requestFactory } from "./requester";

const apiUrl = import.meta.env.VITE_API_URL;

export const academyServiceFactory = (token) => {
  const requester = requestFactory(token);

  return {
    // ===============================
    // САМО ЗА LANDING PAGE
    // ===============================

    // Статистики за About секцията
    getStats: async () => {
      return requester.get(`${apiUrl}/academy/stats`);
      // Response: { totalCourses, activeMentors, totalParticipants, countries, satisfactionRate }
    },

    // Featured ментори за Mentors секцията (2-3 ментора)
    getFeaturedMentors: async (limit = 3) => {
      return requester.get(`${apiUrl}/academy/mentors/featured?limit=${limit}`);
    },

    // Featured отзиви за Testimonials секцията (3-5 отзива)
    getFeaturedTestimonials: async (limit = 5) => {
      return requester.get(`${apiUrl}/academy/testimonials/featured?limit=${limit}`);
    },

  };
};

export default academyServiceFactory;