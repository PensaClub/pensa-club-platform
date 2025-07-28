// utils/initiativeEditorUtils.js
import { createEditor, Element as SlateElement, Transforms, Editor } from 'slate';
import { withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import { EditorState, ContentState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';

// 🎯 SLATE.JS УТИЛИТИ (за сложни полета)

// Създаване на Slate редактор
export const createSlateEditor = () => {
  return withHistory(withReact(createEditor()));
};

// Начална стойност за Slate
export const createSlateEditorState = (html = '') => {
  // За сега връщаме базова структура, може да добавим HTML парсинг по-късно
  return [
    {
      type: 'paragraph',
      children: [{ text: '' }], // Премахваме HTML таговете за сега
    },
  ];

};

// Конвертиране на Slate в HTML

// да се върна ако дава грещка при инциативите 
// export const convertSlateToHtml = (value) => {
//   if (!value || !Array.isArray(value)) return '';

//   return value
//     .map(node => {
//       if (node.type === 'paragraph') {
//         const text = node.children.map(child => {
//           let content = child.text || '';
//           if (child.bold) content = `<strong>${content}</strong>`;
//           if (child.italic) content = `<em>${content}</em>`;
//           if (child.underline) content = `<u>${content}</u>`;
//           return content;
//         }).join('');
//         return `<p>${text}</p>`;
//       }
//       if (node.type === 'heading-one') {
//         return `<h1>${node.children.map(child => child.text).join('')}</h1>`;
//       }
//       if (node.type === 'heading-two') {
//         return `<h2>${node.children.map(child => child.text).join('')}</h2>`;
//       }
//       if (node.type === 'bulleted-list') {
//         const items = node.children.map(item => 
//           `<li>${item.children.map(child => child.text).join('')}</li>`
//         ).join('');
//         return `<ul>${items}</ul>`;
//       }
//       if (node.type === 'numbered-list') {
//         const items = node.children.map(item => 
//           `<li>${item.children.map(child => child.text).join('')}</li>`
//         ).join('');
//         return `<ol>${items}</ol>`;
//       }
//       // ДОБАВЯМЕ ОБРАБОТКА НА BLOCKQUOTE
//       if (node.type === 'block-quote') {
//         const text = node.children.map(child => {
//           if (child.children) {
//             return child.children.map(c => {
//               let content = c.text || '';
//               if (c.bold) content = `<strong>${content}</strong>`;
//               if (c.italic) content = `<em>${content}</em>`;
//               if (c.underline) content = `<u>${content}</u>`;
//               return content;
//             }).join('');
//           }
//           return child.text || '';
//         }).join('');
//         return `<blockquote>${text}</blockquote>`;
//       }
//       return `<p>${node.children?.map(child => child.text).join('') || ''}</p>`;
//     })
//     .join('');
// };

// Проверка дали Slate редакторът е празен

// Конвертиране на Slate в HTML
export const convertSlateToHtml = (value) => {
  if (!value || !Array.isArray(value)) return '';

  const serialize = (node) => {
    // 🔧 БЕЗОПАСНИ ПРОВЕРКИ
    if (!node || typeof node !== 'object') return '';

    // Handle text nodes (leaf nodes)
    if (node.hasOwnProperty('text')) {
      let content = node.text || '';
      if (node.bold) content = `<strong>${content}</strong>`;
      if (node.italic) content = `<em>${content}</em>`;
      if (node.underline) content = `<u>${content}</u>`;
      return content;
    }

    // Handle element nodes
    if (!node.type) {
      // Fallback за стари структури без type
      if (node.children && Array.isArray(node.children)) {
        return node.children.map(child => serialize(child)).join('');
      }
      return '';
    }

    // 🔧 БЕЗОПАСНА обработка на children
    let children = '';
    if (node.children && Array.isArray(node.children)) {
      children = node.children.map(child => serialize(child)).join('');
    }

    switch (node.type) {
      case 'paragraph':
        return `<p>${children}</p>`;
      case 'heading-one':
        return `<h1>${children}</h1>`;
      case 'heading-two':
        return `<h2>${children}</h2>`;
      case 'bulleted-list':
        return `<ul>${children}</ul>`;
      case 'numbered-list':
        return `<ol>${children}</ol>`;
      case 'list-item':
        return `<li>${children}</li>`;
      case 'block-quote':
        return `<blockquote>${children}</blockquote>`;
      // В serialize функцията добави:
      case 'link':
        return `<a href="${node.url}" target="_blank" rel="noopener noreferrer">${children}</a>`;
      default:
        return `<p>${children}</p>`;
    }
  };

  try {
    return value.map(node => serialize(node)).join('');
  } catch (error) {
    console.error('Грешка при конвертиране на Slate в HTML:', error);
    // 🔧 FALLBACK към старата логика ако новата не работи
    return value
      .map(node => {
        if (!node || typeof node !== 'object') return '';

        if (node.type === 'paragraph') {
          const children = node.children && Array.isArray(node.children) ? node.children : [];
          const text = children.map(child => {
            if (!child) return '';
            let content = child.text || '';
            if (child.bold) content = `<strong>${content}</strong>`;
            if (child.italic) content = `<em>${content}</em>`;
            if (child.underline) content = `<u>${content}</u>`;
            return content;
          }).join('');
          return `<p>${text}</p>`;
        }

        // Добавяме всички останали типове...
        const children = node.children && Array.isArray(node.children) ? node.children : [];
        const text = children.map(child => child ? (child.text || '') : '').join('');
        return `<p>${text}</p>`;
      })
      .join('');
  }
};
export const isSlateEmpty = (value) => {
  if (!value || !Array.isArray(value)) return true;

  return value.every(node => {
    // Text node - проверяваме дали има текст
    if ('text' in node) {
      return !node.text || node.text.trim() === '';
    }

    // Element node с type - ако има type, не е празен
    if (node.type) {
      return false;
    }

    // Стария код за children
    if (!node.children || node.children.length === 0) return true;
    return node.children.every(child => !child.text || child.text.trim() === '');
  });
};

// Валидация на Slate съдържание
export const validateSlateContent = (value) => {
  return !isSlateEmpty(value);
};

// 📝 DRAFT.JS УТИЛИТИ (за прости полета - ALT текстове, кратки описания)

// Създаване на Draft EditorState от HTML
export const createDraftEditorState = (html = '') => {
  if (html) {
    const contentBlock = htmlToDraft(html);
    if (contentBlock) {
      const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
      return EditorState.createWithContent(contentState);
    }
  }
  return EditorState.createEmpty();
};

// Конвертиране на Draft EditorState в HTML
export const convertDraftToHtml = (editorState) => {
  if (!editorState) return '';
  return draftToHtml(convertToRaw(editorState.getCurrentContent()));
};

// Проверка дали Draft редакторът е празен
export const isDraftEmpty = (editorState) => {
  if (!editorState) return true;
  const content = editorState.getCurrentContent();
  return !content.hasText();
};

// Валидация на Draft съдържание
export const validateDraftContent = (editorState) => {
  return !isDraftEmpty(editorState);
};

// Получаване на plain text от Draft
export const getDraftPlainText = (editorState) => {
  if (!editorState) return '';
  const content = editorState.getCurrentContent();
  return content.getPlainText();
};

// 🎨 SLATE.JS TOOLBAR CONFIGURATION

export const slateToolbarOptions = {
  // Основни форматиращи опции
  marks: ['bold', 'italic', 'underline', 'strikethrough'],

  // Блокови елементи
  blocks: [
    'paragraph',
    'heading-one',
    'heading-two',
    'heading-three',
    'bulleted-list',
    'numbered-list',
    'blockquote'
  ],

  // Допълнителни функции
  features: ['link', 'image', 'divider', 'undo', 'redo']
};

// 📝 DRAFT.JS TOOLBAR CONFIGURATION (минимален за ALT текстове)

export const draftMinimalToolbarOptions = {
  options: ['inline', 'link'],
  inline: {
    options: ['bold', 'italic', 'underline'],
    className: 'draft-toolbar-inline-minimal',
  },
  link: {
    inDropdown: false,
    showOpenOptionOnHover: true,
  },
};

// 🔄 КОНВЕРТИРАЩИ ФУНКЦИИ

// Конвертиране от Draft към Slate (ако е необходимо)
export const convertDraftToSlate = (editorState) => {
  const html = convertDraftToHtml(editorState);
  return createSlateEditorState(html);
};

// Конвертиране от Slate към Draft (ако е необходимо)
export const convertSlateTodraft = (slateValue) => {
  const html = convertSlateToHtml(slateValue);
  return createDraftEditorState(html);
};

// 🎯 ПОЛЕТА ЗА РАЗЛИЧНИТЕ РЕДАКТОРИ

// Полета, които използват Slate.js (сложни)
export const SLATE_FIELDS = [
  'detailedDescription',
  'expectedResults',
  'progressReport',
  'sections[].content' // За секциите
];

// Полета, които използват Draft.js (прости)
export const DRAFT_FIELDS = [
  'mainImage.alt',
  'gallery[].alt',
  'gallery[].caption',
  'sections[].image[].alt',
  'sections[].image[].caption'
];

// Функция за определяне какъв редактор да се използва
export const getEditorType = (fieldName) => {
  // Проверка за Slate полета
  if (SLATE_FIELDS.includes(fieldName)) {
    return 'slate';
  }

  // Проверка за Draft полета
  if (DRAFT_FIELDS.includes(fieldName)) {
    return 'draft';
  }

  // Проверка с regex за масиви
  if (fieldName.includes('sections[') && fieldName.includes('].content')) {
    return 'slate';
  }

  if (fieldName.includes('.alt') || fieldName.includes('.caption')) {
    return 'draft';
  }

  // По подразбиране за сложни полета използваме Slate
  if (fieldName.includes('Description') || fieldName.includes('Results') || fieldName.includes('Report')) {
    return 'slate';
  }

  // По подразбиране за прости полета използваме Draft
  return 'draft';
};

// 🔧 ПОМОЩНИ ФУНКЦИИ

// Създаване на правилния тип редактор според полето
export const createEditorForField = (fieldName, initialValue = '') => {
  const editorType = getEditorType(fieldName);

  if (editorType === 'slate') {
    return createSlateEditorState(initialValue);
  } else {
    return createDraftEditorState(initialValue);
  }
};

// Валидация според типа редактор
export const validateEditorField = (fieldName, value) => {
  const editorType = getEditorType(fieldName);

  if (editorType === 'slate') {
    return validateSlateContent(value);
  } else {
    return validateDraftContent(value);
  }
};

// Конвертиране в HTML според типа редактор
export const convertEditorToHtml = (fieldName, value) => {
  const editorType = getEditorType(fieldName);

  if (editorType === 'slate') {
    return convertSlateToHtml(value);
  } else {
    return convertDraftToHtml(value);
  }
};
