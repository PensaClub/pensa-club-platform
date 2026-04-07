// src/components/contexts/StorageProvider.jsx

import { createContext, useContext, useCallback, useMemo } from 'react';
import { useAuthContext } from './UserContext';
import { storageServiceFactory } from '../Services/storageService';
import { toast } from 'react-toastify';

const StorageContext = createContext();

export const StorageProvider = ({ children }) => {
  const { isAdmin } = useAuthContext();
  const storageService = useMemo(() => storageServiceFactory(), []);

  // =========================================================
  //                    FILE OPERATIONS
  // =========================================================

  const listFiles = useCallback(async (path) => {
    try {
      return await storageService.listFiles(path);
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  }, [storageService]);

  const uploadFile = useCallback(async (path, file) => {
    try {
      const result = await storageService.uploadFile(path, file);
      return result;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }, [storageService]);

  const createFolder = useCallback(async (path) => {
    try {
      const result = await storageService.createFolder(path);
      return result;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  }, [storageService]);

  const deleteFile = useCallback(async (path) => {
    try {
      const result = await storageService.deleteFile(path);
      return result;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }, [storageService]);

  const deleteFolder = useCallback(async (path) => {
    try {
      const result = await storageService.deleteFolder(path);
      return result;
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw error;
    }
  }, [storageService]);

  const renameFile = useCallback(async (oldPath, newPath) => {
    try {
      const result = await storageService.renameFile(oldPath, newPath);
      return result;
    } catch (error) {
      console.error('Error renaming file:', error);
      throw error;
    }
  }, [storageService]);

  const moveFile = useCallback(async (sourcePath, destinationFolder) => {
    try {
      const result = await storageService.moveFile(sourcePath, destinationFolder);
      return result;
    } catch (error) {
      console.error('Error moving file:', error);
      throw error;
    }
  }, [storageService]);

  const getFileInfo = useCallback(async (path) => {
    try {
      return await storageService.getFileInfo(path);
    } catch (error) {
      console.error('Error getting file info:', error);
      throw error;
    }
  }, [storageService]);

  const getStorageUsage = useCallback(async () => {
    try {
      return await storageService.getStorageUsage();
    } catch (error) {
      console.error('Error getting storage usage:', error);
      throw error;
    }
  }, [storageService]);

  const getDownloadUrl = useCallback((path) => {
    return storageService.getDownloadUrl(path);
  }, [storageService]);

  // =========================================================
  //                    ADMIN OPERATIONS
  // =========================================================

  const syncStorage = useCallback(async () => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return;
    }
    try {
      const result = await storageService.syncStorage();
      return result;
    } catch (error) {
      console.error('Error syncing storage:', error);
      throw error;
    }
  }, [storageService, isAdmin]);

  const getSyncStatus = useCallback(async () => {
    try {
      return await storageService.getSyncStatus();
    } catch (error) {
      console.error('Error getting sync status:', error);
      throw error;
    }
  }, [storageService]);

  const initializeStructure = useCallback(async () => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return;
    }
    try {
      const result = await storageService.initializeStructure();
      return result;
    } catch (error) {
      console.error('Error initializing structure:', error);
      throw error;
    }
  }, [storageService, isAdmin]);

  const createProject = useCallback(async (name) => {
    if (!isAdmin) {
      toast.error('Нямате права за тази операция');
      return;
    }
    try {
      const result = await storageService.createProject(name);
      return result;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }, [storageService, isAdmin]);

  // =========================================================
  //                    SHARED LINKS
  // =========================================================

  const createShareLink = useCallback(async (data) => {
    try {
      const result = await storageService.createShareLink(data);
      return result;
    } catch (error) {
      console.error('Error creating share link:', error);
      throw error;
    }
  }, [storageService]);

  const getShareLinks = useCallback(async () => {
    try {
      return await storageService.getShareLinks();
    } catch (error) {
      console.error('Error getting share links:', error);
      throw error;
    }
  }, [storageService]);

  const deleteShareLink = useCallback(async (id) => {
    try {
      const result = await storageService.deleteShareLink(id);
      return result;
    } catch (error) {
      console.error('Error deleting share link:', error);
      throw error;
    }
  }, [storageService]);

  const getShareLinkInfo = useCallback(async (token) => {
    try {
      return await storageService.getShareLinkInfo(token);
    } catch (error) {
      console.error('Error getting share link info:', error);
      throw error;
    }
  }, [storageService]);

  const downloadSharedFile = useCallback(async (token, password) => {
    try {
      return await storageService.downloadSharedFile(token, password);
    } catch (error) {
      console.error('Error downloading shared file:', error);
      throw error;
    }
  }, [storageService]);

  // =========================================================
  //                    FILE SHARING WITH USERS
  // =========================================================

  const shareWithUser = useCallback(async (data) => {
    try {
      const result = await storageService.shareWithUser(data);
      return result;
    } catch (error) {
      console.error('Error sharing with user:', error);
      throw error;
    }
  }, [storageService]);

  const getSharedWithMe = useCallback(async () => {
    try {
      return await storageService.getSharedWithMe();
    } catch (error) {
      console.error('Error getting shared files:', error);
      throw error;
    }
  }, [storageService]);

  const markShareAsRead = useCallback(async (id) => {
    try {
      return await storageService.markShareAsRead(id);
    } catch (error) {
      console.error('Error marking share as read:', error);
      throw error;
    }
  }, [storageService]);

  const deleteShare = useCallback(async (id) => {
    try {
      const result = await storageService.deleteShare(id);
      return result;
    } catch (error) {
      console.error('Error deleting share:', error);
      throw error;
    }
  }, [storageService]);

  const searchUsers = useCallback(async (q) => {
    try {
      return await storageService.searchUsers(q);
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }, [storageService]);

  // =========================================================
  //                    USER SHARED FILES (PUBLIC)
  // =========================================================

  const getUserSharedFiles = useCallback(async () => {
    try {
      return await storageService.getUserSharedFiles();
    } catch (error) {
      console.error('Error getting user shared files:', error);
      throw error;
    }
  }, [storageService]);

  const markUserShareAsRead = useCallback(async (id) => {
    try {
      return await storageService.markUserShareAsRead(id);
    } catch (error) {
      console.error('Error marking user share as read:', error);
      throw error;
    }
  }, [storageService]);

  const getSharedFileDownloadUrl = useCallback((id) => {
    return storageService.getSharedFileDownloadUrl(id);
  }, [storageService]);

  // =========================================================
  //                    CONTEXT VALUE
  // =========================================================

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const contextValue = useMemo(() => ({
    // File operations
    listFiles,
    uploadFile,
    createFolder,
    deleteFile,
    deleteFolder,
    renameFile,
    moveFile,
    getFileInfo,
    getStorageUsage,
    getDownloadUrl,
    // Admin operations
    syncStorage,
    getSyncStatus,
    initializeStructure,
    createProject,
    // Shared links
    createShareLink,
    getShareLinks,
    deleteShareLink,
    getShareLinkInfo,
    downloadSharedFile,
    // File sharing with users
    shareWithUser,
    getSharedWithMe,
    markShareAsRead,
    deleteShare,
    searchUsers,
    // User shared files
    getUserSharedFiles,
    markUserShareAsRead,
    getSharedFileDownloadUrl,
  }), [
    listFiles, uploadFile, createFolder, deleteFile, deleteFolder, renameFile, moveFile,
    getFileInfo, getStorageUsage, getDownloadUrl,
    syncStorage, getSyncStatus, initializeStructure, createProject,
    createShareLink, getShareLinks, deleteShareLink, getShareLinkInfo, downloadSharedFile,
    shareWithUser, getSharedWithMe, markShareAsRead, deleteShare, searchUsers,
    getUserSharedFiles, markUserShareAsRead, getSharedFileDownloadUrl,
  ]);

  return (
    <StorageContext.Provider value={contextValue}>
      {children}
    </StorageContext.Provider>
  );
};

export const useStorage = () => {
  const context = useContext(StorageContext);
  if (!context) throw new Error('useStorage must be used within StorageProvider');
  return context;
};
