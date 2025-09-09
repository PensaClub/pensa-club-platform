// src/components/Clubs/ClubCreateForm/ClubPreview/ClubPreviewModal.jsx
import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faEye } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import './clubPreviewModal.css';
import ClubPreview from '../ClubPreview/ClubPreview';

const ClubPreviewModal = ({ isOpen, onClose, formData }) => {
    const { t } = useTranslation();

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }

        return () => document.body.classList.remove('modal-open');
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="club-preview-modal-overlay" onClick={onClose}>
            <div className="club-preview-modal" onClick={(e) => e.stopPropagation()}>

                {/* Modal Header */}
                <div className="club-preview-modal-header">
                    <div className="club-preview-modal-title">
                        <FontAwesomeIcon icon={faEye} />
                        <span>{t('clubForm.preview.title')}</span>
                    </div>
                    <button
                        className="club-preview-modal-close"
                        onClick={onClose}
                        title={t('clubForm.preview.close')}
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="club-preview-modal-content">
                    <div style={{ position: 'relative', minHeight: '100%' }}>
                        <ClubPreview
                            formData={formData}
                            onClose={onClose}
                            isPreviewMode={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClubPreviewModal;