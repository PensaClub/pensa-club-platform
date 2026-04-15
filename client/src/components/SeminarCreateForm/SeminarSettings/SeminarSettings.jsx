// src/components/SeminarCreateForm/SeminarSettings/SeminarSettings.jsx
// Prefix: scft-

import { useTranslation } from 'react-i18next';
import { Users, Award, AlertCircle, FileText } from 'lucide-react';
import FacilitatorPicker from './FacilitatorPicker/FacilitatorPicker';
import './seminarSettings.css';

const SeminarSettings = ({ seminarData, errors, handleChange, updateField, facilitators, setFacilitators, seminarId, onOpenTestEditor }) => {
    const { t } = useTranslation('academy-admin');

    const renderError = (field) =>
        errors[field] ? (
            <span className="scft-error-msg">
                <AlertCircle size={14} />
                {errors[field]}
            </span>
        ) : null;

    return (
        <>
            {/* ============================================= */}
            {/* Facilitators */}
            {/* ============================================= */}
            <div className="scft-section scft-section-mentor">
                <div className="scft-section-header">
                    <Users size={20} />
                    <h2 className="scft-section-title">{t('seminarSettings.facilitatorsTitle', 'Водещи на семинара')}</h2>
                </div>
                <p className="scft-section-desc">
                    {t('seminarSettings.facilitatorsDesc', 'Добавете един или повече водещи (ментори, администратори или външни лектори). Първият добавен автоматично става главен.')}
                </p>
                <FacilitatorPicker
                    selected={facilitators}
                    onChange={(next) => setFacilitators(next)}
                    placeholder={t('seminarSettings.facilitatorsPlaceholder', 'Търси ментор, админ или външен лектор...')}
                />
            </div>

            {/* ============================================= */}
            {/* Registration */}
            {/* ============================================= */}
            <div className="scft-section">
                <div className="scft-section-header">
                    <Users size={20} />
                    <h2 className="scft-section-title">{t('seminarSettings.registrationTitle', 'Записване')}</h2>
                </div>

                <div className="scft-row">
                    <div className={`scft-field ${errors.maxParticipants ? 'scft-field-error' : ''}`}>
                        <label className="scft-label" htmlFor="scft-max-participants">
                            {t('seminarSettings.maxParticipants', 'Макс. участници')}
                        </label>
                        <input
                            id="scft-max-participants"
                            type="number"
                            name="maxParticipants"
                            className="scft-input scft-input-sm"
                            placeholder={t('seminarSettings.unlimited', 'Без ограничение')}
                            value={seminarData.maxParticipants}
                            onChange={handleChange}
                            min={1}
                        />
                        {renderError('maxParticipants')}
                    </div>
                    <div className={`scft-field ${errors.minParticipants ? 'scft-field-error' : ''}`}>
                        <label className="scft-label" htmlFor="scft-min-participants">
                            {t('seminarSettings.minParticipants', 'Мин. участници')}
                        </label>
                        <input
                            id="scft-min-participants"
                            type="number"
                            name="minParticipants"
                            className="scft-input scft-input-sm"
                            placeholder={t('seminarSettings.noMinimum', 'Без минимум')}
                            value={seminarData.minParticipants}
                            onChange={handleChange}
                            min={1}
                        />
                        {renderError('minParticipants')}
                    </div>
                </div>

                <div className="scft-toggles">
                    <label className="scft-toggle">
                        <input type="checkbox" name="requiresRegistration" checked={seminarData.requiresRegistration} onChange={handleChange} />
                        <span className="scft-toggle-slider" />
                        <span className="scft-toggle-text">{t('seminarSettings.requiresRegistration', 'Изисква регистрация')}</span>
                    </label>
                    <label className="scft-toggle">
                        <input type="checkbox" name="requiresApproval" checked={seminarData.requiresApproval} onChange={handleChange} />
                        <span className="scft-toggle-slider" />
                        <span className="scft-toggle-text">{t('seminarSettings.requiresApproval', 'Изисква одобрение')}</span>
                    </label>
                    <label className="scft-toggle">
                        <input type="checkbox" name="isPublic" checked={seminarData.isPublic} onChange={handleChange} />
                        <span className="scft-toggle-slider" />
                        <span className="scft-toggle-text">{t('seminarSettings.isPublic', 'Публичен')}</span>
                    </label>
                </div>
            </div>

            {/* ============================================= */}
            {/* Credits & Test */}
            {/* ============================================= */}
            <div className="scft-section">
                <div className="scft-section-header">
                    <Award size={20} />
                    <h2 className="scft-section-title">{t('seminarSettings.creditsTitle', 'Кредити и тест')}</h2>
                </div>

                <div className="scft-row">
                    <div className={`scft-field ${errors.maxCredits ? 'scft-field-error' : ''}`}>
                        <label className="scft-label" htmlFor="scft-max-credits">
                            {t('seminarSettings.maxCredits', 'Макс. кредити')}
                        </label>
                        <input id="scft-max-credits" type="number" name="maxCredits" className="scft-input" value={seminarData.maxCredits} onChange={handleChange} min={0} />
                        {renderError('maxCredits')}
                    </div>
                    <div className={`scft-field ${errors.creditsForAttendance ? 'scft-field-error' : ''}`}>
                        <label className="scft-label" htmlFor="scft-credits-attendance">
                            {t('seminarSettings.creditsForAttendance', 'За присъствие')}
                        </label>
                        <input id="scft-credits-attendance" type="number" name="creditsForAttendance" className="scft-input" value={seminarData.creditsForAttendance} onChange={handleChange} min={0} />
                        {renderError('creditsForAttendance')}
                    </div>
                    <div className={`scft-field ${errors.creditsForParticipation ? 'scft-field-error' : ''}`}>
                        <label className="scft-label" htmlFor="scft-credits-participation">
                            {t('seminarSettings.creditsForParticipation', 'За участие')}
                        </label>
                        <input id="scft-credits-participation" type="number" name="creditsForParticipation" className="scft-input" value={seminarData.creditsForParticipation} onChange={handleChange} min={0} />
                        {renderError('creditsForParticipation')}
                        <span className="scft-hint">{t('seminarSettings.participationHint', 'active = 100%, moderate = 50%, passive = 0%')}</span>
                    </div>
                </div>

                <div className="scft-toggles">
                    <label className="scft-toggle">
                        <input type="checkbox" name="hasTest" checked={seminarData.hasTest} onChange={handleChange} />
                        <span className="scft-toggle-slider" />
                        <span className="scft-toggle-text">{t('seminarSettings.hasTest', 'Има тест')}</span>
                    </label>
                </div>

                {seminarData.hasTest && (
                    <div className="scft-row scft-test-fields">
                        <div className={`scft-field ${errors.creditsForTest ? 'scft-field-error' : ''}`}>
                            <label className="scft-label" htmlFor="scft-credits-test">
                                {t('seminarSettings.creditsForTest', 'За тест')}
                            </label>
                            <input id="scft-credits-test" type="number" name="creditsForTest" className="scft-input" value={seminarData.creditsForTest} onChange={handleChange} min={0} />
                            {renderError('creditsForTest')}
                        </div>
                        <div className={`scft-field ${errors.testPassingScore ? 'scft-field-error' : ''}`}>
                            <label className="scft-label" htmlFor="scft-test-score">
                                {t('seminarSettings.testPassingScore', 'Минимален резултат (%)')}
                            </label>
                            <input id="scft-test-score" type="number" name="testPassingScore" className="scft-input" value={seminarData.testPassingScore} onChange={handleChange} min={0} max={100} />
                            {renderError('testPassingScore')}
                        </div>
                    </div>
                )}
                {seminarData.hasTest && seminarId && onOpenTestEditor && (
                    <button
                        type="button"
                        className="scft-btn-test-editor"
                        onClick={onOpenTestEditor}
                    >
                        <FileText size={16} />
                        {t('seminarSettings.manageTest', 'Управлявай тест')}
                    </button>
                )}
            </div>
        </>
    );
};

export default SeminarSettings;