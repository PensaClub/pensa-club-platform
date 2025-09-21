// viewedStories.js - Local storage management for viewed stories
class ViewedStoriesManager {
  constructor() {
    this.storageKey = 'viewedStories';
    this.maxStories = 20; // Maximum number of stories to keep in history
  }

  // Get all viewed stories from localStorage
  getViewedStories() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading viewed stories from localStorage:', error);
      return [];
    }
  }

  // Add a story to viewed stories
  addViewedStory(story) {
    try {
      const viewedStories = this.getViewedStories();

      // Remove if already exists (to move to front)
      const filteredStories = viewedStories.filter(s => s.id !== story.id);

      // Add to beginning
      const updatedStories = [story, ...filteredStories];

      // Keep only the most recent stories
      const trimmedStories = updatedStories.slice(0, this.maxStories);

      localStorage.setItem(this.storageKey, JSON.stringify(trimmedStories));
      return trimmedStories;
    } catch (error) {
      console.error('Error saving viewed story to localStorage:', error);
      return [];
    }
  }

  // Check if a story has been viewed
  hasViewedStory(storyId) {
    const viewedStories = this.getViewedStories();
    return viewedStories.some(story => story.id === storyId);
  }

  // Get viewed story by ID
  getViewedStory(storyId) {
    const viewedStories = this.getViewedStories();
    return viewedStories.find(story => story.id === storyId);
  }

  // Remove a specific story from viewed stories
  removeViewedStory(storyId) {
    try {
      const viewedStories = this.getViewedStories();
      const filteredStories = viewedStories.filter(story => story.id !== storyId);
      localStorage.setItem(this.storageKey, JSON.stringify(filteredStories));
      return filteredStories;
    } catch (error) {
      console.error('Error removing viewed story from localStorage:', error);
      return [];
    }
  }

  // Clear all viewed stories
  clearViewedStories() {
    try {
      localStorage.removeItem(this.storageKey);
      return [];
    } catch (error) {
      console.error('Error clearing viewed stories from localStorage:', error);
      return [];
    }
  }

  // Get count of viewed stories
  getViewedStoriesCount() {
    return this.getViewedStories().length;
  }

  // Get recently viewed stories (last N stories)
  getRecentlyViewedStories(count = 5) {
    const viewedStories = this.getViewedStories();
    return viewedStories.slice(0, count);
  }

  // Update story data if it exists in viewed stories
  updateViewedStory(storyId, updatedData) {
    try {
      const viewedStories = this.getViewedStories();
      const storyIndex = viewedStories.findIndex(story => story.id === storyId);

      if (storyIndex !== -1) {
        viewedStories[storyIndex] = { ...viewedStories[storyIndex], ...updatedData };
        localStorage.setItem(this.storageKey, JSON.stringify(viewedStories));
        return viewedStories;
      }

      return viewedStories;
    } catch (error) {
      console.error('Error updating viewed story in localStorage:', error);
      return [];
    }
  }

  // Get stories by category
  getViewedStoriesByCategory(category) {
    const viewedStories = this.getViewedStories();
    return viewedStories.filter(story => story.category === category);
  }

  // Get stories by author
  getViewedStoriesByAuthor(author) {
    const viewedStories = this.getViewedStories();
    return viewedStories.filter(story =>
      story.author === author || story.authorEmail === author
    );
  }

  // Export viewed stories data
  exportViewedStories() {
    const viewedStories = this.getViewedStories();
    const dataStr = JSON.stringify(viewedStories, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'viewed-stories.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Import viewed stories data
  importViewedStories(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedStories = JSON.parse(e.target.result);
          if (Array.isArray(importedStories)) {
            localStorage.setItem(this.storageKey, JSON.stringify(importedStories));
            resolve(importedStories);
          } else {
            reject(new Error('Invalid file format'));
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsText(file);
    });
  }
}

// Create and export a singleton instance
const viewedStoriesManager = new ViewedStoriesManager();
export { viewedStoriesManager as ViewedStoriesManager };
export default viewedStoriesManager;
