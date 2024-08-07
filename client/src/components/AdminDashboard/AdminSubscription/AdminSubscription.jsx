/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import './adminSubscription.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { useCommunityContext } from '../../contexts/CommunityContext';

export const AdminSubscription = ({setAllSubscriptionEmails}) => {
  const { getSubscribeEmails, subscribeEmails } = useCommunityContext();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmails, setFilteredEmails] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchCriterion, setSearchCriterion] = useState('email');
  const emailsPerPage = 15;
  const totalPages = Math.ceil(filteredEmails.length / emailsPerPage);

  useEffect(() => {
    getSubscribeEmails();
    
  }, []);

  useEffect(() => {
    setFilteredEmails(subscribeEmails);
    setAllSubscriptionEmails(subscribeEmails?.length);
  }, [subscribeEmails]);

  const handleSearch = () => {
    if (searchTerm === '') {
      setFilteredEmails(subscribeEmails);
    } else {
      const filtered = subscribeEmails.filter(email =>
        email[searchCriterion].toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmails(filtered);
    }
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilteredEmails(subscribeEmails);
  };

  const getCurrentEmails = () => {
    const startIndex = (currentPage - 1) * emailsPerPage;
    return filteredEmails.slice(startIndex, startIndex + emailsPerPage);
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  return (
    <div className="subscription-container">
      <div className="search-container-subscription">
        <input
          type="text"
          placeholder={t('admin.search')}
          onChange={(e) => setSearchTerm(e.target.value)}
          value={searchTerm}
          className="search-input-subscription"
        />
        <select
          className="search-select-subscription"
          onChange={(e) => setSearchCriterion(e.target.value)}
          value={searchCriterion}
        >
          <option value="email">{t('admin.email')}</option>
          <option value="username">{t('admin.username')}</option>
        </select>
        <div className="search-actions-subscription">
          <button className="search-button-subscription" onClick={handleSearch}>{t('admin.search')}</button>
          {searchTerm && (
            <div className="reset-icon-container">
              <FontAwesomeIcon
                icon={faArrowRotateLeft}
                className="reset-icon"
                onClick={resetFilters}
              />
              <span className="reset-text" onClick={resetFilters}>{t('admin.search_clear')}</span>
            </div>
          )}
        </div>
      </div>
      <div className="emails-container">
        <div className="emails-header">
          <span>{t('admin.number')}</span>
          <span>{t('admin.email')}</span>
          <span>{t('admin.username')}</span>
        </div>
        {getCurrentEmails().map((sub, index) => (
          <div key={index} className="email-wrapper">
            <div className="email-row">
              <span>{(currentPage - 1) * emailsPerPage + index + 1}</span>
              <span>{sub.email}</span>
              <span>{sub.username}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="pagination-container">
        <button className="pagination-button" onClick={handlePreviousPage} disabled={currentPage === 1}>{t('admin_messages.previous')}</button>
        <span className="pagination-info">{t('admin_messages.page')} {currentPage} {totalPages > 1 && `${t('admin_messages.of')} ${totalPages}`}</span>
        <button className="pagination-button" onClick={handleNextPage} disabled={currentPage === totalPages}>{t('admin_messages.next')}</button>
      </div>
    </div>
  );
};
