import { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { firebaseStorage } from '../../firebase';

export const useFirebaseUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const uploadFile = async (file, path, onProgress = null) => {
    return new Promise((resolve, reject) => {
      const fileId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const fileName = `${fileId}_${file.name}`;
      const storageRef = ref(firebaseStorage, `${path}/${fileName}`);
      
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      setUploading(true);
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
      
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
          
          if (onProgress) {
            onProgress(progress, fileId);
          }
        },
        (error) => {
          console.error('Upload error:', error);
          setUploading(false);
          setUploadProgress(prev => {
            const updated = { ...prev };
            delete updated[fileId];
            return updated;
          });
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            setUploading(false);
            setTimeout(() => {
              setUploadProgress(prev => {
                const updated = { ...prev };
                delete updated[fileId];
                return updated;
              });
            }, 1000);
            
            resolve({
              id: fileId,
              name: file.name,
              size: file.size,
              type: file.type,
              url: downloadURL,
              uploadedAt: new Date().toISOString()
            });
          } catch (error) {
            console.error('Error getting download URL:', error);
            setUploading(false);
            reject(error);
          }
        }
      );
    });
  };

  const uploadMultipleFiles = async (files, path, onProgress = null) => {
    const promises = Array.from(files).map(file => 
      uploadFile(file, path, onProgress)
    );
    
    try {
      return await Promise.all(promises);
    } catch (error) {
      console.error('Error uploading multiple files:', error);
      throw error;
    }
  };

  return {
    uploadFile,
    uploadMultipleFiles,
    uploading,
    uploadProgress
  };
};