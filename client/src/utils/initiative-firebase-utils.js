// utils/initiative-firebase-utils.js

import { deleteFileFromStorage } from '../components/Articles/articleUtils/file-delete-utils';
import { compressImage, uploadFileWithProgress } from '../components/Articles/articleUtils/file-utils';

/**
 * Качва main image или gallery снимки във Firebase
 * @param {FileList|Array} files - Файловете за качване
 * @param {string} folderPath - Пътя във Firebase Storage
 * @param {Function} progressCallback - Callback за прогрес
 * @returns {Promise<Array>} - URL адресите на качените снимки
 */
// В initiative-firebase-utils.js - ПОПРАВЕНО
export const uploadInitiativeImages = async (files, folderPath = 'initiatives/images', progressCallback) => {
  if (!files || files.length === 0) {
    console.log('❌ No files to upload');
    return [];
  }

  try {
    const fileArray = Array.isArray(files) ? files : Array.from(files);
    console.log('📤 Starting upload of', fileArray.length, 'files to', folderPath);

    const uploadPromises = fileArray.map(async (file, index) => {
      console.log(`📤 Uploading file ${index + 1}:`, file.name, file.size);

      // Компресираме снимката
      const compressedFile = await compressImage(file, {
        maxSizeMB: 2,
        maxWidthOrHeight: 1920
      });

      console.log(`🗜️ Compressed file ${index + 1}:`, compressedFile.size);

      // Качваме във Firebase
      const url = await uploadFileWithProgress(
        compressedFile,
        folderPath,
        (progress) => {
          console.log(`📊 File ${index + 1} progress:`, progress + '%');
          if (progressCallback) {
            const totalProgress = ((index + progress/100) / fileArray.length) * 100;
            progressCallback(totalProgress);
          }
        }
      );

      return {
        src: url,
        alt: '',
        caption: ''
      };
    });

    const uploadedImages = await Promise.all(uploadPromises);
    return uploadedImages;

  } catch (error) {
    console.error('❌ Upload error:', error);
    throw error;
  }
};

/**
 * Качва section images във Firebase
 * @param {FileList|Array} files - Файловете за качване
 * @param {number} sectionIndex - Индекса на секцията
 * @param {Function} progressCallback - Callback за прогрес
 * @returns {Promise<Array>} - URL адресите на качените снимки
 */
export const uploadSectionImages = async (files, sectionIndex, progressCallback) => {
  const folderPath = `initiatives/sections/section-${sectionIndex}`;
  return uploadInitiativeImages(files, folderPath, progressCallback);
};

/**
 * Изтрива снимки от Firebase Storage
 * @param {Array} imageUrls - URL адресите за изтриване
 * @returns {Promise<void>}
 */
export const deleteInitiativeImages = async (imageUrls) => {
  if (!imageUrls || imageUrls.length === 0) return;

  try {
    const deletePromises = imageUrls
      .filter(url => url && url.includes('firebasestorage.googleapis.com'))
      .map(url => deleteFileFromStorage(url));

    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Грешка при изтриване на снимки:', error);
    throw error;
  }
};

/**
 * Намира снимките за изтриване при редактиране на инициатива
 * @param {Object} oldInitiative - Старата инициатива
 * @param {Object} newInitiative - Новата инициатива
 * @returns {Array} - URL адресите за изтриване
 */
export const findInitiativeImagesToDelete = (oldInitiative, newInitiative) => {
  const imagesToDelete = [];

  // Проверка за main image промени
  if (oldInitiative.mainImage) {
    // Проверка за gallery промени
    if (oldInitiative.mainImage.gallery && Array.isArray(oldInitiative.mainImage.gallery)) {
      oldInitiative.mainImage.gallery.forEach(oldImg => {
        if (!oldImg.src || !oldImg.src.includes('firebasestorage.googleapis.com')) return;
        
        const existsInNew = newInitiative.mainImage?.gallery?.some(
          newImg => newImg.src === oldImg.src
        );
        
        if (!existsInNew) {
          imagesToDelete.push(oldImg.src);
        }
      });
    }

    // Проверка за главната снимка
    if (oldInitiative.mainImage.src && 
        oldInitiative.mainImage.src.includes('firebasestorage.googleapis.com') &&
        oldInitiative.mainImage.src !== newInitiative.mainImage?.src) {
      imagesToDelete.push(oldInitiative.mainImage.src);
    }
  }

  // Проверка за section images промени
  if (oldInitiative.sections && Array.isArray(oldInitiative.sections)) {
    oldInitiative.sections.forEach((oldSection, sectionIndex) => {
      const newSection = newInitiative.sections?.[sectionIndex];
      
      if (!newSection) {
        // Секцията е премахната - изтриваме всички снимки
        if (oldSection.images && Array.isArray(oldSection.images)) {
          oldSection.images.forEach(img => {
            if (img.src && img.src.includes('firebasestorage.googleapis.com')) {
              imagesToDelete.push(img.src);
            }
          });
        }
      } else {
        // Секцията съществува - проверяваме за премахнати снимки
        if (oldSection.images && Array.isArray(oldSection.images)) {
          oldSection.images.forEach(oldImg => {
            if (!oldImg.src || !oldImg.src.includes('firebasestorage.googleapis.com')) return;
            
            const existsInNew = newSection.images?.some(
              newImg => newImg.src === oldImg.src
            );
            
            if (!existsInNew) {
              imagesToDelete.push(oldImg.src);
            }
          });
        }
      }
    });
  }

  return [...new Set(imagesToDelete)]; // Премахваме дубликати
};

/**
 * Обработва всички промени в изображенията при редактиране на инициатива
 * @param {Object} oldInitiative - Старата инициатива
 * @param {Object} newInitiative - Новата инициатива с промени
 * @param {Function} progressCallback - Callback за прогрес
 * @returns {Object} - Обновената инициатива с Firebase URL адреси
 */
export const processInitiativeImageChanges = async (oldInitiative, newInitiative, progressCallback) => {
  try {
    // Стъпка 1: Намираме снимките за изтриване
    const imagesToDelete = findInitiativeImagesToDelete(oldInitiative, newInitiative);
    
    // Стъпка 2: Изтриваме старите снимки
    if (imagesToDelete.length > 0) {
      await deleteInitiativeImages(imagesToDelete);
    }

    // Стъпка 3: Качваме новите снимки (ако има такива с blob: URL-и)
    const updatedInitiative = { ...newInitiative };
    
    // Обработваме main image gallery
    if (updatedInitiative.mainImage?.gallery) {
      const blobImages = updatedInitiative.mainImage.gallery.filter(
        img => img.src && img.src.startsWith('blob:')
      );
      
      if (blobImages.length > 0) {
        // Тук трябва да имаме достъп до файловете, но понеже използваме URL.createObjectURL
        // трябва да преработим логиката за да не създаваме blob URL-и изобщо
        console.warn('Намерени blob URL-и в gallery - трябва да се качат във Firebase');
      }
    }

    // Обработваме section images
    if (updatedInitiative.sections) {
      updatedInitiative.sections.forEach((section, index) => {
        if (section.images) {
          const blobImages = section.images.filter(
            img => img.src && img.src.startsWith('blob:')
          );
          
          if (blobImages.length > 0) {
            console.warn(`Намерени blob URL-и в секция ${index} - трябва да се качат във Firebase`);
          }
        }
      });
    }

    return updatedInitiative;
    
  } catch (error) {
    console.error('Грешка при обработка на изображенията:', error);
    throw error;
  }
};

/**
 * Изтрива една снимка от Firebase Storage
 * @param {string} imageUrl - URL адреса на снимката
 * @returns {Promise<void>}
 */
export const deleteSingleImage = async (imageUrl) => {
  if (!imageUrl || !imageUrl.includes('firebasestorage.googleapis.com')) {
    console.log('Не е Firebase URL - не се изтрива:', imageUrl);
    return;
  }

  try {
    await deleteFileFromStorage(imageUrl);
    console.log('✅ Изтрита снимка от Firebase:', imageUrl);
  } catch (error) {
    console.error('Грешка при изтриване на снимка:', error);
    throw error;
  }
};