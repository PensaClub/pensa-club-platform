// src/firebase/firebaseMentorStorage.js

import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { firebaseStorage } from '../../firebase';

/**
 * Upload снимка на ментор кандидат
 * @param {File} file 
 * @param {Function} onProgress 
 * @returns {Promise<{url: string, originalName: string, storagePath: string}>}
 */
export const uploadMentorPhoto = async (file, onProgress = null) => {
  try {
    const timestamp = Date.now();
    const originalName = file.name;
    const fileName = `${timestamp}_${originalName}`;
    const filePath = `mentor_applications/photos/${fileName}`;
    
    const fileRef = storageRef(firebaseStorage, filePath);
    const uploadTask = uploadBytesResumable(fileRef, file);
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          console.error('Photo upload error:', error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              url: downloadURL,
              originalName: originalName,
              storagePath: filePath
            });
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
};

/**
 * Upload CV на ментор кандидат
 * @param {File} file 
 * @param {Function} onProgress 
 * @returns {Promise<{url: string, originalName: string, storagePath: string}>}
 */
export const uploadMentorCV = async (file, onProgress = null) => {
  try {
    const timestamp = Date.now();
    const originalName = file.name;
    const fileName = `${timestamp}_${originalName}`;
    const filePath = `mentor_applications/cv/${fileName}`;
    
    const fileRef = storageRef(firebaseStorage, filePath);
    const uploadTask = uploadBytesResumable(fileRef, file);
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          console.error('CV upload error:', error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              url: downloadURL,
              originalName: originalName,
              storagePath: filePath
            });
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error uploading CV:', error);
    throw error;
  }
};

/**
 * Извлича оригиналното име на файл от storage path
 * @param {string} storagePath - напр. "mentor_applications/cv/1234567890_resume.pdf"
 * @returns {string} - "resume.pdf"
 */
export const getOriginalFileName = (storagePath) => {
  const fileName = storagePath.split('/').pop(); // "1234567890_resume.pdf"
  const parts = fileName.split('_');
  parts.shift(); // премахва timestamp
  return parts.join('_'); // "resume.pdf" (ако има _ в оригиналното име)
};