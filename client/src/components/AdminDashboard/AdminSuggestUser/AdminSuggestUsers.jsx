/* eslint-disable no-unused-vars */
import './adminSuggestUsers.css';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { notify } from '../../../utils/notify';
import { useSuggestUserContext } from '../../contexts/SuggestUserContext';
import { CommentModal } from '../PendingAnnouncements/CommentModal';

export const AdminSuggestUsers = ({ setAllSuggestedUsers }) => {
  const [users, setUsers] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'refferer_name', direction: 'ascending' });
  const [rowOrder, setRowOrder] = useState('ascending');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCriteria, setSearchCriteria] = useState('refferer_name');
  const [searchResults, setSearchResults] = useState([]);
  const { t } = useTranslation();
  const { getAllSuggested, getDeleteSuggest, onSuggestResolve } = useSuggestUserContext();
   const [modalContent, setModalContent] = useState('');
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  
  useEffect(() => {
    const loadUsers = async () => {
      const allUsers = await getAllSuggested();

      setUsers(allUsers);
      setAllSuggestedUsers(allUsers?.length);
      setSearchResults(allUsers);
    };
    loadUsers();
  }, []);

  const sortedUsers = Array.isArray(searchResults) ? [...searchResults].sort((a, b) => {
    if (sortConfig.key === 'refferer_name') {
      return sortConfig.direction === 'ascending'
        ? (a.refferer_name || '').localeCompare(b.refferer_name || '')
        : (b.refferer_name || '').localeCompare(a.refferer_name || '');
    } else if (sortConfig.key === 'name') {
      return sortConfig.direction === 'ascending'
        ? (a.name || '').localeCompare(b.name || '')
        : (b.name || '').localeCompare(a.name || '');
    } else if (sortConfig.key === 'phone_number') {
      return sortConfig.direction === 'ascending'
        ? (a.phone_number || '').localeCompare(b.phone_number || '')
        : (b.phone_number || '').localeCompare(a.phone_number || '');
    } else if (sortConfig.key === 'createdAt') {
      return sortConfig.direction === 'ascending'
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt);
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

  const handleDelete = async (id) => {
    try {

      await getDeleteSuggest(id);
      setComment('');
      const updatedUsers = await getAllSuggested();
      setUsers(updatedUsers);
      setSearchResults(updatedUsers);
    } catch (error) {
      console.error(error);
    }
  };
  const handleResolved = async (id) => {
    try {

      await onSuggestResolve(id);
      setComment('');
      const updatedUsers = await getAllSuggested();
      setUsers(updatedUsers);
      setSearchResults(updatedUsers);
    } catch (error) {
      console.error(error);
    }
  }
  const handleSearch = () => {
    const results = users.filter((user) => {
      if (searchCriteria === 'refferer_name') {
        return (user.refferer_name || '').toLowerCase().includes(searchTerm.toLowerCase());
      } else if (searchCriteria === 'name') {
        return (user.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      } else if (searchCriteria === 'phone_number') {
        return (user.phone_number || '').includes(searchTerm);
      }
      return false;
    });
    setSearchResults(results);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSearchCriteria('refferer_name');
    setSearchResults(users);
  };
  const truncateText = (text) => {
    if (!text) return 'N/A';
    return text.length > 15 ? text.substring(0, 10) + '...' : text;
  };

  const handleTextClick = (text) => {
    setModalContent(text);
    setIsTextModalOpen(true);
  };

  const closeTextModal = () => {
    setIsTextModalOpen(false);
    setModalContent('');
  }
  return (
    <div className="admin-suggestUsers-container">
      <h2>{t('admin.all_suggested_users')}</h2>
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
          <option value="refferer_name">{t('admin.recommended_by')}</option>
          <option value="name">{t('admin.recommended_person')}</option>
          <option value="phone_number">{t('admin.phone')}</option>
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
          <img src={'/icons/resolved.svg'} alt="Comment" className="legend-icon" />
          <span>{t('admin.resolved')}</span>
        </div>
        <div className="legend-item">
          <img src={'/icons/delete-button.svg'} alt="delete" className="legend-icon" />
          <span>{t('admin.delete')}</span>
        </div>
        <div className="legend-item">
          <img src={'/icons/comment.svg'} alt="Comment" className="legend-icon" />
          <span>{t('admin.comment')}</span>
        </div>
      </div>
      <hr />
      <div className="suggestUsers-container-table-container">
        <table className="suggestUsers-container-table">
          <thead>
            <tr>
              <th className="number-cell" onClick={toggleRowOrder}>
                {t('admin.number')}
                {rowOrder === 'ascending' ? ' ↑' : ' ↓'}
              </th>
              <th onClick={() => requestSort('refferer_name')} className='recommended-by'>
                {t('admin.recommended_by')}
                {sortConfig.key === 'refferer_name' ? (
                  sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'
                ) : null}
              </th>
              <th onClick={() => requestSort('name')} className='recommended-name'>
                {t('admin.recommended_person')}
                {sortConfig.key === 'name' ? (
                  sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'
                ) : null}
              </th>
              <th onClick={() => requestSort('phone_number')} className='recommended-phone'>
                {t('admin.phone')}
                {sortConfig.key === 'phone_number' ? (
                  sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'
                ) : null}
              </th>
              <th className='message-suggest-all'>{t('admin.message')}</th>
              <th>{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {sortedByRowOrder.map((user, index) => (
              <tr key={user.id}>
                <td className="number-cell">{index + 1}</td>
                <td>
                  <Link to={`#`}>{user.refferer_name || 'N/A'}</Link>
                </td>
                <td>{user.name || 'N/A'}</td>
                <td>{user.phone_number || 'N/A'}</td>
                <td>
                  <span onClick={() => handleTextClick(user.message)} className="clickable-text">
                    {truncateText(user.message)}
                  </span>
                </td>
                <td className="actions-admin-suggestUsers">
                  <img
                    src={'/icons/resolved.svg'}
                    alt="approved"
                    className="comment-icon-suggestUsers "
                    onClick={() => handleResolved(user.id)}
                  />
                  <img
                    src={'/icons/comment.svg'}
                    alt="Comment"
                    className="comment-icon-suggestUsers"
                    onClick={() => handleComment(user)}
                  />

                  <img
                    src={'/icons/delete-button.svg'}
                    alt="delete"
                    className="comment-icon-suggestUsers "
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
      {isTextModalOpen && (
        <div className="text-modal-overlay">
          <div className="text-modal-content">
            <span className="close-button" onClick={closeTextModal}>&times;</span>
            <p>{modalContent}</p>
          </div>
        </div>
      )}
    </div>
  );
};
