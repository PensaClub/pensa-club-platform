// src/components/SeminarCreateForm/SeminarBasicInfo/SeminarBasicInfo.jsx
// Prefix: scfb-

import { useTranslation } from 'react-i18next';
import { Info, AlertCircle } from 'lucide-react';
import './seminarBasicInfo.css';

const SEMINAR_TYPES = ['workshop', 'discussion', 'hands_on', 'q_and_a'];

const SeminarBasicInfo = ({ seminarData, errors, handleChange, updateField }) => {
    const { t } = useTranslation('academy-admin');

    const renderError = (field) =>
        errors[field] ? (
            <span className="scfb-error-msg">
                <AlertCircle size={14} />
                {errors[field]}
            </span>
        ) : null;

    return (
        <div className="scfb-section">
            <div className="scfb-section-header">
                <Info size={20} />
                <h2 className="scfb-section-title">{t('seminarBasicInfo.title', 'Основна информация')}</h2>
            </div>

            {/* Title */}
            <div className={`scfb-field ${errors.title ? 'scfb-field-error' : ''}`}>
                <label className="scfb-label" htmlFor="scfb-title">
                    {t('seminarBasicInfo.seminarTitle', 'Заглавие')} <span className="scfb-required">*</span>
                </label>
                <input
                    id="scfb-title"
                    type="text"
                    name="title"
                    className="scfb-input"
                    placeholder={t('seminarBasicInfo.titlePlaceholder', 'Напр. Как да плащаме сметки онлайн')}
                    value={seminarData.title}
                    onChange={handleChange}
                    maxLength={200}
                />
                {renderError('title')}
                <span className="scfb-char-count">{seminarData.title.length}/200</span>
            </div>

            {/* Short Description */}
            <div className={`scfb-field ${errors.shortDescription ? 'scfb-field-error' : ''}`}>
                <label className="scfb-label" htmlFor="scfb-short-desc">
                    {t('seminarBasicInfo.shortDescription', 'Кратко описание')}
                </label>
                <textarea
                    id="scfb-short-desc"
                    name="shortDescription"
                    className="scfb-textarea scfb-textarea-sm"
                    placeholder={t('seminarBasicInfo.shortDescriptionPlaceholder', 'Кратко описание на семинара...')}
                    value={seminarData.shortDescription}
                    onChange={handleChange}
                    maxLength={500}
                    rows={3}
                />
                {renderError('shortDescription')}
                <span className="scfb-char-count">{(seminarData.shortDescription || '').length}/500</span>
            </div>

            {/* Description */}
            <div className={`scfb-field ${errors.description ? 'scfb-field-error' : ''}`}>
                <label className="scfb-label" htmlFor="scfb-desc">
                    {t('seminarBasicInfo.description', 'Пълно описание')}
                </label>
                <textarea
                    id="scfb-desc"
                    name="description"
                    className="scfb-textarea"
                    placeholder={t('seminarBasicInfo.descriptionPlaceholder', 'Подробно описание...')}
                    value={seminarData.description}
                    onChange={handleChange}
                    rows={6}
                />
                {renderError('description')}
            </div>

            {/* Category + Type */}
            <div className="scfb-row">
                <div className={`scfb-field ${errors.category ? 'scfb-field-error' : ''}`}>
                    <label className="scfb-label" htmlFor="scfb-category">
                        {t('seminarBasicInfo.category', 'Категория')}
                    </label>
                    <input
                        id="scfb-category"
                        type="text"
                        name="category"
                        className="scfb-input"
                        placeholder={t('seminarBasicInfo.categoryPlaceholder', 'Напр. Дигитална грамотност')}
                        value={seminarData.category}
                        onChange={handleChange}
                        maxLength={100}
                    />
                    {renderError('category')}
                </div>

                <div className={`scfb-field ${errors.seminarType ? 'scfb-field-error' : ''}`}>
                    <label className="scfb-label" htmlFor="scfb-type">
                        {t('seminarBasicInfo.seminarType', 'Тип семинар')}
                    </label>
                    <select
                        id="scfb-type"
                        name="seminarType"
                        className="scfb-select"
                        value={seminarData.seminarType}
                        onChange={handleChange}
                    >
                        {SEMINAR_TYPES.map((type) => (
                            <option key={type} value={type}>
                                {t(`seminarBasicInfo.types.${type}`, type)}
                            </option>
                        ))}
                    </select>
                    {renderError('seminarType')}
                </div>
            </div>

            {/* Tags */}
            <div className={`scfb-field ${errors.tags ? 'scfb-field-error' : ''}`}>
                <label className="scfb-label" htmlFor="scfb-tags">
                    {t('seminarBasicInfo.tags', 'Тагове')}
                </label>
                <input
                    id="scfb-tags"
                    type="text"
                    name="tags"
                    className="scfb-input"
                    placeholder={t('seminarBasicInfo.tagsPlaceholder', 'интернет, безопасност, начинаещи')}
                    value={seminarData.tags}
                    onChange={handleChange}
                />
                <span className="scfb-hint">{t('seminarBasicInfo.tagsHint', 'Разделени със запетая')}</span>
                {renderError('tags')}
            </div>

            {/* Learning Points */}
            <div className="scfb-field">
                <label className="scfb-label">
                    {t('seminarBasicInfo.learningPoints', 'Какво ще научите')}
                </label>
                <div className="scfb-learning-points">
                    {(seminarData.learningPoints || []).map((point, index) => (
                        <div key={index} className="scfb-learning-point">
                            <span className="scfb-learning-point-icon">✓</span>
                            <input
                                type="text"
                                className="scfb-input scfb-learning-point-input"
                                value={point}
                                placeholder={t('seminarBasicInfo.learningPointPlaceholder', 'Напр. Основни понятия и концепции')}
                                onChange={(e) => {
                                    const updated = [...seminarData.learningPoints];
                                    updated[index] = e.target.value;
                                    updateField('learningPoints', updated);
                                }}
                            />
                            <button
                                type="button"
                                className="scfb-learning-point-remove"
                                onClick={() => {
                                    const updated = seminarData.learningPoints.filter((_, i) => i !== index);
                                    updateField('learningPoints', updated);
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                    {(seminarData.learningPoints || []).length < 10 && (
                        <button
                            type="button"
                            className="scfb-learning-point-add"
                            onClick={() => updateField('learningPoints', [...(seminarData.learningPoints || []), ''])}
                        >
                            + {t('seminarBasicInfo.addLearningPoint', 'Добави точка')}
                        </button>
                    )}
                </div>
                <span className="scfb-hint">{t('seminarBasicInfo.learningPointsHint', 'До 10 точки')}</span>
            </div>
        </div>
    );
};

export default SeminarBasicInfo;