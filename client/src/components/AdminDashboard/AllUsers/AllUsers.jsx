import './allUsers.css';
import { useEffect, useState } from 'react';
import { LocalizedLink as Link } from '../../LocalizedLink/LocalizedLink';
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
  const [adminEmail, setAdminEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation('admin');
  const { onAllUsers } = useMappingContext();
  const { onForgetPasswordSubmit, onChangeAdminRole, profileData } = useAuthContext();
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);
  const { deleteUserData } = useAdminContext();
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
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
      } finally {
        setIsLoading(false);
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
    return enabled ? (
      <span className="status-badge status-active">{t('admin.finish')}</span>
    ) : (
      <span className="status-badge status-inactive">{t('admin.unfinish')}</span>
    );
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
      defaultComment = `${t('admin.from_admin',)} ${adminEmail}: ${t('admin.default_comment_banned')}`;
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
    <div className="users-dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">{t('admin.all_users')}</h2>
        <div className="dashboard-stats">
          <div className="stat-item">
            <span className="stat-value">{users.length}</span>
            <span className="stat-label">{t('admin.total_users')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{users.filter(u => u.enabled).length}</span>
            <span className="stat-label">{t('admin.active_users')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{users.filter(u => !u.enabled).length}</span>
            <span className="stat-label">{t('admin.inactive_users')}</span>
          </div>
        </div>
      </div>
      
      <div className="search-panel">
        <div className="search-input-group">
          <div className="search-icon-wrapper">
            <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <input
            type="text"
            placeholder={`${t('admin.search')}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input-allusers"
          />
          {searchTerm && (
            <button className="clear-search-allusers" onClick={resetFilters}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
        
        <div className="search-controls">
          <select
            value={searchCriteria}
            onChange={(e) => setSearchCriteria(e.target.value)}
            className="search-criteria-allusers"
          >
            <option value="email">{t('admin.email')}</option>
            <option value="date">{t('admin.creation_date')}</option>
          </select>
          
          <button onClick={handleSearch} className="search-button-allusers">
            {t('admin.search')}
          </button>
        </div>
      </div>
      
      <div className="legend-panel">
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

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t('admin.loading_users')}</p>
        </div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th className="number-column" onClick={toggleRowOrder}>
                  <div className="th-content">
                    <span>{t('admin.number')}</span>
                    <span className={`sort-icon ${rowOrder === 'ascending' ? 'asc' : 'desc'}`}>
                      {rowOrder === 'ascending' ? '↑' : '↓'}
                    </span>
                  </div>
                </th>
                <th className="email-column" onClick={() => requestSort('email')}>
                  <div className="th-content">
                    <span>{t('admin.user_email')}</span>
                    {sortConfig.key === 'email' && (
                      <span className={`sort-icon ${sortConfig.direction === 'ascending' ? 'asc' : 'desc'}`}>
                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="date-column" onClick={() => requestSort('date')}>
                  <div className="th-content">
                    <span>{t('admin.user_registration_date')}</span>
                    {sortConfig.key === 'date' && (
                      <span className={`sort-icon ${sortConfig.direction === 'ascending' ? 'asc' : 'desc'}`}>
                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="status-column" onClick={() => requestSort('status')}>
                  <div className="th-content">
                    <span>{t('admin.status')}</span>
                    {sortConfig.key === 'status' && (
                      <span className={`sort-icon ${sortConfig.direction === 'ascending' ? 'asc' : 'desc'}`}>
                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="ads-column" onClick={() => requestSort('ads')}>
                  <div className="th-content">
                    <span>{t('profile.ads-statistic')}</span>
                    {sortConfig.key === 'ads' && (
                      <span className={`sort-icon ${sortConfig.direction === 'ascending' ? 'asc' : 'desc'}`}>
                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="actions-column">
                  <div className="th-content">
                    <span>{t('admin.actions')}</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedByRowOrder.length > 0 ? (
                sortedByRowOrder.map((user, index) => (
                  <tr key={user.email} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                    <td className="number-cell">{index + 1}</td>
                    <td 
                      className="email-cell"
                      onClick={() => handleTextClick(user?.email)}
                    >
                      <span className="email-text">{trimString(user?.email, 20)}</span>
                    </td>
                    <td className="date-cell">{formatDate(user?.createdAt)}</td>
                    <td className="status-cell">{getStatus(user?.enabled)}</td>
                    <td className="ads-cell">
                      <span className="ads-count">{user?.ads?.length || 0}</span>
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons-allusers">
                        <button 
                          className="action-btn-allusers comment-btn"
                          onClick={() => handleComment(user)}
                          title={t('admin.comment')}
                        >
                          <img src={'/icons/comment.svg'} alt="Comment" />
                        </button>
                        <button 
                          className="action-btn-allusers settings-btn"
                          onClick={() => handleFlyoutOpen(user)}
                          title={t('admin.settings')}
                        >
                          <img src={'/icons/gears-icon.svg'} alt="Settings" />
                        </button>
                        <button 
                          className="action-btn-allusers ban-btn"
                          onClick={() => handleRoleChange(user.email, "guest")}
                          title={t('admin.ban')}
                        >
                          <img src={'/icons/denied.svg'} alt="Ban" />
                        </button>
                        <button 
                          className="action-btn-allusers delete-btn"
                          onClick={() => handleDelete(user.email)}
                          title={t('admin.delete')}
                        >
                          <img src={'/icons/delete-button.svg'} alt="Delete" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-results">
                    <div className="no-results-message">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      <p>{t('admin.no_results')}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      <CommentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitComment}
      >
        <h2>{t('admin.comment_on_user')}</h2>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows="5"
          cols="50"
          placeholder={t('admin.enter_comment')}
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
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={closeTextModal}>&times;</button>
            <div className="modal-body">
              <h3>{t('admin.full_email')}</h3>
              <p className="modal-text">{modalContent}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};