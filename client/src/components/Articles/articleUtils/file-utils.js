import imageCompression from "browser-image-compression";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { v4 } from "uuid";
import { firebaseStorage } from "../../../firebase";

// Допустими типове файлове
export const allowedImageTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
export const allowedVideoTypes = ["video/mp4", "video/webm", "video/ogg"];

// Компресиране на изображение
export const compressImage = async (file, options = {}) => {
  const defaultOptions = {
    maxSizeMB: 2,
    maxWidthOrHeight: 1920,
  };
  
  const compressionOptions = { ...defaultOptions, ...options };
  
  try {
    return await imageCompression(file, compressionOptions);
  } catch (err) {
    console.error("Image compression error:", err);
    return file;
  }
};

// Качване на файл с прогрес
export const uploadFileWithProgress = (file, path, onProgress) => {
  const fileRef = ref(firebaseStorage, `${path}/${v4()}`);
  const uploadTask = uploadBytesResumable(fileRef, file);
  
  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(progress);
      },
      (error) => {
        reject(error);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(url);
      }
    );
  });
};