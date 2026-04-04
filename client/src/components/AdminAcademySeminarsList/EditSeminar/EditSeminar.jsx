// src/components/AdminAcademySeminarsList/EditSeminar/EditSeminar.jsx
// Prefix: esem-

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeft, Save, Send, EyeOff, Trash2,
    AlertTriangle, RotateCcw, XCircle, Loader2, Radio,
} from 'lucide-react';
import useEditSeminar from '../../hooks/useEditSeminar';
import SeminarBasicInfo from '../../SeminarCreateForm/SeminarBasicInfo/SeminarBasicInfo';
import SeminarSchedule from '../../SeminarCreateForm/SeminarSchedule/SeminarSchedule';
import SeminarSettings from '../../SeminarCreateForm/SeminarSettings/SeminarSettings';
import SeminarAdditional from '../../SeminarCreateForm/SeminarAdditional/SeminarAdditional';
import SeminarMaterialsSection from '../../SeminarCreateForm/SeminarMaterialsSection/SeminarMaterialsSection';
import SeminarVideosSection from '../../SeminarCreateForm/SeminarVideosSection/SeminarVideosSection';
import TestEditorModal from '../../AdminAcademyCoursesList/CourseContentManager/TestEditorModal/TestEditorModal';
import { useLocalizedNavigate } from '../../../hooks/useLocalizedNavigate';
import './editSeminar.css';

