// components/Projects/ProjectGallery/ProjectGallery.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faTimes, faChevronLeft, faChevronRight, 
    faDownload, faExpand, faImage
} from '@fortawesome/free-solid-svg-icons';
import './projectGallery.css';

export const ProjectGallery = ({ gallery = [], title }) => {
    const { t } = useTranslation();
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Филтрираме само валидните изображения
    const validImages = gallery.filter(item => 
        item.src && 
        !item.isUploading && 
        (item.type?.startsWith('image/') || 
         ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(
             item.name?.split('.').pop()?.toLowerCase()
         ))
    );

    useEffect(() => {
        if (validImages.length > 0) {
            setIsLoading(false);
        }
    }, [validImages]);

    const openLightbox = (index) => {
        setCurrentImageIndex(index);
        setLightboxOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
        document.body.style.overflow = 'auto';
    };

    const nextImage = () => {
        setCurrentImageIndex((prev) => 
            prev === validImages.length - 1 ? 0 : prev + 1
        );
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => 
            prev === 0 ? validImages.length - 1 : prev - 1
        );
    };

    const handleKeyDown = (e) => {
        if (!lightboxOpen) return;
        
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
    };

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [lightboxOpen]);

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    if (isLoading || validImages.length === 0) {
        return (
            <div className="project-gallery-empty">
                <FontAwesomeIcon icon={faImage} size="3x" />
                <p>{t('projectView.gallery.noImages')}</p>
            </div>
        );
    }

    return (
        <div className="project-gallery-container">
            {title && (
                <div className="project-gallery-header">
                    <h3 className="project-gallery-title">{title}</h3>
                    <div className="project-gallery-count">
                        {validImages.length} {validImages.length === 1 ? t('projectView.gallery.image') : t('projectView.gallery.images')}
                    </div>
                </div>
            )}

            <div className="project-gallery-grid">
                {validImages.map((image, index) => (
                    <div 
                        key={image.id || index} 
                        className="project-gallery-item"
                        onClick={() => openLightbox(index)}
                    >
                        <div className="gallery-item-image">
                            <img
                                src={image.src}
                                alt={image.alt || `Gallery image ${index + 1}`}
                                loading="lazy"
                            />
                            <div className="gallery-item-overlay">
                                <div className="gallery-overlay-content">
                                    <FontAwesomeIcon icon={faExpand} />
                                    <span>{t('projectView.gallery.viewImage')}</span>
                                </div>
                            </div>
                        </div>
                        
                        {(image.caption || image.name) && (
                            <div className="gallery-item-info">
                                <div className="gallery-item-title">
                                    {image.caption || image.name}
                                </div>
                                {image.size && (
                                    <div className="gallery-item-size">
                                        {formatFileSize(image.size)}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Lightbox */}
            {lightboxOpen && (
                <div className="project-gallery-lightbox" onClick={closeLightbox}>
                    <div className="lightbox-backdrop"></div>
                    
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <button className="lightbox-close" onClick={closeLightbox}>
                            <FontAwesomeIcon icon={faTimes} />
                        </button>

                        <div className="lightbox-image-container">
                            <img
                                src={validImages[currentImageIndex]?.src}
                                alt={validImages[currentImageIndex]?.alt || `Gallery image ${currentImageIndex + 1}`}
                                className="lightbox-image"
                            />
                        </div>

                        <div className="lightbox-controls">
                            <button 
                                className="lightbox-nav lightbox-prev"
                                onClick={prevImage}
                                disabled={validImages.length <= 1}
                            >
                                <FontAwesomeIcon icon={faChevronLeft} />
                            </button>

                            <button 
                                className="lightbox-nav lightbox-next"
                                onClick={nextImage}
                                disabled={validImages.length <= 1}
                            >
                                <FontAwesomeIcon icon={faChevronRight} />
                            </button>
                        </div>

                        <div className="lightbox-info">
                            <div className="lightbox-title">
                                {validImages[currentImageIndex]?.caption || 
                                 validImages[currentImageIndex]?.name || 
                                 `${t('projectView.gallery.image')} ${currentImageIndex + 1}`}
                            </div>
                            
                            <div className="lightbox-meta">
                                <span className="lightbox-counter">
                                    {currentImageIndex + 1} / {validImages.length}
                                </span>
                                
                                {validImages[currentImageIndex]?.size && (
                                    <span className="lightbox-size">
                                        {formatFileSize(validImages[currentImageIndex].size)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectGallery;