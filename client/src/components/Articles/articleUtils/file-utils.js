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
// firebase/file-utils.js (допълнение)

// Допустими типове документи
export const allowedDocumentTypes = [
  "application/pdf",
  "application/msword", 
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "text/plain" // .txt
];

// Качване на документ без компресиране
export const uploadDocumentWithProgress = (file, path, onProgress) => {
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

// Валидация на документ
export const isValidDocument = (file) => {
  if (!file) return false;
  
  // Проверка на тип
  if (!allowedDocumentTypes.includes(file.type)) {
    return { valid: false, error: 'Неподдържан тип файл' };
  }
  
  // Проверка на размер (макс 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'Файлът е твърде голям (макс 10MB)' };
  }
  
  return { valid: true };
};

// Получаване на иконка според типа файл
export const getFileIcon = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return '📄';
    case 'doc':
    case 'docx':
      return '📝';
    case 'ppt':
    case 'pptx':
      return '📊';
    case 'xls':
    case 'xlsx':
      return '📈';
    default:
      return '📁';
  }
};

// Форматиране на размера на файла
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
export const isValidImageUrl = (url) => {
  if (!url) return false;
  return !!url.match(/^(https?:\/\/)(.+)\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i);
};
