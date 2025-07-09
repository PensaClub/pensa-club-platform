// components/Projects/ProjectCreateForm/MediaSection/MediaSection.jsx
import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faImage, faPlus, faTrash, faFileAlt, faUpload, faDownload,
    faEye, faTimes, faFileExcel, faFileWord, faFilePdf, 
    faFileImage, faFilePowerpoint, faFile, faCloudUploadAlt,
    faImages, faFolder, faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import './mediaSection.css';

const MediaSection = ({
    values,
    errors,
    setValues,
    handleGalleryUpload,
    removeGalleryImage,
    handleDocumentUpload,
    removeDocument,
    handleLogoUpload,
    removeLogo,
    clearAllGallery,
    clearAllDocuments
}) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('gallery');
    const [dragOver, setDragOver] = useState('');
    const galleryInputRef = useRef(null);
    const documentsInputRef = useRef(null);
    const logoInputRef = useRef(null);

    // File type icons
    const getFileIcon = (fileName) => {
        const extension = fileName.split('.').pop().toLowerCase();
        switch (extension) {
            case 'xlsx':
            case 'xls':
            case 'csv':
                return faFileExcel;
            case 'docx':
            case 'doc':
                return faFileWord;
            case 'pdf':
                return faFilePdf;
            case 'pptx':
            case 'ppt':
                return faFilePowerpoint;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'webp':
                return faFileImage;
            default:
                return faFileAlt;
        }
    };

    // File size formatter
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Handle gallery upload
    const handleGalleryChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        await handleGalleryUpload(files);
        e.target.value = '';
    };

    // Handle documents upload
    const handleDocumentsChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        await handleDocumentUpload(files);
        e.target.value = '';
    };
