import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCheck,
    faTrash,
    faTimes,
    faSpinner,
    faExclamationTriangle,
    faToggleOn,
    faUsers,
    faChevronDown,
    faCheckDouble,
    faBolt,
    faShield
} from '@fortawesome/free-solid-svg-icons';
import './adminClubActions.css';

const AdminClubActions = ({ 
    selectedCount, 
    onBulkAction, 
    onClearSelection,
    isProcessing = false 
}) => {
    const { t } = useTranslation();
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [currentAction, setCurrentAction] = useState(null);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    // Available status options for bulk change
    const statusOptions = [
        { 
            value: 'active', 
            label: t('adminClubActions.statusOptions.active'),
            icon: faCheck,
            color: '#10b981',
            bgColor: '#d1fae5'
        },
        { 
            value: 'inactive', 
            label: t('adminClubActions.statusOptions.inactive'),
            icon: faTimes,
            color: '#f59e0b',
            bgColor: '#fef3c7'
        },
        { 
            value: 'suspended', 
            label: t('adminClubActions.statusOptions.suspended'),
            icon: faExclamationTriangle,
            color: '#ef4444',
            bgColor: '#fef2f2'
        }
    ];

    // Action configurations
    const actionConfigs = {
        approve: {
            title: t('adminClubActions.actions.approve.title'),
            description: t('adminClubActions.actions.approve.description'),
            icon: faCheckDouble,
            color: '#10b981',
            bgColor: '#d1fae5',
            confirmText: t('adminClubActions.actions.approve.confirm'),
            buttonText: t('adminClubActions.actions.approve.button')
        },
        delete: {
            title: t('adminClubActions.actions.delete.title'),
            description: t('adminClubActions.actions.delete.description'),
            icon: faTrash,
            color: '#ef4444',
            bgColor: '#fef2f2',
            confirmText: t('adminClubActions.actions.delete.confirm'),
            buttonText: t('adminClubActions.actions.delete.button'),
            danger: true
        },
        updateStatus: {
            title: t('adminClubActions.actions.updateStatus.title'),
            description: t('adminClubActions.actions.updateStatus.description'),
            icon: faToggleOn,
            color: '#3b82f6',
            bgColor: '#dbeafe',
            confirmText: t('adminClubActions.actions.updateStatus.confirm'),
            buttonText: t('adminClubActions.actions.updateStatus.button')
        }
    };

    const handleActionClick = (action, data = null) => {
        setCurrentAction({ type: action, data });
        setShowConfirmModal(true);
        setShowStatusDropdown(false);
    };

    const handleConfirmAction = async () => {
        if (!currentAction) return;

        try {
            await onBulkAction(currentAction.type, currentAction.data);
            setShowConfirmModal(false);
            setCurrentAction(null);
        } catch (error) {
            console.error('Bulk action error:', error);
        }
    };

    const handleStatusChange = (status) => {
        handleActionClick('updateStatus', { status });
    };

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            onClearSelection();
            setIsVisible(true);
        }, 300);
    };

    if (selectedCount === 0) return null;

    const currentActionConfig = currentAction ? actionConfigs[currentAction.type] : null;

    return (
        <>
            <div className={`adminclubactions-container ${isVisible ? 'visible' : 'hiding'}`}>
                <div className="adminclubactions-wrapper">
                    {/* Selection Info */}
                    <div className="adminclubactions-info">
                        <div className="adminclubactions-icon">
                            <FontAwesomeIcon icon={faUsers} />
                        </div>
                        <div className="adminclubactions-text">
                            <div className="adminclubactions-count">
                                {selectedCount.toLocaleString()}
                            </div>
                            <div className="adminclubactions-label">
                                {t('adminClubActions.selected', { count: selectedCount })}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="adminclubactions-actions">
                        {/* Approve Button */}
                        <button
                            className="adminclubactions-btn adminclubactions-btn--approve"
                            onClick={() => handleActionClick('approve')}
                            disabled={isProcessing}
                            title={t('adminClubActions.tooltips.approve')}
                        >
                            <FontAwesomeIcon icon={faCheckDouble} />
                            <span className="adminclubactions-btn-text">
                                {t('adminClubActions.buttons.approve')}
                            </span>
                        </button>

                        {/* Status Change Dropdown */}
                        <div className="adminclubactions-dropdown">
                            <button
                                className="adminclubactions-btn adminclubactions-btn--status"
                                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                disabled={isProcessing}
                                title={t('adminClubActions.tooltips.changeStatus')}
                            >
                                <FontAwesomeIcon icon={faToggleOn} />
                                <span className="adminclubactions-btn-text">
                                    {t('adminClubActions.buttons.changeStatus')}
                                </span>
                                <FontAwesomeIcon 
                                    icon={faChevronDown} 
                                    className={`adminclubactions-chevron ${showStatusDropdown ? 'rotated' : ''}`}
                                />
                            </button>

                            {showStatusDropdown && (
                                <div className="adminclubactions-dropdown-menu">
                                    {statusOptions.map((status) => (
                                        <button
                                            key={status.value}
                                            className="adminclubactions-dropdown-item"
                                            onClick={() => handleStatusChange(status.value)}
                                        >
                                            <div 
                                                className="adminclubactions-status-icon"
                                                style={{ 
                                                    backgroundColor: status.bgColor,
                                                    color: status.color 
                                                }}
                                            >
                                                <FontAwesomeIcon icon={status.icon} />
                                            </div>
                                            <span>{status.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Delete Button */}
                        <button
                            className="adminclubactions-btn adminclubactions-btn--delete"
                            onClick={() => handleActionClick('delete')}
                            disabled={isProcessing}
                            title={t('adminClubActions.tooltips.delete')}
                        >
                            <FontAwesomeIcon icon={faTrash} />
                            <span className="adminclubactions-btn-text">
                                {t('adminClubActions.buttons.delete')}
                            </span>
                        </button>
                    </div>

                    {/* Quick Stats */}
                    <div className="adminclubactions-stats">
                        <div className="adminclubactions-stat">
                            <FontAwesomeIcon icon={faBolt} />
                            <span>{t('adminClubActions.bulkAction')}</span>
                        </div>
                    </div>

                    {/* Clear Selection */}
                    <button
                        className="adminclubactions-close"
                        onClick={handleClose}
                        disabled={isProcessing}
                        title={t('adminClubActions.tooltips.clear')}
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                {/* Processing Overlay */}
                {isProcessing && (
                    <div className="adminclubactions-processing-overlay">
                        <div className="adminclubactions-processing-content">
                            <FontAwesomeIcon icon={faSpinner} spin className="adminclubactions-processing-spinner" />
                            <span>{t('adminClubActions.processing')}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && currentActionConfig && (
                <div className="adminclubactions-modal-overlay">
                    <div className="adminclubactions-modal">
                        <div className="adminclubactions-modal-header">
                            <div 
                                className="adminclubactions-modal-icon"
                                style={{ 
                                    backgroundColor: currentActionConfig.bgColor,
                                    color: currentActionConfig.color 
                                }}
                            >
                                <FontAwesomeIcon icon={currentActionConfig.icon} />
                            </div>
                            <div className="adminclubactions-modal-title">
                                <h3>{currentActionConfig.title}</h3>
                                <p>
                                    {t('adminClubActions.confirmAction', { count: selectedCount })}
                                </p>
                            </div>
                        </div>

                        <div className="adminclubactions-modal-body">
                            <div className={`adminclubactions-warning ${currentActionConfig.danger ? 'danger' : 'info'}`}>
                                <FontAwesomeIcon icon={faExclamationTriangle} />
                                <div>
                                    <p>{currentActionConfig.description}</p>
                                    
                                    {currentAction.type === 'updateStatus' && currentAction.data && (
                                        <div className="adminclubactions-status-preview">
                                            {t('adminClubActions.newStatus')}: 
                                            <span 
                                                className="adminclubactions-status-badge"
                                                style={{ 
                                                    backgroundColor: statusOptions.find(s => s.value === currentAction.data.status)?.bgColor,
                                                    color: statusOptions.find(s => s.value === currentAction.data.status)?.color
                                                }}
                                            >
                                                {statusOptions.find(s => s.value === currentAction.data.status)?.label}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="adminclubactions-selection-summary">
                                <FontAwesomeIcon icon={faUsers} />
                                <span>
                                    {t('adminClubActions.affectedClubs', { count: selectedCount })}
                                </span>
                            </div>
                        </div>

                        <div className="adminclubactions-modal-footer">
                            <button
                                className="adminclubactions-modal-btn adminclubactions-modal-btn--cancel"
                                onClick={() => {
                                    setShowConfirmModal(false);
                                    setCurrentAction(null);
                                }}
                                disabled={isProcessing}
                            >
                                {t('adminClubActions.cancel')}
                            </button>

                            <button
                                className={`adminclubactions-modal-btn ${
                                    currentActionConfig.danger 
                                        ? 'adminclubactions-modal-btn--danger' 
                                        : 'adminclubactions-modal-btn--confirm'
                                }`}
                                onClick={handleConfirmAction}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <FontAwesomeIcon icon={faSpinner} spin />
                                        {t('adminClubActions.processing')}
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={currentActionConfig.icon} />
                                        {currentActionConfig.buttonText}
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

export default AdminClubActions;