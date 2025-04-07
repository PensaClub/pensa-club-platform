import { convertEditorToHtml } from './editor';

// Подготовка на стойностите за изпращане с конвертиране на EditorState
export const prepareArticleValuesForSubmit = (values) => {
  const prepared = { ...values };
  
  // Конвертиране на summary
  prepared.summary = convertEditorToHtml(values.summary);
  
  // Конвертиране на mainImage.alt
  prepared.mainImage = {
    ...values.mainImage,
    alt: convertEditorToHtml(values.mainImage.alt)
  };
  
  // Конвертиране на съдържанието на секциите
  prepared.sections = values.sections.map(section => {
    const updatedSection = { ...section };
    
    if (section.content) {
      updatedSection.content = convertEditorToHtml(section.content);
    }
    
    if (section.image && section.image.alt && typeof section.image.alt !== 'string') {
      updatedSection.image = {
        ...section.image,
        alt: convertEditorToHtml(section.image.alt)
      };
    }
    
    if (section.image && section.image.caption && typeof section.image.caption !== 'string') {
      updatedSection.image = {
        ...updatedSection.image,
        caption: convertEditorToHtml(section.image.caption)
      };
    }
    
    return updatedSection;
  });
  
  return prepared;
};