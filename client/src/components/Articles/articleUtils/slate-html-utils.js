import { htmlToSlate } from '@slate-serializers/html';

// Конфигурация за вашата Slate схема
const htmlToSlateConfig = {
  elementTransforms: {
    P: (el) => ({ type: 'paragraph' }),
    H1: (el) => ({ type: 'heading-one' }),
    H2: (el) => ({ type: 'heading-two' }),
    BLOCKQUOTE: (el) => ({ type: 'block-quote' }),
    UL: (el) => ({ type: 'bulleted-list' }),
    OL: (el) => ({ type: 'numbered-list' }),
    LI: (el) => ({ type: 'list-item' }),
  },
  markTransforms: {
    STRONG: () => ({ bold: true }),
    B: () => ({ bold: true }),
    EM: () => ({ italic: true }),
    I: () => ({ italic: true }),
    U: () => ({ underline: true }),
  }
};

// Функция за конвертиране на HTML към Slate
export const convertHtmlToSlate = (html) => {
  if (!html || typeof html !== 'string') {
    return [{ type: 'paragraph', children: [{ text: '' }] }];
  }

  try {
    const slateValue = htmlToSlate(html, htmlToSlateConfig);
    
    // Проверяваме дали резултатът е валиден
    if (!Array.isArray(slateValue) || slateValue.length === 0) {
      return [{ type: 'paragraph', children: [{ text: '' }] }];
    }

    return slateValue;
  } catch (error) {
    console.error('Грешка при конвертиране на HTML към Slate:', error);
    // Fallback - извличаме само текста
    const textContent = html.replace(/<[^>]*>/g, '');
    return textContent.trim() 
      ? [{ type: 'paragraph', children: [{ text: textContent }] }]
      : [{ type: 'paragraph', children: [{ text: '' }] }];
  }
};