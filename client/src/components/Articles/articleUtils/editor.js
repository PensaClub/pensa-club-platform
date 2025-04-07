import { EditorState, ContentState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';

// Създаване на EditorState от HTML
export const createEditorState = (html = '') => {
  if (html) {
    const contentBlock = htmlToDraft(html);
    if (contentBlock) {
      const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
      return EditorState.createWithContent(contentState);
    }
  }
  return EditorState.createEmpty();
};

// Конвертиране на EditorState в HTML
export const convertEditorToHtml = (editorState) => {
  if (!editorState) return '';
  return draftToHtml(convertToRaw(editorState.getCurrentContent()));
};

// Проверка дали EditorState е празен
export const isEditorEmpty = (editorState) => {
  if (!editorState) return true;
  const content = editorState.getCurrentContent();
  return !content.hasText();
};