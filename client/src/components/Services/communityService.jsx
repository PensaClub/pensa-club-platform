import { requestFactory } from "./requester";

const apiUrl = import.meta.env.VITE_API_URL;

export const communityServiceFactory = (token) => {
  const requester = requestFactory(token);

  return {
    getRegions: async () => {
      const response = await fetch("/regions.json");
      if (!response.ok) {
        throw new Error("Failed to fetch regions");
      }
      return response.json();
    },

    getSubregions: async (regionId) => {
      const response = await fetch(
        `/regions-data/region-${regionId}/subregions-${regionId}.json`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch subregions for region ");
      }
      return response.json();
    },
    getTowns: async (regionId, subregionId) => {
      const response = await fetch(`/regions-data/region-${regionId}/towns/towns-${subregionId}.json`);
      if (!response.ok) {
        throw new Error('Failed to fetch towns');
      }
      return response.json();
    },
    getSearchCriteria: async () => {
      const response = await fetch('/search-criteria.json');
      if (!response.ok) {
        throw new Error('Failed to fetch search criteria');
      }
      return response.json();
    },
    createAd: async (adData) => {
      return requester.post(`${apiUrl}/listings/ad-create`, adData);

    },
    getMyAds: async (email) => {

      return requester.get(`${apiUrl}/listings/ads-user/${ email }`);
    },
     deleteAd: async (id) => {
      return requester.del(`${apiUrl}/listings/ad-delete/${ id }`);
    },
    editAd: async (adData) => {
      return requester.patch(`${apiUrl}/listings/ad-edit`, adData);
    },
    searchAds: async (filters, page, limit = 25, order = "desc") => {
      const query = new URLSearchParams({ ...filters, page, limit, order }).toString();
      return requester.get(`${apiUrl}/listings/ads-search?${query}`);
    },
    getAdById: async (id) => {
      return requester.get(`${apiUrl}/listings/adById/${id}`);
    },
    updateExpirationDate: async (adId) => {
      return requester.patch(`${apiUrl}/listings/update-expiration-date/${adId}`, { adId })
    },
    getLatestAds: async (count) => {
      return requester.get(
        `${apiUrl}/listings/ads-search?status=approved&order=DESC&limit=${count}`
      );
    },
    subscribeNewUser: async (username, email, source) => {
      return requester.post(
        `${apiUrl}/subscribe/addSubscriber`, { username, email, source }
      );
    },
    getSubscribeEmails: async () => {
      return requester.get(
        `${apiUrl}/subscribe/getSubscribers`
      );
    },
    deleteSubscriber: async (id) => {
      return requester.del(`${apiUrl}/subscribe/admin/${id}`);
    },
    getPreferencesByToken: async (token) => {
      return requester.get(`${apiUrl}/subscribe/preferences/${token}`);
    },
    updatePreferences: async (token, preferences) => {
      return requester.put(`${apiUrl}/subscribe/preferences/${token}`, { preferences });
    },
    unsubscribeByToken: async (token) => {
      return requester.post(`${apiUrl}/subscribe/unsubscribe/${token}`);
    },

    // ===== Newsletters (admin) =====
    getAdminNewsletters: async (params = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query.append(key, value);
        }
      });
      const qs = query.toString();
      return requester.get(`${apiUrl}/newsletter/admin${qs ? `?${qs}` : ''}`);
    },
    getAdminNewsletterStats: async () => {
      return requester.get(`${apiUrl}/newsletter/admin/stats`);
    },
    getAdminNewsletterById: async (id) => {
      return requester.get(`${apiUrl}/newsletter/admin/${id}`);
    },
    deleteNewsletter: async (id) => {
      return requester.del(`${apiUrl}/newsletter/admin/${id}`);
    },
    duplicateNewsletter: async (id) => {
      return requester.post(`${apiUrl}/newsletter/admin/${id}/duplicate`, {});
    },
    cancelScheduledNewsletter: async (id) => {
      return requester.post(`${apiUrl}/newsletter/admin/${id}/cancel`, {});
    },
    createNewsletter: async (data) => {
      return requester.post(`${apiUrl}/newsletter/admin`, data);
    },
    updateNewsletter: async (id, data) => {
      return requester.put(`${apiUrl}/newsletter/admin/${id}`, data);
    },
    scheduleNewsletter: async (id, scheduledAt) => {
      return requester.post(`${apiUrl}/newsletter/admin/${id}/schedule`, { scheduledAt });
    },
    searchNewsletterContent: async (type, query = '', limit = 10) => {
      const qs = new URLSearchParams({ type });
      if (query) qs.append('q', query);
      if (limit) qs.append('limit', limit);
      return requester.get(`${apiUrl}/newsletter/admin/search-content?${qs.toString()}`);
    },
    previewNewsletter: async ({ title, body, platformUpdates }) => {
      return requester.post(`${apiUrl}/newsletter/admin/preview`, {
        title: title || '',
        body: body || '',
        platformUpdates: platformUpdates || '',
      });
    },
    getNewsletterRecipientCount: async (categories) => {
      const qs = new URLSearchParams();
      if (Array.isArray(categories) && categories.length > 0) {
        qs.append('categories', categories.join(','));
      }
      const suffix = qs.toString() ? `?${qs.toString()}` : '';
      return requester.get(`${apiUrl}/newsletter/admin/recipient-count${suffix}`);
    },
    sendTestNewsletter: async (id, to) => {
      return requester.post(`${apiUrl}/newsletter/admin/${id}/send-test`, to ? { to } : {});
    },
    sendNewsletterNow: async (id) => {
      return requester.post(`${apiUrl}/newsletter/admin/${id}/send-now`, {});
    },
    getNewsletterStats: async (id) => {
      return requester.get(`${apiUrl}/newsletter/admin/${id}/stats`);
    },
  }
}

