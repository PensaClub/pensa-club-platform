// components/AdminDashboard/AllInitiatives/AllInitiatives.js
import React, { useEffect, useState } from 'react';
import './allInitiatives.css';
import { useTranslation } from 'react-i18next';
import { InitiativesSearchAdmin } from './InitiativesSearchAdmin/InitiativesSearchAdmin';
import { useInitiativeContext } from '../../contexts/InitiativeProvider';

export const AllInitiatives = () => {
  const { t } = useTranslation();
  const { 
    getAllInitiatives, 
    initiatives, 
    isLoading,
    hasMore,
    loadMoreInitiatives 
  } = useInitiativeContext();
  
  const [filteredInitiatives, setFilteredInitiatives] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    sortBy: 'newest'
  });

  useEffect(() => {
    getAllInitiatives(1, true);
  }, []);

  useEffect(() => {
    let filtered = [...initiatives];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(initiative => 
        initiative.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        initiative.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        initiative.author?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(initiative => {
        if (filters.status === 'published') return !initiative.isDraft;
        if (filters.status === 'draft') return initiative.isDraft;
        if (filters.status === 'archived') return initiative.isArchived;
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'mostViewed':
          return (b.viewsCount || 0) - (a.viewsCount || 0);
        case 'mostLiked':
          return (b.likesCount || 0) - (a.likesCount || 0);
        default:
          return 0;
      }
    });

    setFilteredInitiatives(filtered);
  }, [initiatives, searchTerm, filters]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const getStatusBadge = (initiative) => {
    if (initiative.isDraft) {
      return <span className="status-badge draft">Чернова</span>;
    } else if (initiative.isArchived) {
      return <span className="status-badge archived">Архивирана</span>;
    }
    return <span className="status-badge published">Публикувана</span>;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bg-BG', { 
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="all-initiatives-container">
      <InitiativesSearchAdmin 
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        totalCount={initiatives.length}
      />

      <div className="initiatives-grid">
        {filteredInitiatives.map((initiative) => (
          <div key={initiative.id} className="initiative-card">
            <div className="card-header">
              {initiative.coverImage && (
                <img 
                  src={initiative.coverImage} 
                  alt={initiative.title}
                  className="card-image"
                />
              )}
              <div className="card-overlay">
                {getStatusBadge(initiative)}
              </div>
            </div>

            <div className="card-body">
              <h3 className="card-title">{initiative.title}</h3>
              <p className="card-description">
                {initiative.description?.slice(0, 120)}...
              </p>

              <div className="card-meta">
                <div className="meta-item">
                  <svg className="meta-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span>{initiative.author || 'Неизвестен автор'}</span>
                </div>

                <div className="meta-item">
                  <svg className="meta-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span>{formatDate(initiative.createdAt)}</span>
                </div>
              </div>

              <div className="card-stats">
                <div className="stat-item">
                  <svg className="stat-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <span>{initiative.viewsCount || 0}</span>
                </div>

                <div className="stat-item">
                  <svg className="stat-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M21 8.5C21 5.5 18.308 3 15 3C12.692 3 10.958 4.312 10.025 6.206C9.743 5.516 9 5 8 5C6.343 5 5 6.343 5 8C5 8.373 5.06 8.731 5.168 9.067C3.349 9.543 2 11.183 2 13.125C2 15.479 3.952 17.395 6.356 17.395C6.579 17.395 11.721 17.405 15 17.405C18.038 17.405 21 14.88 21 11.5C21 10.303 20.632 9.196 20.016 8.286C20.006 8.357 21 8.5 21 8.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span>{initiative.likesCount || 0}</span>
                </div>

                <div className="stat-item">
                  <svg className="stat-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.9706 16.9706 21 12 21C10.0286 21 8.20117 20.3775 6.69879 19.3224L3 21L4.67756 17.3012C3.62246 15.7988 3 13.9714 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span>{initiative.commentsCount || 0}</span>
                </div>
              </div>

              <div className="card-actions">
                <button className="action-btn view-btn">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Преглед
                </button>

                <button className="action-btn edit-btn">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2"/>
                    <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.43741 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Редактирай
                </button>

                <button className="action-btn delete-btn">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M10 11V17M14 11V17" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Изтрий
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMore && !isLoading && (
        <div className="load-more-container">
          <button 
            className="load-more-btn"
            onClick={loadMoreInitiatives}
          >
            Зареди още инициативи
          </button>
        </div>
      )}

      {isLoading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Зареждане на инициативи...</p>
        </div>
      )}

      {!isLoading && filteredInitiatives.length === 0 && (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" className="empty-icon">
            <path d="M12 2L2 7V12C2 16.5 4.23 20.68 7.62 23.15L12 24L16.38 23.15C19.77 20.68 22 16.5 22 12V7L12 2Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 8V13M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <h3>Няма намерени инициативи</h3>
          <p>Опитайте да промените критериите за търсене или филтриране</p>
        </div>
      )}
    </div>
  );
};