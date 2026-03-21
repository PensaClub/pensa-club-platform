// src/components/SeminarCreateForm/SeminarAdditional/SeminarAdditional.jsx
// Prefix: scfa-

import { useTranslation } from 'react-i18next';
import { ClipboardList, BookOpen, AlertCircle } from 'lucide-react';
import './seminarAdditional.css';

const SeminarAdditional = ({ seminarData, errors, handleChange, updateField, availableCourses, courseSearch, setCourseSearch }) => {
    const { t } = useTranslation('academy-admin');

    const renderError = (field) =>
        errors[field] ? (
            <span className="scfa-error-msg">
                <AlertCircle size={14} />
                {errors[field]}
            </span>
        ) : null;

    return (
        <>
            {/* ============================================= */}
            {/* Additional Settings */}
            {/* ============================================= */}
            <div className="scfa-section">
                <div className="scfa-section-header">
                    <ClipboardList size={20} />
                    <h2 className="scfa-section-title">{t('seminarAdditional.title', 'Допълнителни настройки')}</h2>
                </div>

                {/* Prerequisites */}
                <div className={`scfa-field ${errors.prerequisites ? 'scfa-field-error' : ''}`}>
                    <label className="scfa-label" htmlFor="scfa-prerequisites">
                        {t('seminarAdditional.prerequisites', 'Предпоставки')}
                    </label>
                    <textarea
                        id="scfa-prerequisites"
                        name="prerequisites"
                        className="scfa-textarea scfa-textarea-sm"
                        placeholder={t('seminarAdditional.prerequisitesPlaceholder', 'Какво трябва да знае участникът предварително')}
                        value={seminarData.prerequisites}
                        onChange={handleChange}
                        rows={3}
                    />
                    {renderError('prerequisites')}
                </div>

                {/* What to bring */}
                <div className={`scfa-field ${errors.whatToBring ? 'scfa-field-error' : ''}`}>
                    <label className="scfa-label" htmlFor="scfa-what-to-bring">
                        {t('seminarAdditional.whatToBring', 'Какво да донесете')}
                    </label>
                    <textarea
                        id="scfa-what-to-bring"
                        name="whatToBring"
                        className="scfa-textarea scfa-textarea-sm"
                        placeholder={t('seminarAdditional.whatToBringPlaceholder', 'Лаптоп, тетрадка, химикал')}
                        value={seminarData.whatToBring}
                        onChange={handleChange}
                        rows={2}
                    />
                    {renderError('whatToBring')}
                </div>

                {/* Assignment toggle */}
                <div className="scfa-toggles">
                    <label className="scfa-toggle">
                        <input type="checkbox" name="hasAssignment" checked={seminarData.hasAssignment} onChange={handleChange} />
                        <span className="scfa-toggle-slider" />
                        <span className="scfa-toggle-text">{t('seminarAdditional.hasAssignment', 'Има задача')}</span>
                    </label>
                </div>

                {seminarData.hasAssignment && (
                    <div className={`scfa-field scfa-assignment-field ${errors.assignmentDescription ? 'scfa-field-error' : ''}`}>
                        <label className="scfa-label" htmlFor="scfa-assignment">
                            {t('seminarAdditional.assignmentDescription', 'Описание на задачата')}
                        </label>
                        <textarea
                            id="scfa-assignment"
                            name="assignmentDescription"
                            className="scfa-textarea"
                            placeholder={t('seminarAdditional.assignmentPlaceholder', 'Опишете задачата...')}
                            value={seminarData.assignmentDescription}
                            onChange={handleChange}
                            rows={4}
                        />
                        {renderError('assignmentDescription')}
                    </div>
                )}
            </div>

            {/* ============================================= */}
            {/* Connected Course */}
            {/* ============================================= */}
            <div className="scfa-section">
                <div className="scfa-section-header">
                    <BookOpen size={20} />
                    <h2 className="scfa-section-title">{t('seminarAdditional.courseTitle', 'Свързан курс')}</h2>
                </div>
                <p className="scfa-section-desc">
                    {t('seminarAdditional.courseDesc', 'Ако семинарът е част от курс, изберете го тук. Иначе оставете празно.')}
                </p>

                {seminarData.courseId ? (
                    <div className="scfa-course-selected">
                        <div className="scfa-course-selected-info">
                            <BookOpen size={16} />
                            <span className="scfa-course-selected-name">
                                {availableCourses.find(c => c.id === seminarData.courseId)?.name || `Курс #${seminarData.courseId}`}
                            </span>
                        </div>
                        <button type="button" className="scfa-course-clear-btn" onClick={() => updateField('courseId', null)}>
                            ✕
                        </button>
                    </div>
                ) : (
                    <>
                        <input
                            type="text"
                            className="scfa-input"
                            placeholder={t('seminarAdditional.courseSearchPlaceholder', 'Търси курс по име...')}
                            value={courseSearch}
                            onChange={(e) => setCourseSearch(e.target.value)}
                        />
                        {availableCourses.length > 0 && courseSearch.trim() && (
                            <div className="scfa-course-dropdown">
                                {availableCourses
                                    .filter(c => c.name.toLowerCase().includes(courseSearch.toLowerCase()))
                                    .map((c) => (
                                        <button
                                            key={c.id}
                                            type="button"
                                            className="scfa-course-option"
                                            onClick={() => { updateField('courseId', c.id); setCourseSearch(''); }}
                                        >
                                            <span className="scfa-course-option-name">{c.name}</span>
                                            <span className="scfa-course-option-cat">{c.category || ''}</span>
                                        </button>
                                    ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default SeminarAdditional;