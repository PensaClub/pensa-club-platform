import { requestFactory } from './requester';

const apiUrl = import.meta.env.VITE_API_URL;

export const driveServiceFactory = () => {
  const requester = requestFactory();

  return {
    checkStatus: async () => {
      return requester.get(`${apiUrl}/admin/drive/status`);
    },

    listFiles: async (folderId = 'root', pageToken = null) => {
      let url = `${apiUrl}/admin/drive/list?folderId=${encodeURIComponent(folderId)}`;
      if (pageToken) url += `&pageToken=${encodeURIComponent(pageToken)}`;
      return requester.get(url);
    },

    searchFiles: async (query) => {
      return requester.get(`${apiUrl}/admin/drive/search?q=${encodeURIComponent(query)}`);
    },

    uploadFile: async (folderId, file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folderId', folderId);
      const auth = JSON.parse(localStorage.getItem('auth') || '{}');
      const response = await fetch(`${apiUrl}/admin/drive/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${auth.token}` },
        credentials: 'include',
        body: formData,
      });
      return response.json();
    },

    createFolder: async (name, parentId = 'root') => {
      return requester.post(`${apiUrl}/admin/drive/folder`, { name, parentId });
    },

    deleteFile: async (id, permanent = false) => {
      return requester.del(`${apiUrl}/admin/drive/file/${id}?permanent=${permanent}`);
    },

    renameFile: async (id, newName) => {
      return requester.put(`${apiUrl}/admin/drive/rename/${id}`, { newName });
    },

    moveFile: async (id, newParentId) => {
      return requester.post(`${apiUrl}/admin/drive/move/${id}`, { newParentId });
    },

    downloadFile: (id) => {
      return `${apiUrl}/admin/drive/download/${id}`;
    },

    getFileInfo: async (id) => {
      return requester.get(`${apiUrl}/admin/drive/info/${id}`);
    },

    getQuota: async () => {
      return requester.get(`${apiUrl}/admin/drive/quota`);
    },

    shareFile: async (id, email, role = 'reader', sendNotification = true) => {
      return requester.post(`${apiUrl}/admin/drive/share/${id}`, { email, role, sendNotification });
    },

    getPermissions: async (id) => {
      return requester.get(`${apiUrl}/admin/drive/permissions/${id}`);
    },

    removePermission: async (fileId, permissionId) => {
      return requester.del(`${apiUrl}/admin/drive/permissions/${fileId}/${permissionId}`);
    },

    setFolderPassword: async (folderId, password, folderName, oldPassword = null, lockTimeout = null) => {
      return requester.post(`${apiUrl}/admin/drive/folder-password/${folderId}`, { password, folderName, oldPassword, lockTimeout });
    },

    removeFolderPassword: async (folderId, password) => {
      return requester.del(`${apiUrl}/admin/drive/folder-password/${folderId}`, { password });
    },

    requestPasswordReset: async (folderId) => {
      return requester.post(`${apiUrl}/admin/drive/folder-password/${folderId}/reset-request`);
    },

    verifyFolderPassword: async (folderId, password) => {
      return requester.post(`${apiUrl}/admin/drive/folder-password/${folderId}/verify`, { password });
    },

    getProtectedFolders: async () => {
      return requester.get(`${apiUrl}/admin/drive/folder-passwords`);
    },

    setSuperPassword: async (password) => {
      return requester.post(`${apiUrl}/admin/drive/super-password`, { password });
    },

    getSuperPasswordStatus: async () => {
      return requester.get(`${apiUrl}/admin/drive/super-password`);
    },

    removeSuperPassword: async () => {
      return requester.del(`${apiUrl}/admin/drive/super-password`);
    },
  };
};
