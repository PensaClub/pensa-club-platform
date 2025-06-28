// utils/draftLocalStorage.js
export const DRAFT_STORAGE_KEY = 'initiative_draft';
export const DRAFT_TIMESTAMP_KEY = 'initiative_draft_timestamp';

export const draftLocalStorage = {
  // Вземаме draft от localStorage
  getDraft: () => {
    try {
      const draftData = localStorage.getItem(DRAFT_STORAGE_KEY);
      const timestamp = localStorage.getItem(DRAFT_TIMESTAMP_KEY);
      
      if (draftData) {
        return {
          data: JSON.parse(draftData),
          timestamp: timestamp ? new Date(timestamp) : null
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting draft from localStorage:', error);
      return null;
    }
  },

  // Запазваме draft в localStorage
  saveDraft: (draftData) => {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
      localStorage.setItem(DRAFT_TIMESTAMP_KEY, new Date().toISOString());
      return true;
    } catch (error) {
      console.error('Error saving draft to localStorage:', error);
      return false;
    }
  },

  // Изтриваме draft от localStorage
  clearDraft: () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      localStorage.removeItem(DRAFT_TIMESTAMP_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing draft from localStorage:', error);
      return false;
    }
  },

  // Проверяваме дали draft-а в localStorage съвпада с даден slug/id
  isDraftMatching: (identifier) => {
    const draft = draftLocalStorage.getDraft();
    if (!draft) return false;
    
    const draftData = draft.data;
    return draftData.slug === identifier || 
           draftData.id === identifier ||
           draftData.id?.toString() === identifier?.toString();
  }
};