import { requestFactory } from './requester';

const apiUrl = import.meta.env.VITE_API_URL;

export const forumServiceFactory = () => {
  const requester = requestFactory();

  const toQueryString = (params) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    return new URLSearchParams(cleanParams).toString();
  };

  return {
    // Feed & Posts
    getFeed: (params = {}) => requester.get(`${apiUrl}/forum/feed?${toQueryString(params)}`),
    getPost: (slug) => requester.get(`${apiUrl}/forum/posts/${slug}`),
    createPost: (data) => requester.post(`${apiUrl}/forum/posts`, data),
    updatePost: (id, data) => requester.put(`${apiUrl}/forum/posts/${id}`, data),
    deletePost: (id) => requester.del(`${apiUrl}/forum/posts/${id}`),

    // Comments
    addComment: (postId, data) => requester.post(`${apiUrl}/forum/posts/${postId}/comments`, data),
    updateComment: (id, data) => requester.put(`${apiUrl}/forum/comments/${id}`, data),
    deleteComment: (id) => requester.del(`${apiUrl}/forum/comments/${id}`),

    // Spaces
    getSpaces: () => requester.get(`${apiUrl}/forum/spaces`),
    getSpaceBySlug: (slug, params = {}) => requester.get(`${apiUrl}/forum/spaces/${slug}?${toQueryString(params)}`),
    suggestSpace: (data) => requester.post(`${apiUrl}/forum/spaces/suggest`, data),
    joinSpace: (id) => requester.post(`${apiUrl}/forum/spaces/${id}/join`),
    leaveSpace: (id) => requester.del(`${apiUrl}/forum/spaces/${id}/leave`),

    // Reactions & Bookmarks
    addReaction: (data) => requester.post(`${apiUrl}/forum/reactions`, data),
    toggleBookmark: (postId) => requester.post(`${apiUrl}/forum/bookmarks/${postId}`),
    getBookmarks: (params = {}) => requester.get(`${apiUrl}/forum/bookmarks?${toQueryString(params)}`),
    sharePost: (postId) => requester.post(`${apiUrl}/forum/posts/${postId}/share`),

    // Reports
    report: (data) => requester.post(`${apiUrl}/forum/reports`, data),

    // Polls
    votePoll: (pollId, data) => requester.post(`${apiUrl}/forum/polls/${pollId}/vote`, data),

    // Tags & Search & Stats
    getTags: () => requester.get(`${apiUrl}/forum/tags`),
    search: (params = {}) => requester.get(`${apiUrl}/forum/search?${toQueryString(params)}`),
    getStats: () => requester.get(`${apiUrl}/forum/stats`),

    // My stuff
    getMyStatus: () => requester.get(`${apiUrl}/forum/my/status`),
    acceptRules: () => requester.post(`${apiUrl}/forum/rules/accept`),
    getMyPosts: (params = {}) => requester.get(`${apiUrl}/forum/my/posts?${toQueryString(params)}`),
    getMyComments: (params = {}) => requester.get(`${apiUrl}/forum/my/comments?${toQueryString(params)}`),
    getMySpaces: () => requester.get(`${apiUrl}/forum/my/spaces`),

    // Admin
    adminGetDashboard: () => requester.get(`${apiUrl}/forum/admin/dashboard`),
  };
};
