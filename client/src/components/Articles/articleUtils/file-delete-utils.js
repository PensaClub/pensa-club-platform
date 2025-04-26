import { ref, deleteObject } from "firebase/storage";
import { firebaseStorage } from "../../../firebase";

// Функция за изтриване на файл от Firebase Storage по URL
export const deleteFileFromStorage = async (url) => {
  try {
    // Пропускаме URL-и, които не са от Firebase Storage
    if (!url || !url.includes('firebasestorage.googleapis.com')) {
      return true;
    }

    // Извличане на пътя от URL-а
    const urlObj = new URL(url);
    const path = decodeURIComponent(urlObj.pathname.split('/o/')[1].split('?')[0]);
    
    // Създаване на референция към файла
    const fileRef = ref(firebaseStorage, path);
    
    // Изтриване на файла
    await deleteObject(fileRef);
    console.log(`Успешно изтрит файл: ${url}`);
    return true;
  } catch (error) {
    console.error("Грешка при изтриване на файл от Firebase Storage:", error);
    return false;
  }
};