import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTimes,
    faCheck,
    faTrash,
    faSpinner,
    faExclamationTriangle,
    faInfo,
    faShield,
    faToggleOn,
    faCrown,
    faFileAlt,
    faUserEdit,
    faWarning
} from '@fortawesome/free-solid-svg-icons';
import './adminClubModal.css';

const AdminClubModal = ({ 
    isOpen, 
    type, 
    club, 
    data, 
    onClose, 
    onConfirm,
    isProcessing = false 
}) => {
    const { t } = useTranslation('clubs');
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen && type) {
            // Reset form data when modal opens
            setFormData({});
            setErrors({});
        }
    }, [isOpen, type]);

    if (!isOpen || !type) return null;

    // Modal configurations for different action types
    const modalConfigs = {
        reject: {
            title: t('adminClubModal.reject.title'),
            description: t('adminClubModal.reject.description', { clubName: club?.name }),
            icon: faTimes,
            color: '#ef4444',
            bgColor: '#fef2f2',
            confirmText: t('adminClubModal.reject.confirm'),
            cancelText: t('adminClubModal.cancel'),
            isDanger: true,
            requiresReason: true
        },
        approve: {
            title: t('adminClubModal.approve.title'),
            description: t('adminClubModal.approve.description', { clubName: club?.name }),
            icon: faCheck,
            color: '#10b981',
            bgColor: '#d1fae5',
            confirmText: t('adminClubModal.approve.confirm'),
            cancelText: t('adminClubModal.cancel'),
            isDanger: false
        },
        delete: {
            title: t('adminClubModal.delete.title'),
            description: t('adminClubModal.delete.description', { clubName: club?.name }),
            icon: faTrash,
            color: '#dc2626',
            bgColor: '#fef2f2',
            confirmText: t('adminClubModal.delete.confirm'),
            cancelText: t('adminClubModal.cancel'),
            isDanger: true,
            requiresConfirmation: true
        },
        verify: {
            title: t('adminClubModal.verify.title'),
            description: t('adminClubModal.verify.description', { clubName: club?.name }),
            icon: faShield,
            color: '#8b5cf6',
            bgColor: '#ede9fe',
            confirmText: t('adminClubModal.verify.confirm'),
            cancelText: t('adminClubModal.cancel'),
            isDanger: false
        },
        status: {
            title: t('adminClubModal.status.title'),
            description: t('adminClubModal.status.description', { 
                clubName: club?.name, 
                status: data?.status 
            }),
            icon: faToggleOn,
            color: '#3b82f6',
            bgColor: '#dbeafe',
            confirmText: t('adminClubModal.status.confirm'),
            cancelText: t('adminClubModal.cancel'),
            isDanger: false
        },
        transfer: {
            title: t('adminClubModal.transfer.title'),
            description: t('adminClubModal.transfer.description', { clubName: club?.name }),
            icon: faCrown,
            color: '#f59e0b',
            bgColor: '#fef3c7',
            confirmText: t('adminClubModal.transfer.confirm'),
            cancelText: t('adminClubModal.cancel'),
            isDanger: true,
            requiresEmail: true
        }
    };

    const config = modalConfigs[type];
    if (!config) return null;

    // Form validation
    const validateForm = () => {
        const newErrors = {};

        if (config.requiresReason && !formData.reason?.trim()) {
            newErrors.reason = t('adminClubModal.validation.reasonRequired');
        }

        if (config.requiresEmail) {
            if (!formData.email?.trim()) {
                newErrors.email = t('adminClubModal.validation.emailRequired');
            } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
                newErrors.email = t('adminClubModal.validation.emailInvalid');
            }
        }

        if (config.requiresConfirmation && formData.confirmText !== club?.name) {
            newErrors.confirmText = t('adminClubModal.validation.confirmationMismatch');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        const submitData = {
            type,
            club,
            formData,
            originalData: data
        };
        
        onConfirm(submitData);
    };

    // Handle input change
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    // Handle backdrop click
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && !isProcessing) {
            onClose();
        }
    };

    return (
        <div className="adminclubmodal-overlay" onClick={handleBackdropClick}>
            <div className="adminclubmodal-container">
                <form onSubmit={handleSubmit} className="adminclubmodal-form">
                    {/* Header */}
                    <div className="adminclubmodal-header">
                        <div className="adminclubmodal-header-content">
                            <div 
                                className="adminclubmodal-icon"
                                style={{ 
                                    backgroundColor: config.bgColor,
                                    color: config.color 
                                }}
                            >
                                <FontAwesomeIcon icon={config.icon} />
                            </div>
                            
                            <div className="adminclubmodal-title-section">
                                <h3 className="adminclubmodal-title">
                                    {config.title}
                                </h3>
                                <p className="adminclubmodal-description">
                                    {config.description}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="adminclubmodal-close"
                            onClick={onClose}
                            disabled={isProcessing}
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="adminclubmodal-body">
                        {/* Club Info */}
                        {club && (
                            <div className="adminclubmodal-club-info">
                                <div className="adminclubmodal-club-preview">
                                    <img
                                        src={club.mainImage || club.logo || '/images/placeholder-club.jpg'}
                                        alt={club.name}
                                        className="adminclubmodal-club-image"
                                        onError={(e) => {
                                            e.target.src = '/images/placeholder-club.jpg';
                                        }}
                                    />
                                    <div className="adminclubmodal-club-details">
                                        <h4 className="adminclubmodal-club-name">{club.name}</h4>
                                        <p className="adminclubmodal-club-meta">
                                            {club.location?.city} • {club.membership?.totalMembers || 0} {t('adminClubModal.members')}
                                        </p>
                                        <div className="adminclubmodal-club-status">
                                            <span 
                                                className="adminclubmodal-status-badge"
                                                style={{ 
                                                    backgroundColor: club.status === 'active' ? '#d1fae5' : 
                                                                   club.status === 'inactive' ? '#fef3c7' : 
                                                                   club.status === 'draft' ? '#f3f4f6' : '#fef2f2',
                                                    color: club.status === 'active' ? '#10b981' : 
                                                          club.status === 'inactive' ? '#f59e0b' : 
                                                          club.status === 'draft' ? '#6b7280' : '#ef4444'
                                                }}
                                            >
                                                {t(`adminClubModal.statuses.${club.status}`)}
                                            </span>
                                            {club.metadata?.isVerified && (
                                                <span className="adminclubmodal-verified-badge">
                                                    <FontAwesomeIcon icon={faShield} />
                                                    {t('adminClubModal.verified')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Warning/Info Message */}
                        <div className={`adminclubmodal-warning ${config.isDanger ? 'danger' : 'info'}`}>
                            <FontAwesomeIcon icon={config.isDanger ? faExclamationTriangle : faInfo} />
                            <div className="adminclubmodal-warning-content">
                                {config.isDanger ? (
                                    <div>
                                        <h5>{t('adminClubModal.warningTitle')}</h5>
                                        <p>{t('adminClubModal.dangerousAction')}</p>
                                    </div>
                                ) : (
                                    <div>
                                        <h5>{t('adminClubModal.infoTitle')}</h5>
                                        <p>{t('adminClubModal.actionInfo')}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="adminclubmodal-form-fields">
                            {/* Reason field for rejection */}
                            {config.requiresReason && (
                                <div className="adminclubmodal-field">
                                    <label className="adminclubmodal-label">
                                        {t('adminClubModal.fields.reason.label')} *
                                    </label>
                                    <textarea
                                        className={`adminclubmodal-textarea ${errors.reason ? 'error' : ''}`}
                                        placeholder={t('adminClubModal.fields.reason.placeholder')}
                                        value={formData.reason || ''}
                                        onChange={(e) => handleInputChange('reason', e.target.value)}
                                        rows="4"
                                        disabled={isProcessing}
                                    />
                                    {errors.reason && (
                                        <span className="adminclubmodal-error">
                                            {errors.reason}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Email field for transfer */}
                            {config.requiresEmail && (
                                <div className="adminclubmodal-field">
                                    <label className="adminclubmodal-label">
                                        {t('adminClubModal.fields.email.label')} *
                                    </label>
                                    <input
                                        type="email"
                                        className={`adminclubmodal-input ${errors.email ? 'error' : ''}`}
                                        placeholder={t('adminClubModal.fields.email.placeholder')}
                                        value={formData.email || ''}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        disabled={isProcessing}
                                    />
                                    {errors.email && (
                                        <span className="adminclubmodal-error">
                                            {errors.email}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Confirmation field for deletion */}
                            {config.requiresConfirmation && (
                                <div className="adminclubmodal-field">
                                    <label className="adminclubmodal-label">
                                        {t('adminClubModal.fields.confirmation.label')} *
                                    </label>
                                    <p className="adminclubmodal-confirmation-instruction">
                                        {t('adminClubModal.fields.confirmation.instruction', { clubName: club?.name })}
                                    </p>
                                    <input
                                        type="text"
                                        className={`adminclubmodal-input ${errors.confirmText ? 'error' : ''}`}
                                        placeholder={club?.name}
                                        value={formData.confirmText || ''}
                                        onChange={(e) => handleInputChange('confirmText', e.target.value)}
                                        disabled={isProcessing}
                                    />
                                    {errors.confirmText && (
                                        <span className="adminclubmodal-error">
                                            {errors.confirmText}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Additional Info */}
                        {type === 'status' && data?.status && (
                            <div className="adminclubmodal-status-info">
                                <FontAwesomeIcon icon={faInfo} />
                                <span>
                                    {t('adminClubModal.statusChange.info', { status: t(`adminClubModal.statuses.${data.status}`) })}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="adminclubmodal-footer">
                        <button
                            type="button"
                            className="adminclubmodal-btn adminclubmodal-btn--cancel"
                            onClick={onClose}
                            disabled={isProcessing}
                        >
                            {config.cancelText}
                        </button>

                        <button
                            type="submit"
                            className={`adminclubmodal-btn ${
                                config.isDanger 
                                    ? 'adminclubmodal-btn--danger' 
                                    : 'adminclubmodal-btn--confirm'
                            }`}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <FontAwesomeIcon icon={faSpinner} spin />
                                    {t('adminClubModal.processing')}
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={config.icon} />
                                    {config.confirmText}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminClubModal;