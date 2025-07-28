
const bulgarianToLatin = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ж': 'zh', 'з': 'z',
  'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p',
  'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch',
  'ш': 'sh', 'щ': 'sht', 'ъ': 'a', 'ь': 'y', 'ю': 'yu', 'я': 'ya',
  'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ж': 'Zh', 'З': 'Z',
  'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P',
  'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch',
  'Ш': 'Sh', 'Щ': 'Sht', 'Ъ': 'A', 'Ь': 'Y', 'Ю': 'Yu', 'Я': 'Ya'
};

export const transliterate = (text) => {
  if (!text) return '';
  
  return text
    .split('')
    .map(char => bulgarianToLatin[char] || char)
    .join('');
};

export const generateSlug = (text) => {
  if (!text) return '';

  return transliterate(text)
    .toLowerCase()                         
    .trim()                              
    .replace(/\s+/g, '-')                  // Заменяме един или повече интервали с тире
    .replace(/[^\w\-]+/g, '')              // Премахвам всички специални символи освен букви, цифри и тире
    .replace(/\-\-+/g, '-')                // Заменям множествени тирета с едно
    .replace(/^-+/, '')                    // Премахваме тирета от началото
    .replace(/-+$/, '');                   // Премахваме тирета от края
};

// Функция за валидация на slug
export const isValidSlug = (slug) => {
  if (!slug) return false;

  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};

// Функция за почистване на slug (ако потребителят въведе нещо невалидно)
export const sanitizeSlug = (slug) => {
  if (!slug) return '';
  
  return slug
    .toLowerCase()
    .replace(/[^\w\-]+/g, '')              // Премахвам невалидни символи
    .replace(/\-\-+/g, '-')                // Заменям множествени тирета
    .replace(/^-+/, '')                    // Премахвам тирета от началото
    .replace(/-+$/, '');                   // Премахвам тирета от края
};