import { useEffect, useState } from 'react';
import './flyoutUnfinished.css';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons';

export const FlyoutUnfinished = ({ isOpen, onClose, user, handleRoleChange, handlePasswordReset }) => {
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
        return enabled ? t('admin.finish') : t('admin.unfinish');
    };

    const onRoleChange = (e) => {
        setRole(e.target.value);
    };

    const isRoleChanged = role !== originalRole;

    return (
        <div className={`flyout-container ${isOpen ? 'open' : ''}`}>
            <div className="flyout-header">
                <h3>{t('admin.user_details')}</h3>
                <button className="flyout-close" onClick={onClose}>&times;</button>
            </div>
            {user ? (
                <div className="flyout-body">
                    <div className="flyout-desc">
                        <h4>{user? user.email : t('admin.no_username')}</h4>
                        <div className="flyout-preview">
                            <img src={selectedImage} alt="User" />
                        </div>
                        <div className="info-flyout">
                            <p><strong>{t('admin.email')}:</strong> {user.email}</p>
                            {user.details && (
                                <>
                                    <p><strong>{t('admin.phone_number')}:</strong> {user.details.phoneNumber}</p>
                                    <p><strong>{t('admin.first_name')}:</strong> {user.details.firstName}</p>
                                    <p><strong>{t('admin.last_name')}:</strong> {user.details.lastName}</p>
                                    <p><strong>{t('admin.region')}:</strong> {user.details.region}</p>
                                    <p><strong>{t('admin.municipality')}:</strong> {user.details.municipality}</p>
                                    <p><strong>{t('admin.settlement')}:</strong> {user.details.settlement}</p>
                                    <p><strong>{t('admin.address')}:</strong> {user.details.street} {user.details.street_number} {user.details.block &&(<>, {user.details.block}</>)}</p>
                                </>
                            )}
                            <p><strong>{t('admin.status')}:</strong> {getStatus(user.enabled)}</p>
                            <div className="role-flyout">
                                <p><strong>{t('admin.role')}:</strong></p>
                                <label>
                                    <input
                                        type="radio"
                                        value="user"
                                        checked={role === 'user'}
                                        onChange={onRoleChange}
                                    />
                                    {t('admin.role_user')}
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        value="admin"
                                        checked={role === 'admin'}
                                        onChange={onRoleChange}
                                    />
                                    {t('admin.role_admin')}
                                </label>
                            </div>
                            <div className="reset-password-flyout">
                                <p><strong>{t('admin.password')}:</strong></p>
                                <button onClick={handlePasswordResetClick}>{t('admin.reset_password')}</button>
                            </div>
                            {user.details && user.details.location && (
                                <div className="location-flyout">
                                    <MapContainer center={[user.details.location.lat, user.details.location.lon]} zoom={13} style={{ height: '300px', width: '100%' }}>
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        />
                                        <Marker position={[user.details.location.lat, user.details.location.lon]} />
                                    </MapContainer>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flyout-buttons">
                        <button className="flyout-save" onClick={onRoleChangeSubmit} disabled={!isRoleChanged}>
                            {t('admin.save')}
                        </button>
                        <button className="flyout-back" onClick={onClose}>
                            <FontAwesomeIcon icon={faArrowRotateLeft} /> {t('admin.back')}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flyout-body">
                    <p>{t('admin.no_user_details')}</p>
                </div>
            )}
        </div>
    );
};
