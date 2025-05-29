import { useState, useEffect } from 'react';
import './initiativesList.css';
import { useTranslation } from 'react-i18next';
import { InitiativeCard } from './InitiativeCard/InitiativeCard';
import mockData from '../data/mockInitiatives.json';
import { InitiativesSearch } from '../InitiativesSearch/InitiativesSearch';

export const InitiativesList = () => {
  const { t } = useTranslation();
  const [initiatives, setInitiatives] = useState([]);
  const [filteredInitiatives, setFilteredInitiatives] = useState([]);
  const [bookmarkedInitiatives, setBookmarkedInitiatives] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInitiatives = async () => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setInitiatives(mockData.initiatives);
      setFilteredInitiatives(mockData.initiatives);
    } catch (error) {
      console.error('Грешка при зареждане на инициативи:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Зареждане на bookmarks от localStorage
  useEffect(() => {
    const saved = localStorage.getItem('bookmarkedInitiatives');
    if (saved) {
      setBookmarkedInitiatives(JSON.parse(saved));
    }
  }, []);

  // Запазване на bookmarks в localStorage
  useEffect(() => {
    localStorage.setItem('bookmarkedInitiatives', JSON.stringify(bookmarkedInitiatives));
  }, [bookmarkedInitiatives]);

  const handleBookmarkToggle = (initiativeId) => {
    setBookmarkedInitiatives(prev => {
      if (prev.includes(initiativeId)) {
        return prev.filter(id => id !== initiativeId);
      } else {
        return [...prev, initiativeId];
      }
    });
  };

  useEffect(() => {
    fetchInitiatives();
  }, []);

  if (isLoading) {
    return (
      <div className="initiatives-loading-wrapper">
        <div className="initiatives-loading-spinner"></div>
        <p>{t('initiatives.initiativesList.loading')}</p>
      </div>
    );
  }

  return (
    <div className="initiatives-main-container">
      {/* Search & Filters */}
      <InitiativesSearch 
        initiatives={initiatives}
        onFilter={setFilteredInitiatives}
      />

      {/* Initiatives Grid */}
      {filteredInitiatives.length > 0 ? (
        <div className="initiatives-cards-grid">
          {filteredInitiatives.map((initiative, index) => (
            <InitiativeCard 
              key={initiative.id} 
              initiative={initiative}
              index={index}
              isBookmarked={bookmarkedInitiatives.includes(initiative.id)}
              onBookmarkToggle={handleBookmarkToggle}
            />
          ))}
        </div>
      ) : (
        <div className="initiatives-no-results">
          <p>{t('initiatives.initiativesList.noResults')}</p>
        </div>
      )}
    </div>
  );
};