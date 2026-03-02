import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import './imageSlider.css';

const ImageSlider = ({ images, alt, onSlideChange, onImageClick, initialIndex = 0 }) => {
  const { t } = useTranslation('content');
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Известяваме родителския компонент при промяна на слайда
  useEffect(() => {
    if (onSlideChange) {
      onSlideChange(currentIndex);
    }
  }, [currentIndex]);

  const goToPrevious = (e) => {
    // Спираме разпространението на събитието, за да не се активира onImageClick
    e.stopPropagation();
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = (e) => {
    // Спираме разпространението на събитието
    e.stopPropagation();
    const isLastSlide = currentIndex === images.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const goToSlide = (slideIndex, e) => {
    // Спираме разпространението на събитието
    if (e) e.stopPropagation();
    setCurrentIndex(slideIndex);
  };

  // Функция за получаване на src - работи и с URL strings и с обекти
  const getImageSrc = (image) => {
    return typeof image === 'string' ? image : image.src;
  };

  // Функция за получаване на alt text
  const getImageAlt = (image, index) => {
    if (typeof image === 'string') {
      return `${alt} - ${t('articles.slider.slide')} ${index + 1}`;
    }
    return image.alt || `${alt} - ${t('articles.slider.slide')} ${index + 1}`;
  };

  const currentImage = images[currentIndex];

  return (
    <div className="slider-container">
      <div className="slider-main">
        <button className="slider-arrow left" onClick={goToPrevious}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <div 
          className="slider-image-container" 
          onClick={onImageClick ? () => onImageClick(currentIndex) : undefined}
          style={onImageClick ? { cursor: 'pointer' } : {}}
        >
          <img
            src={getImageSrc(currentImage)}
            alt={getImageAlt(currentImage, currentIndex)}
            className="slider-image"
          />
        </div>
        <button className="slider-arrow right" onClick={goToNext}>
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>

      <div className="slider-dots">
        {images.map((_, slideIndex) => (
          <div
            key={slideIndex}
            className={`slider-dot ${currentIndex === slideIndex ? 'active' : ''}`}
            onClick={(e) => goToSlide(slideIndex, e)}
          />
        ))}
      </div>
      
      <div className="slider-counter">
        {currentIndex + 1}/{images.length}
      </div>

      {/* Показваме caption ако има (само за обекти) */}
      {typeof currentImage === 'object' && currentImage.caption && (
        <div className="slider-caption">
          {currentImage.caption}
        </div>
      )}
    </div>
  );
};

export default ImageSlider;