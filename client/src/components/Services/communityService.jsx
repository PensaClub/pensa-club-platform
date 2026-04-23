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
    getNewsletterStatsOverview: async ({ from, to } = {}) => {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const qs = params.toString();
      return requester.get(
        `${apiUrl}/newsletter/admin/stats/overview${qs ? `?${qs}` : ''}`,
      );
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
    getAdminSubscriberList: async (params = {}) => {
      const qs = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') qs.append(k, v);
      });
      const suffix = qs.toString() ? `?${qs.toString()}` : '';
      return requester.get(`${apiUrl}/subscribe/admin/list${suffix}`);
    },
    getAdminSubscriberStats: async () => {
      return requester.get(`${apiUrl}/subscribe/admin/stats`);
    },
    getAdminSubscriberGrowth: async ({ days = 90 } = {}) => {
      return requester.get(`${apiUrl}/subscribe/admin/stats/growth?days=${days}`);
    },

    // ── Cron settings (Phase 7) ─────────────────────────────────────────
    getAdminCrons: async () => {
      return requester.get(`${apiUrl}/admin/cron`);
    },
    updateAdminCron: async (key, payload) => {
      return requester.put(`${apiUrl}/admin/cron/${encodeURIComponent(key)}`, payload);
    },

    // ── Email template (Phase 7) ────────────────────────────────────────
    getAdminEmailTemplate: async () => {
      return requester.get(`${apiUrl}/admin/email-template`);
    },
    updateAdminEmailTemplate: async (payload) => {
      return requester.put(`${apiUrl}/admin/email-template`, payload);
    },
    blockSubscriber: async (id) => {
      return requester.post(`${apiUrl}/subscribe/admin/${id}/block`, {});
    },
    unblockSubscriber: async (id) => {
      return requester.post(`${apiUrl}/subscribe/admin/${id}/unblock`, {});
    },
    updateSubscriberPreferencesByAdmin: async (id, preferences) => {
      return requester.put(`${apiUrl}/subscribe/admin/${id}/preferences`, { preferences });
    },
    // Lightweight counts for the home-page PlatformStats cards.
    // Replaces 5 separate full-list fetches (~700 KiB) with one ~200B response.
    getPlatformCounts: async () => {
      const res = await fetch(`${apiUrl}/platform-stats/counts`);
      if (!res.ok) throw new Error('platform-stats failed');
      return res.json();
    },

    exportSubscribersCsvUrl: (params = {}) => {
      const qs = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') qs.append(k, v);
      });
      const suffix = qs.toString() ? `?${qs.toString()}` : '';
      return `${apiUrl}/subscribe/admin/export.csv${suffix}`;
    },
    exportSubscribersPdfUrl: (params = {}) => {
      const qs = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') qs.append(k, v);
      });
      const suffix = qs.toString() ? `?${qs.toString()}` : '';
      return `${apiUrl}/subscribe/admin/export.pdf${suffix}`;
    },
    sendPersonalNewsletter: async (subscriberId, { title, body }) => {
      return requester.post(`${apiUrl}/newsletter/admin/personal/${subscriberId}`, { title, body });
    },
    getEventBatchPreview: async () => {
      return requester.get(`${apiUrl}/newsletter/admin/event-preview`);
    },
    runEventBatchNow: async () => {
      return requester.post(`${apiUrl}/newsletter/admin/event-run-now`, {});
    },
    getMonthlyReportPreview: async ({ month, limit } = {}) => {
      const params = new URLSearchParams();
      if (month) params.set('month', month);
      if (limit) params.set('limit', String(limit));
      const qs = params.toString();
      return requester.get(
        `${apiUrl}/newsletter/admin/monthly-preview${qs ? `?${qs}` : ''}`,
      );
    },
    runMonthlyReportNow: async ({ month, limit, platformUpdatesHtml } = {}) => {
      return requester.post(`${apiUrl}/newsletter/admin/monthly-run-now`, {
        month,
        limit,
        platformUpdatesHtml,
      });
    },
    getNewsletterQueue: async (status = 'pending') => {
      return requester.get(`${apiUrl}/newsletter/admin/queue?status=${encodeURIComponent(status)}`);
    },
    addNewsletterQueueItem: async (payload) => {
      return requester.post(`${apiUrl}/newsletter/admin/queue`, payload);
    },
    deleteNewsletterQueueItem: async (id) => {
      return requester.del(`${apiUrl}/newsletter/admin/queue/${id}`);
    },
  }
}

