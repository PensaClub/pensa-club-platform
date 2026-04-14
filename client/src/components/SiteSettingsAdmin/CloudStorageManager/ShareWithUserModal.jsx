import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Search, Check, Send, User, Folder, FileArchive } from 'lucide-react';
import { useStorage } from '../../contexts/StorageProvider';
import './shareWithUserModal.css';

const ShareWithUserModal = ({ filePath, fileName, onClose }) => {
    const { t } = useTranslation('admin');
    const { searchUsers, shareWithUser } = useStorage();
    const searchTimeoutRef = useRef(null);
    // Detect folder by trailing slash
    const isFolder = filePath?.endsWith('/');

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState('');
    const [sharing, setSharing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = useCallback(async (q) => {
        if (!q || q.length < 2) {
            setSearchResults([]);
            return;
        }
        setSearching(true);
        try {
            const data = await searchUsers(q);
            setSearchResults(data.users || []);
        } catch {
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    }, []);

    useEffect(() => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => {
            handleSearch(searchQuery);
        }, 300);
        return () => clearTimeout(searchTimeoutRef.current);
    }, [searchQuery, handleSearch]);

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleShare = async () => {
        if (!selectedUser) return;
        setSharing(true);
        setError('');
        try {
            await shareWithUser({
                filePath,
                fileName,
                sharedWithUserId: selectedUser.id,
                message: message || undefined,
            });
            setSuccess(true);
        } catch (err) {
            setError(err?.message || err?.error || t('cloudStorage.shareWithUserError', 'Error sharing file'));
        } finally {
            setSharing(false);
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    const getUserDisplayName = (user) => {
        if (user.firstName || user.lastName) {
            return `${user.firstName || ''} ${user.lastName || ''}`.trim();
        }
        return user.email;
    };

    return (
        <div className="csm-share-modal" onClick={handleOverlayClick}>
            <div className="csm-share-user-content">
                <div className="csm-share-user-header">
                    <h4>{isFolder ? t('cloudStorage.shareFolderWithUser', 'Сподели папка с потребител') : t('cloudStorage.shareWithUser', 'Сподели с потребител')}</h4>
                    <button className="csm-share-user-close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <p className="csm-share-filename">
                    {isFolder ? <Folder size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> : null}
                    {fileName}
                </p>
                {isFolder && (
                    <div className="csm-share-folder-notice">
                        <FileArchive size={14} />
                        <span>{t('cloudStorage.folderZipNotice', 'Цялата папка ще бъде свалена като ZIP архив (включително всички файлове в подпапките)')}</span>
                    </div>
                )}

                {!success ? (
                    <>
                        {/* Selected user chip */}
                        {selectedUser ? (
                            <div className="csm-share-user-selected">
                                <div className="csm-share-user-chip">
                                    {selectedUser.imageURL ? (
                                        <img
                                            src={selectedUser.imageURL}
                                            alt=""
                                            className="csm-share-user-avatar"
                                        />
                                    ) : (
                                        <div className="csm-share-user-avatar-placeholder">
                                            <User size={14} />
                                        </div>
                                    )}
                                    <span>{getUserDisplayName(selectedUser)}</span>
                                    <span className="csm-share-user-email">{selectedUser.email}</span>
                                    <button
                                        className="csm-share-user-remove"
                                        onClick={() => setSelectedUser(null)}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Search input */
                            <div className="csm-share-user-search-wrap">
                                <Search size={14} className="csm-share-user-search-icon" />
                                <input
                                    type="text"
                                    className="csm-share-user-search"
                                    placeholder={t('cloudStorage.searchUser', 'Търси потребител...')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                />
                                {searching && <span className="csm-share-user-searching">...</span>}

                                {/* Search results dropdown */}
                                {searchResults.length > 0 && (
                                    <div className="csm-share-user-dropdown">
                                        {searchResults.map(user => (
                                            <button
                                                key={user.id}
                                                className="csm-share-user-option"
                                                onClick={() => handleSelectUser(user)}
                                            >
                                                {user.imageURL ? (
                                                    <img
                                                        src={user.imageURL}
                                                        alt=""
                                                        className="csm-share-user-avatar"
                                                    />
                                                ) : (
                                                    <div className="csm-share-user-avatar-placeholder">
                                                        <User size={14} />
                                                    </div>
                                                )}
                                                <div className="csm-share-user-info">
                                                    <span className="csm-share-user-name">
                                                        {getUserDisplayName(user)}
                                                    </span>
                                                    <span className="csm-share-user-email">
                                                        {user.email}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Optional message */}
                        <textarea
                            className="csm-share-user-message"
                            placeholder={t('cloudStorage.optionalMessage', 'Съобщение (незадължително)')}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={3}
                        />

                        {error && (
                            <p className="csm-share-user-error">{error}</p>
                        )}

                        {/* Actions */}
                        <div className="csm-share-actions">
                            <button className="csm-btn" onClick={onClose}>
                                <X size={14} />
                                <span>{t('cloudStorage.cancel')}</span>
                            </button>
                            <button
                                className="csm-btn csm-btn--primary"
                                onClick={handleShare}
                                disabled={!selectedUser || sharing}
                            >
                                <Send size={14} />
                                <span>{sharing ? '...' : t('cloudStorage.shareWithUser', 'Сподели')}</span>
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="csm-share-user-success">
                            <Check size={24} />
                            <p>
                                {t('cloudStorage.shareSuccess', 'Файлът е споделен')}
                                {selectedUser && (
                                    <span> {t('cloudStorage.with', 'с')} <strong>{getUserDisplayName(selectedUser)}</strong></span>
                                )}
                            </p>
                        </div>
                        <div className="csm-share-actions">
                            <button className="csm-btn" onClick={onClose}>
                                <X size={14} />
                                <span>{t('cloudStorage.close', 'Затвори')}</span>
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ShareWithUserModal;
