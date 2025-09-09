import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faEye, 
    faEdit, 
    faTrash, 
    faMapMarkerAlt,
    faSpinner,
    faExclamationTriangle,
    faClock,
    faFileAlt,
    faCheckCircle,
    faTimesCircle,
    faCalendarAlt,
    faTag
} from '@fortawesome/free-solid-svg-icons';
import './draftClubsCard.css';

const DraftClubsCard = ({ draft, onContinue, onView, onDelete }) => {
    const { t } = useTranslation();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Calculate completion percentage based on filled fields
    const calculateCompletionPercentage = () => {
        const requiredFields = [
            'name',
            'shortDescription', 
            'category',
            'location.city',
            'contacts.email'
        ];
        
        const optionalFields = [
            'fullDescription',
            'foundedYear',
            'location.address',
            'contacts.phone',
            'logo',
            'mainImage'
        ];

        let filledRequired = 0;
        let filledOptional = 0;

        // Check required fields
        requiredFields.forEach(field => {
            const value = getNestedValue(draft, field);
            if (value && value.toString().trim()) {
                filledRequired++;
            }
        });

        // Check optional fields  
        optionalFields.forEach(field => {
            const value = getNestedValue(draft, field);
            if (value && value.toString().trim()) {
                filledOptional++;
            }
        });

        // Required fields worth 70%, optional fields worth 30%
        const requiredPercentage = (filledRequired / requiredFields.length) * 70;
        const optionalPercentage = (filledOptional / optionalFields.length) * 30;
        
        return Math.round(requiredPercentage + optionalPercentage);
    };

    // Helper function to get nested object values
    const getNestedValue = (obj, path) => {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    };

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            await onDelete(draft);
            setShowDeleteModal(false);
        } catch (error) {
            console.error('Error deleting draft:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const getCompletionStatus = (percentage) => {
        if (percentage >= 80) return 'high';
        if (percentage >= 50) return 'medium';
        if (percentage >= 20) return 'low';
        return 'minimal';
    };

    const getCategoryLabel = (category) => {
        return t(`draftClubsCard.categories.${category}`, { defaultValue: category });
    };

    const formatLastModified = (date) => {
        if (!date) return t('draftClubsCard.neverModified');
        
        const now = new Date();
        const modified = new Date(date);
        const diffInHours = Math.floor((now - modified) / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInHours < 1) {
            return t('draftClubsCard.modifiedMinutesAgo');
        } else if (diffInHours < 24) {
            return t('draftClubsCard.modifiedHoursAgo', { hours: diffInHours });
        } else if (diffInDays < 7) {
            return t('draftClubsCard.modifiedDaysAgo', { days: diffInDays });
        } else {
            return modified.toLocaleDateString('bg-BG');
        }
    };

    const completionPercentage = calculateCompletionPercentage();
    const completionStatus = getCompletionStatus(completionPercentage);
    const lastModified = draft.metadata?.updatedAt || draft.updatedAt;

    return (
        <>
            <div className="draftclubscard-wrapper">
                <div className="draftclubscard-container">
                    {/* Header with completion indicator */}
                    <div className="draftclubscard-header">
                        <div className="draftclubscard-completion-badge">
                            <div className={`draftclubscard-completion-circle ${completionStatus}`}>
                                <div 
                                    className="draftclubscard-completion-fill"
                                    style={{ '--completion': `${completionPercentage}%` }}
                                ></div>
                                <span className="draftclubscard-completion-text">
                                    {completionPercentage}%
                                </span>
                            </div>
                            <span className="draftclubscard-completion-label">
                                {t(`draftClubsCard.completionStatus.${completionStatus}`)}
                            </span>
                        </div>

                        <div className="draftclubscard-actions">
                            <button
                                className="draftclubscard-action-btn draftclubscard-action-btn--view"
                                onClick={() => onView(draft)}
                                title={t('draftClubsCard.actions.view')}
                            >
                                <FontAwesomeIcon icon={faEye} />
                            </button>
                            <button
                                className="draftclubscard-action-btn draftclubscard-action-btn--continue"
                                onClick={() => onContinue(draft)}
                                title={t('draftClubsCard.actions.continue')}
                            >
                                <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button
                                className="draftclubscard-action-btn draftclubscard-action-btn--delete"
                                onClick={handleDeleteClick}
                                title={t('draftClubsCard.actions.delete')}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <FontAwesomeIcon icon={faSpinner} spin />
                                ) : (
                                    <FontAwesomeIcon icon={faTrash} />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Draft preview image or placeholder */}
                    <div className="draftclubscard-preview">
                        {draft.mainImage || draft.logo ? (
                            <img
                                src={draft.mainImage || draft.logo}
                                alt={draft.name || t('draftClubsCard.unnamedDraft')}
                                className="draftclubscard-image"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <div 
                            className="draftclubscard-placeholder"
                            style={{ display: (draft.mainImage || draft.logo) ? 'none' : 'flex' }}
                        >
                            <FontAwesomeIcon icon={faFileAlt} />
                            <span>{t('draftClubsCard.noPreview')}</span>
                        </div>
                    </div>
                    
                    {/* Content */}
                    <div className="draftclubscard-content">
                        <h3 className="draftclubscard-title">
                            {draft.name || (
                                <span className="draftclubscard-unnamed">
                                    {t('draftClubsCard.unnamedDraft')}
                                </span>
                            )}
                        </h3>
                        
                        <p className="draftclubscard-description">
                            {draft.shortDescription || t('draftClubsCard.noDescription')}
                        </p>
                        
                        <div className="draftclubscard-meta">
                            {draft.category && (
                                <div className="draftclubscard-meta-item">
                                    <FontAwesomeIcon icon={faTag} />
                                    <span>{getCategoryLabel(draft.category)}</span>
                                </div>
                            )}
                            
                            {draft.location?.city && (
                                <div className="draftclubscard-meta-item">
                                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                                    <span>{draft.location.city}</span>
                                </div>
                            )}

                            <div className="draftclubscard-meta-item">
                                <FontAwesomeIcon icon={faClock} />
                                <span>{formatLastModified(lastModified)}</span>
                            </div>
                        </div>

                        {/* Status indicators */}
                        <div className="draftclubscard-status">
                            <div className={`draftclubscard-status-badge ${completionStatus}`}>
                                <FontAwesomeIcon 
                                    icon={completionPercentage >= 80 ? faCheckCircle : faTimesCircle} 
                                />
                                <span>
                                    {t(`draftClubsCard.status.${completionPercentage >= 80 ? 'readyToPublish' : 'needsWork'}`)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick action bar */}
                    <div className="draftclubscard-footer">
                        <button
                            className="draftclubscard-primary-btn"
                            onClick={() => onContinue(draft)}
                        >
                            <FontAwesomeIcon icon={faEdit} />
                            {t('draftClubsCard.continueEditing')}
                        </button>
                        <span className="draftclubscard-completion-mini">
                            {completionPercentage}% {t('draftClubsCard.complete')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="draftclubscard-modal-overlay">
                    <div className="draftclubscard-modal">
                        <div className="draftclubscard-modal-header">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="draftclubscard-modal-icon" />
                            <h3>{t('draftClubsCard.deleteModal.title')}</h3>
                        </div>
                        <div className="draftclubscard-modal-body">
                            <p>
                                {t('draftClubsCard.deleteModal.message', { 
                                    name: draft.name || t('draftClubsCard.unnamedDraft')
                                })}
                            </p>
                            <p>{t('draftClubsCard.deleteModal.warning')}</p>
                        </div>
                        <div className="draftclubscard-modal-footer">
                            <button 
                                className="draftclubscard-modal-btn draftclubscard-modal-btn--cancel"
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                            >
                                {t('draftClubsCard.deleteModal.cancel')}
                            </button>
                            <button 
                                className="draftclubscard-modal-btn draftclubscard-modal-btn--delete"
                                onClick={handleDeleteConfirm}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <FontAwesomeIcon icon={faSpinner} spin />
                                        {t('draftClubsCard.deleteModal.deleting')}
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faTrash} />
                                        {t('draftClubsCard.deleteModal.delete')}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DraftClubsCard;