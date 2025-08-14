import React, { useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faClock, faUpload, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
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
    const { t } = useTranslation();
    const fileInputRef = useRef(null);

    // Handle file upload with minimum time
    const handleFileUpload = useCallback(async (e) => {
        console.log('🚀 handleFileUpload called!');
        console.log('📁 Event:', e);
        console.log('📁 Files:', e.target.files);

        const files = e.target.files;
        if (!files || files.length === 0) {
            console.log('❌ No files selected');
            return;
        }

        const file = files[0]; // Only one file allowed

        console.log('📁 File selected:', file.name, file.size, file.type);
        console.log(' setValues function:', typeof setValues, setValues);

        // Validate file
        const validation = isValidDocument(file);
        if (!validation.valid) {
            console.log('❌ File validation failed:', validation.error);
            notify('error', validation.error);
            e.target.value = '';
            return;
        }

        console.log('✅ File validation passed');

        // Record start time for minimum upload duration
        const startTime = Date.now();
        const minUploadTime = 2000; // 2 seconds minimum

        try {
            // Show uploading state
            console.log('🔄 About to call setValues for uploading state...');
            setValues(prev => {
                console.log('🔄 Inside setValues callback - prev values:', prev);
                const newValues = {
                    ...prev,
                    fileType: file.name.split('.').pop().toLowerCase(),
                    fileSize: formatFileSize(file.size),
                    downloadUrl: '',
                    isUploading: true
                };
                console.log('🔄 New values after uploading state:', newValues);
                return newValues;
            });

            console.log('📤 Starting Firebase upload...');
            // Upload to Firebase
            const uploadedUrl = await uploadDocumentWithProgress(
                file,
                'publications/documents',
                (progress) => {
                    console.log(`📊 Upload progress: ${progress}%`);
                }
            );

            console.log('✅ Firebase upload successful:', uploadedUrl);

            // Calculate elapsed time and ensure minimum duration
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, minUploadTime - elapsedTime);

            if (remainingTime > 0) {
                console.log(`⏱️ Waiting ${remainingTime}ms to meet minimum upload time`);
                await new Promise(resolve => setTimeout(resolve, remainingTime));
            }

            // Update with Firebase URL
            console.log('💾 About to call setValues with Firebase URL...');
            setValues(prev => {
                console.log('💾 Inside setValues callback - prev values:', prev);
                const newValues = {
                    ...prev,
                    fileType: file.name.split('.').pop().toLowerCase(),
                    fileSize: formatFileSize(file.size),
                    downloadUrl: uploadedUrl,
                    isUploading: false,
                    originalFileName: file.name
                };
                console.log('📋 New values after Firebase URL:', newValues);
                return newValues;
            });

            notify('success', 'File uploaded successfully!');
            e.target.value = '';

        } catch (error) {
            console.error('❌ Upload error:', error);
            notify('error', 'File upload failed');
            setValues(prev => ({
                ...prev,
                isUploading: false
            }));
            e.target.value = '';
        }
    }, [setValues]);

    // Remove uploaded file
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
            {/* File Upload Section */}
            <div className="publication-form-group">
                <label className="publication-form-label">
                    <FontAwesomeIcon icon={faFileAlt} className="publication-form-icon" />
                    {t('publications.create.uploadFile')}
                </label>

                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.csv,.jpg,.jpeg,.png,.gif,.webp"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    disabled={values.isUploading}
                />

                {/* Upload Area */}
                {!values.downloadUrl ? (
                    <div
                        className={`publication-file-upload-area ${values.isUploading ? 'uploading' : ''}`}
                        onClick={() => {
                            if (!values.isUploading) {
                                console.log('🖱️ Upload area clicked!');
                                console.log('📁 fileInputRef.current:', fileInputRef.current);
                                fileInputRef.current?.click();
                            }
                        }}
                    >
                        {values.isUploading ? (
                            <>

                                <p>{t('publications.create.uploadingDescription')}<FontAwesomeIcon icon={faSpinner} className="publication-upload-spinner" spin /></p>
                                <small>{t('publications.create.uploadingHint')}</small>
                            </>
                        ) : (
                            <>
                                <h4>{t('publications.create.clickToUpload')}</h4>
                                <p>{t('publications.create.supportedFormats')}: PDF, Word, Excel, PowerPoint, Text</p>
                                <small>{t('publications.create.maxSize')}: 10MB</small>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="publication-file-preview">
                        <div className="publication-file-info">
                            <FontAwesomeIcon icon={faFileAlt} />
                            <div className="publication-file-details">
                                <div className="publication-file-name">
                                    {values.originalFileName || 'Uploaded file'}
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

            {/* Display uploaded file info (read-only) */}
            {values.downloadUrl && (
                <div className="publication-form-group">
                    <label className="publication-form-label">
                        <FontAwesomeIcon icon={faFileAlt} className="publication-form-icon" />
                        {t('publications.create.fileInfo')}
                    </label>
                    <div className="publication-file-info-display">
                        <div className="publication-info-row">
                            <span className="publication-info-label">{t('publications.create.fileType')}:</span>
                            <span className="publication-info-value">{values.fileType?.toUpperCase()}</span>
                        </div>
                        <div className="publication-info-row">
                            <span className="publication-info-label">{t('publications.create.fileSize')}:</span>
                            <span className="publication-info-value">{values.fileSize}</span>
                        </div>
                        <div className="publication-info-row">
                            <span className="publication-info-label">{t('publications.create.downloadUrl')}:</span>
                            <span className="publication-info-value">
                                <a
                                    href={values.downloadUrl}
                                    download={values.originalFileName || 'document'}
                                    className="publication-file-link publication-file-download"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {t('publications.create.downloadFile')}
                                </a>
                            </span>
                        </div>

                        {/* View link row only for PDF files */}
                        {values.fileType?.toLowerCase() === 'pdf' && (
                            <div className="publication-info-row">
                                <span className="publication-info-label">{t('publications.create.viewUrl')}:</span>
                                <span className="publication-info-value">
                                    <a
                                        href={values.downloadUrl}
                                        className="publication-file-link publication-file-view"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {t('publications.create.viewFile')}
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
