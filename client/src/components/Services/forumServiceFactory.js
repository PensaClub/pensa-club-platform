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

    // Tags & Search & Stats & Widgets
    getTags: () => requester.get(`${apiUrl}/forum/tags`),
    getTrendingTags: () => requester.get(`${apiUrl}/forum/trending-tags`),
    getRecentArticles: () => requester.get(`${apiUrl}/forum/recent-articles`),
    getUpcomingSeminars: () => requester.get(`${apiUrl}/forum/upcoming-seminars`),
    getRecommendedCourses: () => requester.get(`${apiUrl}/forum/recommended-courses`),
    search: (params = {}) => requester.get(`${apiUrl}/forum/search?${toQueryString(params)}`),
    getStats: () => requester.get(`${apiUrl}/forum/stats`),
    getSettings: () => requester.get(`${apiUrl}/forum/settings`),

    // My stuff
    getMyStatus: () => requester.get(`${apiUrl}/forum/my/status`),
    getRules: () => requester.get(`${apiUrl}/forum/rules`),
    acceptRules: () => requester.post(`${apiUrl}/forum/rules/accept`),
    getMyPosts: (params = {}) => requester.get(`${apiUrl}/forum/my/posts?${toQueryString(params)}`),
    getMyComments: (params = {}) => requester.get(`${apiUrl}/forum/my/comments?${toQueryString(params)}`),
    getMySpaces: () => requester.get(`${apiUrl}/forum/my/spaces`),

    // Admin
    adminGetDashboard: () => requester.get(`${apiUrl}/forum/admin/dashboard`),
    adminGetPosts: (params) => requester.get(`${apiUrl}/forum/admin/posts?${toQueryString(params)}`),
    adminUpdatePostStatus: (id, data) => requester.put(`${apiUrl}/forum/admin/posts/${id}/status`, data),
    adminTogglePin: (id) => requester.put(`${apiUrl}/forum/admin/posts/${id}/pin`),
    adminToggleLock: (id) => requester.put(`${apiUrl}/forum/admin/posts/${id}/lock`),
    adminDeletePost: (id) => requester.del(`${apiUrl}/forum/admin/posts/${id}`),
    adminSetPostOfWeek: (id) => requester.post(`${apiUrl}/forum/admin/posts/${id}/post-of-week`),
    adminBulkAction: (data) => requester.post(`${apiUrl}/forum/admin/posts/bulk-action`, data),
    adminGetComments: (params) => requester.get(`${apiUrl}/forum/admin/comments?${toQueryString(params)}`),
    adminUpdateCommentStatus: (id, data) => requester.put(`${apiUrl}/forum/admin/comments/${id}/status`, data),
    adminDeleteComment: (id) => requester.del(`${apiUrl}/forum/admin/comments/${id}`),
    adminGetSpaces: () => requester.get(`${apiUrl}/forum/admin/spaces`),
    adminCreateSpace: (data) => requester.post(`${apiUrl}/forum/admin/spaces`, data),
    adminUpdateSpace: (id, data) => requester.put(`${apiUrl}/forum/admin/spaces/${id}`, data),
    adminDeleteSpace: (id) => requester.del(`${apiUrl}/forum/admin/spaces/${id}`),
    adminApproveSpace: (id) => requester.put(`${apiUrl}/forum/admin/spaces/${id}/approve`),
    adminSetModerator: (id, data) => requester.put(`${apiUrl}/forum/admin/spaces/${id}/moderator`, data),
    adminGetReports: (params) => requester.get(`${apiUrl}/forum/admin/reports?${toQueryString(params)}`),
    adminReviewReport: (id, data) => requester.put(`${apiUrl}/forum/admin/reports/${id}`, data),
    adminGetUsers: (params) => requester.get(`${apiUrl}/forum/admin/users?${toQueryString(params)}`),
    adminGetUser: (id) => requester.get(`${apiUrl}/forum/admin/users/${id}`),
    adminWarnUser: (id, data) => requester.post(`${apiUrl}/forum/admin/users/${id}/warn`, data),
    adminMuteUser: (id, data) => requester.post(`${apiUrl}/forum/admin/users/${id}/mute`, data),
    adminRestrictUser: (id, data) => requester.post(`${apiUrl}/forum/admin/users/${id}/restrict`, data),
    adminBanUser: (id, data) => requester.post(`${apiUrl}/forum/admin/users/${id}/ban`, data),
    adminPermBanUser: (id, data) => requester.post(`${apiUrl}/forum/admin/users/${id}/permban`, data),
    adminUnbanUser: (id) => requester.post(`${apiUrl}/forum/admin/users/${id}/unban`),
    adminGrantVip: (id) => requester.post(`${apiUrl}/forum/admin/users/${id}/vip`),
    adminRevokeVip: (id) => requester.del(`${apiUrl}/forum/admin/users/${id}/vip`),
    adminGetRules: () => requester.get(`${apiUrl}/forum/admin/rules`),
    adminUpdateRules: (data) => requester.put(`${apiUrl}/forum/admin/rules`, data),
    adminResetRulesAcceptance: () => requester.post(`${apiUrl}/forum/admin/rules/reset-acceptance`),
    adminGetSettings: () => requester.get(`${apiUrl}/forum/admin/settings`),
    adminUpdateSettings: (data) => requester.put(`${apiUrl}/forum/admin/settings`, data),
    adminExport: (type) => requester.get(`${apiUrl}/forum/admin/export/${type}`),
  };
};
