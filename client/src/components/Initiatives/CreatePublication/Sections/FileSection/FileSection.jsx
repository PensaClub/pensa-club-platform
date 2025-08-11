import React from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faClock, faLink } from '@fortawesome/free-solid-svg-icons';

const FileSection = ({
    values,
    errors,
    onChangeHandler,
    onBlurHandler,
    setValues
}) => {
    const { t } = useTranslation();

    const fileTypes = [
        { value: '', label: t('publications.selectFileType') },
        { value: 'pdf', label: t('publications.fileTypes.pdf') },
        { value: 'doc', label: t('publications.fileTypes.doc') },
        { value: 'txt', label: t('publications.fileTypes.txt') },
        { value: 'epub', label: t('publications.fileTypes.epub') }
    ];

    return (
        <div className="publication-form-section">
            {/* Type and Size Row */}
            <div className="publication-form-row">
                <div className="publication-form-group">
                    <label htmlFor="fileType" className="publication-form-label">
                        <FontAwesomeIcon icon={faFileAlt} className="publication-form-icon" />
                        {t('publications.fileType')}
                    </label>
                    <select
                        id="fileType"
                        name="fileType"
                        value={values.fileType || ''}
                        onChange={onChangeHandler}
                        onBlur={onBlurHandler}
                        className={`publication-form-select ${errors.fileType ? 'publication-form-error' : ''}`}
                    >
                        {fileTypes.map((fileType) => (
                            <option key={fileType.value} value={fileType.value}>
                                {fileType.label}
                            </option>
                        ))}
                    </select>
                    {errors.fileType && (
                        <span className="publication-form-error-message">{errors.fileType}</span>
                    )}
                </div>

                <div className="publication-form-group">
                    <label htmlFor="fileSize" className="publication-form-label">
                        <FontAwesomeIcon icon={faFileAlt} className="publication-form-icon" />
                        {t('publications.fileSize')}
                    </label>
                    <input
                        type="number"
                        id="fileSize"
                        name="fileSize"
                        value={values.fileSize || ''}
                        onChange={onChangeHandler}
                        onBlur={onBlurHandler}
                        placeholder={t('publications.fileSizePlaceholder')}
                        min="1"
                        max="100"
                        step="0.1"
                        className={`publication-form-input ${errors.fileSize ? 'publication-form-error' : ''}`}
                    />
                    {errors.fileSize && (
                        <span className="publication-form-error-message">{errors.fileSize}</span>
                    )}
                </div>
            </div>

            {/* Read Time and URL Row */}
            <div className="publication-form-row">
                <div className="publication-form-group">
                    <label htmlFor="readTime" className="publication-form-label">
                        <FontAwesomeIcon icon={faClock} className="publication-form-icon" />
                        {t('publications.readTime')}
                    </label>
                    <input
                        type="number"
                        id="readTime"
                        name="readTime"
                        value={values.readTime || ''}
                        onChange={onChangeHandler}
                        onBlur={onBlurHandler}
                        placeholder={t('publications.readTimePlaceholder')}
                        min="1"
                        max="480"
                        className={`publication-form-input ${errors.readTime ? 'publication-form-error' : ''}`}
                    />
                    {errors.readTime && (
                        <span className="publication-form-error-message">{errors.readTime}</span>
                    )}
                </div>

                <div className="publication-form-group">
                    <label htmlFor="downloadUrl" className="publication-form-label">
                        <FontAwesomeIcon icon={faLink} className="publication-form-icon" />
                        {t('publications.downloadUrl')}
                    </label>
                    <input
                        type="url"
                        id="downloadUrl"
                        name="downloadUrl"
                        value={values.downloadUrl || ''}
                        onChange={onChangeHandler}
                        onBlur={onBlurHandler}
                        placeholder={t('publications.downloadUrlPlaceholder')}
                        className={`publication-form-input ${errors.downloadUrl ? 'publication-form-error' : ''}`}
                    />
                    {errors.downloadUrl && (
                        <span className="publication-form-error-message">{errors.downloadUrl}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FileSection;
