//Функцийка за изрязване на текстчето
 export const truncateText = (text, maxLength = 60) => {
  return text && text.length > maxLength 
    ? text.substring(0, maxLength) + ' ...' 
    : text;
};