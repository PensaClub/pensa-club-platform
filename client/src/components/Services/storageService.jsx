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

    deleteOrphan: async (table, id) => {
      return requester.del(`${apiUrl}/admin/storage/orphan`, { table, id });
    },

    deleteSyncErrorFile: async (path) => {
      return requester.del(`${apiUrl}/admin/storage/sync-error`, { path });
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
      const contentType = response.headers.get('content-type') || '';
      // If we got HTML back (NPM fallback to React SPA), the route isn't
      // hitting the backend — surface that as a clear "not found".
      if (!contentType.includes('application/json')) {
        const err = new Error('Backend route not reachable (got HTML instead of JSON)');
        err.statusCode = 404;
        err.routingIssue = true;
        throw err;
      }
      const data = await response.json();
      if (!response.ok) {
        const err = new Error(data?.message || 'Request failed');
        err.statusCode = response.status;
        err.body = data;
        throw err;
      }
      return data;
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

    // Verify password without downloading — used by mobile-friendly flow
    verifySharedLinkPassword: async (token, password) => {
      const response = await fetch(`${apiUrl}/shared-links/${token}/verify-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw err;
      }
      return response.json();
    },

    // Build a direct download URL for native browser download
    // Works for both passwordless and password-protected links
    getSharedDownloadUrl: (token, password) => {
      const base = `${apiUrl}/shared-links/${token}/download`;
      return password ? `${base}?password=${encodeURIComponent(password)}` : base;
    },

    // Search files
    searchFiles: async (params = {}) => {
      const queryParts = [];
      if (params.q) queryParts.push(`q=${encodeURIComponent(params.q)}`);
      if (params.type) queryParts.push(`type=${encodeURIComponent(params.type)}`);
      if (params.path) queryParts.push(`path=${encodeURIComponent(params.path)}`);
      if (params.maxResults) queryParts.push(`maxResults=${params.maxResults}`);
      const qs = queryParts.length ? `?${queryParts.join('&')}` : '';
      return requester.get(`${apiUrl}/admin/storage/search${qs}`);
    },

    // Analytics
    getAnalytics: async () => {
      return requester.get(`${apiUrl}/admin/storage/analytics`);
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
