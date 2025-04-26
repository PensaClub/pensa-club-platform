/**
 * Добавя нов таг към масива с тагове, ако не съществува вече
 * @param {Array} existingTags - Масив със съществуващи тагове
 * @param {String} newTag - Новият таг, който искаме да добавим
 * @returns {Array} - Обновеният масив с тагове
 */
export const addTagToArray = (existingTags, newTag) => {
    if (!newTag || existingTags.includes(newTag)) return existingTags;
    return [...existingTags, newTag];
  };
  
  /**
   * Премахва таг от масива с тагове по индекс
   * @param {Array} existingTags - Масив със съществуващи тагове
   * @param {Number} indexToRemove - Индексът на тага, който искаме да премахнем
   * @returns {Array} - Обновеният масив с тагове
   */
  export const removeTagByIndex = (existingTags, indexToRemove) => {
    const updatedTags = [...existingTags];
    updatedTags.splice(indexToRemove, 1);
    return updatedTags;
  };