// Добави тази функция в MediaSection.jsx
const downloadFileWithOriginalName = async (document) => {
    try {
        // Fetch файла
        const response = await fetch(document.url || document.src);
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const blob = await response.blob();
        
        // Създай download link с оригиналното име
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = document.originalName || document.name || document.filename || 'document';
        
        // Добави към DOM, кликни и премахни
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Почисти blob URL
        window.URL.revokeObjectURL(url);
        
    } catch (error) {
        console.error('Download error:', error);
        // Fallback - отвори в нов tab
        window.open(document.url || document.src, '_blank');
    }
};
    // Handle logo upload
    const handleLogoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        await handleLogoUpload(file);
        e.target.value = '';
    };

    // Drag and drop handlers
    const handleDragOver = (e, type) => {
        e.preventDefault();
        setDragOver(type);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver('');
    };

    const handleDrop = async (e, type) => {
        e.preventDefault();
        setDragOver('');
        
        const files = Array.from(e.dataTransfer.files);
        if (files.length === 0) return;

        if (type === 'gallery') {
            const imageFiles = files.filter(file => file.type.startsWith('image/'));
            if (imageFiles.length > 0) {
                await handleGalleryUpload(imageFiles);
            }
        } else if (type === 'documents') {
            await handleDocumentUpload(files);
        }
    };

    // Calculate statistics
    const getStats = () => {
        const totalImages = values.gallery?.length || 0;
        const totalDocuments = values.downloadMaterials?.length || 0;
        const totalSize = [
            ...(values.gallery || []),
            ...(values.downloadMaterials || [])
        ].reduce((sum, item) => sum + (item.size || 0), 0);

        return {
            totalImages,
            totalDocuments,
            totalFiles: totalImages + totalDocuments,
            totalSize: formatFileSize(totalSize),
            hasLogo: !!(values.logo && values.logo.trim())
        };
    };

    const stats = getStats();

    return (
        <div className="project-media-section-card">
            <div className="project-media-section-header">
                <h2 className="project-media-section-title">
                    <FontAwesomeIcon icon={faImages} />
                    {t('projects.create.media')}
                </h2>
            </div>

            <div className="project-form-section-content">
                <div className="project-media-help">
                    <p>{t('projects.create.media-help')}</p>
                </div>

                {/* Tabs */}
                <div className="project-media-tabs">
                    <button
                        type="button"
                        className={`project-media-tab ${activeTab === 'gallery' ? 'active' : ''}`}
                        onClick={() => setActiveTab('gallery')}
                    >
                        <FontAwesomeIcon icon={faImages} />
                        {t('projects.create.gallery')} ({stats.totalImages})
                    </button>
                    <button
                        type="button"
                        className={`project-media-tab ${activeTab === 'documents' ? 'active' : ''}`}
                        onClick={() => setActiveTab('documents')}
                    >
                        <FontAwesomeIcon icon={faFolder} />
                        {t('projects.create.documents')} ({stats.totalDocuments})
                    </button>
                    <button
                        type="button"
                        className={`project-media-tab ${activeTab === 'logo' ? 'active' : ''}`}
                        onClick={() => setActiveTab('logo')}
                    >
                        <FontAwesomeIcon icon={faImage} />
                        {t('projects.create.projectLogo')}
                    </button>
                </div>

                {/* Gallery Tab */}
                {activeTab === 'gallery' && (
                    <div className="project-media-tab-content">
                        <div className="project-media-tab-header">
                            <h3>{t('projects.create.gallery')}</h3>
                            <div className="project-media-tab-actions">
                                <button
                                    type="button"
                                    className="project-media-form-btn primary"
                                    onClick={() => galleryInputRef.current?.click()}
                                >
                                    <FontAwesomeIcon icon={faUpload} />
                                    {t('projects.create.uploadImages')}
                                </button>
                                {values.gallery?.length > 0 && (
                                    <button
                                        type="button"
                                        className="project-media-form-btn danger"
                                        onClick={clearAllGallery}
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                        {t('projects.create.clearAll')}
                                    </button>
                                )}
                            </div>
                        </div>

                        <input
                            ref={galleryInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleGalleryChange}
                            style={{ display: 'none' }}
                        />

                        {/* Gallery Upload Area */}
                        <div 
                            className={`project-media-upload-area ${dragOver === 'gallery' ? 'drag-over' : ''}`}
                            onDragOver={(e) => handleDragOver(e, 'gallery')}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, 'gallery')}
                            onClick={() => galleryInputRef.current?.click()}
                        >
                            <FontAwesomeIcon icon={faCloudUploadAlt} className="project-media-upload-icon" />
                            <h4>{t('projects.create.dragDropImages')}</h4>
                            <p>{t('projects.create.clickToUpload')}</p>
                            <div className="project-media-supported-formats">
                                <small>{t('projects.create.supportedImageFormats')}: JPG, PNG, GIF, WebP</small>
                            </div>
                        </div>

                        {/* Gallery Preview */}
                        {values.gallery && values.gallery.length > 0 ? (
                            <div className="project-media-gallery-grid">
                                {values.gallery.map((image, index) => (
                                    <div key={index} className="project-media-gallery-item">
                                        <div className="project-media-image-preview">
                                            <img src={image.src || image.url} alt={image.alt || `Gallery image ${index + 1}`} />
                                            {image.isUploading && (
                                                <div className="project-media-uploading-overlay">
                                                    <FontAwesomeIcon icon={faSpinner} spin />
                                                </div>
                                            )}
                                            <div className="project-media-image-overlay">
                                                <button
                                                    type="button"
                                                    className="project-media-image-btn view"
                                                    onClick={() => window.open(image.src || image.url, '_blank')}
                                                    title={t('projects.create.viewImage')}
                                                >
                                                    <FontAwesomeIcon icon={faEye} />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="project-media-image-btn remove"
                                                    onClick={() => removeGalleryImage(index)}
                                                    title={t('projects.create.removeImage')}
                                                >
                                                    <FontAwesomeIcon icon={faTimes} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="project-media-image-info">
                                            <div className="project-media-image-name">
                                                {image.name || `Image ${index + 1}`}
                                            </div>
                                            {image.size && (
                                                <div className="project-media-image-size">
                                                    {formatFileSize(image.size)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="project-media-empty-state">
                                <FontAwesomeIcon icon={faImages} className="project-media-empty-icon" />
                                <h3>{t('projects.create.noImages')}</h3>
                                <p>{t('projects.create.galleryDescription')}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Documents Tab */}
                {activeTab === 'documents' && (
                    <div className="project-media-tab-content">
                        <div className="project-media-tab-header">
                            <h3>{t('projects.create.documents')}</h3>
                            <div className="project-media-tab-actions">
                                <button
                                    type="button"
                                    className="project-media-form-btn primary"
                                    onClick={() => documentsInputRef.current?.click()}
                                >
                                    <FontAwesomeIcon icon={faUpload} />
                                    {t('projects.create.uploadDocuments')}
                                </button>
                                {values.downloadMaterials?.length > 0 && (
                                    <button
                                        type="button"
                                        className="project-media-form-btn danger"
                                        onClick={clearAllDocuments}
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                        {t('projects.create.clearAll')}
                                    </button>
                                )}
                            </div>
                        </div>

                        <input
                            ref={documentsInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.csv"
                            multiple
                            onChange={handleDocumentsChange}
                            style={{ display: 'none' }}
                        />

                        {/* Documents Upload Area */}
                        <div 
                            className={`project-media-upload-area ${dragOver === 'documents' ? 'drag-over' : ''}`}
                            onDragOver={(e) => handleDragOver(e, 'documents')}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, 'documents')}
                            onClick={() => documentsInputRef.current?.click()}
                        >
                            <FontAwesomeIcon icon={faCloudUploadAlt} className="project-media-upload-icon" />
                            <h4>{t('projects.create.dragDropDocuments')}</h4>
                            <p>{t('projects.create.clickToUpload')}</p>
                            <div className="project-media-supported-formats">
                                <small>{t('projects.create.supportedDocumentFormats')}: PDF, Word, Excel, PowerPoint, TXT</small>
                            </div>
                        </div>

                        {/* Documents List */}
                        {values.downloadMaterials && values.downloadMaterials.length > 0 ? (
                            <div className="project-media-documents-list">
                                {values.downloadMaterials.map((document, index) => (
                                    <div key={index} className="project-media-document-item">
                                        <div className="project-media-document-icon">
                                            <FontAwesomeIcon icon={getFileIcon(document.name || document.filename)} />
                                        </div>
                                        <div className="project-media-document-info">
                                            <div className="project-media-document-name">
                                                {document.name || document.filename || `Document ${index + 1}`}
                                            </div>
                                            <div className="project-media-document-details">
                                                {document.size && (
                                                    <span className="project-media-document-size">
                                                        {formatFileSize(document.size)}
                                                    </span>
                                                )}
                                                {document.type && (
                                                    <span className="project-media-document-type">
                                                        {document.type}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="project-media-document-actions">
                                            {document.isUploading ? (
                                                <FontAwesomeIcon icon={faSpinner} spin className="project-media-uploading-icon" />
                                            ) : (
                                                <>
                                                    <button
                                                        type="button"
                                                        className="project-media-document-btn download"
                                                        onClick={() => window.open(document.url || document.src, '_blank')}
                                                        title={t('projects.create.downloadDocument')}
                                                    >
                                                        <FontAwesomeIcon icon={faDownload} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="project-media-document-btn remove"
                                                        onClick={() => removeDocument(index)}
                                                        title={t('projects.create.removeDocument')}
                                                    >
                                                        <FontAwesomeIcon icon={faTimes} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="project-media-empty-state">
                                <FontAwesomeIcon icon={faFolder} className="project-media-empty-icon" />
                                <h3>{t('projects.create.noDocuments')}</h3>
                                <p>{t('projects.create.documentsDescription')}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Logo Tab */}
                {activeTab === 'logo' && (
                    <div className="project-media-tab-content">
                        <div className="project-media-tab-header">
                            <h3>{t('projects.create.projectLogo')}</h3>
                        </div>

                        <input
                            ref={logoInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleLogoChange}
                            style={{ display: 'none' }}
                        />

                        <div className="project-media-logo-section">
                            <div className="project-media-logo-preview">
                                {values.logo ? (
                                    <div className="project-media-logo-container">
                                        <img src={values.logo} alt="Project logo" />
                                        <div className="project-media-logo-overlay">
                                            <button
                                                type="button"
                                                className="project-media-logo-btn remove"
                                                onClick={removeLogo}
                                                title={t('projects.create.removeLogo')}
                                            >
                                                <FontAwesomeIcon icon={faTimes} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div 
                                        className="project-media-logo-placeholder"
                                        onClick={() => logoInputRef.current?.click()}
                                    >
                                        <FontAwesomeIcon icon={faImage} />
                                        <span>{t('projects.create.noLogo')}</span>
                                    </div>
                                )}
                            </div>

                            <div className="project-media-logo-actions">
                                <button
                                    type="button"
                                    className="project-media-form-btn primary"
                                    onClick={() => logoInputRef.current?.click()}
                                >
                                    <FontAwesomeIcon icon={faUpload} />
                                    {values.logo ? t('projects.create.changeLogo') : t('projects.create.uploadLogo')}
                                </button>
                            </div>

                            <div className="project-media-logo-help">
                                <p>{t('projects.create.logo-help')}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Media Summary */}
                {stats.totalFiles > 0 && (
                    <div className="project-media-summary">
                        <h4>📊 {t('projects.create.mediaSummary')}</h4>
                        <div className="project-media-summary-stats">
                            <div className="project-media-stat">
                                <span className="project-media-stat-label">{t('projects.create.totalFiles')}:</span>
                                <span className="project-media-stat-value">{stats.totalFiles}</span>
                            </div>
                            <div className="project-media-stat">
                                <span className="project-media-stat-label">{t('projects.create.totalImages')}:</span>
                                <span className="project-media-stat-value">{stats.totalImages}</span>
                            </div>
                            <div className="project-media-stat">
                                <span className="project-media-stat-label">{t('projects.create.totalDocuments')}:</span>
                                <span className="project-media-stat-value">{stats.totalDocuments}</span>
                            </div>
                            <div className="project-media-stat">
                                <span className="project-media-stat-label">{t('projects.create.totalSize')}:</span>
                                <span className="project-media-stat-value">{stats.totalSize}</span>
                            </div>
                            <div className="project-media-stat">
                                <span className="project-media-stat-label">{t('projects.create.hasLogo')}:</span>
                                <span className="project-media-stat-value">{stats.hasLogo ? '✅' : '❌'}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MediaSection;