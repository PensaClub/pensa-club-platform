import React, { useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { uploadDocumentWithProgress, isValidDocument, formatFileSize } from '../../../../Articles/articleUtils/file-utils';
import { notify } from '../../../../../utils/notify';
import './FileSection.css';

const FileSection = ({
    values,
    errors,
    onChangeHandler,
    onBlurHandler,
    setValues
}) => {
    const { t } = useTranslation('content');
    const fileInputRef = useRef(null);

    const handleFileUpload = useCallback(async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) {
            return;
        }

        const file = files[0];

        const validation = isValidDocument(file);
        if (!validation.valid) {
            notify('error', null, validation.error);
            e.target.value = '';
            return;
        }

        const startTime = Date.now();
        const minUploadTime = 2000;

        try {
            setValues(prev => ({
                ...prev,
                fileType: file.name.split('.').pop().toLowerCase(),
                fileSize: formatFileSize(file.size),
                downloadUrl: '',
                originalFileName: file.name,
                isUploading: true
            }));

            const uploadedUrl = await uploadDocumentWithProgress(
                file,
                'publications/documents',
                (progress) => {
                    // Progress callback - could be used for progress bar if needed
                }
            );

            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, minUploadTime - elapsedTime);

            if (remainingTime > 0) {
                await new Promise(resolve => setTimeout(resolve, remainingTime));
            }

            setValues(prev => ({
                ...prev,
                fileType: file.name.split('.').pop().toLowerCase(),
                fileSize: formatFileSize(file.size),
                downloadUrl: uploadedUrl,
                originalFileName: file.name,
                isUploading: false,
            }));

            notify('file-upload-success');
            e.target.value = '';

        } catch (error) {
            notify('file-upload-failed');
            setValues(prev => ({
                ...prev,
                isUploading: false
            }));
            e.target.value = '';
        }
    }, [setValues]);

    const removeFile = useCallback(() => {
        setValues(prev => ({
            ...prev,
            fileType: '',
            fileSize: '',
            downloadUrl: '',
            originalFileName: ''
        }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [setValues]);

    return (
        <div className="publication-form-section">
            <div className="publication-form-group">
                <label className="publication-form-label">
                    <FontAwesomeIcon icon={faFileAlt} className="publication-form-icon" />
                    {t('publications.fileUpload.uploadFile')}
                </label>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.csv,.jpg,.jpeg,.png,.gif,.webp"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    disabled={values.isUploading}
                />

                {!values.downloadUrl ? (
                    <div
                        className={`publication-file-upload-area ${values.isUploading ? 'uploading' : ''}`}
                        onClick={() => {
                            if (!values.isUploading) {
                                fileInputRef.current?.click();
                            }
                        }}
                    >
                        {values.isUploading ? (
                            <>
                                <p>{t('publications.fileUpload.uploadingDescription')}<FontAwesomeIcon icon={faSpinner} className="publication-upload-spinner" spin /></p>
                                <small>{t('publications.fileUpload.uploadingHint')}</small>
                            </>
                        ) : (
                            <>
                                <h4>{t('publications.fileUpload.clickToUpload')}</h4>
                                <p>{t('publications.fileUpload.supportedFormats')}: PDF, Word, Excel, PowerPoint, Text</p>
                                <small>{t('publications.fileUpload.maxSize')}: 10MB</small>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="publication-file-preview">
                        <div className="publication-file-info">
                            <FontAwesomeIcon icon={faFileAlt} />
                            <div className="publication-file-details">
                                <div className="publication-file-name">
                                    {values.originalFileName || t('publications.unnamedFile')}
                                </div>
                                <div className="publication-file-meta">
                                    {values.fileType?.toUpperCase()} • {values.fileSize}
                                </div>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="publication-file-remove"
                            onClick={removeFile}
                            disabled={values.isUploading}
                        >
                            {values.isUploading ? (
                                <FontAwesomeIcon icon={faSpinner} spin />
                            ) : (
                                <FontAwesomeIcon icon={faTimes} />
                            )}
                        </button>
                    </div>
                )}
            </div>

            {values.downloadUrl && (
                <div className="publication-form-group">
                    <label className="publication-form-label">
                        <FontAwesomeIcon icon={faFileAlt} className="publication-form-icon" />
                        {t('publications.fileUpload.fileInfo')}
                    </label>
                    <div className="publication-file-info-display">
                        <div className="publication-info-row">
                            <span className="publication-info-label">{t('publications.fileUpload.fileType')}:</span>
                            <span className="publication-info-value">{values.fileType?.toUpperCase()}</span>
                        </div>
                        <div className="publication-info-row">
                            <span className="publication-info-label">{t('publications.fileUpload.fileSize')}:</span>
                            <span className="publication-info-value">{values.fileSize}</span>
                        </div>
                        <div className="publication-info-row">
                            <span className="publication-info-label">{t('publications.fileUpload.downloadUrl')}:</span>
                            <span className="publication-info-value">
                                <a
                                    href={values.downloadUrl}
                                    download={values.originalFileName || 'document'}
                                    className="publication-file-link publication-file-download"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {t('publications.fileUpload.downloadFile')}
                                </a>
                            </span>
                        </div>

                        {values.fileType?.toLowerCase() === 'pdf' && (
                            <div className="publication-info-row">
                                <span className="publication-info-label">{t('publications.fileUpload.viewUrl')}:</span>
                                <span className="publication-info-value">
                                    <a
                                        href={values.downloadUrl}
                                        className="publication-file-link publication-file-view"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {t('publications.fileUpload.viewFile')}
                                    </a>
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileSection;
