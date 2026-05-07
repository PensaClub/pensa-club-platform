import { requestFactory } from "./requester";

const apiUrl = import.meta.env.VITE_API_URL;

export const articleServiceFactory = (token) => {
  const requester = requestFactory(token);

  return {
    createArticle: async (articleData) => {
      return requester.post(`${apiUrl}/articles/create`, articleData);
    },
    
    getArticleById: async (id) => {
      return requester.get(`${apiUrl}/articles/single/${id}`);
    },
    
    getUserArticles: async (email) => {
      return requester.get(`${apiUrl}/articles/user-articles/${email}`);
    },
    
    getAllArticles: async () => {
      return requester.get(`${apiUrl}/articles/all`);
    },

    // Paginated mode of GET /articles/all — backend switches modes based on
    // presence of any pagination query param. We always at least send `page`
    // so we get the {items,total,page,limit,totalPages} envelope.
    //
    // params: { page, limit, search, sort, order, status, author, tag,
    //           dateFrom, dateTo, publicOnly }
    getArticlesPaginated: async (params = {}) => {
      const qs = new URLSearchParams();
      const safeParams = {
        page: 1,
        ...params,
      };
      Object.entries(safeParams).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        qs.append(key, String(value));
      });
      return requester.get(`${apiUrl}/articles/all?${qs.toString()}`);
    },

    updateArticle: async (id,articleData) => {
      return requester.put(`${apiUrl}/articles/${id}`, articleData);
    },

    // Visibility toggle — reuses PUT /:id with just { status } in the body.
    // The controller accepts status on update (Phase 1 contract).
    updateArticleStatus: async (id, status) => {
      return requester.put(`${apiUrl}/articles/${id}`, { status });
    },
    
    deleteArticle: async (id) => {
      return requester.del(`${apiUrl}/articles/${id}`);
    },

    // Bulk action over a list of article ids. Backend: POST /articles/bulk
    // Body: { ids: number[], action: 'delete'|'archive'|'publish'|'draft' }
    // Returns { success: true, updated, action } on full success
    // or 207 with { success: false, results: [{id, ok, error}] } on partial.
    bulkArticles: async (ids, action) => {
      return requester.post(`${apiUrl}/articles/bulk`, { ids, action });
    },

    // Returns og:image / title / description / siteName for a remote URL.
    // Backend endpoint: GET /api/articles/url-metadata?url=<encoded>
    getUrlMetadata: async (url) => {
      return requester.get(`${apiUrl}/articles/url-metadata?url=${encodeURIComponent(url)}`);
    }
  };
};