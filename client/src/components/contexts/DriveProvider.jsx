import { createContext, useContext, useCallback, useMemo } from 'react';
import { driveServiceFactory } from '../Services/driveService';

const DriveContext = createContext();

export const DriveProvider = ({ children }) => {
  const driveService = useMemo(() => driveServiceFactory(), []);

  const checkStatus = useCallback(async () => {
    try {
      return await driveService.checkStatus();
    } catch (error) {
      console.error('Error checking Drive status:', error);
      throw error;
    }
  }, [driveService]);

  const listFiles = useCallback(async (folderId, pageToken) => {
    try {
      return await driveService.listFiles(folderId, pageToken);
    } catch (error) {
      console.error('Error listing Drive files:', error);
      throw error;
    }
  }, [driveService]);

  const searchFiles = useCallback(async (query) => {
    try {
      return await driveService.searchFiles(query);
    } catch (error) {
      console.error('Error searching Drive files:', error);
      throw error;
    }
  }, [driveService]);

  const uploadFile = useCallback(async (folderId, file) => {
    try {
      return await driveService.uploadFile(folderId, file);
    } catch (error) {
      console.error('Error uploading to Drive:', error);
      throw error;
    }
  }, [driveService]);

  const createFolder = useCallback(async (name, parentId) => {
    try {
      return await driveService.createFolder(name, parentId);
    } catch (error) {
      console.error('Error creating Drive folder:', error);
      throw error;
    }
  }, [driveService]);

  const deleteFile = useCallback(async (id, permanent = false) => {
    try {
      return await driveService.deleteFile(id, permanent);
    } catch (error) {
      console.error('Error deleting Drive file:', error);
      throw error;
    }
  }, [driveService]);

  const renameFile = useCallback(async (id, newName) => {
    try {
      return await driveService.renameFile(id, newName);
    } catch (error) {
      console.error('Error renaming Drive file:', error);
      throw error;
    }
  }, [driveService]);

  const moveFile = useCallback(async (id, newParentId) => {
    try {
      return await driveService.moveFile(id, newParentId);
    } catch (error) {
      console.error('Error moving Drive file:', error);
      throw error;
    }
  }, [driveService]);

  const getDownloadUrl = useCallback((id) => {
    return driveService.downloadFile(id);
  }, [driveService]);

  const getFileInfo = useCallback(async (id) => {
    try {
      return await driveService.getFileInfo(id);
    } catch (error) {
      console.error('Error getting Drive file info:', error);
      throw error;
    }
  }, [driveService]);

  const getQuota = useCallback(async () => {
    try {
      return await driveService.getQuota();
    } catch (error) {
      console.error('Error getting Drive quota:', error);
      throw error;
    }
  }, [driveService]);

  const shareFile = useCallback(async (id, email, role, sendNotification) => {
    try {
      return await driveService.shareFile(id, email, role, sendNotification);
    } catch (error) {
      console.error('Error sharing Drive file:', error);
      throw error;
    }
  }, [driveService]);

  const getPermissions = useCallback(async (id) => {
    try {
      return await driveService.getPermissions(id);
    } catch (error) {
      console.error('Error getting Drive permissions:', error);
      throw error;
    }
  }, [driveService]);

  const removePermission = useCallback(async (fileId, permissionId) => {
    try {
      return await driveService.removePermission(fileId, permissionId);
    } catch (error) {
      console.error('Error removing Drive permission:', error);
      throw error;
    }
  }, [driveService]);

  const setFolderPassword = useCallback(async (folderId, password, folderName, oldPassword, lockTimeout) => {
    try {
      return await driveService.setFolderPassword(folderId, password, folderName, oldPassword, lockTimeout);
    } catch (error) {
      console.error('Error setting folder password:', error);
      throw error;
    }
  }, [driveService]);

  const removeFolderPassword = useCallback(async (folderId, password) => {
    try {
      return await driveService.removeFolderPassword(folderId, password);
    } catch (error) {
      console.error('Error removing folder password:', error);
      throw error;
    }
  }, [driveService]);

  const requestPasswordReset = useCallback(async (folderId) => {
    try {
      return await driveService.requestPasswordReset(folderId);
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw error;
    }
  }, [driveService]);

  const verifyFolderPassword = useCallback(async (folderId, password) => {
    try {
      return await driveService.verifyFolderPassword(folderId, password);
    } catch (error) {
      console.error('Error verifying folder password:', error);
      throw error;
    }
  }, [driveService]);

  const getProtectedFolders = useCallback(async () => {
    try {
      return await driveService.getProtectedFolders();
    } catch (error) {
      console.error('Error getting protected folders:', error);
      throw error;
    }
  }, [driveService]);

  const setSuperPassword = useCallback(async (password) => {
    try {
      return await driveService.setSuperPassword(password);
    } catch (error) {
      console.error('Error setting super password:', error);
      throw error;
    }
  }, [driveService]);

  const getSuperPasswordStatus = useCallback(async () => {
    try {
      return await driveService.getSuperPasswordStatus();
    } catch (error) {
      console.error('Error getting super password status:', error);
      throw error;
    }
  }, [driveService]);

  const removeSuperPassword = useCallback(async () => {
    try {
      return await driveService.removeSuperPassword();
    } catch (error) {
      console.error('Error removing super password:', error);
      throw error;
    }
  }, [driveService]);

  const contextValue = useMemo(() => ({
    checkStatus,
    listFiles,
    searchFiles,
    uploadFile,
    createFolder,
    deleteFile,
    renameFile,
    moveFile,
    getDownloadUrl,
    getFileInfo,
    getQuota,
    shareFile,
    getPermissions,
    removePermission,
    setFolderPassword,
    removeFolderPassword,
    verifyFolderPassword,
    getProtectedFolders,
    requestPasswordReset,
    setSuperPassword,
    getSuperPasswordStatus,
    removeSuperPassword,
  }), [
    checkStatus, listFiles, searchFiles, uploadFile, createFolder,
    deleteFile, renameFile, moveFile, getDownloadUrl, getFileInfo, getQuota,
    shareFile, getPermissions, removePermission,
    setFolderPassword, removeFolderPassword, verifyFolderPassword, getProtectedFolders, requestPasswordReset,
    setSuperPassword, getSuperPasswordStatus, removeSuperPassword,
  ]);

  return (
    <DriveContext.Provider value={contextValue}>
      {children}
    </DriveContext.Provider>
  );
};

export const useDrive = () => {
  const context = useContext(DriveContext);
  if (!context) throw new Error('useDrive must be used within DriveProvider');
  return context;
};
