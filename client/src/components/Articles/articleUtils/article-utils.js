import { convertEditorToHtml, createEditorState } from './editor';

export const prepareArticleValuesForSubmit = (values) => {
  const prepared = { ...values };
  
  // Конвертиране на summary
  prepared.summary = convertEditorToHtml(values.summary);
  
  // Конвертиране на mainImage.alt
  prepared.mainImage = {
    ...values.mainImage,
    alt: convertEditorToHtml(values.mainImage.alt)
  };
  
  // Конвертиране на секциите
  prepared.sections = values.sections.map(section => {
    const updatedSection = { ...section };
    
    // Конвертиране на съдържанието
    if (section.content) {
      updatedSection.content = convertEditorToHtml(section.content);
    }
    
    // Обработка на изображенията в масив
    if (section.image) {
      if (Array.isArray(section.image) && section.image.length > 0) {
        // Конвертираме всички изображения в масива
        updatedSection.image = section.image.map(img => {
          if (!img || !img.src) return null;
          
          return {
            src: img.src,
            alt: img.alt ? convertEditorToHtml(img.alt) : '',
            caption: img.caption ? convertEditorToHtml(img.caption) : ''
          };
        }).filter(img => img !== null);
        
        // Ако няма изображения след филтрирането, задаваме image на null
        if (updatedSection.image.length === 0) {
          updatedSection.image = null;
        }
      } else if (!Array.isArray(section.image) && section.image.src) {
        // Ако image е обект (не масив), но има src, обработваме го
        updatedSection.image = {
          src: section.image.src,
          alt: convertEditorToHtml(section.image.alt),
          caption: section.image.caption ? convertEditorToHtml(section.image.caption) : ''
        };
      } else {
        // Ако няма valid image, задаваме го на null
        updatedSection.image = null;
      }
    } else {
      updatedSection.image = null;
    }
    
    // Премахваме полетата, които не са нужни при изпращане
    if (updatedSection.images) delete updatedSection.images;
    
    return updatedSection;
  });
  
  return prepared;
};
// Функция за рендериране на HTML съдържание
export const renderHtml = (content) => {
  if (!content) return null;
  return <div dangerouslySetInnerHTML={{ __html: content }} />;
};
export const createEmptySection = (orderNumber) => {
  return {
    title: "",
    content: createEditorState(),
    image: [],
    order: orderNumber
  };
};
export const addSectionToArray = (sections) => {
  const newOrder = sections.length + 1;
  return [...sections, createEmptySection(newOrder)];
};
export const removeSectionByIndex = (sections, indexToRemove) => {
  // Ако е последната секция, връщаме оригиналния масив
  if (sections.length <= 1) return sections;
  
  const updatedSections = [...sections];
  updatedSections.splice(indexToRemove, 1);
  
  // Преномериране на секциите
  return updatedSections.map((section, idx) => ({
    ...section,
    order: idx + 1
  }));
};

/**
 * Размяна на медийни файлове между две секции
 * @param {Object} sectionImages - Обект със секционни изображения
 * @param {Number} index1 - Индекс на първата секция
 * @param {Number} index2 - Индекс на втората секция
 * @returns {Object} - Обновен обект със секционни изображения
 */
export const swapSectionMediaFiles = (sectionImages, index1, index2) => {
  const newSectionImages = { ...sectionImages };
  
  const temp1 = newSectionImages[index1];
  const temp2 = newSectionImages[index2];
  
  newSectionImages[index1] = temp2;
  newSectionImages[index2] = temp1;
  
  return newSectionImages;
};
