
/**
 * Изчиства HTML тагове и форматиране от текст
 * @param {string} text - Текст за изчистване
 * @returns {string} - Чист текст без форматиране
 */
export const stripHtmlTags = (text) => {
    if (!text) return '';
    
    // Създаваме временен DOM елемент
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    
    // Взимаме само текстовото съдържание
    return tempDiv.textContent || tempDiv.innerText || '';
};

/**
 * Изчиства множествени интервали и нови редове
 * @param {string} text - Текст за изчистване
 * @returns {string} - Нормализиран текст
 */
export const normalizeWhitespace = (text) => {
    if (!text) return '';
    
    return text
        .replace(/\s+/g, ' ') // Заменя множествени интервали с един
        .replace(/\n\s*\n/g, '\n') // Заменя множествени нови редове
        .trim();
};

/**
 * Пълно изчистване на текст от форматиране
 * @param {string} text - Текст за изчистване
 * @returns {string} - Напълно чист текст
 */
export const cleanPastedText = (text) => {
    if (!text) return '';
    
    let cleanText = stripHtmlTags(text);
    cleanText = normalizeWhitespace(cleanText);
    
    // Премахваме специални символи които идват от copy/paste
    cleanText = cleanText
        .replace(/[\u200B-\u200D\uFEFF]/g, '') // Zero-width chars
        .replace(/[\u2018\u2019]/g, "'") // Smart quotes
        .replace(/[\u201C\u201D]/g, '"') // Smart quotes
        .replace(/[\u2013\u2014]/g, '-') // Em/En dashes
        .replace(/\u00A0/g, ' '); // Non-breaking spaces
    
    return cleanText;
};

/**
 * Handler за paste event във обикновени input/textarea полета
 * @param {Event} e - Paste event
 * @param {Function} setValue - Функция за обновяване на стойността
 * @param {string} currentValue - Текущата стойност на полето
 * @param {number} maxLength - Максимална дължина (опционално)
 */
export const handleCleanPaste = (e, setValue, currentValue = '', maxLength = null) => {
    e.preventDefault();
    
    // Взимаме текста от clipboard-а
    const pastedText = (e.clipboardData || window.clipboardData).getData('text');
    
    if (!pastedText) return;
    
    // Изчистваме текста
    const cleanText = cleanPastedText(pastedText);
    
    // Получаваме позицията на курсора
    const input = e.target;
    const selectionStart = input.selectionStart;
    const selectionEnd = input.selectionEnd;
    
    // Вмъкваме изчистения текст
    const newValue = currentValue.substring(0, selectionStart) + 
                    cleanText + 
                    currentValue.substring(selectionEnd);
    
    // Проверяваме максималната дължина
    const finalValue = maxLength ? newValue.substring(0, maxLength) : newValue;
    
    setValue(finalValue);
    
    // Поставяме курсора след вмъкнатия текст
    setTimeout(() => {
        const newCursorPosition = selectionStart + cleanText.length;
        input.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);
};