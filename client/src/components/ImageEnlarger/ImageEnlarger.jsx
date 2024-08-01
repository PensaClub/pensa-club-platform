import React, { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import './imageEnlarger.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';

const EnlargedImage = ({ src, onClose, onNext, onPrev }) => {
  const handlers = useSwipeable({
    onSwipedLeft: onNext,
    onSwipedRight: onPrev,
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        onNext();
      } else if (e.key === 'ArrowLeft') {
        onPrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, onNext, onPrev]);

  return (
    <div className="overlay visible" onClick={onClose} {...handlers}>
      <div className="enlarged-wrapper">
        <span
          className="arrow left"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </span>
        <img src={src} className="main-image enlarged" alt="Enlarged" />
        <span
          className="arrow right"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </span>
      </div>
    </div>
  );
};

export const ImageEnlarger = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEnlarged, setIsEnlarged] = useState(false);

  const handleImageClick = (index) => {
    setCurrentIndex(index);
    setIsEnlarged(true);
  };

  const handleClose = () => {
    setIsEnlarged(false);
  };

  const handleNext = () => {
    setCurrentIndex((currentIndex + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((currentIndex - 1 + images.length) % images.length);
  };

  return (
    <div className="gallery-container">
      <div className="main-image-wrapper">
        <img
          src={images[currentIndex]}
          onClick={() => handleImageClick(currentIndex)}
          className="main-image"
          alt="Main"
        />
      </div>
      <div className="small-img">
        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            onClick={() => handleImageClick(index)}
            className="thumbnail"
            alt={`Thumbnail ${index + 1}`}
          />
        ))}
      </div>
      {isEnlarged && (
        <EnlargedImage
          src={images[currentIndex]}
          onClose={handleClose}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      )}
    </div>
  );
};
