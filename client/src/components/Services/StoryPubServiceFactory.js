import { requestFactory } from "./requester";

const apiUrl = import.meta.env.VITE_API_URL;

export const initiativeServiceFactory = (token) => {
  const requester = requestFactory(token);

   return {
    // Stories
getStoryBySlug: async (slug) => {
  return requester.get(`${apiUrl}/stories/single/${slug}`);
},

getAllStories: async (page = 1, limit = 10) => {
  return requester.get(`${apiUrl}/stories/all?page=${page}&limit=${limit}`);
},

getStoriesByInitiative: async (initiativeId) => {
  return requester.get(`${apiUrl}/stories/initiative/${initiativeId}`);
},

// Story comments
getStoryComments: async (storyId) => {
  return requester.get(`${apiUrl}/stories/${storyId}/comments`);
},

addStoryComment: async (storyId, commentData) => {
  return requester.post(`${apiUrl}/stories/${storyId}/comments`, commentData);
},

updateStoryComment: async (storyId, commentId, commentData) => {
  return requester.patch(`${apiUrl}/stories/${storyId}/comments/${commentId}`, commentData);
},

deleteStoryComment: async (storyId, commentId) => {
  return requester.del(`${apiUrl}/stories/${storyId}/comments/${commentId}`);
},

likeStoryComment: async (storyId, commentId) => {
  return requester.post(`${apiUrl}/stories/${storyId}/comments/${commentId}/like`);
},

// Story interactions
likeStory: async (storyId) => {
  return requester.post(`${apiUrl}/stories/${storyId}/like`);
},

trackStoryView: async (storyId) => {
  return requester.post(`${apiUrl}/stories/${storyId}/view`);
},
// Publications
getPublicationBySlug: async (slug) => {
  return requester.get(`${apiUrl}/publications/single/${slug}`);
},

getAllPublications: async (page = 1, limit = 10) => {
  return requester.get(`${apiUrl}/publications/all?page=${page}&limit=${limit}`);
},

getPublicationsByInitiative: async (initiativeId) => {
  return requester.get(`${apiUrl}/publications/initiative/${initiativeId}`);
},

getAllPublicationDrafts: async (page = 1, limit = 10) => {
  return requester.get(`${apiUrl}/publications/drafts?page=${page}&limit=${limit}`);
},

// Publication comments - SIMPLIFIED ENDPOINTS
getPublicationComments: async (publicationId) => {
  return requester.get(`${apiUrl}/comments/all/publication/${publicationId}`);
},

addPublicationComment: async (commentData) => {
  return requester.post(`${apiUrl}/comments/create`, commentData);
},

updatePublicationComment: async (commentId, content) => {
  return requester.patch(`${apiUrl}/comments/${commentId}`, { content });
},

deletePublicationComment: async (commentId) => {
  return requester.del(`${apiUrl}/comments/${commentId}`);
},

likePublicationComment: async (commentId) => {
  return requester.post(`${apiUrl}/comments/like/${commentId}`);
},

// Publication interactions
likePublication: async (publicationId) => {
  return requester.post(`${apiUrl}/publications/${publicationId}/like`);
},

trackPublicationView: async (publicationId) => {
  return requester.post(`${apiUrl}/publications/${publicationId}/view`);
},

downloadPublication: async (publicationId) => {
  return requester.post(`${apiUrl}/publications/${publicationId}/download`);
},
// Story bookmarks
toggleStoryBookmark: async (storyId) => {
  return requester.post(`${apiUrl}/stories/bookmark/${storyId}`);
},

getUserStories: async (email) => {
  return requester.get(`${apiUrl}/stories/user-stories/${email}`);
},

// Publication bookmarks
togglePublicationBookmark: async (publicationId) => {
  return requester.post(`${apiUrl}/publications/bookmark/${publicationId}`);
},

getUserPublications: async (email) => {
  return requester.get(`${apiUrl}/publications/user-publications/${email}`);
},
   }
};
