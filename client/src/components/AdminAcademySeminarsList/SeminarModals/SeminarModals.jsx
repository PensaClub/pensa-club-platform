// src/components/AdminAcademySeminarsList/SeminarModals/SeminarModals.jsx
// Prefix: asmm-

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, XCircle, Trash2 } from 'lucide-react';
import './seminarModals.css';

const SeminarModals = ({ deleteModal, setDeleteModal, cancelModal, setCancelModal, actionLoading, onDelete, onCancel }) => {
    const { t } = useTranslation('academy-admin');
    const [cancelReason, setCancelReason] = useState('');

    const handleCancel = () => {
        onCancel(cancelReason);
        setCancelReason('');
    };

    const handleCloseCancelModal = () => {
        setCancelModal(null);
        setCancelReason('');
    };

    if (!deleteModal && !cancelModal) return null;

    return (
        <>
            {/* Delete Modal */}
            {deleteModal && (
                <div className="asmm-overlay" onClick={() => setDeleteModal(null)}>
                    <div className="asmm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="asmm-icon asmm-icon-delete">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="asmm-title">{t('seminarModals.delete.title', 'Изтриване на семинар')}</h3>
                        <p className="asmm-text">
                            {t('seminarModals.delete.text', 'Сигурни ли сте, че искате да изтриете')}
                            <strong> {deleteModal.title}</strong>?
                            {' '}{t('seminarModals.delete.warning', 'Това действие е необратимо.')}
                        </p>
                        <div className="asmm-actions">
                            <button className="asmm-btn asmm-btn-back" onClick={() => setDeleteModal(null)}>
                                {t('seminarModals.delete.cancel', 'Отказ')}
                            </button>
                            <button className="asmm-btn asmm-btn-delete" onClick={onDelete} disabled={actionLoading === deleteModal.id}>
                                <Trash2 size={16} />
                                {t('seminarModals.delete.confirm', 'Изтрий')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Modal */}
            {cancelModal && (
                <div className="asmm-overlay" onClick={handleCloseCancelModal}>
                    <div className="asmm-modal asmm-modal-cancel" onClick={(e) => e.stopPropagation()}>
                        <div className="asmm-icon asmm-icon-cancel">
                            <XCircle size={32} />
                        </div>
                        <h3 className="asmm-title">{t('seminarModals.cancel.title', 'Отмяна на семинар')}</h3>
                        <p className="asmm-text">
                            {t('seminarModals.cancel.text', 'Отменяте')}
                            <strong> {cancelModal.title}</strong>.
                            {' '}{t('seminarModals.cancel.reasonLabel', 'Можете да посочите причина:')}
                        </p>
                        <textarea
                            className="asmm-reason"
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder={t('seminarModals.cancel.reasonPlaceholder', 'Причина за отмяна (незадължително)')}
                            rows={3}
                            maxLength={500}
                        />
                        <div className="asmm-actions">
                            <button className="asmm-btn asmm-btn-back" onClick={handleCloseCancelModal}>
                                {t('seminarModals.cancel.back', 'Назад')}
                            </button>
                            <button className="asmm-btn asmm-btn-cancel-confirm" onClick={handleCancel} disabled={actionLoading === cancelModal.id}>
                                <XCircle size={16} />
                                {t('seminarModals.cancel.confirm', 'Отмени семинара')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SeminarModals;