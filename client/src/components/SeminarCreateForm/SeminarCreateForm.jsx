// src/components/SeminarCreateForm/SeminarCreateForm.jsx
// Prefix: scf-

import { useTranslation } from 'react-i18next';
import { Save, Send, ArrowLeft } from 'lucide-react';

import SeminarBasicInfo from './SeminarBasicInfo/SeminarBasicInfo';
import SeminarSchedule from './SeminarSchedule/SeminarSchedule';
import SeminarSettings from './SeminarSettings/SeminarSettings';
import SeminarAdditional from './SeminarAdditional/SeminarAdditional';
import SeminarMaterialsSection from './SeminarMaterialsSection/SeminarMaterialsSection';
import SeminarVideosSection from './SeminarVideosSection/SeminarVideosSection';
import './seminarCreateForm.css';
import useSeminarCreateForm from '../hooks/useSeminarCreateForm';
import { useLocalizedNavigate } from '../../hooks/useLocalizedNavigate';


const SeminarCreateForm = () => {
    const { t } = useTranslation('academy-admin');
    const navigate = useLocalizedNavigate();

    const {
        isEditMode,
        seminarId,
        seminarSlug,
        seminarData,
        assignedMentors,
        setAssignedMentors,
        isLoading,
        isSaving,
        errors,
        hasChanges,
        updateField,
        handleSaveDraft,
        handlePublish,
        availableCourses,
        courseSearch,
        setCourseSearch,
    } = useSeminarCreateForm();

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
            <div className="scf-loading">
                <div className="scf-spinner" />
                <p>{t('seminarCreateForm.loading', 'Зареждане...')}</p>
            </div>
        );
    }

    return (
        <>
            <div className="scf-page-bg">
                <div className="scf-glow-orb" />
            </div>

            <div className="scf-container">
                {/* Header */}
                <div className="scf-header">
                    <button className="scf-back-btn" onClick={() => navigate('/academy/admin/seminars')}>
                        <ArrowLeft size={18} />
                        {t('seminarCreateForm.backToList', 'Към списъка')}
                    </button>
                    <h1 className="scf-title">
                        {isEditMode
                            ? t('seminarCreateForm.editTitle', 'Редактиране на семинар')
                            : (
                                <>
                                    {t('seminarCreateForm.title', 'Създай семинар').split(' ').slice(0, -1).join(' ')}{' '}
                                    <span className="scf-title-accent">{t('seminarCreateForm.title', 'Създай семинар').split(' ').pop()}</span>
                                </>
                            )}
                    </h1>
                </div>

                <div className="scf-form">
                    <SeminarBasicInfo
                        seminarData={seminarData}
                        errors={errors}
                        handleChange={handleChange}
                        updateField={updateField}
                    />

                    <SeminarSchedule
                        seminarData={seminarData}
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
                        seminarSlug={seminarSlug}
                    />

                    <SeminarVideosSection
                        seminarId={seminarId}
                        seminarSlug={seminarSlug}
                    />
                </div>

                {/* Footer */}
                <div className="scf-footer">
                    <div className="scf-footer-left">
                        {hasChanges && (
                            <span className="scf-unsaved">
                                {t('seminarCreateForm.unsavedChanges', '● Незапазени промени')}
                            </span>
                        )}
                    </div>
                    <div className="scf-footer-right">
                        <button className="scf-btn scf-btn-cancel" onClick={() => navigate('/academy/admin/seminars')}>
                            {t('seminarCreateForm.cancel', 'Отказ')}
                        </button>
                        <button className="scf-btn scf-btn-draft" onClick={handleSaveDraft} disabled={isSaving}>
                            <Save size={18} />
                            {isSaving ? t('seminarCreateForm.saving', 'Запазване...') : t('seminarCreateForm.saveDraft', 'Запази чернова')}
                        </button>
                        <button className="scf-btn scf-btn-publish" onClick={handlePublish} disabled={isSaving}>
                            <Send size={18} />
                            {t('seminarCreateForm.publish', 'Публикувай')}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SeminarCreateForm;