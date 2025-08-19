// utils/viewedPublications.js
export const ViewedPublicationsManager = {
  STORAGE_KEY: 'viewed_publications',
  MAX_VIEWED: 3,

  // Get viewed publications from localStorage
  getViewedPublications() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading viewed publications:', error);
      return [];
    }
  },

  // Add publication to viewed list
  addViewedPublication(publication) {
    try {
      let viewedList = this.getViewedPublications();
      
      // Remove if already exists (to move to front)
      viewedList = viewedList.filter(item => item.id !== publication.id);
      
      // Add to beginning with all necessary fields for different languages
      viewedList.unshift({
        id: publication.id,
        slug: publication.slug,
        title: publication.title,
        shortDescription: publication.shortDescription,
        description: publication.description, // Fallback
        image: publication.image,
        category: publication.category,
        publishedAt: publication.publishedAt,
        createdAt: publication.createdAt, // Fallback
        readTime: publication.readTime,
        userEmail: publication.userEmail,
        author: publication.author, // For different content types
        viewedAt: new Date().toISOString()
      });
      
      // Keep only last 3
      viewedList = viewedList.slice(0, this.MAX_VIEWED);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(viewedList));
      return viewedList;
    } catch (error) {
      console.error('Error saving viewed publication:', error);
      return [];
    }
  },

  // Initialize with latest publications if empty
  initializeWithLatest(publications) {
    const existing = this.getViewedPublications();
    if (existing.length === 0 && publications.length > 0) {
      const latest = publications.slice(1, 4); // Skip first (featured), take next 3
      const viewedList = latest.map(pub => ({
        id: pub.id,
        slug: pub.slug,
        title: pub.title,
        shortDescription: pub.shortDescription,
        description: pub.description,
        image: pub.image,
        category: pub.category,
        publishedAt: pub.publishedAt,
        createdAt: pub.createdAt,
        readTime: pub.readTime,
        userEmail: pub.userEmail,
        author: pub.author,
        viewedAt: new Date().toISOString()
      }));
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(viewedList));
      return viewedList;
    }
    return existing;
  },

  // Clear viewed publications
  clearViewed() {
    localStorage.removeItem(this.STORAGE_KEY);
  },

  // Get viewed count
  getViewedCount() {
    return this.getViewedPublications().length;
  },

  // Check if publication is in viewed list
  isViewed(publicationId) {
    const viewed = this.getViewedPublications();
    return viewed.some(item => item.id === publicationId);
  }
};