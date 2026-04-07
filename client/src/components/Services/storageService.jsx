import { requestFactory } from './requester';

const apiUrl = import.meta.env.VITE_API_URL;

export const storageServiceFactory = () => {
  const requester = requestFactory();

  return {
    listFiles: async (path = '') => {
      return requester.get(`${apiUrl}/admin/storage/list?path=${encodeURIComponent(path)}`);
    },

    uploadFile: async (path, file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', path);
      const auth = JSON.parse(localStorage.getItem('auth') || '{}');
      const response = await fetch(`${apiUrl}/admin/storage/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${auth.token}` },
        credentials: 'include',
        body: formData,
      });
      return response.json();
    },

    createFolder: async (path) => {
      return requester.post(`${apiUrl}/admin/storage/folder`, { path });
    },

    deleteFile: async (path) => {
      return requester.del(`${apiUrl}/admin/storage/file`, { path });
    },

    deleteFolder: async (path) => {
      return requester.del(`${apiUrl}/admin/storage/folder`, { path });
    },

    renameFile: async (oldPath, newPath) => {
      return requester.post(`${apiUrl}/admin/storage/rename`, { oldPath, newPath });
    },

    moveFile: async (sourcePath, destinationFolder) => {
      return requester.post(`${apiUrl}/admin/storage/move`, { sourcePath, destinationFolder });
    },

    getFileInfo: async (path) => {
      return requester.get(`${apiUrl}/admin/storage/info?path=${encodeURIComponent(path)}`);
    },

    getStorageUsage: async () => {
      return requester.get(`${apiUrl}/admin/storage/usage`);
    },

    getDownloadUrl: (path) => {
      return `${apiUrl}/admin/storage/download?path=${encodeURIComponent(path)}`;
    },

    syncStorage: async () => {
      return requester.post(`${apiUrl}/admin/storage/sync`);
    },

    getSyncStatus: async () => {
      return requester.get(`${apiUrl}/admin/storage/sync-status`);
    },

    initializeStructure: async () => {
      return requester.post(`${apiUrl}/admin/storage/initialize-structure`);
    },

    createProject: async (name) => {
      return requester.post(`${apiUrl}/admin/storage/create-project`, { name });
    },

    // Shared Links
    createShareLink: async (data) => {
      return requester.post(`${apiUrl}/shared-links`, data);
    },

    getShareLinks: async () => {
      return requester.get(`${apiUrl}/shared-links`);
    },

    deleteShareLink: async (id) => {
      return requester.del(`${apiUrl}/shared-links/${id}`);
    },

    getShareLinkInfo: async (token) => {
      const response = await fetch(`${apiUrl}/shared-links/${token}/info`);
      return response.json();
    },

    downloadSharedFile: async (token, password) => {
      const response = await fetch(`${apiUrl}/shared-links/${token}/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw err;
      }
      return response.blob();
    },

    // File sharing with users
    shareWithUser: async (data) => {
      return requester.post(`${apiUrl}/admin/storage/share`, data);
    },

    getSharedWithMe: async () => {
      return requester.get(`${apiUrl}/admin/storage/shared-with-me`);
    },

    markShareAsRead: async (id) => {
      return requester.put(`${apiUrl}/admin/storage/shared-with-me/${id}/read`);
    },

    deleteShare: async (id) => {
      return requester.del(`${apiUrl}/admin/storage/share/${id}`);
    },

    searchUsers: async (q) => {
      return requester.get(`${apiUrl}/admin/storage/search-users?q=${encodeURIComponent(q)}`);
    },

    // Public user endpoints (no admin required)
    getUserSharedFiles: async () => {
      return requester.get(`${apiUrl}/user/shared-files`);
    },

    markUserShareAsRead: async (id) => {
      return requester.put(`${apiUrl}/user/shared-files/${id}/read`);
    },

    getSharedFileDownloadUrl: (id) => {
      return `${apiUrl}/user/shared-files/${id}/download`;
    },
  };
};
