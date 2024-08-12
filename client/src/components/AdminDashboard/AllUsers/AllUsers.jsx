import './allUsers.css';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { CommentModal } from '../PendingAnnouncements/CommentModal';
import { useMappingContext } from '../../contexts/MapContext';
import { FlyoutAllUsers } from './FlyoutAllUsers/FlyoutAllUsers';
import { useAuthContext } from '../../contexts/UserContext';
import { useAdminContext } from '../../contexts/AdminContext';

export const AllUsers = ({ setAllUsers }) => {
  const [users, setUsers] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'email', direction: 'ascending' });
  const [rowOrder, setRowOrder] = useState('ascending');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCriteria, setSearchCriteria] = useState('email');
  const [searchResults, setSearchResults] = useState([]);
  const [adminEmail, setAdminEmail] = useState('')
  const { t } = useTranslation();
  const { onAllUsers } = useMappingContext();
  const { onForgetPasswordSubmit, onChangeAdminRole, profileData } = useAuthContext();
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);
  const { deleteUserData } = useAdminContext()
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const allUsers = await onAllUsers();
        if (allUsers && allUsers.accounts) {
          setUsers(allUsers.accounts);
          setAllUsers(allUsers.accounts.length);
          setAdminEmail(profileData.email);

          setSearchResults(allUsers.accounts);
        } else {
          console.error("Failed to load users.");
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortedUsers = Array.isArray(searchResults) ? [...searchResults].sort((a, b) => {
    if (sortConfig.key === 'email') {
      return sortConfig.direction === 'ascending'
        ? (a.email || '').localeCompare(b.email || '')
        : (b.email || '').localeCompare(a.email || '');
    } else if (sortConfig.key === 'date') {
      return sortConfig.direction === 'ascending'
        ? new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
        : new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    } else if (sortConfig.key === 'status') {
      return sortConfig.direction === 'ascending'
        ? a.enabled - b.enabled
        : b.enabled - a.enabled;
    } else if (sortConfig.key === 'ads') {
      return sortConfig.direction === 'ascending'
        ? (a.ads?.length || 0) - (b.ads?.length || 0)
        : (b.ads?.length || 0) - (a.ads?.length || 0);
    } else {
      return sortConfig.direction === 'ascending'
        ? (a[sortConfig.key] || '').localeCompare(b[sortConfig.key] || '')
        : (b[sortConfig.key] || '').localeCompare(a[sortConfig.key] || '');
    }
  }) : [];

  const sortedByRowOrder = rowOrder === 'ascending' ? sortedUsers : [...sortedUsers].reverse();

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const toggleRowOrder = () => {
    setRowOrder(rowOrder === 'ascending' ? 'descending' : 'ascending');
  };

  const handleComment = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleSubmitComment = () => {
    setIsModalOpen(false);
  };

  const handleDelete = async (email) => {
    try {
      setComment('');
      await deleteUserData(email);
      const updatedUsers = await onAllUsers();
      setUsers(updatedUsers.accounts);
      setSearchResults(updatedUsers.accounts);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = () => {
    const results = users.filter((user) => {
      if (searchCriteria === 'email') {
        return user.email.toLowerCase().includes(searchTerm.toLowerCase());
      } else if (searchCriteria === 'date') {
        return user.createdAt.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return false;
    });
    setSearchResults(results);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSearchCriteria('email');
    setSearchResults(users);
  };

  const getStatus = (enabled) => {
    return enabled ? t('admin.finish') : t('admin.unfinish');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleFlyoutOpen = (user) => {
    setSelectedUser(user);
    setIsFlyoutOpen(true);
  };

  const handleFlyoutClose = () => {
    setIsFlyoutOpen(false);
    setSelectedUser(null);
  };

  const handleRoleChange = async (email, role) => {
    let defaultComment = `${t('admin.from_admin',)} ${adminEmail}: ${t('admin.default_comment',)} ${role}`;
    if (role === "guest") {
      defaultComment = `${t('admin.from_admin',)} ${adminEmail}: ${t('admin.default_comment_banned')}`
    }
    const finalComment = comment || defaultComment;

    try {
      await onChangeAdminRole(email, role, finalComment);
      const updatedUsers = await onAllUsers();
      if (updatedUsers && updatedUsers.accounts) {
        setUsers(updatedUsers.accounts);
        setSearchResults(updatedUsers.accounts);
      } else {
        console.error("Failed to fetch updated users.");
      }
      setIsFlyoutOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePasswordReset = (email) => {
    onForgetPasswordSubmit({ email });
  };

  const trimString = (str, num) => {
    if (str.length <= num) return str;
    return str.slice(0, num) + '...';
  }

  const handleTextClick = (text) => {
    setModalContent(text);
    setIsTextModalOpen(true);
  };

  const closeTextModal = () => {
    setIsTextModalOpen(false);
    setModalContent('');
  }

  return (
    <div className="all-users-container">
      <h2>{t('admin.all_users')}</h2>
      <div className="search-container-all-users">
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
          <option value="email">{t('admin.email')}</option>
          <option value="date">{t('admin.creation_date')}</option>
        </select>
        <button onClick={handleSearch}>{t('admin.search')}</button>
        {searchTerm && (
          <div className="reset-icon-container">
            <FontAwesomeIcon
              icon={faArrowRotateLeft}
              className="reset-icon-all-users"
              onClick={resetFilters}
            />
            <span className="reset-text-all-users" onClick={resetFilters}>{t('admin_messages.search_clear')}</span>
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
    <img src={'/icons/gears-icon.svg'} alt="approved" className="legend-icon" />
    <span>{t('admin.settings')}</span>
  </div>
  <div className="legend-item">
    <img src={'/icons/denied.svg'} alt="reject" className="legend-icon" />
    <span>{t('admin.ban')}</span>
  </div>
  <div className="legend-item">
    <img src={'/icons/delete-button.svg'} alt="delete" className="legend-icon" />
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
    <img src={'/icons/registration.svg'} alt="Registration Date" className="legend-icon" />
    <span>{t('admin.user_registration_date')}</span>
  </div>
  <div className="legend-item">
    <img src={'/icons/status.svg'} alt="Status" className="legend-icon" />
    <span>{t('admin.status')}</span>
  </div>
  <div className="legend-item">
    <img src={'/icons/ads.svg'} alt="Ads" className="legend-icon" />
    <span>{t('profile.ads-statistic')}</span>
  </div>
  <div className="legend-item">
    <img src={'/icons/actions.svg'} alt="Actions" className="legend-icon" />
    <span>{t('admin.actions')}</span>
  </div>
</div>

      <hr />
      <div className="all-users-table-container">
        <table className="all-users-table">
          <thead>
            <tr>
              <th className="number-cell" onClick={toggleRowOrder}>
                <img src="/icons/number.svg" alt="Number" className="table-icon" />
                <span>{t('admin.number')}</span>
                {rowOrder === 'ascending' ? ' ↑' : ' ↓'}
              </th>

              <th className="th-email-all-users" onClick={() => requestSort('email')}>
                <span>{t('admin.user_email')}</span>
                <img src="/icons/email.svg" alt="Email" className="table-icon" />
                {sortConfig.key === 'email' ? (
                  sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'
                ) : null}
              </th>
              <th onClick={() => requestSort('date')} className="registration-date-admin-all-users">
                <span>{t('admin.user_registration_date')}</span>
                <img src="/icons/registration.svg" alt="Registration" className="table-icon" />
                {sortConfig.key === 'date' ? (
                  sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'
                ) : null}
              </th>
              <th onClick={() => requestSort('status')} className='status-all-users'> 
                <span>{t('admin.status')}</span>
                <img src="/icons/status.svg" alt="Status" className="table-icon" />
                {sortConfig.key === 'status' ? (
                  sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'
                ) : null}
              </th>
              <th onClick={() => requestSort('ads')} className="ads-cell-all-users">
                <span>{t('profile.ads-statistic')}</span>
                <img src="/icons/ads.svg" alt="Ads" className="table-icon" />
                {sortConfig.key === 'ads' ? (
                  sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'
                ) : null}
              </th>
              <th>
                <span>{t('admin.actions')}</span>
                <img src="/icons/actions.svg" alt="Actions" className="table-icon" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedByRowOrder.map((user, index) => (
              <tr key={user.email}>
                <td className="number-cell">{index + 1}</td>
                <td className='trimmed-email-all-users' onClick={() => handleTextClick(user?.email)}>
                  <Link to={`#`}>{trimString(user?.email, 12)}</Link>
                </td>
                <td>{formatDate(user?.createdAt)}</td>
                <td>{getStatus(user?.enabled)}</td>
                <td>{user?.ads?.length}</td>
                <td className="actions-admin">
                  <img
                    src={'/icons/comment.svg'}
                    alt="Comment"
                    className="comment-icon"
                    onClick={() => handleComment(user)}
                  />
                  <img
                    src={'/icons/gears-icon.svg'}
                    alt="approved"
                    className="comment-icon"
                    onClick={() => handleFlyoutOpen(user)}
                  />
                  <img
                    src={'/icons/denied.svg'}
                    alt="reject"
                    className="comment-icon"
                    onClick={() => handleRoleChange(user.email, "guest")}
                  />
                  <img
                    src={'/icons/delete-button.svg'}
                    alt="delete"
                    className="comment-icon"
                    onClick={() => handleDelete(user.email)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sortedUsers?.length === 0 && <p className='no-result-fly'>No results found...</p>}
      </div>
      <CommentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitComment}
      >
        <h2>Comment on User</h2>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows="5"
          cols="50"
        />
      </CommentModal>
      <FlyoutAllUsers
        isOpen={isFlyoutOpen}
        onClose={handleFlyoutClose}
        user={selectedUser}
        handleRoleChange={handleRoleChange}
        handlePasswordReset={handlePasswordReset}
      />
      {isTextModalOpen && (
        <div className="text-modal-overlay-all-users">
          <div className="text-modal-content-all-users-ads ">
            <span className="close-button-all-users" onClick={closeTextModal}>&times;</span>
            <p>{modalContent}</p>
          </div>
        </div>
      )}
    </div>
  );
};
