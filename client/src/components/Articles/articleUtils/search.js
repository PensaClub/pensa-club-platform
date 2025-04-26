export const filterArticles = (articles, searchTerm) => {
    if (!searchTerm.trim()) return [];
    
    const searchLower = searchTerm.toLowerCase();
    return articles.filter(article => 
      article.title.toLowerCase().includes(searchLower) ||
      (article.summary && (typeof article.summary === 'string' 
        ? article.summary.toLowerCase().includes(searchLower)
        : article.summary.getCurrentContent?.().getPlainText?.().toLowerCase().includes(searchLower))) ||
      (article.tags && article.tags.some(tag => tag.toLowerCase().includes(searchLower)))
    );
  };