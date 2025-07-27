import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import './FileSection.css';

const FileSection = ({ values, errors, onChangeHandler }) => {
    const { t } = useTranslation();

    return (
        <div className="publication-form-section-card">
            <div className="publication-form-section-header">
                <h2 className="publication-form-section-title">
                    <FontAwesomeIcon icon={faFileAlt} />
                    {t('publications.create.file')}
                </h2>
            </div>
            <div className="publication-form-section-content">
                {/* File Type */}
                <div className="publication-form-group">
                    <label htmlFor="fileType">
                        {t('publications.create.fileType')}
                    </label>
                    <select
                        id="fileType"
                        name="fileType"
                        value={values.fileType}
                        onChange={onChangeHandler}
                    >
                        <option value="">{t('publications.create.selectFileType')}</option>
                        <option value="pdf">PDF</option>
                        <option value="docx">DOCX</option>
                        <option value="xlsx">XLSX</option>
                        <option value="pptx">PPTX</option>
                    </select>
                </div>

                {/* File Size */}
                <div className="publication-form-group">
                    <label htmlFor="fileSize">
                        {t('publications.create.fileSize')}
                    </label>
                    <input
                        type="text"
                        id="fileSize"
                        name="fileSize"
                        value={values.fileSize}
                        onChange={onChangeHandler}
                        placeholder={t('publications.create.fileSizePlaceholder')}
                    />
                </div>

                {/* Download URL */}
                <div className="publication-form-group">
                    <label htmlFor="downloadUrl">
                        {t('publications.create.downloadUrl')}
                    </label>
                    <input
                        type="text"
                        id="downloadUrl"
                        name="downloadUrl"
                        value={values.downloadUrl}
                        onChange={onChangeHandler}
                        placeholder={t('publications.create.downloadUrlPlaceholder')}
                    />
                    <div className="publication-field-help">
                        {t('publications.create.downloadUrl-help')}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FileSection;
