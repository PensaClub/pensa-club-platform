import{ useEffect, useState } from 'react';
import {Link } from 'react-router-dom';
import './pendingAnnouncements.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { CommentModal } from './CommentModal';
import { useAdminContext } from '../../contexts/AdminContext';
import { Flyout } from '../Flyout';
import { useTranslation } from 'react-i18next';
import { notify } from '../../../utils/notify';

export const PendingAnnouncements = ({ setAdsCount }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comment, setComment] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCriteria, setSearchCriteria] = useState('summary');
  const [searchResults, setSearchResults] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [isSearching, setIsSearching] = useState(false);
  const { t } = useTranslation();

  const { fetchPendingAds, updateAdStatus, deleteAd } = useAdminContext();

  useEffect(() => {
    const loadPendingAds = async () => {
      try {
        const pendingAds = await fetchPendingAds();
        setAnnouncements(pendingAds);
        setSearchResults(pendingAds);
        setAdsCount(pendingAds.length);

      } catch (e) {
        console.error(e);
      }
    };
    loadPendingAds();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setAnnouncements]);

  const sortedAnnouncements = [...searchResults].sort((a, b) => {
    if (sortConfig.key === 'email') {
      const emailA = a.email.split('@')[0];
      const emailB = b.email.split('@')[0];
      return sortConfig.direction === 'ascending' ? emailA.localeCompare(emailB) : emailB.localeCompare(emailA);
    } else if (sortConfig.key === 'date') {
      return sortConfig.direction === 'ascending' ? new Date(a.creationDate) - new Date(b.creationDate) : new Date(b.creationDate) - new Date(a.creationDate);
    } else if (sortConfig.key === 'id') {
      return sortConfig.direction === 'ascending' ? a.adId.localeCompare(b.adId) : b.adId.localeCompare(a.adId);
    } else {
      return sortConfig.direction === 'ascending' ? a[sortConfig.key].localeCompare(b[sortConfig.key]) : b[sortConfig.key].localeCompare(a[sortConfig.key]);
    }
  });

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleComment = (announcement) => {
    setSelectedAnnouncement(announcement);
    setIsModalOpen(true);
  };

  const handleSubmitComment = () => {
    setIsModalOpen(false);
  };

  const handleApprove = async (id) => {
    try {
      await updateAdStatus(id, 'approved', comment);
      setComment('');
   
      const updatedAds = await fetchPendingAds();
      setAnnouncements(updatedAds);
      setAdsCount(updatedAds.length);
      setSearchResults(updatedAds);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async (id) => {
    try {
      if (!comment) {
        notify('enter-comment');
        return;
      }
  
      await updateAdStatus(id, 'denied', comment);
      setComment('');
  
      const updatedAds = await fetchPendingAds();
      setAnnouncements(updatedAds);
      setAdsCount(updatedAds.length);
      setSearchResults(updatedAds);
    } catch (e) {
      console.error(e);
    }
  };
  
  const handleDelete = async (id) => {
    try {
      await deleteAd(id);
      setComment('');
    
      const updatedAds = await fetchPendingAds();
      setAnnouncements(updatedAds);
      setAdsCount(updatedAds.length);
      setSearchResults(updatedAds);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAdClick = (ad) => {
    setSelectedAd(ad);
    setIsFlyoutOpen(true);
  };

  const handleSearch = () => {
    setIsSearching(true);
    const results = announcements.filter((announcement) => {
      if (searchCriteria === 'summary') {
        return announcement.summary.toLowerCase().includes(searchTerm.toLowerCase());
      } else if (searchCriteria === 'email') {
        return announcement.email.toLowerCase().includes(searchTerm.toLowerCase());
      } else if (searchCriteria === 'date') {
        return announcement.creationDate.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return false;
    });
    setSearchResults(results);
    setIsSearching(false);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSearchCriteria('summary');
    setSearchResults(announcements);
  };

  return (
    <div className="pending-announcements-container">
      <h2>{t('admin.pending_announcements')}</h2>
      <div className="search-container">
        <input
          type="text"
          placeholder={t('admin.search') + '...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={searchCriteria}
          onChange={(e) => setSearchCriteria(e.target.value)}
        >
          <option value="summary">{t('admin.name')}</option>
          <option value="email">{t('admin.email')}</option>
          <option value="date">{t('admin.date')}</option>
        </select>
        <button onClick={handleSearch}>{t('admin.search')}</button>
        {searchTerm && (
          <FontAwesomeIcon
            icon={faArrowRotateLeft}
            className="reset-icon"
            onClick={resetFilters}
          />
        )}
      </div>
      <hr />
      <div className="pending-announcements-table-container">
        <table className="pending-announcements-table">
          <thead>
            <tr>
              <th className="number-cell" onClick={() => requestSort('adId')}>
                {t('admin.number')}
                {sortConfig.key === 'adId' ? (
                  sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'
                ) : null}
              </th>
              <th onClick={() => requestSort('email')}>
                {t('admin.user_email')}
                {sortConfig.key === 'email' ? (
                  sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'
                ) : null}
              </th>
              <th>{t('admin.announcement_title')}</th>
              <th onClick={() => requestSort('date')}>
                {t('admin.creation_date')}
                {sortConfig.key === 'date' ? (
                  sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'
                ) : null}
              </th>
              <th>{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {sortedAnnouncements.map((announcement, index) => (
              <tr key={announcement.adId}>
                <td className="number-cell id-table-admin">{index + 1}</td>
                <td>
                  <Link to={`#`}>{announcement.email}</Link>
                </td>
                <td>
                  <Link to={`#`} onClick={() => handleAdClick(announcement)}>{announcement.summary}</Link>
                </td>
                <td>{announcement.creationDate}</td>
                <td className="actions-admin">
                  <img
                    src={'/icons/comment.svg'}
                    alt="Comment"
                    className="comment-icon"
                    onClick={() => handleComment(announcement)}
                  />
                  <img
                    src={'/icons/approve-invoice.svg'}
                    alt="approved"
                    className="comment-icon"
                    onClick={() => handleApprove(announcement.adId)}
                  />
                  <img
                    src={'/icons/denied.svg'}
                    alt="reject"
                    className="comment-icon"
                    onClick={() => handleReject(announcement.adId)}
                  />
                  <img
                    src={'/icons/delete-button.svg'}
                    alt="delete"
                    className="comment-icon"
                    onClick={() => handleDelete(announcement.adId)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sortedAnnouncements.length === 0 && <p className='no-result-fly'>No results found...</p>}
      </div>
      <CommentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitComment}
      >
        <h2>Comment on Announcement</h2>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows="5"
          cols="50"
        />
      </CommentModal>
      {selectedAd && (
        <Flyout
          isOpen={isFlyoutOpen}
          onClose={() => setIsFlyoutOpen(false)}
          ad={selectedAd}
          handleApprove={handleApprove}
          handleReject={handleReject}
        />
      )}
    </div>
  );
};
