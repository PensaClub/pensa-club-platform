import { requestFactory } from "./requester";

const apiUrl = import.meta.env.VITE_API_URL;

export const initiativeServiceFactory = (token) => {
  const requester = requestFactory(token);

  return {
    // ========================================
    // PUBLICATIONS
    // ========================================

    getPublicationById: async (id) => {
      return requester.get(`${apiUrl}/publications/single/${id}`);
    },

    getAllPublications: async (page = 1, limit = 10, isDraft = null) => {
      const params = new URLSearchParams({ page, limit });
      if (isDraft !== null) params.append('isDraft', isDraft);
      return requester.get(`${apiUrl}/publications/all?${params}`);
    },

    createPublication: async (publicationData) => {
      return requester.post(`${apiUrl}/publications/create`, publicationData);
    },

    updatePublication: async (id, publicationData) => {
      return requester.patch(`${apiUrl}/publications/${id}`, publicationData);
    },

    deletePublication: async (id) => {
      return requester.del(`${apiUrl}/publications/${id}`);
    },

    togglePublicationDraftStatus: async (id) => {
      return requester.patch(`${apiUrl}/publications/toggle-draft/${id}`);
    },

    // Publication interactions
    likePublication: async (publicationId) => {
      return requester.post(`${apiUrl}/publications/${publicationId}/like`);
    },

    trackPublicationView: async (publicationId) => {
      return requester.patch(`${apiUrl}/publications/${publicationId}/view`);
    },

    downloadPublication: async (publicationId) => {
      return requester.patch(`${apiUrl}/publications/${publicationId}/download`);
    },

    // Publication bookmarks
    togglePublicationBookmark: async (publicationId) => {
      return requester.post(`${apiUrl}/publications/bookmark/${publicationId}`);
    },

    getUserPublications: async (email) => {
      return requester.get(`${apiUrl}/publications/user-publications/${email}`);
    },

    // Publication connections
    getAllPublicationsForConnections: async () => {
      return requester.get(`${apiUrl}/publications/all-for-connections`);
    },


    // ========================================
    // STORIES
    // ========================================

    getStoryById: async (id) => {
      return requester.get(`${apiUrl}/stories/single/${id}`);
    },

    getAllStories: async (page = 1, limit = 10, isDraft = null) => {
      const params = new URLSearchParams({ page, limit });
      if (isDraft !== null) params.append('isDraft', isDraft);
      return requester.get(`${apiUrl}/stories/all?${params}`);
    },

    createStory: async (storyData) => {
      return requester.post(`${apiUrl}/stories/create`, storyData);
    },

    updateStory: async (id, storyData) => {
      return requester.patch(`${apiUrl}/stories/${id}`, storyData);
    },

    deleteStory: async (id) => {
      return requester.del(`${apiUrl}/stories/${id}`);
    },

    toggleStoryDraftStatus: async (id) => {
      return requester.patch(`${apiUrl}/stories/toggle-draft/${id}`);
    },

    // Story interactions
    likeStory: async (storyId) => {
      return requester.post(`${apiUrl}/stories/${storyId}/like`);
    },

    trackStoryView: async (storyId) => {
      return requester.patch(`${apiUrl}/stories/${storyId}/view`);
    },

    // Story bookmarks
    toggleStoryBookmark: async (storyId) => {
      return requester.post(`${apiUrl}/stories/bookmark/${storyId}`);
    },

    getUserStories: async (email) => {
      return requester.get(`${apiUrl}/stories/user-stories/${email}`);
    },

    // Story connections
    getAllStoriesForConnections: async () => {
      return requester.get(`${apiUrl}/stories/all-for-connections`);
    },

    // Legacy story methods (keeping for backward compatibility)
    getStoryBySlug: async (slug) => {
      return requester.get(`${apiUrl}/stories/single/${slug}`);
    },

    getStoriesByInitiative: async (initiativeId) => {
      return requester.get(`${apiUrl}/stories/initiative/${initiativeId}`);
    },

    // ========================================
    // COMMENTS (UNIFIED SYSTEM)
    // ========================================

    getPublicationComments: async (publicationId) => {
      return requester.get(`${apiUrl}/comments/all/publication/${publicationId}`);
    },

    getStoryComments: async (storyId) => {
      return requester.get(`${apiUrl}/comments/all/story/${storyId}`);
    },

    addPublicationComment: async (commentData) => {
      return requester.post(`${apiUrl}/comments/create`, commentData);
    },

    addStoryComment: async (commentData) => {
      return requester.post(`${apiUrl}/comments/create`, commentData);
    },

    updatePublicationComment: async (commentId, content) => {
      return requester.patch(`${apiUrl}/comments/${commentId}`, { content });
    },

    updateStoryComment: async (commentId, content) => {
      return requester.patch(`${apiUrl}/comments/${commentId}`, { content });
    },

    deletePublicationComment: async (commentId) => {
      return requester.del(`${apiUrl}/comments/${commentId}`);
    },

    deleteStoryComment: async (commentId) => {
      return requester.del(`${apiUrl}/comments/${commentId}`);
    },

    likePublicationComment: async (commentId) => {
      return requester.post(`${apiUrl}/comments/like/${commentId}`);
    },

    likeStoryComment: async (commentId) => {
      return requester.post(`${apiUrl}/comments/like/${commentId}`);
    },

    // ========================================
    // CONNECTIONS
    // ========================================

    getAllInitiativesForConnections: async () => {
      return requester.get(`${apiUrl}/initiatives/all-for-connections`);
    },

    getAllProjectsForConnections: async () => {
      return requester.get(`${apiUrl}/projects/all-for-connections`);
    },
  };
};
