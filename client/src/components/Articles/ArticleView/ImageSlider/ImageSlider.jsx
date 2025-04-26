import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import './imageSlider.css';

const ImageSlider = ({ images, alt, onSlideChange }) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Известяваме родителския компонент при промяна на слайда
  useEffect(() => {
    if (onSlideChange) {
      onSlideChange(currentIndex);
    }
  }, [currentIndex]);

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === images.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const goToSlide = (slideIndex) => {
    setCurrentIndex(slideIndex);
  };

  return (
    <div className="slider-container">
      <div className="slider-main">
        <button className="slider-arrow left" onClick={goToPrevious}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <div className="slider-image-container">
          <img
            src={images[currentIndex]}
            alt={`${alt} - ${t('articles.slider.slide')} ${currentIndex + 1}`}
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
            onClick={() => goToSlide(slideIndex)}
          />
        ))}
      </div>
      <div className="slider-counter">
        {currentIndex + 1}/{images.length}
      </div>
    </div>
  );
};

export default ImageSlider;
