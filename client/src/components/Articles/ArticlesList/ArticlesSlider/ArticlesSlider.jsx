// ArticlesSlider.jsx
import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getResizedUrl } from '../../../../utils/firebaseImageResize';
import './articlesSlider.css';

export const ArticlesSlider = ({ articles, onSlideClick }) => {
  const { t } = useTranslation('content');
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);

  const totalSlides = articles.length;
  const slidesToShow = window.innerWidth < 768 ? 1 : window.innerWidth < 992 ? 2 : 3;
  const maxSlideIndex = Math.max(0, totalSlides - slidesToShow);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev >= maxSlideIndex) ? 0 : prev + 1);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev <= 0) ? maxSlideIndex : prev - 1);
  };

  const handleSlideClick = (article) => {
    if (onSlideClick) {
      onSlideClick(article);
    }
  };

  return (
    <div className="articles-slider-container">
      <button
        className="slider-arrow slider-arrow-left"
        onClick={prevSlide}
        aria-label={t('articles.slider.previousSlide')}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(180deg)' }}>
          <path d="M17.41,12.71,9.12,21,6.29,18.17,12.46,12,6.29,5.83,9.11,3l8.3,8.29A1,1,0,0,1,17.41,12.71Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
        </svg>
      </button>
      <div className="articles-slider-track-container">
        <div
          className="articles-slider-track"
          ref={sliderRef}
          style={{ transform: `translateX(calc(-${currentSlide * 100}% / ${slidesToShow}))` }}
        >
          {articles.map((article, index) => (
            <div
              key={article.id}
              className="slider-slide"
              onClick={() => handleSlideClick(article)}
            >
              <div className="slide-image-container">
                {(() => {
                  const original = article.mainImage.type === 'video'
                    ? article.mainImage.thumbnail
                    : article.mainImage.sources[0];
                  return (
                    <img
                      src={getResizedUrl(original, 600)}
                      alt={article.title}
                      className="slide-image"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        if (original && e.target.src !== original) e.target.src = original;
                      }}
                    />
                  );
                })()}
              </div>
              <h3 className="slide-title">{article.title}</h3>
            </div>
          ))}
        </div>
      </div>
      <button
        className="slider-arrow slider-arrow-right"
        onClick={nextSlide}
        aria-label={t('articles.slider.nextSlide')}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.41,12.71,9.12,21,6.29,18.17,12.46,12,6.29,5.83,9.11,3l8.3,8.29A1,1,0,0,1,17.41,12.71Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
        </svg>
      </button>
    </div>
  );
};
