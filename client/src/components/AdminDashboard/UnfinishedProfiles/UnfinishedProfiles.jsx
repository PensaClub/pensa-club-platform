import './unfinishedProfiles.css';

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { notify } from '../../../utils/notify';
import { useMappingContext } from '../../contexts/MapContext';
import { useAuthContext } from '../../contexts/UserContext';
import { CommentModal } from '../PendingAnnouncements/CommentModal';
import { FlyoutUnfinished } from './FlyoutUnfinished';

export const UnfinishedProfiles = ({ setUnfinishedUsers }) => {
  const [users, setUsers] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'email', direction: 'ascending' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCriteria, setSearchCriteria] = useState('email');
  const [searchResults, setSearchResults] = useState([]);
  const { t } = useTranslation();
  const { onAllUsers } = useMappingContext();
  const { onForgetPasswordSubmit,onChangeAdminRole } = useAuthContext();
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const allUsers = await onAllUsers();
        const filteredUsers = allUsers.accounts.filter((user) => !user.enabled);
        setUsers(filteredUsers);

        setUnfinishedUsers(filteredUsers?.length);

        setSearchResults(filteredUsers);

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
        ? a.email.localeCompare(b.email)
        : b.email.localeCompare(a.email);
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
        ? a.ads?.length - b.ads?.length
        : b.ads?.length - a.ads?.length;
    } else if (sortConfig.key === 'id') {
      return sortConfig.direction === 'ascending'
        ? searchResults.indexOf(a) - searchResults.indexOf(b)
        : searchResults.indexOf(b) - searchResults.indexOf(a);
    } else {
      return sortConfig.direction === 'ascending'
        ? (a[sortConfig.key] || '').localeCompare(b[sortConfig.key] || '')
        : (b[sortConfig.key] || '').localeCompare(a[sortConfig.key] || '');
    }
  }) : [];

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleComment = (user) => {
    setSelectedUser(user);
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
      setComment('');
      const updatedUsers = await onAllUsers();
      setUsers(updatedUsers.accounts);
      setSearchResults(updatedUsers.accounts.filter((user) => !user.enabled));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    try {
      setComment('');
      const updatedUsers = await onAllUsers();
      setUsers(updatedUsers.accounts);
      setSearchResults(updatedUsers.accounts.filter((user) => !user.enabled));
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

  const handleRoleChange = async(email, role) => {
    await onChangeAdminRole(email, role, comment)
      .then(() => {
        const updatedUsers = onAllUsers();
        setUsers(updatedUsers.accounts);
        setSearchResults(updatedUsers.accounts.filter((user) => !user.enabled));
        setIsFlyoutOpen(false);
      })
      .catch((e) => {
        console.error(e);
      });

  };

  const handlePasswordReset = (email) => {
    onForgetPasswordSubmit({ email })
  };

  return (
    <div className="pending-announcements-container">
      <h2>{t('admin.all_users')}</h2>
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
          <option value="email">{t('admin.email')}</option>
          <option value="date">{t('admin.creation_date')}</option>
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
      </div>
      <hr />
      <div className="pending-announcements-table-container">
        <table className="pending-announcements-table">
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
              <th onClick={() => requestSort('date')} className='registration-date-admin'>
                {t('admin.user_registration_date')}
                {sortConfig.key === 'date' ? (
                  sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'
                ) : null}
              </th>
              <th onClick={() => requestSort('status')}>
                {t('admin.status')}
                {sortConfig.key === 'status' ? (
                  sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'
                ) : null}
              </th>
              <th onClick={() => requestSort('ads')} className='ads-cell'>
                {t('profile.ads-statistic')}
                {sortConfig.key === 'ads' ? (
                  sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'
                ) : null}
              </th>
              <th>{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user, index) => (
              <tr key={user.email}>
                <td className="number-cell">{sortConfig.key === 'id' && sortConfig.direction === 'descending' ? sortedUsers.length - index : index + 1}</td>
                <td>
                  <Link to={`#`}>{user.email}</Link>
                </td>
                <td>{formatDate(user.createdAt)}</td>
                <td>{getStatus(user.enabled)}</td>
                <td>{user.ads?.length}</td>
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
                    onClick={() => handleReject(user.id)}
                  />
                  <img
                    src={'/icons/delete-button.svg'}
                    alt="delete"
                    className="comment-icon"
                    onClick={() => handleDelete(user.id)}
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
      <FlyoutUnfinished
        isOpen={isFlyoutOpen}
        onClose={handleFlyoutClose}
        user={selectedUser}
        handleRoleChange={handleRoleChange}
        handlePasswordReset={handlePasswordReset}
      />

    </div>
  );
};
