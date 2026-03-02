/* eslint-disable react-hooks/exhaustive-deps */
// DraftInitiatives/DraftInitiatives.jsx
import { useState, useEffect, useMemo, useRef } from 'react';
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
  const { t } = useTranslation('content');
  const navigate = useNavigate();
  const {
    getAllDrafts,
    deleteDraftInitiative,
    toggleDraftStatus,
    isLoading
  } = useInitiativeContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [allDrafts, setAllDrafts] = useState([]);
  const [isLoadingAll, setIsLoadingAll] = useState(true);
  const hasLoadedRef = useRef(false);
  const itemsPerPage = 6;

  useEffect(() => {
    if (hasLoadedRef.current) return;

    const loadAllDrafts = async () => {
      hasLoadedRef.current = true;
      setIsLoadingAll(true);

      try {
        // Зареждаме първа страница
        const firstResponse = await getAllDrafts(1, true);
        const totalPagesFromServer = firstResponse.pagination?.totalPages || 1;

        let allResults = [...(firstResponse.data || [])];

        // Зареждаме останалите страници
        for (let page = 2; page <= totalPagesFromServer; page++) {
          const response = await getAllDrafts(page, false);
          if (response.data && response.data.length > 0) {
            allResults = [...allResults, ...response.data];
          }
        }

        setAllDrafts(allResults);
      } catch (error) {
        console.error('Error loading drafts:', error);
      } finally {
        setIsLoadingAll(false);
      }
    };

    loadAllDrafts();
  }, []);

  // Филтрираме черновите според търсенето
  const filteredDrafts = useMemo(() => {
    if (!searchTerm.trim()) return allDrafts;

    return allDrafts.filter(draft =>
      draft.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      draft.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allDrafts, searchTerm]);

  // Пагинация на филтрираните резултати
  const paginatedDrafts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredDrafts.slice(startIndex, endIndex);
  }, [filteredDrafts, currentPage]);

  // Изчисляваме общия брой страници
  useEffect(() => {
    const newTotalPages = Math.ceil(filteredDrafts.length / itemsPerPage);
    setTotalPages(newTotalPages);

    // Ако сме на страница която вече не съществува, отиваме на първа
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredDrafts.length]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset към първа страница при търсене
  };

  const handlePublish = async (draft) => {
    if (window.confirm(t('drafts.confirmPublish'))) {
      try {
        const identifier = draft.slug || draft.id;
        await toggleDraftStatus(identifier);

        // Премахваме от локалния state
        setAllDrafts(prev => prev.filter(d => d.id !== draft.id));
      } catch (error) {
        console.error('Error publishing draft:', error);
      }
    }
  };

  const handleEdit = (draftId) => {
    navigate(`/profile/initiative-create?draftId=${draftId}`);
  };

  const handleDelete = async (draft) => {
    if (window.confirm(t('drafts.confirmDelete'))) {
      try {
        // Използваме slug ако има, иначе id
        const identifier = draft.slug || draft.id;
        await deleteDraftInitiative(identifier, draft);

        // Премахваме от локалния state
        setAllDrafts(prev => prev.filter(d => d.id !== draft.id));
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

  if (isLoadingAll || isLoading) {
    return <Loader />;
  }

  return (
    <div className="draft-initiatives-container">
      <div className="draft-header">
        <div className="draft-title-section">
          <h1 className="draft-main-title">
            <FontAwesomeIcon icon={faFileText} className="title-icon" />
            {t('drafts.title')}
          </h1>
          <p className="draft-subtitle">
            {t('drafts.subtitle')}
          </p>
        </div>

        <button
          className="create-new-draft-btn"
          onClick={handleCreateNew}
        >
          <FontAwesomeIcon icon={faPlus} />
          {t('drafts.newInitiative')}
        </button>
      </div>

      <div className="draft-controls">
        <DraftSearchBar
          onSearch={handleSearch}
          placeholder={t('drafts.searchPlaceholder')}
        />

        <div className="draft-stats">
          <span className="draft-count">
            {filteredDrafts.length} {t('drafts.of')} {allDrafts.length} {t('drafts.draftsCount')}
          </span>
        </div>
      </div>

      {filteredDrafts.length === 0 ? (
        <div className="no-drafts-message">
          {searchTerm ? (
            <div className="no-search-results">
              <FontAwesomeIcon icon={faFileText} className="empty-icon" />
              <h3>{t('drafts.noResultsTitle')}</h3>
              <p>{t('drafts.noResultsText', { searchTerm })}</p>
            </div>
          ) : (
            <div className="no-drafts">
              <FontAwesomeIcon icon={faFileText} className="empty-icon" />
              <h3>{t('drafts.noDraftsTitle')}</h3>
              <p>{t('drafts.noDraftsText')}</p>
              <button
                className="create-first-draft-btn"
                onClick={handleCreateNew}
              >
                <FontAwesomeIcon icon={faPlus} />
                {t('drafts.createInitiative')}
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="drafts-grid">
            {paginatedDrafts.map((draft) => (
              <DraftCard
                key={draft.slug || draft.id}
                draft={draft}
                onEdit={handleEdit}
                onDelete={() => handleDelete(draft)}
                onPublish={handlePublish}
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