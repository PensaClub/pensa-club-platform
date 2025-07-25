// Оставете импорта в началото:

import { convertSlateToHtml } from "../../Initiatives/CreateIniciative/Utils/initiativeEditorUtils";

// Локална функция за създаване на Slate editor state
const createSlateEditorState = () => {
  return [
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ];
};

// ПРЕМАХНЕТЕ локалната функция convertSlateToHtml (защото я имаме в импорта)

// Универсална функция за проверка дали редакторът е празен
export const isEditorEmpty = (editorState) => {
  if (!editorState) return true;
  
  // Ако е DraftJS (има getCurrentContent метод)
  if (editorState && typeof editorState === 'object' && editorState.getCurrentContent) {
    const contentState = editorState.getCurrentContent();
    return !contentState.hasText() || contentState.getPlainText().trim() === '';
  }
  
  // Ако е Slate.js (масив от възли)
  if (Array.isArray(editorState)) {
    if (editorState.length === 0) return true;
    
    // Проверяваме дали има текстово съдържание
    const hasText = editorState.some(node => {
      if (!node || !node.children) return false;
      
      return node.children.some(child => {
        if (typeof child === 'string') return child.trim() !== '';
        if (child && child.text) return child.text.trim() !== '';
        return false;
      });
    });
    
    return !hasText;
  }
  
  // Ако е друг тип обект (напр. стар формат)
  if (typeof editorState === 'object') {
    // Ако има children property (Slate формат)
    if (editorState.children) {
      return isEditorEmpty(editorState.children);
    }
    
    // Ако е string wrapper
    if (editorState.text !== undefined) {
      return !editorState.text || editorState.text.trim() === '';
    }
  }
  
  // Ако е string
  if (typeof editorState === 'string') {
    return editorState.trim() === '';
  }
  
  // По подразбиране - празен
  return true;
};

// Функция за извличане на plain text от Slate.js editor state
export const getSlateText = (slateValue) => {
  if (!Array.isArray(slateValue)) return '';
  
  const extractText = (node) => {
    if (typeof node === 'string') return node;
    if (!node || !node.children) return '';
    
    return node.children.map(child => {
      if (typeof child === 'string') return child;
      if (child && child.text) return child.text;
      if (child && child.children) return extractText(child);
      return '';
    }).join('');
  };
  
  return slateValue.map(extractText).join('\n').trim();
};

export const prepareArticleValuesForSubmit = (values) => {
  const prepared = { ...values };
  
  // Конвертиране на summary (използваме импортираната функция)
  prepared.summary = convertSlateToHtml(values.summary);
  
  // Конвертиране на mainImage.alt
  prepared.mainImage = {
    ...values.mainImage,
    alt: convertSlateToHtml(values.mainImage.alt)
  };
  
  // Конвертиране на секциите
  prepared.sections = values.sections.map(section => {
    const updatedSection = { ...section };
    
    // Конвертиране на съдържанието
    if (section.content) {
      updatedSection.content = convertSlateToHtml(section.content);
    }
    
    // Обработка на изображенията в масив
    if (section.image) {
      if (Array.isArray(section.image) && section.image.length > 0) {
        // Конвертираме всички изображения в масива
        updatedSection.image = section.image.map(img => {
          if (!img || !img.src) return null;
          
          return {
            src: img.src,
            alt: img.alt ? convertSlateToHtml(img.alt) : '',
            caption: img.caption ? convertSlateToHtml(img.caption) : ''
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
          alt: convertSlateToHtml(section.image.alt),
          caption: section.image.caption ? convertSlateToHtml(section.image.caption) : ''
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
    content: createSlateEditorState(),
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