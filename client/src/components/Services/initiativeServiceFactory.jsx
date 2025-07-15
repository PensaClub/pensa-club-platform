import { requestFactory } from "./requester";

const apiUrl = process.env.REACT_APP_API_URL;

export const initiativeServiceFactory = (token) => {
  const requester = requestFactory(token);

  return {
    createInitiative: async (initiativeData) => {
      return requester.post(`${apiUrl}/initiatives/create`, initiativeData);
    },
    // Draft endpoints
    saveDraftInitiative: async (draftData) => {
      return requester.post(`${apiUrl}/initiatives/draft/save`, draftData);
    },

    updateDraftInitiative: async (id, draftData) => {
      return requester.post(`${apiUrl}/initiatives/draft/save/${id}`, draftData);
    },

    getAllDrafts: async (page = 1, limit = 6) => {
      return requester.get(`${apiUrl}/initiatives/drafts?page=${page}&limit=${limit}`);
    },

    getDraftById: async (id) => {
      return requester.get(`${apiUrl}/initiatives/draft/${id}`);
    },
    toggleDraftStatus: async (identifier) => {

      return requester.patch(`${apiUrl}/initiatives/toggle-draft/${identifier}`);
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
    getAllBookmarkedInitiatives: async (email) => {
      return requester.get(`${apiUrl}/initiatives/user-initiatives/${email}`);
    },
    getUserInitiatives: async (email) => {
      return requester.get(`${apiUrl}/initiatives/user-initiatives/${email}`);
    },

    getAllInitiatives: async (page = 1, limit = 6) => {
      return requester.get(`${apiUrl}/initiatives/all?page=${page}&limit=${limit}`);
    },

    updateInitiative: async (identifier, initiativeData) => {
      // 🔧 Уверете се, че endpoint-ът приема както ID, така и slug
      return requester.put(`${apiUrl}/initiatives/${identifier}`, initiativeData);
    },
    deleteInitiative: async (identifier) => {
      // 🔧 Уверете се, че endpoint-ът приема както ID, така и slug
      return requester.del(`${apiUrl}/initiatives/${identifier}`);
    },

    // Initiative comments endpoints 

    // Създаване на коментар/reply
    createComment: async (commentData) => {
      const response = await requester.post(`${apiUrl}/comments/create`, commentData);
      return response;
    },
    // Получаване на всички коментари за инициатива
    getInitiativeComments: async (initiativeId) => {
      return requester.get(`${apiUrl}/comments/all/initiative/${initiativeId}`);
    },

    // Получаване на всички коментари за проект  
    getProjectComments: async (projectId) => {
      return requester.get(`${apiUrl}/comments/all/project/${projectId}`);
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
      const response = await requester.post(`${apiUrl}/comments/like/${commentId}`);
      return response;
    },

    getSingleComment: async (commentId) => {
      return requester.get(`${apiUrl}/comments/single/${commentId}`);
    },

    // Project endpoints
    createProject: async (projectData) => {
      return requester.post(`${apiUrl}/projects/create`, projectData);
    },
    getAllProjects: async (page = 1, limit = 6) => {
      return requester.get(`${apiUrl}/projects/all?page=${page}&limit=${limit}`);
    },
    updateProject: async (identifier, projectData) => {
      return requester.put(`${apiUrl}/projects/${identifier}`, projectData);
    },
    getProjectById: async (id) => {
      return requester.get(`${apiUrl}/projects/single/${id}`);
    },
    deleteProject: async (identifier) => {
      return requester.del(`${apiUrl}/projects/${identifier}`);
    },
    getProjectsByInitiative: async (projectId) => {
      return requester.get(`${apiUrl}/projects/initiative/${projectId}`);
    },
    // Project Draft endpoints
    saveDraftProject: async (draftData) => {
      return requester.post(`${apiUrl}/projects/draft/save`, draftData);
    },

    updateDraftProject: async (id, draftData) => {
      return requester.post(`${apiUrl}/projects/draft/save/${id}`, draftData);
    },

    getDraftProjectById: async (id) => {
      return requester.get(`${apiUrl}/projects/draft/${id}`);
    },

    deleteDraftProject: async (draftId) => {
      return requester.del(`${apiUrl}/projects/draft/${draftId}`);
    },

    toggleProjectDraftStatus: async (identifier) => {
      return requester.patch(`${apiUrl}/projects/toggle-draft/${identifier}`);
    },

    getAllProjectDrafts: async (page = 1, limit = 6) => {
      return requester.get(`${apiUrl}/projects/drafts?page=${page}&limit=${limit}`);
    },
    //bookmark-project
    toggleBookmarkProject: async (projectId) => {
      return requester.post(`${apiUrl}/projects/bookmark/${projectId}`);
    },
    getAllBookmarkedProjects: async (email) => {
      return requester.get(`${apiUrl}/projects/user-projects/${email}`);
    },

    // Project applications endpoints
    applyToProject: async (projectId, applicationData) => {
      return requester.post(`${apiUrl}/projects/${projectId}/apply`, applicationData);
    },

    getProjectApplications: async (projectId) => {
      return requester.get(`${apiUrl}/projects/${projectId}/applications`);
    },

    getAllApplications: async () => {
      return requester.get(`${apiUrl}/applications/all`);
    },

    updateApplicationStatus: async (applicationId, status) => {
      return requester.patch(`${apiUrl}/applications/${applicationId}/status`, { status });
    },

    deleteApplication: async (applicationId) => {
      return requester.del(`${apiUrl}/applications/${applicationId}`);
    },

    sendPersonalizedEmails: async (emailData) => {
      return requester.post(`${apiUrl}/applications/send-personalized-emails`, emailData);
    },
  };
};