// src/utils/slateToHtml.js

// Конвертира Slate node към HTML string
export const slateToHtml = (nodes) => {
  if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
    return '';
  }

  return nodes.map(node => serializeNode(node)).join('');
};

// Конвертира един Slate node
const serializeNode = (node) => {
  if (!node) return '';

  // Text node - применяваме marks (bold, italic, underline)
  if ('text' in node) {
    let text = escapeHtml(node.text);
    
    if (node.bold) text = `<strong>${text}</strong>`;
    if (node.italic) text = `<em>${text}</em>`;
    if (node.underline) text = `<u>${text}</u>`;
    
    return text;
  }

  // Element node - обработваме различните типове
  const children = node.children?.map(child => serializeNode(child)).join('') || '';

  switch (node.type) {
    case 'paragraph':
      return `<p>${children}</p>`;
    
    case 'heading-one':
      return `<h1>${children}</h1>`;
    
    case 'heading-two':
      return `<h2>${children}</h2>`;
    
    case 'heading-three':
      return `<h3>${children}</h3>`;
    
    case 'block-quote':
      return `<blockquote>${children}</blockquote>`;
    
    case 'bulleted-list':
      return `<ul>${children}</ul>`;
    
    case 'numbered-list':
      return `<ol>${children}</ol>`;
    
    case 'list-item':
      return `<li>${children}</li>`;
    
    default:
      return children;
  }
};

// Escape HTML entities
const escapeHtml = (text) => {
  if (typeof text !== 'string') return '';
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

// Проверява дали Slate съдържанието е празно
export const isSlateEmpty = (nodes) => {
  if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
    return true;
  }

  return nodes.every(node => {
    if ('text' in node) {
      return !node.text || node.text.trim() === '';
    }
    
    if (node.children) {
      return isSlateEmpty(node.children);
    }
    
    return true;
  });
};