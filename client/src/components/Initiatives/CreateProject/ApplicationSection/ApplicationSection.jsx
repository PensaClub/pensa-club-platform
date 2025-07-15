
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faUserCheck, faClock, faUsers } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import './applicationSection.css'; 
const ApplicationSection = ({
    values,
    errors,
    onChangeHandler,
    onBlurHandler,
    setValues,
    addRequirement,
    removeRequirement
}) => {
    const { t } = useTranslation();

    return (
        <div className="project-form-section-card">
            <div className="project-form-section-header">
                <h2 className="project-form-section-title">
                    <FontAwesomeIcon icon={faUserCheck} />
                    {t('projects.create.application')}
                </h2>
            </div>
            <div className="project-form-section-content">

                {/* 📝 APPLICATION STATUS */}
                <div className="project-application-status-section">
                    <h3>📝 {t('projects.create.applicationSettings')}</h3>
                    
                    <div className="project-application-form-row">
                        {/* Application Status */}
                        <div className="project-application-form-group">
                            <label htmlFor="applicationStatus">
                                {t('projects.create.applicationStatus')}
                                <span className="project-required-indicator">*</span>
                            </label>
                            <select
                                id="applicationStatus"
                                name="applicationStatus"
                                value={values.applicationStatus || 'open'}
                                onChange={onChangeHandler}
                                onBlur={onBlurHandler}
                                className={`project-application-status-select ${errors.applicationStatus ? 'error' : ''}`}
                            >
                                <option value="open">{t('projects.applicationStatus.open')}</option>
                                <option value="closed">{t('projects.applicationStatus.closed')}</option>
                                <option value="coming-soon">{t('projects.applicationStatus.comingSoon')}</option>
                            </select>
                            <div className="project-application-field-help">
                                {t('projects.create.application-status-help')}
                            </div>
                            {errors.applicationStatus && <div className="project-application-error-message">{errors.applicationStatus}</div>}
                        </div>

                        {/* Application Deadline */}
                        <div className="project-application-form-group">
                            <label htmlFor="applicationDeadline">
                                <FontAwesomeIcon icon={faClock} />
                                {t('projects.create.applicationDeadline')}
                            </label>
                            <input
                                type="datetime-local"
                                id="applicationDeadline"
                                name="applicationDeadline"
                                value={values.applicationDeadline ? new Date(values.applicationDeadline).toISOString().slice(0, 16) : ''}
                                onChange={onChangeHandler}
                                onBlur={onBlurHandler}
                                className={`project-application-deadline-input ${errors.applicationDeadline ? 'error' : ''}`}
                                min={new Date().toISOString().slice(0, 16)}
                            />
                            <div className="project-application-field-help">
                                {t('projects.create.application-deadline-help')}
                            </div>
                            {errors.applicationDeadline && <div className="project-application-error-message">{errors.applicationDeadline}</div>}
                        </div>
                    </div>

                    {/* Status Preview */}
                    {values.applicationStatus && (
                        <div className={`project-application-status-preview status-${values.applicationStatus}`}>
                            <div className="project-application-status-badge">
                                {values.applicationStatus === 'open' && '🟢'}
                                {values.applicationStatus === 'closed' && '🔴'}
                                {values.applicationStatus === 'coming-soon' && '🟡'}
                                <span>{t(`projects.applicationStatus.${values.applicationStatus}`)}</span>
                            </div>
                            {values.applicationDeadline && values.applicationStatus === 'open' && (
                                <div className="project-application-deadline-info">
                                    <FontAwesomeIcon icon={faClock} />
                                    <span>
                                        {t('projects.create.deadlineUntil')}: {new Date(values.applicationDeadline).toLocaleString('bg-BG')}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 👥 PARTICIPANTS */}
                <div className="project-application-participants-section">
                    <h3>👥 {t('projects.create.participants')}</h3>
                    
                    <div className="project-application-form-row">
                        {/* Max Participants */}
                        <div className="project-application-form-group">
                            <label htmlFor="maxParticipants">
                                <FontAwesomeIcon icon={faUsers} />
                                {t('projects.create.maxParticipants')}
                            </label>
                            <input
                                type="number"
                                id="maxParticipants"
                                name="maxParticipants"
                                value={values.maxParticipants || ''}
                                onChange={onChangeHandler}
                                onBlur={onBlurHandler}
                                className={`project-application-participants-input ${errors.maxParticipants ? 'error' : ''}`}
                                placeholder="0"
                                min="1"
                                step="1"
                            />
                            <div className="project-application-field-help">
                                {t('projects.create.max-participants-help')}
                            </div>
                            {errors.maxParticipants && <div className="project-application-error-message">{errors.maxParticipants}</div>}
                        </div>

                        {/* Current Participants */}
                        <div className="project-application-form-group">
                            <label htmlFor="currentParticipants">
                                {t('projects.create.currentParticipants')}
                            </label>
                            <input
                                type="number"
                                id="currentParticipants"
                                name="currentParticipants"
                                value={values.currentParticipants || 0}
                                onChange={onChangeHandler}
                                onBlur={onBlurHandler}
                                className={`project-application-participants-input ${errors.currentParticipants ? 'error' : ''}`}
                                placeholder="0"
                                min="0"
                                step="1"
                                max={values.maxParticipants || 999}
                            />
                            <div className="project-application-field-help">
                                {t('projects.create.current-participants-help')}
                            </div>
                            {errors.currentParticipants && <div className="project-application-error-message">{errors.currentParticipants}</div>}
                        </div>
                    </div>

                    {/* Participants Progress */}
                    {values.maxParticipants && values.currentParticipants !== undefined && (
                        <div className="project-application-participants-progress">
                            <h4>📊 {t('projects.create.participantsProgress')}</h4>
                            <div className="project-application-progress-bar">
                                <div 
                                    className="project-application-progress-fill"
                                    style={{ 
                                        width: `${Math.min((values.currentParticipants / values.maxParticipants) * 100, 100)}%` 
                                    }}
                                ></div>
                            </div>
                            <div className="project-application-progress-stats">
                                <span className="project-application-current">{values.currentParticipants}</span>
                                <span>/</span>
                                <span className="project-application-max">{values.maxParticipants}</span>
                                <span className="project-application-percentage">
                                    ({Math.round((values.currentParticipants / values.maxParticipants) * 100)}%)
                                </span>
                                <span className="project-application-available">
                                    • {values.maxParticipants - values.currentParticipants} {t('projects.create.spotsAvailable')}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* 📋 REQUIREMENTS */}
                <div className="project-application-requirements-section">
                    <div className="project-application-dynamic-section-header">
                        <h3>📋 {t('projects.create.participantRequirements')}</h3>
                        <button
                            type="button"
                            className="project-application-form-btn accent"
                            onClick={addRequirement}
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            {t('projects.create.addRequirement')}
                        </button>
                    </div>
                    <div className="project-application-field-help">
                        {t('projects.create.participant-requirements-help')}
                    </div>

                    {values.participantRequirements?.length === 0 ? (
                        <div className="project-application-empty-requirements">
                            <div className="project-application-empty-state">
                                <FontAwesomeIcon icon={faUsers} className="project-application-empty-icon" />
                                <p>{t('projects.create.noRequirements')}</p>
                                <p className="project-application-empty-description">{t('projects.create.requirementsDescription')}</p>
                                <button
                                    type="button"
                                    className="project-application-form-btn primary"
                                    onClick={addRequirement}
                                >
                                    <FontAwesomeIcon icon={faPlus} />
                                    {t('projects.create.addFirstRequirement')}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="project-application-requirements-list">
                            {values.participantRequirements.map((requirement, index) => (
                                <div key={index} className="project-application-requirement-item">
                                    <div className="project-application-requirement-header">
                                        <h5>
                                            {t('projects.create.requirementNumber', { number: index + 1 })}
                                            {errors[`participantRequirements[${index}]`] && (
                                                <span className="project-application-error-indicator">⚠️</span>
                                            )}
                                        </h5>
                                        <button
                                            type="button"
                                            className="project-application-remove-requirement-btn"
                                            onClick={() => removeRequirement(index)}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                            {t('projects.create.remove')}
                                        </button>
                                    </div>

                                    <div className="project-application-requirement-content">
                                        <input
                                            type="text"
                                            value={requirement || ''}
                                            onChange={(e) => {
                                                const updatedRequirements = [...values.participantRequirements];
                                                updatedRequirements[index] = e.target.value;
                                                setValues(prev => ({ ...prev, participantRequirements: updatedRequirements }));
                                            }}
                                            placeholder={t('projects.create.requirementPlaceholder')}
                                            className={`project-application-requirement-input ${errors[`participantRequirements[${index}]`] ? 'error' : ''}`}
                                            maxLength={200}
                                        />
                                        <div className="project-application-character-count">
                                            {requirement?.length || 0}/200
                                        </div>
                                        {errors[`participantRequirements[${index}]`] && (
                                            <div className="project-application-error-message">{errors[`participantRequirements[${index}]`]}</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Requirements Preview */}
                    {values.participantRequirements?.length > 0 && (
                        <div className="project-application-requirements-preview">
                            <h4>📝 {t('projects.create.requirementsPreview')}</h4>
                            <ul className="project-application-requirements-preview-list">
                                {values.participantRequirements
                                    .filter(req => req?.trim())
                                    .map((requirement, index) => (
                                        <li key={index} className="project-application-requirement-preview-item">
                                            <span className="project-application-requirement-bullet">✓</span>
                                            <span>{requirement}</span>
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ApplicationSection;