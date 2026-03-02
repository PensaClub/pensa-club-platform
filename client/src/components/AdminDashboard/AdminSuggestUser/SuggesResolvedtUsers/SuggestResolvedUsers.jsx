/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { LocalizedLink as Link } from '../../../LocalizedLink/LocalizedLink';
import './suggestResolvedUsers.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useSuggestUserContext } from '../../../contexts/SuggestUserContext';
import { ResolvedComments } from './ResolvedComments';

export const SuggestResolvedUsers = ({ setResolvedUsers }) => {
    const [users, setUsers] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: 'refferer_name', direction: 'ascending' });
    const [rowOrder, setRowOrder] = useState('ascending');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [comment, setComment] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchCriteria, setSearchCriteria] = useState('refferer_name');
    const [searchResults, setSearchResults] = useState([]);
    const { t } = useTranslation(['auth', 'admin']);
    const { getAllResolve, getDeleteSuggest, onCreateComment } = useSuggestUserContext();
    const [modalContent, setModalContent] = useState('');
    const [isTextModalOpen, setIsTextModalOpen] = useState(false);
    const [comments, setComments] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadUsers = async () => {
            const allUsers = await getAllResolve();

            const formattedUsers = allUsers.map(user => ({
                ...user,
                comments: user.comments.map(comment => ({
                    ...comment,
                    date: formatDate(comment.date),
                })).sort((a, b) => new Date(b.date) - new Date(a.date))
            }));

            setUsers(formattedUsers);
            setResolvedUsers(formattedUsers?.length);
            setSearchResults(formattedUsers);
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
        setComments(user?.comments || []);
        setIsModalOpen(true);
    };

    const formatDate = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    };

    const handleSubmitComment = async () => {
        if (!comment.trim()) {
          setError(t('user-suggestion.empty_comment_error')); 
          return;
        }
      
        try {
          const newComment = await onCreateComment({ userId: selectedUser.id, comment });
          const formattedDate = formatDate(new Date());
          setComments([{ date: formattedDate, comment }, ...comments]);
          setComment('');
          setError(''); 
        } catch (error) {
          console.error(error);
        }
      };
      
    const handleDelete = async (id) => {
        try {
            await getDeleteSuggest(id);
            setComment('');
            const updatedUsers = await getAllResolve();

            const formattedUsers = updatedUsers.map(user => ({
                ...user,
                comments: user?.comments.map(comment => ({
                    ...comment,
                    date: formatDate(comment.date),
                })).sort((a, b) => new Date(b.date) - new Date(a.date))
            }));
            setUsers(formattedUsers);
            setSearchResults(formattedUsers);
        } catch (error) {
            console.error(error);
        }
    };

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
        return text.length > 10 ? text.substring(0, 10) + '...' : text;
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
        <div className="admin-suggestUsers-container">
            <h2>{t('admin.approved-suggested_users')}</h2>
            <div className="search-container-suggestUsers">
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
                    <div className="reset-icon-container">
                        <FontAwesomeIcon
                            icon={faArrowRotateLeft}
                            className="reset-icon-suggestUsers"
                            onClick={resetFilters}
                        />
                        <span className="reset-text-suggestUsers" onClick={resetFilters}>{t('admin_messages.search_clear')}</span>
                    </div>
                )}
            </div>
            <hr />
            <div className="legend-container">
                <div className="legend-item">
                    <img src={'/icons/resolved.svg'} alt="Resolved" className="legend-icon" />
                    <span>{t('admin.resolved')}</span>
                </div>
                <div className="legend-item">
                    <img src={'/icons/delete-button.svg'} alt="Delete" className="legend-icon" />
                    <span>{t('admin.delete')}</span>
                </div>
                <div className="legend-item">
                    <img src={'/icons/comment.svg'} alt="Comment" className="legend-icon" />
                    <span>{t('admin.comment')}</span>
                </div>
                <div className="legend-item">
                    <img src={'/icons/suggestion.svg'} alt="Suggested By" className="legend-icon" />
                    <span>{t('admin.recommended_by')}</span>
                </div>
                <div className="legend-item">
                    <img src={'/icons/nominee.svg'} alt="Nominee" className="legend-icon" />
                    <span>{t('admin.recommended_person')}</span>
                </div>
                <div className="legend-item">
                    <img src={'/icons/phone.svg'} alt="Phone" className="legend-icon" />
                    <span>{t('admin.phone')}</span>
                </div>
                <div className="legend-item">
                    <img src={'/icons/messages.svg'} alt="Messages" className="legend-icon" />
                    <span>{t('admin.message')}</span>
                </div>
                <div className="legend-item">
                    <img src={'/icons/actions.svg'} alt="Actions" className="legend-icon" />
                    <span>{t('admin.actions')}</span>
                </div>
            </div>

            <hr />
            <div className="suggestUsers-container-table-container">
                <table className="suggestUsers-container-table">
                    <thead>
                        <tr>
                            <th className="number-cell" onClick={toggleRowOrder}>
                                <span>{t('admin.number')}</span>
                                <img src="/icons/number.svg" alt="Number" className="table-icon" />
                                {rowOrder === 'ascending' ? ' ↑' : ' ↓'}
                            </th>
                            <th onClick={() => requestSort('refferer_name')} className='recommended-by'>
                                <span>{t('admin.recommended_by')}</span>
                                <img src="/icons/nominee.svg" alt="Refferer" className="table-icon" />
                                {sortConfig.key === 'refferer_name' ? (
                                    sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'
                                ) : null}
                            </th>
                            <th onClick={() => requestSort('name')} className='recommended-name'>
                                <span>{t('admin.recommended_person')}</span>
                                <img src="/icons/suggestion.svg" alt="Name" className="table-icon" />
                                {sortConfig.key === 'name' ? (
                                    sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'
                                ) : null}
                            </th>
                            <th onClick={() => requestSort('phone_number')} className='recommended-phone'>
                                <span>{t('admin.phone')}</span>
                                <img src="/icons/phone.svg" alt="Phone" className="table-icon" />
                                {sortConfig.key === 'phone_number' ? (
                                    sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'
                                ) : null}
                            </th>
                            <th className='message-suggest-all'>
                                <span>{t('admin.message')}</span>
                                <img src="/icons/messages.svg" alt="Messages" className="table-icon" />
                            </th>
                            <th>
                                <span>{t('admin.actions')}</span>
                                <img src="/icons/actions.svg" alt="Actions" className="table-icon" />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedByRowOrder.map((user, index) => (
                            <tr key={user.id}>
                                <td className="number-cell">{index + 1}</td>
                                <td>
                                    <Link to={`#`}>{user.refferer_name || 'N/A'}</Link>
                                </td>
                                <td className='resolved-name-td'>{user.name || 'N/A'}</td>
                                <td>{user.phone_number || 'N/A'}</td>
                                <td>
                                    <span onClick={() => handleTextClick(user.message)} className="clickable-text">
                                        {truncateText(user.message)}
                                    </span>
                                </td>
                                <td className="actions-admin-suggestUsers">
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
            <ResolvedComments
                isOpen={isModalOpen}
                onClose={() => {setIsModalOpen(false); 
                    setError(''); }}
                onSubmit={handleSubmitComment}
                comments={comments}
                comment={comment}
                setComment={setComment}
                error={error}
                setError={setError}
            >
                <h2>{t('admin.user_comment')}</h2>
            </ResolvedComments>
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
