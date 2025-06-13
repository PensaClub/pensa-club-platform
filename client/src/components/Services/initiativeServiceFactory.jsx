import { requestFactory } from "./requester";

const apiUrl = process.env.REACT_APP_API_URL;

export const initiativeServiceFactory = (token) => {
  const requester = requestFactory(token);

  return {
    createInitiative: async (initiativeData) => {
      return requester.post(`${apiUrl}/initiatives/create`, initiativeData);
    },
    saveDraftInitiative: async (draftData) => {
      return requester.post(`${apiUrl}/initiatives/draft/save`, draftData);
    },

    getDraftInitiative: async (userId) => {
      return requester.get(`${apiUrl}/initiatives/draft/${userId}`);
    },

    deleteDraftInitiative: async (draftId) => {
      return requester.del(`${apiUrl}/initiatives/draft/${draftId}`);
    },
    getInitiativeById: async (id) => {
      return requester.get(`${apiUrl}/initiatives/single/${id}`);
    },
    toggleBookmark: async (initiativeId) => {
      return requester.post(`${apiUrl}/initiatives/bookmark/${initiativeId}`);
    },
    getUserInitiatives: async (email) => {
      return requester.get(`${apiUrl}/initiatives/user-initiatives/${email}`);
    },

    getAllInitiatives: async (page = 1, limit = 6) => {
      return requester.get(`${apiUrl}/initiatives/all?page=${page}&limit=${limit}`);
    },

    updateInitiative: async (id, initiativeData) => {
      return requester.put(`${apiUrl}/initiatives/${id}`, initiativeData);
    },

    deleteInitiative: async (id) => {
      return requester.del(`${apiUrl}/initiatives/${id}`);
    },

    // Initiative comments endpoints 

    // Създаване на коментар/reply
    createComment: async (commentData) => {
      console.log('API Request:', commentData); // ← DEBUG
      const response = await requester.post(`${apiUrl}/comments/create`, commentData);
      console.log('API Response:', response); // ← DEBUG
      return response;
    },

    // Обновяване на коментар/reply
    updateComment: async (commentId, commentData) => {
      // commentData: { content }
      return requester.patch(`${apiUrl}/comments/${commentId}`, commentData);
    },

    // Изтриване на коментар/reply
    deleteComment: async (commentId) => {
      return requester.del(`${apiUrl}/comments/${commentId}`);
    },

    // Харесване на коментар/reply
    likeComment: async (commentId) => {
      return requester.post(`${apiUrl}/comments/like/${commentId}`);
    },

    getSingleComment: async (commentId) => {
      return requester.get(`${apiUrl}/comments/single/${commentId}`);
    },

    // Project endpoints
    getAllProjects: async () => {
      return requester.get(`${apiUrl}/projects/all`);
    },

    getProjectById: async (id) => {
      return requester.get(`${apiUrl}/projects/single/${id}`);
    },

    getProjectsByInitiative: async (initiativeId) => {
      return requester.get(`${apiUrl}/projects/initiative/${initiativeId}`);
    },

    applyToProject: async (projectId, applicationData) => {
      return requester.post(`${apiUrl}/projects/${projectId}/apply`, applicationData);
    },

    // // Project comments
    // getProjectComments: async (projectId) => {
    //   return requester.get(`${apiUrl}/projects/${projectId}/comments`);
    // },

    // addProjectComment: async (projectId, commentData) => {
    //   return requester.post(`${apiUrl}/projects/${projectId}/comments`, commentData);
    // },

    // updateProjectComment: async (projectId, commentId, commentData) => {
    //   return requester.put(`${apiUrl}/projects/${projectId}/comments/${commentId}`, commentData);
    // },

    // deleteProjectComment: async (projectId, commentId) => {
    //   return requester.del(`${apiUrl}/projects/${projectId}/comments/${commentId}`);
    // },

    // likeProjectComment: async (projectId, commentId) => {
    //   return requester.post(`${apiUrl}/projects/${projectId}/comments/${commentId}/like`);
    // },

    // Project applications endpoints
    getProjectApplications: async (projectId) => {
      return requester.get(`${apiUrl}/projects/${projectId}/applications`);
    },

    getAllApplications: async () => {
      return requester.get(`${apiUrl}/applications/all`);
    },

    getApplicationById: async (applicationId) => {
      return requester.get(`${apiUrl}/applications/${applicationId}`);
    },

    updateApplicationStatus: async (applicationId, status) => {
      return requester.patch(`${apiUrl}/applications/${applicationId}/status`, { status });
    },

    deleteApplication: async (applicationId) => {
      return requester.del(`${apiUrl}/applications/${applicationId}`);
    },
  };
};