// fire-base-edit.js
import { deleteFileFromStorage } from "./file-delete-utils";
import { uploadFileWithProgress, compressImage } from "./file-utils";
import { createEditorState } from "./editor";

/**
 * Намира изображенията, които трябва да бъдат изтрити при редактиране на статия
 * @param {Object} oldArticle - Оригиналната статия преди редакцията
 * @param {Object} newArticle - Обновената статия след редакцията
 * @returns {Array} Масив с URL адреси на изображения за изтриване
 */
export const findImagesToDelete = (oldArticle, newArticle) => {
  const imagesToDelete = [];

  // Проверка за промени в основното изображение
  if (oldArticle.mainImage && newArticle.mainImage) {
    // Проверка дали се е променил типът на изображението
    if (oldArticle.mainImage.type !== newArticle.mainImage.type) {
      // Ако типът е променен, изтриваме всички стари изображения
      if (oldArticle.mainImage.sources && Array.isArray(oldArticle.mainImage.sources)) {
        oldArticle.mainImage.sources.forEach(src => {
          if (src && src.includes('firebasestorage.googleapis.com')) {
            imagesToDelete.push(src);
          }
        });
      }
    } else {
      // Същият тип, проверяваме за конкретни изтрити изображения
      if (Array.isArray(oldArticle.mainImage.sources) && Array.isArray(newArticle.mainImage.sources)) {
        oldArticle.mainImage.sources.forEach(src => {
          if (src && src.includes('firebasestorage.googleapis.com') && 
              !newArticle.mainImage.sources.includes(src)) {
            imagesToDelete.push(src);
          }
        });
      }
    }

    // Проверка дали се е променила миниатюрата (за видео тип)
    if (oldArticle.mainImage.thumbnail && 
        oldArticle.mainImage.thumbnail.includes('firebasestorage.googleapis.com') &&
        oldArticle.mainImage.thumbnail !== newArticle.mainImage.thumbnail) {
      imagesToDelete.push(oldArticle.mainImage.thumbnail);
    }
  }

  // Проверка за промени в изображенията в секциите
  if (oldArticle.sections && newArticle.sections) {
    oldArticle.sections.forEach(oldSection => {
      // Намираме съответната нова секция по ID или order
      const newSection = newArticle.sections.find(s => 
        s.id === oldSection.id || s.order === oldSection.order);
      
      if (!newSection) {
        // Секцията е премахната, изтриваме всички нейни изображения
        if (Array.isArray(oldSection.image)) {
          oldSection.image.forEach(img => {
            if (img && img.src && img.src.includes('firebasestorage.googleapis.com')) {
              imagesToDelete.push(img.src);
            }
          });
        } else if (oldSection.image && oldSection.image.src && 
                  oldSection.image.src.includes('firebasestorage.googleapis.com')) {
          imagesToDelete.push(oldSection.image.src);
        }
      } else {
        // Секцията съществува, проверяваме за премахнати изображения
        if (Array.isArray(oldSection.image)) {
          oldSection.image.forEach(oldImg => {
            if (!oldImg || !oldImg.src) return;
            
            // Проверка дали изображението все още съществува в новата секция
            const imageExists = Array.isArray(newSection.image) && 
              newSection.image.some(newImg => newImg && newImg.src === oldImg.src);
            
            if (oldImg.src.includes('firebasestorage.googleapis.com') && !imageExists) {
              imagesToDelete.push(oldImg.src);
            }
          });
        } else if (oldSection.image && oldSection.image.src && 
                  oldSection.image.src.includes('firebasestorage.googleapis.com')) {
          // Обработка на единично изображение
          const newSectionHasImage = newSection.image && 
            (newSection.image.src === oldSection.image.src ||
             (Array.isArray(newSection.image) && 
              newSection.image.some(img => img && img.src === oldSection.image.src)));
          
          if (!newSectionHasImage) {
            imagesToDelete.push(oldSection.image.src);
          }
        }
      }
    });
  }

  return imagesToDelete;
};

/**
 * Обновява статията с нови URL адреси на изображения след качване
 * @param {Object} article - Обект на статията за обновяване
 * @param {Object} newImageUrls - Обект с URL адреси на качени изображения
 * @returns {Object} Обновена статия с нови URL адреси на изображения
 */
