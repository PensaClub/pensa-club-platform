import { requestFactory } from './requester';

const apiUrl = import.meta.env.VITE_API_URL;

export const factCheckServiceFactory = (token) => {
  const requester = requestFactory(token);

  return {
    // ===============================
    // PUBLIC
    // ===============================
    getPublishedModules: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return requester.get(`${apiUrl}/fact-check/modules?${queryString}`);
    },

    getPublicFeed: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return requester.get(`${apiUrl}/fact-check/feed?${queryString}`);
    },

    getModuleBySlug: async (slug) => {
      return requester.get(`${apiUrl}/fact-check/modules/${slug}`);
    },

    getCategories: async () => {
      return requester.get(`${apiUrl}/fact-check/categories`);
    },

    getPublicStats: async () => {
      return requester.get(`${apiUrl}/fact-check/stats`);
    },

    submitSignal: async (data) => {
      return requester.post(`${apiUrl}/fact-check/signals`, data);
    },

    // ===============================
    // ADMIN — Signals
    // ===============================
    getAdminSignals: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return requester.get(`${apiUrl}/fact-check/admin/signals?${queryString}`);
    },

    getSignalById: async (id) => {
      return requester.get(`${apiUrl}/fact-check/admin/signals/${id}`);
    },

    updateSignal: async (id, data) => {
      return requester.patch(`${apiUrl}/fact-check/admin/signals/${id}`, data);
    },

    deleteSignal: async (id) => {
      return requester.del(`${apiUrl}/fact-check/admin/signals/${id}`);
    },

    // ===============================
    // ADMIN — Modules
    // ===============================
    getAdminModules: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return requester.get(`${apiUrl}/fact-check/admin/modules?${queryString}`);
    },

    createModule: async (data) => {
      return requester.post(`${apiUrl}/fact-check/admin/modules`, data);
    },

    updateModule: async (id, data) => {
      return requester.patch(`${apiUrl}/fact-check/admin/modules/${id}`, data);
    },

    deleteModule: async (id) => {
      return requester.del(`${apiUrl}/fact-check/admin/modules/${id}`);
    },

    publishModule: async (id) => {
      return requester.patch(`${apiUrl}/fact-check/admin/modules/${id}/publish`);
    },

    hideModule: async (id) => {
      return requester.patch(`${apiUrl}/fact-check/admin/modules/${id}/hide`);
    },
  };
};

export default factCheckServiceFactory;
