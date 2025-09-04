import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faEye, 
    faEdit, 
    faTrash, 
    faUsers, 
    faMapMarkerAlt,
    faSpinner,
    faExclamationTriangle,
    faCheck,
    faTimes,
    faCrown,
    faEnvelope,
    faCalendarAlt,
    faToggleOn,
    faToggleOff,
    faShield,
    faInfo, // ДОБАВЕНО
    faUser,
    faPhone
} from '@fortawesome/free-solid-svg-icons';
import './adminClubCard.css';

const AdminClubCard = ({ 
    club, 
    isSelected, 
    onSelect, 
    onStatusChange, 
    onVerify, 
    onApprove, 
    onReject, 
    onOpenModal 
}) => {
    const { t } = useTranslation();
    const [isProcessing, setIsProcessing] = useState(false);
    const [showStatusMenu, setShowStatusMenu] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false); // ДОБАВЕНО
    const [rejectReason, setRejectReason] = useState('');

    // Status configuration
    const statusConfig = {
        active: { color: '#10b981', bgColor: '#ecfdf5', label: t('adminClubCard.status.active') },
        inactive: { color: '#f59e0b', bgColor: '#fffbeb', label: t('adminClubCard.status.inactive') },
        draft: { color: '#6b7280', bgColor: '#f9fafb', label: t('adminClubCard.status.draft') },
        suspended: { color: '#ef4444', bgColor: '#fef2f2', label: t('adminClubCard.status.suspended') },
        rejected: { color: '#dc2626', bgColor: '#fef2f2', label: t('adminClubCard.status.rejected') }
    };

    const handleStatusChange = async (newStatus) => {
        setIsProcessing(true);
        setShowStatusMenu(false);
        
        try {
            await onStatusChange(club, newStatus);
        } catch (error) {
            console.error('Error changing status:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleVerify = async () => {
        setIsProcessing(true);
        try {
            await onVerify(club);
        } catch (error) {
            console.error('Error verifying club:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleApprove = async () => {
        setIsProcessing(true);
        try {
            await onApprove(club);
        } catch (error) {
            console.error('Error approving club:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) return;
        
        setIsProcessing(true);
        try {
            await onReject(rejectReason);
            setShowRejectModal(false);
            setRejectReason('');
        } catch (error) {
            console.error('Error rejecting club:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleViewClub = () => {
        window.open(`/clubs/${club.slug}`, '_blank');
    };

    const handleEditClub = () => {
        window.open(`/profile/club-create?editId=${club.id}&mode=edit`, '_blank');
    };

    // ДОБАВЕНА ФУНКЦИЯ
    const handleInfoClick = (e) => {
        e.stopPropagation();
        setShowInfoModal(true);
    };

    const formatDate = (date) => {
        if (!date) return t('adminClubCard.noDate');
        return new Date(date).toLocaleDateString('bg-BG', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric'
        });
    };

    const currentStatus = statusConfig[club.status] || statusConfig.draft;

    return (
        <>
            <div className={`adminclubcard-wrapper ${isSelected ? 'selected' : ''}`}>
                <div className="adminclubcard-container">
                    {/* Selection Checkbox */}
                    <div className="adminclubcard-selection">
                        <label className="adminclubcard-checkbox">
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => onSelect(e.target.checked)}
                                disabled={isProcessing}
                            />
                            <span className="adminclubcard-checkmark"></span>
                        </label>
                    </div>

                    {/* Header with image and quick actions */}
                    <div className="adminclubcard-header">
                        <img
                            src={club.mainImage || club.logo || '/images/placeholder-club.jpg'}
                            alt={club.name}
                            className="adminclubcard-image"
                            onError={(e) => {
                                e.target.src = '/images/placeholder-club.jpg';
                            }}
                        />
                        
                        {/* Verification Badge */}
                        {club.metadata?.isVerified && (
                            <div className="adminclubcard-verified-badge" title={t('adminClubCard.verified')}>
                                <FontAwesomeIcon icon={faShield} />
                            </div>
                        )}

                        {/* Quick Actions Overlay */}
                        <div className="adminclubcard-overlay">
                            <div className="adminclubcard-quick-actions">
                                {/* ДОБАВЕН INFO БУТОН */}
                                <button
                                    className="adminclubcard-action-btn adminclubcard-action-btn--info"
                                    onClick={handleInfoClick}
                                    title={t('adminClubCard.actions.info')}
                                    disabled={isProcessing}
                                >
                                    <FontAwesomeIcon icon={faInfo} />
                                </button>

                                <button
                                    className="adminclubcard-action-btn adminclubcard-action-btn--view"
                                    onClick={handleViewClub}
                                    title={t('adminClubCard.actions.view')}
                                    disabled={isProcessing}
                                >
                                    <FontAwesomeIcon icon={faEye} />
                                </button>
                                
                                <button
                                    className="adminclubcard-action-btn adminclubcard-action-btn--edit"
                                    onClick={handleEditClub}
                                    title={t('adminClubCard.actions.edit')}
                                    disabled={isProcessing}
                                >
                                    <FontAwesomeIcon icon={faEdit} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="adminclubcard-content">
                        {/* Title and Status */}
                        <div className="adminclubcard-title-section">
                            <h3 className="adminclubcard-title" title={club.name}>
                                {club.name}
                            </h3>
                            
                            <div className="adminclubcard-status-section">
                                <div 
                                    className="adminclubcard-status-badge"
                                    style={{ 
                                        backgroundColor: currentStatus.bgColor,
                                        color: currentStatus.color 
                                    }}
                                >
                                    {currentStatus.label}
                                </div>
                                
                                <div className="adminclubcard-status-dropdown">
                                    <button 
                                        className="adminclubcard-status-toggle"
                                        onClick={() => setShowStatusMenu(!showStatusMenu)}
                                        disabled={isProcessing}
                                        title={t('adminClubCard.actions.changeStatus')}
                                    >
                                        <FontAwesomeIcon icon={showStatusMenu ? faToggleOn : faToggleOff} />
                                    </button>
                                    
                                    {showStatusMenu && (
                                        <div className="adminclubcard-status-menu">
                                            {Object.entries(statusConfig).map(([status, config]) => (
                                                <button
                                                    key={status}
                                                    className="adminclubcard-status-option"
                                                    onClick={() => handleStatusChange(status)}
                                                    disabled={club.status === status}
                                                >
                                                    <span 
                                                        className="adminclubcard-status-dot"
                                                        style={{ backgroundColor: config.color }}
                                                    ></span>
                                                    {config.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="adminclubcard-description">
                            {club.shortDescription || t('adminClubCard.noDescription')}
                        </p>
                        
                        {/* Meta Information */}
                        <div className="adminclubcard-meta">
                            <div className="adminclubcard-meta-row">
                                <div className="adminclubcard-meta-item">
                                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                                    <span>{club.location?.city || t('adminClubCard.noLocation')}</span>
                                </div>
                                
                                <div className="adminclubcard-meta-item">
                                    <FontAwesomeIcon icon={faUsers} />
                                    <span>{club.membership?.totalMembers || 0} {t('adminClubCard.members')}</span>
                                </div>
                            </div>

                            <div className="adminclubcard-meta-row">
                                <div className="adminclubcard-meta-item">
                                    <FontAwesomeIcon icon={faEnvelope} />
                                    <span className="adminclubcard-owner-email">
                                        {club.owner || t('adminClubCard.noOwner')}
                                    </span>
                                </div>
                            </div>

                            <div className="adminclubcard-meta-row">
                                <div className="adminclubcard-meta-item">
                                    <FontAwesomeIcon icon={faCalendarAlt} />
                                    <span>{t('adminClubCard.created')}: {formatDate(club.metadata?.createdAt || club.createdAt)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Admin Actions */}
                        <div className="adminclubcard-admin-actions">
                            {!club.metadata?.isVerified && (
                                <button
                                    className="adminclubcard-admin-btn adminclubcard-admin-btn--verify"
                                    onClick={handleVerify}
                                    disabled={isProcessing}
                                    title={t('adminClubCard.actions.verify')}
                                >
                                    {isProcessing ? (
                                        <FontAwesomeIcon icon={faSpinner} spin />
                                    ) : (
                                        <FontAwesomeIcon icon={faShield} />
                                    )}
                                    <span>{t('adminClubCard.actions.verify')}</span>
                                </button>
                            )}

                            {(club.status === 'draft' || club.status === 'inactive') && (
                                <button
                                    className="adminclubcard-admin-btn adminclubcard-admin-btn--approve"
                                    onClick={handleApprove}
                                    disabled={isProcessing}
                                    title={t('adminClubCard.actions.approve')}
                                >
                                    {isProcessing ? (
                                        <FontAwesomeIcon icon={faSpinner} spin />
                                    ) : (
                                        <FontAwesomeIcon icon={faCheck} />
                                    )}
                                    <span>{t('adminClubCard.actions.approve')}</span>
                                </button>
                            )}

                            {club.status !== 'rejected' && (
                                <button
                                    className="adminclubcard-admin-btn adminclubcard-admin-btn--reject"
                                    onClick={() => setShowRejectModal(true)}
                                    disabled={isProcessing}
                                    title={t('adminClubCard.actions.reject')}
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                    <span>{t('adminClubCard.actions.reject')}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="adminclubcard-modal-overlay">
                    <div className="adminclubcard-modal">
                        <div className="adminclubcard-modal-header">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="adminclubcard-modal-icon" />
                            <h3>{t('adminClubCard.rejectModal.title')}</h3>
                        </div>
                        
                        <div className="adminclubcard-modal-body">
                            <p>{t('adminClubCard.rejectModal.description', { clubName: club.name })}</p>
                            
                            <div className="adminclubcard-form-group">
                                <label>{t('adminClubCard.rejectModal.reasonLabel')}</label>
                                <textarea
                                    className="adminclubcard-textarea"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder={t('adminClubCard.rejectModal.reasonPlaceholder')}
                                    rows="4"
                                    disabled={isProcessing}
                                />
                            </div>
                        </div>
                        
                        <div className="adminclubcard-modal-footer">
                            <button 
                                className="adminclubcard-modal-btn adminclubcard-modal-btn--cancel"
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectReason('');
                                }}
                                disabled={isProcessing}
                            >
                                {t('adminClubCard.rejectModal.cancel')}
                            </button>
                            
                            <button 
                                className="adminclubcard-modal-btn adminclubcard-modal-btn--reject"
                                onClick={handleReject}
                                disabled={isProcessing || !rejectReason.trim()}
                            >
                                {isProcessing ? (
                                    <>
                                        <FontAwesomeIcon icon={faSpinner} spin />
                                        {t('adminClubCard.rejectModal.rejecting')}
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faTimes} />
                                        {t('adminClubCard.rejectModal.confirm')}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ДОБАВЕН INFO MODAL */}
            {showInfoModal && (
                <div className="adminclubcard-modal-overlay">
                    <div className="adminclubcard-modal adminclubcard-info-modal">
                        <div className="adminclubcard-modal-header">
                            <FontAwesomeIcon icon={faInfo} className="adminclubcard-modal-icon adminclubcard-modal-icon--info" />
                            <h3>{t('adminClubCard.info.title')}</h3>
                            <button
                                className="adminclubcard-info-close"
                                onClick={() => setShowInfoModal(false)}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        <div className="adminclubcard-modal-body">
                            <div className="adminclubcard-info-grid">
                                <div className="adminclubcard-info-item">
                                    <div className="adminclubcard-info-label">
                                        <FontAwesomeIcon icon={faUser} />
                                        <span>{t('adminClubCard.info.clubName')}</span>
                                    </div>
                                    <div className="adminclubcard-info-value">
                                        {club.name}
                                    </div>
                                </div>

                                <div className="adminclubcard-info-item">
                                    <div className="adminclubcard-info-label">
                                        <FontAwesomeIcon icon={faUser} />
                                        <span>{t('adminClubCard.info.owner')}</span>
                                    </div>
                                    <div className="adminclubcard-info-value">
                                        {club.owner || t('adminClubCard.info.notSpecified')}
                                    </div>
                                </div>

                                <div className="adminclubcard-info-item">
                                    <div className="adminclubcard-info-label">
                                        <FontAwesomeIcon icon={faEnvelope} />
                                        <span>{t('adminClubCard.info.email')}</span>
                                    </div>
                                    <div className="adminclubcard-info-value">
                                        {club.contacts?.email || t('adminClubCard.info.notSpecified')}
                                    </div>
                                </div>

                                <div className="adminclubcard-info-item">
                                    <div className="adminclubcard-info-label">
                                        <FontAwesomeIcon icon={faPhone} />
                                        <span>{t('adminClubCard.info.phone')}</span>
                                    </div>
                                    <div className="adminclubcard-info-value">
                                        {club.contacts?.phone || club.contacts?.mobile || t('adminClubCard.info.notSpecified')}
                                    </div>
                                </div>

                                <div className="adminclubcard-info-item">
                                    <div className="adminclubcard-info-label">
                                        <FontAwesomeIcon icon={faCalendarAlt} />
                                        <span>{t('adminClubCard.info.createdDate')}</span>
                                    </div>
                                    <div className="adminclubcard-info-value">
                                        {formatDate(club.metadata?.createdAt)}
                                    </div>
                                </div>

                                <div className="adminclubcard-info-item">
                                    <div className="adminclubcard-info-label">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                                        <span>{t('adminClubCard.info.location')}</span>
                                    </div>
                                    <div className="adminclubcard-info-value">
                                        {club.location?.city && club.location?.region 
                                            ? `${club.location.city}, ${club.location.region}`
                                            : club.location?.city || t('adminClubCard.info.notSpecifiedFeminine')
                                        }
                                    </div>
                                </div>

                                <div className="adminclubcard-info-item">
                                    <div className="adminclubcard-info-label">
                                        <FontAwesomeIcon icon={faUsers} />
                                        <span>{t('adminClubCard.info.members')}</span>
                                    </div>
                                    <div className="adminclubcard-info-value">
                                        {club.membership?.totalMembers || 0} {t('adminClubCard.info.people')}
                                    </div>
                                </div>

                                {/* ДОБАВЕНИ ADMIN СПЕЦИФИЧНИ ПОЛЕТА */}
                                <div className="adminclubcard-info-item">
                                    <div className="adminclubcard-info-label">
                                        <FontAwesomeIcon icon={faShield} />
                                        <span>{t('adminClubCard.info.verificationStatus')}</span>
                                    </div>
                                    <div className="adminclubcard-info-value">
                                        {club.metadata?.isVerified 
                                            ? t('adminClubCard.info.verified') 
                                            : t('adminClubCard.info.notVerified')
                                        }
                                    </div>
                                </div>

                                <div className="adminclubcard-info-item">
                                    <div className="adminclubcard-info-label">
                                        <FontAwesomeIcon icon={faToggleOn} />
                                        <span>{t('adminClubCard.info.status')}</span>
                                    </div>
                                    <div className="adminclubcard-info-value">
                                        {currentStatus.label}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminClubCard;