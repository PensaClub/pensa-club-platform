/* eslint-disable react-hooks/exhaustive-deps */
// DraftInitiatives/DraftInitiatives.jsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import DraftSearchBar from './DraftSearchBar/DraftSearchBar';
import DraftCard from './DraftCard/DraftCard';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faFileText } from '@fortawesome/free-solid-svg-icons';
import './draftInitiatives.css';
import { useInitiativeContext } from '../../contexts/InitiativeProvider';
import { Loader } from '../../Loader/Loader';
import Pagination from '../../Articles/Pagination/Pagination';

const DraftInitiatives = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    getAllDrafts,
    deleteDraftInitiative,
    drafts,
    draftsLoaded,
    draftsHasMore,
    draftsCurrentPage,
    isLoading
  } = useInitiativeContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    if (!draftsLoaded) {
      loadDrafts();
    }
  }, [draftsLoaded]);

  const loadDrafts = async () => {
    try {
      await getAllDrafts(1, true);
    } catch (error) {
      console.error('Error loading drafts:', error);
    }
  };

  // Филтрираме черновите според търсенето
  const filteredDrafts = useMemo(() => {
    if (!searchTerm.trim()) return drafts;
    
    return drafts.filter(draft => 
      draft.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      draft.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [drafts, searchTerm]);

  // Пагинация на филтрираните резултати
  const paginatedDrafts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredDrafts.slice(startIndex, endIndex);
  }, [filteredDrafts, currentPage, itemsPerPage]);

  // Изчисляваме общия брой страници
  useEffect(() => {
    const totalPages = Math.ceil(filteredDrafts.length / itemsPerPage);
    setTotalPages(totalPages);
    
    // Ако сме на страница която вече не съществува, отиваме на първа
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredDrafts.length, currentPage, itemsPerPage]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset към първа страница при търсене
  };

  const handleEdit = (draftId) => {
    navigate(`/profile/initiative-create?draftId=${draftId}`);
  };

 const handleDelete = async (draft) => { 
  if (window.confirm('Сигурни ли сте, че искате да изтриете тази чернова?')) {
    try {
      // Използваме slug ако има, иначе id
      const identifier = draft.slug || draft.id;
      console.log('Deleting draft with identifier:', identifier);
      await deleteDraftInitiative(identifier,draft);
    } catch (error) {
      console.error('Error deleting draft:', error);
    }
  }
};
  const handleCreateNew = () => {
    navigate('/profile/initiative-create');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading && !draftsLoaded) {
    return <Loader />;
  }

  return (
    <div className="draft-initiatives-container">
      <div className="draft-header">
        <div className="draft-title-section">
          <h1 className="draft-main-title">
            <FontAwesomeIcon icon={faFileText} className="title-icon" />
            Чернови на инициативи
          </h1>
          <p className="draft-subtitle">
            Управлявайте вашите чернови и ги превърнете в пълноценни инициативи
          </p>
        </div>
        
        <button 
          className="create-new-draft-btn"
          onClick={handleCreateNew}
        >
          <FontAwesomeIcon icon={faPlus} />
          Нова инициатива
        </button>
      </div>

      <div className="draft-controls">
        <DraftSearchBar 
          onSearch={handleSearch}
          placeholder="Търси сред черновите..."
        />
        
        <div className="draft-stats">
          <span className="draft-count">
            {filteredDrafts.length} от {drafts.length} чернови
          </span>
        </div>
      </div>

      {filteredDrafts.length === 0 ? (
        <div className="no-drafts-message">
          {searchTerm ? (
            <div className="no-search-results">
              <FontAwesomeIcon icon={faFileText} className="empty-icon" />
              <h3>Не са намерени чернови</h3>
              <p>Няма чернови които отговарят на търсенето "{searchTerm}"</p>
            </div>
          ) : (
            <div className="no-drafts">
              <FontAwesomeIcon icon={faFileText} className="empty-icon" />
              <h3>Все още няма чернови</h3>
              <p>Започнете със създаването на първата си инициатива</p>
              <button 
                className="create-first-draft-btn"
                onClick={handleCreateNew}
              >
                <FontAwesomeIcon icon={faPlus} />
                Създай инициатива
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="drafts-grid">
            {paginatedDrafts.map((draft) => (
              <DraftCard
                key={draft.id}
                draft={draft}
                onEdit={handleEdit}
                onDelete={() => handleDelete(draft)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="draft-pagination">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DraftInitiatives;