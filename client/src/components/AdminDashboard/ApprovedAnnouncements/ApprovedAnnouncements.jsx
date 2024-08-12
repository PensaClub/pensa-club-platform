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
import { useAuthContext } from '../../contexts/UserContext';

export const ApprovedAnnouncements = ({ setApprovedCount }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCriteria, setSearchCriteria] = useState('summary');
  const [searchResults, setSearchResults] = useState([]);
  const [adminEmail, setAdminEmail] = useState('');
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');

  const { t } = useTranslation();
  const { profileData } = useAuthContext();

  const { fetchApprovedAds, updateAdStatus, deleteAd } = useAdminContext();

  useEffect(() => {
    const loadApprovedAds = async () => {
      try {
        const approvedAds = await fetchApprovedAds();
        setAnnouncements(approvedAds);
        setSearchResults(approvedAds);
        setAdminEmail(profileData.email);

        setApprovedCount(approvedAds.length);
      } catch (e) {
        console.error(e);
      }
    };
    loadApprovedAds();
  }, [setAnnouncements]);

  const sortedAnnouncements = [...searchResults].sort((a, b) => {
    if (sortConfig.key === 'id') {
      return sortConfig.direction === 'ascending' ? a.adId.localeCompare(b.adId) : b.adId.localeCompare(a.adId);
    } else if (sortConfig.key === 'email') {
      return sortConfig.direction === 'ascending' ? a.account.email.localeCompare(b.account.email) : b.account.email.localeCompare(a.account.email);
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

  const handleReject = async (id, summary) => {
    try {
      const defaultComment = `${t('admin.from_admin')} ${adminEmail}: ${t('profile.your_ad')} "${summary}" ${t('profile.rejected_ads')}`;
      const finalComment = comment ? `${t('admin.from_admin')} ${adminEmail}: ${comment}` : defaultComment;
      if (!finalComment) {
        notify('enter-comment');
        return;
      }
      await updateAdStatus(id, 'denied', finalComment);
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
      const defaultComment = `${t('admin.from_admin')} ${adminEmail}: ${t('admin.deleted_ad')}`;
      const finalComment = comment ? `${t('admin.from_admin')} ${adminEmail}: ${comment}` : defaultComment;
      await deleteAd(id, finalComment);
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
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSearchCriteria('summary');
    setSearchResults(announcements);
  };

  const trimString = (str, num) => {
    if (str.length <= num) return str;
    return str.slice(0, num) + '...';
  };

  const handleTextClick = (text) => {
    setModalContent(text);
    setIsTextModalOpen(true);
  };

  const closeTextModal = () => {
    setIsTextModalOpen(false);
    setModalContent('');
  };

  return (
    <div className="approved-announcements-container">
      <h2>{t('profile.approved_announcements')}</h2>
      <div className="search-container-approved">
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
            <div className="reset-icon-container">
              <FontAwesomeIcon
                icon={faArrowRotateLeft}
                className="reset-icon-approved"
                onClick={resetFilters}
              />
              <span className="reset-text-approved" onClick={resetFilters}>{t('admin_messages.search_clear')}</span>
            </div>
          )}
      </div>

      <hr />
      <div className="legend-container">
        <div className="legend-item">
          <img src={'/icons/comment.svg'} alt="Comment" className="legend-icon" />
          <span>{t('admin.comment')}</span>
        </div>
        <div className="legend-item">
          <img src={'/icons/denied.svg'} alt="Reject" className="legend-icon" />
          <span>{t('admin.reject')}</span>
        </div>
        <div className="legend-item">
          <img src={'/icons/delete-button.svg'} alt="Delete" className="legend-icon" />
          <span>{t('admin.delete')}</span>
        </div>
        <div className="legend-item">
          <img src={'/icons/number.svg'} alt="Number" className="legend-icon" />
          <span>{t('admin.number')}</span>
        </div>
        <div className="legend-item">
          <img src={'/icons/email.svg'} alt="Email" className="legend-icon" />
          <span>{t('admin.user_email')}</span>
        </div>
        <div className="legend-item">
          <img src={'/icons/date.svg'} alt="Creation Date" className="legend-icon" />
          <span>{t('admin.creation_date')}</span>
        </div>
        <div className="legend-item">
          <img src={'/icons/ads.svg'} alt="Ads" className="legend-icon" />
          <span>{t('admin.announcement_title')}</span>
        </div>
        <div className="legend-item">
          <img src={'/icons/actions.svg'} alt="Actions" className="legend-icon" />
          <span>{t('admin.actions')}</span>
        </div>
      </div>
      <hr />
      <div className="approved-announcements-table-container">
        <table className="approved-announcements-table">
          <thead>
            <tr>
              <th className="number-cell" onClick={() => requestSort('adId')}>
                <img src="/icons/number.svg" alt="Number" className="table-icon" />
                <span>{t('admin.number')}</span>
                {sortConfig.key === 'adId' ? (
                  sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'
                ) : null}
              </th>
              <th onClick={() => requestSort('email')} className='email-approved-ads'>
                <img src="/icons/email.svg" alt="Email" className="table-icon" />
                <span>{t('admin.user_email')}</span>
                {sortConfig.key === 'email' ? (
                  sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'
                ) : null}
              </th>
              <th className='ads-approved-ads'>
                <img src="/icons/ads.svg" alt="Ads" className="table-icon" />
                <span>{t('admin.announcement_title')}</span>
              </th>
              <th className='th-date-approved' onClick={() => requestSort('date')}>
                <img src="/icons/date.svg" alt="Creation Date" className="table-icon" />
                <span>{t('admin.creation_date')}</span>
                {sortConfig.key === 'date' ? (
                  sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'
                ) : null}
              </th>
              <th>
                <img src="/icons/actions.svg" alt="Actions" className="table-icon" />
                <span>{t('admin.actions')}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedAnnouncements.map((announcement, index) => (
              <tr key={announcement.adId}>
                <td className="number-cell id-table-admin">{index + 1}</td>
                <td className='trimmed-email-approved' onClick={() => handleTextClick(announcement.account.email)}>
                  <Link to={`#`}>{trimString(announcement.account.email, 12)}</Link>
                </td>
                <td className='trimmed-tittle-approved'>
                  <Link to={`#`} onClick={() => handleAdClick(announcement)}>{trimString(announcement.summary, 10)}</Link>
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
                    alt="Reject"
                    className="comment-icon"
                    onClick={() => handleReject(announcement.adId, announcement.summary)}
                  />
                  <img
                    src={'/icons/delete-button.svg'}
                    alt="Delete"
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
      {isTextModalOpen && (
        <div className="text-modal-overlay-approved">
          <div className="text-modal-content-approved-ads ">
            <span className="close-button-approved" onClick={closeTextModal}>&times;</span>
            <p>{modalContent}</p>
          </div>
        </div>
      )}
    </div>
  );
};
