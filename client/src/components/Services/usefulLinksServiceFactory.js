import { requestFactory } from "./requester";

const apiUrl = import.meta.env.VITE_API_URL;

export const usefulLinksServiceFactory = (token) => {
  const requester = requestFactory(token);

  return {
    // PUBLIC
    getAllPublic: async (page = 1, limit = 12, search = '', category = '') => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search.trim()) params.append('search', search.trim());
      if (category && category !== 'all') params.append('category', category);
      return requester.get(`${apiUrl}/useful-links/all?${params.toString()}`);
    },

    // ADMIN
    getAllAdmin: async (page = 1, limit = 12, search = '', category = '', status = '', sortBy = 'newest') => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search.trim()) params.append('search', search.trim());
      if (category && category !== 'all') params.append('category', category);
      if (status && status !== 'all') params.append('status', status);
      if (sortBy) params.append('sortBy', sortBy);
      return requester.get(`${apiUrl}/useful-links/admin/all?${params.toString()}`);
    },

    // SINGLE
    getById: async (id) => {
      return requester.get(`${apiUrl}/useful-links/single/${id}`);
    },

    // CREATE
    create: async (data) => {
      return requester.post(`${apiUrl}/useful-links/create`, data);
    },

    // UPDATE
    update: async (id, data) => {
      return requester.put(`${apiUrl}/useful-links/${id}`, data);
    },

    // DELETE
    remove: async (id) => {
      return requester.del(`${apiUrl}/useful-links/${id}`);
    },

    // TRACK VIEW
    trackView: async (id) => {
      return requester.post(`${apiUrl}/useful-links/${id}/track-view`);
    },

    // TOGGLE ACTIVE
    toggleActive: async (id) => {
      return requester.patch(`${apiUrl}/useful-links/${id}/toggle-active`);
    },
  };
};

export default usefulLinksServiceFactory;
