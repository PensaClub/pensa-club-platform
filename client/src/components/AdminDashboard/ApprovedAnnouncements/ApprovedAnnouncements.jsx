import './approvedAnnouncements.css';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { useAdminContext } from '../../contexts/AdminContext';
import { useTranslation } from 'react-i18next';
import { notify } from '../../../utils/notify';
import { CommentModal } from '../PendingAnnouncements/CommentModal';
import { FlyoutApproved } from './FlyoutApproved';

export const ApprovedAnnouncements = ({ setApprovedCount }) => {
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

  const { fetchApprovedAds, updateAdStatus, deleteAd } = useAdminContext();

  useEffect(() => {
    const loadPendingAds = async () => {
      try {
        const approvedAds = await fetchApprovedAds();
        setAnnouncements(approvedAds);
        setSearchResults(approvedAds);
        setApprovedCount(approvedAds.length);
      } catch (e) {
        console.error(e);
      }
    };
    loadPendingAds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setAnnouncements]);

  const sortedAnnouncements = [...searchResults].sort((a, b) => {
    if (sortConfig.key === 'id') {
      const idA = a.adId;
      const idB = b.adId;
      return sortConfig.direction === 'ascending' ? idA.localeCompare(idB) : idB.localeCompare(idA);
    } else if (sortConfig.key === 'email') {
      const emailA = a.account.email.split('@')[0];
      const emailB = b.account.email.split('@')[0];
      return sortConfig.direction === 'ascending' ? emailA.localeCompare(emailB) : emailB.localeCompare(emailA);
    } else if (sortConfig.key === 'date') {
      return sortConfig.direction === 'ascending' ? new Date(a.creationDate) - new Date(b.creationDate) : new Date(b.creationDate) - new Date(a.creationDate);
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

  const handleReject = async (id) => {
    try {
      if (!comment) {
        notify('enter-comment');
        return;
      }
      await updateAdStatus(id, 'denied', comment);
      setComment('');
      const updatedAds = await fetchApprovedAds();
      setAnnouncements(updatedAds);
      setApprovedCount(updatedAds.length);
      setSearchResults(updatedAds);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAd(id,comment);
      setComment('');
      const updatedAds = await fetchApprovedAds();
      setAnnouncements(updatedAds);
      setApprovedCount(updatedAds.length);
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
        return announcement.account.email.toLowerCase().includes(searchTerm.toLowerCase());
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
      <h2>{t('profile.approved_announcements')}</h2>
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
      <div className="legend-container">
        <div className="legend-item">
          <img src={'/icons/comment.svg'} alt="Comment" className="legend-icon" />
          <span>{t('admin.comment')}</span>
        </div>
        <div className="legend-item">
          <img src={'/icons/denied.svg'} alt="reject" className="legend-icon" />
          <span>{t('admin.reject')}</span>
        </div>
        <div className="legend-item">
          <img src={'/icons/delete-button.svg'} alt="delete" className="legend-icon" />
          <span>{t('admin.delete')}</span>
        </div>
      </div>
      <hr />
      <div className="approved-announcements-table-container">
        <table className="approved-announcements-table">
          <thead>
            <tr>
              
              <th className="number-cell" onClick={() => requestSort('id')}>
                {t('admin.number')}
                {sortConfig.key === 'id' ? (
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
                  <Link to={`#`}>{announcement.account.email}</Link>
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
        <FlyoutApproved
          isOpen={isFlyoutOpen}
          onClose={() => setIsFlyoutOpen(false)}
          ad={selectedAd}
          handleDelete={handleDelete}
          handleReject={handleReject}
        />
      )}
    </div>
  );
};
