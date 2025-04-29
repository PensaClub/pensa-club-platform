import { useEffect, useState } from 'react';
import './flyoutAllUsers.css';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export const FlyoutAllUsers = ({ isOpen, onClose, user, handleRoleChange, handlePasswordReset }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [role, setRole] = useState('');
    const [originalRole, setOriginalRole] = useState('');
    const { t } = useTranslation();

    useEffect(() => {
        if (user && user.details && user.details.imageURL) {
            setSelectedImage(user.details.imageURL);
        } else {
            setSelectedImage('/images/homePage/avatar2.png');
        }
        if (user) {
            setRole(user.role);
            setOriginalRole(user.role);
        }
    }, [user]);

    const onRoleChangeSubmit = () => {
        handleRoleChange(user.email, role);
    };

    const handlePasswordResetClick = () => {
        handlePasswordReset(user.email);
    };

    const getStatus = (enabled) => {
        return enabled ? (
            <span className="status-badge-flyout status-active">{t('admin.finish')}</span>
        ) : (
            <span className="status-badge-flyout status-inactive">{t('admin.unfinish')}</span>
        );
    };

    const onRoleChange = (e) => {
        setRole(e.target.value);
    };

    const isRoleChanged = role !== originalRole;

    return (
        <>
            <div className={`flyout-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
            <div className={`flyout-panel ${isOpen ? 'open' : ''}`}>
                <div className="flyout-header">
                    <h3>{t('admin.user_details')}</h3>
                    <button className="flyout-close" onClick={onClose}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {user ? (
                    <div className="flyout-content">
                        <div className="user-profile-card">
                            <div className="user-avatar">
                                <img src={selectedImage} alt={user.email} />
                            </div>
                            <h4 className="user-email">{user.email}</h4>
                            <div className="user-status">
                                {getStatus(user.enabled)}
                            </div>
                        </div>

                        <div className="user-details-section">
                            <h5 className="section-title">{t('admin.personal_information')}</h5>
                            <div className="details-grid">
                                {user.details && (
                                    <>
                                        <div className="detail-item">
                                            <span className="detail-label">{t('admin.first_name')}</span>
                                            <span className="detail-value">{user.details.firstName || '-'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">{t('admin.last_name')}</span>
                                            <span className="detail-value">{user.details.lastName || '-'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">{t('admin.phone_number')}</span>
                                            <span className="detail-value">{user.details.phoneNumber || '-'}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="user-details-section">
                            <h5 className="section-title">{t('admin.location')}</h5>
                            <div className="details-grid">
                                {user.details && (
                                    <>
                                        <div className="detail-item">
                                            <span className="detail-label">{t('admin.region')}</span>
                                            <span className="detail-value">{user.details.region || '-'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">{t('admin.municipality')}</span>
                                            <span className="detail-value">{user.details.municipality || '-'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">{t('admin.settlement')}</span>
                                            <span className="detail-value">{user.details.settlement || '-'}</span>
                                        </div>
                                        <div className="detail-item full-width">
                                            <span className="detail-label">{t('admin.address')}</span>
                                            <span className="detail-value">
                                                {user.details.street} {user.details.street_number}
                                                {user.details.block && <>, {user.details.block}</>}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>

                            {user.details && user.details.location && (
                                <div className="user-map">
                                    <MapContainer center={[user.details.location.lat, user.details.location.lon]} zoom={13} style={{ height: '250px', width: '100%' }}>
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        />
                                        <Marker position={[user.details.location.lat, user.details.location.lon]} />
                                    </MapContainer>
                                </div>
                            )}
                        </div>

                        <div className="user-actions-section">
                            <div className="roles-control">
                                <h5 className="section-title">{t('admin.user_role')}</h5>
                                <div className="role-options">
                                    <label className={`role-option ${role === 'limited' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="role"
                                            value="limited"
                                            checked={role === 'limited'}
                                            onChange={onRoleChange}
                                        />
                                        <div className="role-icon limited-role">
                                            <svg
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <rect
                                                    x="3"
                                                    y="5"
                                                    width="18"
                                                    height="14"
                                                    rx="2"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    fill="none"
                                                />
                                                <path
                                                    d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeDasharray="2 2"
                                                />
                                                <path
                                                    d="M16 8H19"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                />
                                                <path
                                                    d="M16 16H19"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                        </div>
                                        <span>{t('admin.role_limited')}</span>
                                    </label>
                                    <label className={`role-option ${role === 'user' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="role"
                                            value="user"
                                            checked={role === 'user'}
                                            onChange={onRoleChange}
                                        />
                                        <div className="role-icon user-role">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                                <circle cx="12" cy="7" r="4"></circle>
                                            </svg>
                                        </div>
                                        <span>{t('admin.role_user')}</span>
                                    </label>
                                    <label className={`role-option ${role === 'moderator' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="role"
                                            value="moderator"
                                            checked={role === 'moderator'}
                                            onChange={onRoleChange}
                                        />
                                        <div className="role-icon moderator-role">
                                            <svg
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M12 3L4 7V12C4 16.42 7.36 20.44 12 21C16.64 20.44 20 16.42 20 12V7L12 3Z"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    fill="none"
                                                />
                                                <path
                                                    d="M12 8L13.25 10.55L16 11L14 13L14.5 15.5L12 14.25L9.5 15.5L10 13L8 11L10.75 10.55L12 8Z"
                                                    fill="currentColor"
                                                />
                                            </svg>
                                        </div>
                                        <span>{t('admin.role_moderator')}</span>
                                    </label>
                                    <label className={`role-option ${role === 'admin' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="role"
                                            value="admin"
                                            checked={role === 'admin'}
                                            onChange={onRoleChange}
                                        />
                                        <div className="role-icon admin-role">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M12 2 2 7l10 5 10-5-10-5z"></path>
                                                <path d="M2 17l10 5 10-5"></path>
                                                <path d="M2 12l10 5 10-5"></path>
                                            </svg>
                                        </div>
                                        <span>{t('admin.role_admin')}</span>
                                    </label>
                                </div>
                            </div>

                            <div className="password-reset-control">
                                <h5 className="section-title">{t('admin.password_management')}</h5>
                                <button className="reset-password-button" onClick={handlePasswordResetClick}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                    {t('admin.reset_password')}
                                </button>
                            </div>
                        </div>

                        <div className="flyout-footer">
                            <button
                                className="save-changes-btn"
                                disabled={!isRoleChanged}
                                onClick={onRoleChangeSubmit}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                    <polyline points="7 3 7 8 15 8"></polyline>
                                </svg>
                                {t('admin.save_changes')}
                            </button>

                            <button className="cancel-btn" onClick={onClose}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                                {t('admin.cancel')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flyout-empty-state">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <p>{t('admin.no_user_details')}</p>
                        <button className="close-flyout-btn" onClick={onClose}>
                            {t('admin.close')}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};