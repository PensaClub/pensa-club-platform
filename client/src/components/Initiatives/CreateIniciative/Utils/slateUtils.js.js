// Utils/slateUtils.js

/**
 * Извлича текстовата дължина от Slate.js редактор стойност
 * @param {Array} slateValue - Slate.js value структура
 * @returns {number} - Брой символи в текста
 */
export const getSlateTextLength = (slateValue) => {
    if (!slateValue || !Array.isArray(slateValue)) return 0;
    
    return slateValue
        .map(node => {
            if (node.children) {
                return node.children.map(child => child.text || '').join('');
            }
            return node.text || '';
        })
        .join('')
        .length;
};

/**
 * Извлича чистия текст от Slate.js редактор стойност (без форматиране)
 * @param {Array} slateValue - Slate.js value структура
 * @returns {string} - Чист текст
 */
export const getSlateText = (slateValue) => {
    if (!slateValue || !Array.isArray(slateValue)) return '';
    
    return slateValue
        .map(node => {
            if (node.children) {
                return node.children.map(child => child.text || '').join('');
            }
            return node.text || '';
        })
        .join(' ');
};

/**
 * Проверява дали Slate.js редакторът е празен
 * @param {Array} slateValue - Slate.js value структура
 * @returns {boolean} - true ако е празен
 */
export const isSlateEmpty = (slateValue) => {
    if (!slateValue || !Array.isArray(slateValue)) return true;
    
    return slateValue.every(node => {
        if (node.children) {
            return node.children.every(child => !child.text || child.text.trim() === '');
        }
        return !node.text || node.text.trim() === '';
    });
};

/**
 * Получава word count от Slate.js редактор
 * @param {Array} slateValue - Slate.js value структура
 * @returns {number} - Брой думи
 */
export const getSlateWordCount = (slateValue) => {
    const text = getSlateText(slateValue);
    if (!text.trim()) return 0;
    
    return text.trim().split(/\s+/).length;
};