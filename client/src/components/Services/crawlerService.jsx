import { requestFactory } from './requester';

const apiUrl = import.meta.env.VITE_API_URL;

/**
 * Bot Crawler service factory.
 *
 * Backend mounts the controller at `/crawler` (see server/src/router.js),
 * which means the full endpoint surface is `${VITE_API_URL}/crawler/*`.
 * All routes are gated by isAuth + checkPermission('crawler', '<action>').
 */
export const crawlerServiceFactory = (token) => {
  const requester = requestFactory(token);

  const buildQuery = (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      qs.append(key, String(value));
    });
    const s = qs.toString();
    return s ? `?${s}` : '';
  };

  return {
    // ===========================================================
    // Bots
    // ===========================================================
    listBots: async (params = {}) => {
      return requester.get(`${apiUrl}/crawler/bots${buildQuery(params)}`);
    },

    getBot: async (id) => {
      return requester.get(`${apiUrl}/crawler/bots/${id}`);
    },

    createBot: async (payload) => {
      return requester.post(`${apiUrl}/crawler/bots`, payload);
    },

    updateBot: async (id, payload) => {
      return requester.put(`${apiUrl}/crawler/bots/${id}`, payload);
    },

    deleteBot: async (id) => {
      return requester.del(`${apiUrl}/crawler/bots/${id}`);
    },

    runBotNow: async (id) => {
      return requester.post(`${apiUrl}/crawler/bots/${id}/run-now`, {});
    },

    clearBotFindings: async (id) => {
      return requester.post(`${apiUrl}/crawler/bots/${id}/clear-findings`, {});
    },

    // ===========================================================
    // Sources (scoped under bots; updates/deletes by source id)
    // ===========================================================
    listSources: async (botId) => {
      return requester.get(`${apiUrl}/crawler/bots/${botId}/sources`);
    },

    createSource: async (botId, payload) => {
      return requester.post(`${apiUrl}/crawler/bots/${botId}/sources`, payload);
    },

    updateSource: async (id, payload) => {
      return requester.put(`${apiUrl}/crawler/sources/${id}`, payload);
    },

    deleteSource: async (id) => {
      return requester.del(`${apiUrl}/crawler/sources/${id}`);
    },

    /**
     * Phase 2: validate an arbitrary source URL (no persistence). Backend
     * runs robots.txt + RSS / HTML detection and returns sample items so the
     * admin can preview before saving. Body fields are passed through as-is;
     * the backend tolerates omitted optional fields.
     */
    validateSourceUrl: async ({ url, sourceType = 'auto', htmlSelectors } = {}) => {
      const body = { url, sourceType };
      if (htmlSelectors && typeof htmlSelectors === 'object') {
        body.htmlSelectors = htmlSelectors;
      }
      return requester.post(`${apiUrl}/crawler/sources/validate`, body);
    },

    /**
     * Phase 2: re-validate an existing source by id and persist updated
     * status fields. No body required — backend reads the current row.
     */
    revalidateSource: async (id) => {
      return requester.post(`${apiUrl}/crawler/sources/${id}/validate`, {});
    },

    // ===========================================================
    // Findings (cross-bot list, status update by id)
    // ===========================================================
    listFindings: async (params = {}) => {
      return requester.get(`${apiUrl}/crawler/findings${buildQuery(params)}`);
    },

    getFinding: async (id) => {
      return requester.get(`${apiUrl}/crawler/findings/${id}`);
    },

    updateFindingStatus: async (id, payload) => {
      return requester.put(`${apiUrl}/crawler/findings/${id}/status`, payload);
    },

    bulkUpdateFindingStatus: async (payload) => {
      return requester.post(`${apiUrl}/crawler/findings/bulk-status`, payload);
    },

    bulkClearFindings: async (botId, payload) => {
      return requester.post(`${apiUrl}/crawler/bots/${botId}/findings/bulk-clear`, payload);
    },

    // ===========================================================
    // Runs (history per bot)
    // ===========================================================
    listRuns: async (botId, limit = 20) => {
      return requester.get(`${apiUrl}/crawler/bots/${botId}/runs${buildQuery({ limit })}`);
    },
  };
};

export default crawlerServiceFactory;
