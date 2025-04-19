/**
 * Обновява алтернативния текст на изображение в секция
 * @param {Array} sections - Масив със секции
 * @param {Number} sectionIndex - Индекс на секцията
 * @param {Number} imageIndex - Индекс на изображението
 * @param {Object|String} altText - Нов алтернативен текст или EditorState
 * @returns {Array} - Обновен масив със секции
 */

import { createEditorState } from "./editor";

/**
 * Обновява алтернативния текст на изображение в секция
 * @param {Array} sections - Масив със секции
 * @param {Number} sectionIndex - Индекс на секцията
 * @param {Number} imageIndex - Индекс на изображението
 * @param {Object|String} altText - Нов алтернативен текст или EditorState
 * @returns {Array} - Обновен масив със секции
 */
export const updateSectionImageAlt = (sections, sectionIndex, imageIndex, altText) => {
    const updatedSections = [...sections];
    
    // Проверяваме дали секцията и изображението съществуват
    if (!updatedSections[sectionIndex] || 
        !Array.isArray(updatedSections[sectionIndex].image) ||
        !updatedSections[sectionIndex].image[imageIndex]) {
      return sections;
    }
    
    // Обновяваме alt текста
    const updatedImages = [...updatedSections[sectionIndex].image];
    
    // Ако altText е стринг, създаваме нов EditorState от него
    const newAlt = typeof altText === 'string' 
      ? createEditorState(altText)
      : altText;
    
    updatedImages[imageIndex] = {
      ...updatedImages[imageIndex],
      alt: newAlt
    };
    
    updatedSections[sectionIndex].image = updatedImages;
    
    return updatedSections;
  };

  /**
 * Обновява информацията за изображение (alt и caption) в секция
 * @param {Array} sections - Масив със секции
 * @param {Number} sectionIndex - Индекс на секцията
 * @param {Number} imageIndex - Индекс на изображението
 * @param {Object} altText - Нов алтернативен текст като EditorState
 * @param {Object} captionText - Ново описание като EditorState
 * @returns {Array} - Обновен масив със секции
 */
export const updateSectionImageInfo = (sections, sectionIndex, imageIndex, altText, captionText) => {
    const updatedSections = [...sections];
    
    // Проверяваме дали секцията и изображението съществуват
    if (!updatedSections[sectionIndex] || 
        !Array.isArray(updatedSections[sectionIndex].image) ||
        !updatedSections[sectionIndex].image[imageIndex]) {
      return sections;
    }
    
    // Създаваме ново копие на масива с изображения
    const updatedImages = [...updatedSections[sectionIndex].image];
    
    // Създаваме ново копие на обекта на изображението
    updatedImages[imageIndex] = {
      ...updatedImages[imageIndex],
      alt: altText,
      caption: captionText
    };
    
    // Обновяваме секцията
    updatedSections[sectionIndex] = {
      ...updatedSections[sectionIndex],
      image: updatedImages
    };
    
    return updatedSections;
  };