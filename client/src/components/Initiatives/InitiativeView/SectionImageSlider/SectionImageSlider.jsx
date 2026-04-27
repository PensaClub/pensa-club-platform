import React from 'react';
import ImageSlider from '../../../Articles/ArticleView/ImageSlider/ImageSlider';
import { getResizedUrl } from '../../../../utils/firebaseImageResize';

export const SectionImageSlider = ({ images = [], className = '', onImageClick }) => {
    if (!images || images.length === 0) {
        return null;
    }

    // Преобразуваме images в правилния формат за ImageSlider
    const sliderImages = images.map(img => img.src || img);

    // За една снимка
    if (images.length === 1) {
        const original = images[0].src || images[0];
        return (
            <div className={`single-image-container ${className}`}>
                <img
                    src={getResizedUrl(original, 1200)}
                    alt={images[0].alt || ''}
                    onClick={() => onImageClick && onImageClick(sliderImages)}
                    style={{ cursor: 'pointer' }}
                    className="single-section-image"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                        if (original && e.target.src !== original) e.target.src = original;
                    }}
                />
                {images[0].caption && (
                    <div className="image-caption">{images[0].caption}</div>
                )}
            </div>
        );
    }

    // За повече снимки - използваме същия ImageSlider като в статиите
    return (
        <div className={`section-slider-container ${className}`}>
            <ImageSlider
                images={sliderImages}
                alt="Project section images"
                onImageClick={() => onImageClick && onImageClick(sliderImages)}
            />
            {/* Caption за активната снимка */}
            {images[0] && images[0].caption && (
                <div className="slider-caption-container">
                    <div className="slider-caption">{images[0].caption}</div>
                </div>
            )}
        </div>
    );
};