export const updateArticleWithNewImages = (article, newImageUrls) => {
  const updatedArticle = { ...article };
  
  // Обновяване на основното изображение
  if (newImageUrls.mainImage && newImageUrls.mainImage.length > 0) {
    updatedArticle.mainImage.sources = [
      ...newImageUrls.mainImage,
      ...updatedArticle.mainImage.sources.filter(src => !src.includes('blob:'))
    ];
  }
  
  // Обновяване на изображенията в секциите
  if (newImageUrls.sectionImages) {
    Object.entries(newImageUrls.sectionImages).forEach(([sectionIndex, urls]) => {
      if (!urls || urls.length === 0) return;
      
      const index = parseInt(sectionIndex, 10);
      if (isNaN(index) || !updatedArticle.sections[index]) return;
      
      // Инициализиране на масива с изображения, ако е необходимо
      if (!Array.isArray(updatedArticle.sections[index].image)) {
        updatedArticle.sections[index].image = [];
      }
      
      // Намираме временните blob изображения и ги заменяме
      let blobImageCount = 0;
      updatedArticle.sections[index].image = updatedArticle.sections[index].image.map(img => {
        if (img && img.src && img.src.includes('blob:') && blobImageCount < urls.length) {
          const newImg = { 
            ...img, 
            src: urls[blobImageCount],
            isFile: false
          };
          blobImageCount++;
          return newImg;
        }
        return img;
      });
      
      // Добавяме останалите нови URL адреси
      while (blobImageCount < urls.length) {
        updatedArticle.sections[index].image.push({
          src: urls[blobImageCount],
          alt: updatedArticle.sections[index].image[0]?.alt || createEditorState(),
          caption: updatedArticle.sections[index].image[0]?.caption || createEditorState()
        });
        blobImageCount++;
      }
    });
  }
  
  return updatedArticle;
};

/**
 * Обработва всички промени в изображенията при редактиране на статия
 * @param {Object} oldArticle - Оригинална статия преди редакцията
 * @param {Object} newArticle - Обновена статия с редакции
 * @param {Object} mediaFiles - Нови медийни файлове за качване
 * @param {Function} progressCallback - Функция за обратна връзка за прогреса на качване
 * @returns {Object} Напълно обработена статия с обновени изображения
 */
export const processArticleImageChanges = async (oldArticle, newArticle, mediaFiles, progressCallback) => {
  try {
    // Стъпка 1: Намираме изображенията, които трябва да бъдат изтрити
    const imagesToDelete = findImagesToDelete(oldArticle, newArticle);
    
    // Стъпка 2: Изтриваме старите изображения
    if (imagesToDelete.length > 0) {
      const deletePromises = imagesToDelete.map(url => deleteFileFromStorage(url));
      await Promise.all(deletePromises);
      console.log(`Изтрити ${imagesToDelete.length} стари изображения`);
    }
    
    // Стъпка 3: Подготовка за нови качвания
    let totalFiles = 0;
    if (mediaFiles.mainImage && mediaFiles.mainImage.length > 0) {
      totalFiles += mediaFiles.mainImage.length;
    }
    
    Object.values(mediaFiles.sectionImages).forEach(files => {
      if (Array.isArray(files)) {
        totalFiles += files.length;
      } else if (files) {
        totalFiles += 1;
      }
    });
    
    // Ако няма нови файлове за качване, връщаме статията както е
    if (totalFiles === 0) {
      return newArticle;
    }
    
    // Стъпка 4: Качваме новите файлове
    let uploadedFiles = 0;
    const newUrls = {
      mainImage: [],
      sectionImages: {}
    };
    
    // Качваме файловете на основното изображение
    if (mediaFiles.mainImage && mediaFiles.mainImage.length > 0) {
      for (const file of mediaFiles.mainImage) {
        const compressedFile = await compressImage(file, {
          maxSizeMB: 2,
          maxWidthOrHeight: 1920
        });
        
        const url = await uploadFileWithProgress(
          compressedFile,
          'articles/images',
          (progress) => {
            if (progressCallback) {
              const totalProgress = ((uploadedFiles + progress/100) / totalFiles) * 100;
              progressCallback(totalProgress);
            }
          }
        );
        
        newUrls.mainImage.push(url);
        uploadedFiles++;
      }
    }
    
    // Качваме файловете на изображенията в секциите
    for (const [sectionIndex, files] of Object.entries(mediaFiles.sectionImages)) {
      if (!files || (Array.isArray(files) && files.length === 0)) continue;
      
      const filesArray = Array.isArray(files) ? files : [files];
      newUrls.sectionImages[sectionIndex] = [];
      
      for (const file of filesArray) {
        const compressedFile = await compressImage(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1200
        });
        
        const url = await uploadFileWithProgress(
          compressedFile,
          'articles/section-images',
          (progress) => {
            if (progressCallback) {
              const totalProgress = ((uploadedFiles + progress/100) / totalFiles) * 100;
              progressCallback(totalProgress);
            }
          }
        );
        
        newUrls.sectionImages[sectionIndex].push(url);
        uploadedFiles++;
      }
    }
    
    // Стъпка 5: Обновяваме статията с новите URL адреси
    const updatedArticle = updateArticleWithNewImages(newArticle, newUrls);
    return updatedArticle;
    
  } catch (error) {
    console.error("Грешка при обработка на промените в изображенията:", error);
    throw error;
  }
};