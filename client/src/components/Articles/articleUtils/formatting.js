// Генериране на slug от заглавие
export const generateSlug = (title) => {
    if (!title) return "";
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Премахване на специални символи
      .replace(/\s+/g, '-')     // Заменяне на интервали с тирета
      .replace(/-+/g, '-');     // Премахване на повтарящи се тирета
  };