const EditSeminar = () => {
    const { t } = useTranslation('academy-admin');
    const navigate = useLocalizedNavigate();

    const {
        seminarData,
        seminarId,
        seminarStatus,
        isPublished,
        assignedMentors,
        setAssignedMentors,
        slug,
        isLoading,
        isSaving,
        errors,
        hasChanges,
        updateField,
        handleSaveAndStay,
        handleSaveAndBack,
        handlePublish,
        handleUnpublish,
        handleDelete,
        handleCancel,
        handleStartLive,
        handleStopLive,
        handleDiscardChanges,
        availableCourses,
        courseSearch,
        setCourseSearch,
        showTestEditor,
        setShowTestEditor,
    } = useEditSeminar();

    useEffect(() => { window.scrollTo(0, 0); }, []);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            updateField(name, checked);
        } else if (type === 'number') {
            updateField(name, value === '' ? '' : Number(value));
        } else {
            updateField(name, value);
        }
    };

    if (isLoading) {
        return (
            <div className="esem-loading">
                <div className="esem-spinner" />
                <p>{t('editSeminar.loading', 'Зареждане на семинар...')}</p>
            </div>
        );
    }

    return (
        <>
            <div className="esem-page-bg">
                <div className="esem-glow-orb" />
            </div>

            <div className="esem-container">
                {/* Header */}
                <div className="esem-header">
                    <button className="esem-back-btn" onClick={() => navigate('/academy/admin/seminars')}>
                        <ArrowLeft size={18} />
                        {t('editSeminar.backToList', 'Към списъка')}
                    </button>

                    <div className="esem-header-row">
                        <h1 className="esem-title">
                            {t('editSeminar.title', 'Редактиране на')}{' '}
                            <span>{t('editSeminar.titleAccent', 'семинар')}</span>
                        </h1>
                        <div className="esem-header-badges">
                            {seminarStatus && (
                                <span className={`esem-status-badge esem-status-${seminarStatus}`}>
                                    {t(`editSeminar.statuses.${seminarStatus}`, seminarStatus)}
                                </span>
                            )}
                            {isPublished ? (
                                <span className="esem-pub-badge esem-pub-yes">
                                    {t('editSeminar.published', 'Публикуван')}
                                </span>
                            ) : (
                                <span className="esem-pub-badge esem-pub-no">
                                    {t('editSeminar.draft', 'Чернова')}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Form — reuse create sub-components */}
                <div className="esem-form">
                    <SeminarBasicInfo
                        seminarData={seminarData}
                        errors={errors}
                        handleChange={handleChange}
                        updateField={updateField}
                    />
                    <SeminarSchedule
                        seminarData={seminarData}
                        seminarId={seminarId}
                        errors={errors}
                        handleChange={handleChange}
                        updateField={updateField}
                    />
                    <SeminarSettings
                         seminarData={seminarData}
                        errors={errors}
                        handleChange={handleChange}
                        updateField={updateField}
                        assignedMentors={assignedMentors}
                        setAssignedMentors={setAssignedMentors}
                        seminarId={seminarId}
                        onOpenTestEditor={() => setShowTestEditor(true)}
                    />
                    <SeminarAdditional
                        seminarData={seminarData}
                        errors={errors}
                        handleChange={handleChange}
                        updateField={updateField}
                        availableCourses={availableCourses}
                        courseSearch={courseSearch}
                        setCourseSearch={setCourseSearch}
                    />

                    <SeminarMaterialsSection
                        seminarId={seminarId}
                        seminarSlug={slug}
                    />

                    <SeminarVideosSection
                        seminarId={seminarId}
                        seminarSlug={slug}
                    />
                </div>

                {/* Footer */}
                <div className="esem-footer">
                    <div className="esem-footer-left">
                        {hasChanges && (
                            <>
                                <span className="esem-unsaved">
                                    {t('editSeminar.unsavedChanges', '● Незапазени промени')}
                                </span>
                                <button className="esem-btn esem-btn-discard" onClick={handleDiscardChanges} disabled={isSaving}>
                                    <RotateCcw size={14} />
                                    {t('editSeminar.discard', 'Отхвърли')}
                                </button>
                            </>
                        )}
                    </div>
                    <div className="esem-footer-right">
                        {/* Danger actions */}
                        {seminarStatus !== 'cancelled' && seminarStatus !== 'completed' && (
                            <button className="esem-btn esem-btn-cancel-sem" onClick={() => setShowCancelModal(true)} disabled={isSaving}>
                                <XCircle size={16} />
                                {t('editSeminar.cancelSeminar', 'Отмени')}
                            </button>
                        )}
                        <button className="esem-btn esem-btn-delete" onClick={() => setShowDeleteModal(true)} disabled={isSaving}>
                            <Trash2 size={16} />
                        </button>

                        {/* Start / Stop Live */}
                        {seminarStatus !== 'live' && seminarStatus !== 'cancelled' && isPublished && (
                            <button className="esem-btn esem-btn-live" onClick={handleStartLive} disabled={isSaving}>
                                <Radio size={16} />
                                {t('editSeminar.startLive', 'На живо')}
                            </button>
                        )}
                        {seminarStatus === 'live' && (
                            <button className="esem-btn esem-btn-stop-live" onClick={handleStopLive} disabled={isSaving}>
                                <Radio size={16} />
                                {t('editSeminar.stopLive', 'Спри на живо')}
                            </button>
                        )}

                        {/* Publish/Unpublish */}
                        {isPublished ? (
                            <button className="esem-btn esem-btn-unpublish" onClick={handleUnpublish} disabled={isSaving}>
                                <EyeOff size={16} />
                                {t('editSeminar.unpublish', 'Скрий')}
                            </button>
                        ) : (
                            <button className="esem-btn esem-btn-publish" onClick={handlePublish} disabled={isSaving}>
                                <Send size={16} />
                                {t('editSeminar.publish', 'Публикувай')}
                            </button>
                        )}

                        {/* Save */}
                        <button className="esem-btn esem-btn-save" onClick={handleSaveAndStay} disabled={isSaving || !hasChanges}>
                            {isSaving ? <Loader2 size={16} className="esem-spin" /> : <Save size={16} />}
                            {t('editSeminar.save', 'Запази')}
                        </button>
                        <button className="esem-btn esem-btn-save-back" onClick={handleSaveAndBack} disabled={isSaving || !hasChanges}>
                            {t('editSeminar.saveAndBack', 'Запази и назад')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="esem-modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="esem-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="esem-modal-icon">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="esem-modal-title">{t('editSeminar.deleteModal.title', 'Изтриване на семинар')}</h3>
                        <p className="esem-modal-text">
                            {t('editSeminar.deleteModal.text', 'Сигурни ли сте? Това действие е необратимо.')}
                        </p>
                        <div className="esem-modal-actions">
                            <button className="esem-btn esem-btn-modal-back" onClick={() => setShowDeleteModal(false)}>
                                {t('editSeminar.deleteModal.cancel', 'Отказ')}
                            </button>
                            <button className="esem-btn esem-btn-modal-delete" onClick={() => { setShowDeleteModal(false); handleDelete(); }} disabled={isSaving}>
                                <Trash2 size={16} />
                                {t('editSeminar.deleteModal.confirm', 'Изтрий')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="esem-modal-overlay" onClick={() => { setShowCancelModal(false); setCancelReason(''); }}>
                    <div className="esem-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="esem-modal-icon esem-modal-icon-cancel">
                            <XCircle size={32} />
                        </div>
                        <h3 className="esem-modal-title">{t('editSeminar.cancelModal.title', 'Отмяна на семинар')}</h3>
                        <textarea
                            className="esem-modal-reason"
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder={t('editSeminar.cancelModal.placeholder', 'Причина за отмяна (незадължително)')}
                            rows={3}
                            maxLength={500}
                        />
                        <div className="esem-modal-actions">
                            <button className="esem-btn esem-btn-modal-back" onClick={() => { setShowCancelModal(false); setCancelReason(''); }}>
                                {t('editSeminar.cancelModal.back', 'Назад')}
                            </button>
                            <button className="esem-btn esem-btn-modal-cancel" onClick={() => { setShowCancelModal(false); handleCancel(cancelReason); setCancelReason(''); }} disabled={isSaving}>
                                <XCircle size={16} />
                                {t('editSeminar.cancelModal.confirm', 'Отмени семинара')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Test Editor Modal */}
            {seminarId && (
                <TestEditorModal
                    isOpen={showTestEditor}
                    onClose={() => setShowTestEditor(false)}
                    seminarId={seminarId}
                    entityTitle={seminarData.title}
                />
            )}

        </>
    );
};

export default EditSeminar;