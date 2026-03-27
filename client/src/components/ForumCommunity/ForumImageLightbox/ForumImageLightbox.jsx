import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import './forumImageLightbox.css';

const ForumImageLightbox = ({ images, startIndex = 0, onClose }) => {
  const [current, setCurrent] = useState(startIndex);

  const goNext = useCallback(() => {
    setCurrent(prev => (prev + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrent(prev => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose, goNext, goPrev]);

  return (
    <div className="filb-overlay" onClick={onClose}>
      <button className="filb-close" onClick={onClose}><X size={24} /></button>

      <div className="filb-content" onClick={(e) => e.stopPropagation()}>
        {images.length > 1 && (
          <button className="filb-arrow filb-arrow-left" onClick={goPrev}>
            <ChevronLeft size={28} />
          </button>
        )}

        <img
          src={images[current]}
          alt=""
          className="filb-image"
          key={current}
        />

        {images.length > 1 && (
          <button className="filb-arrow filb-arrow-right" onClick={goNext}>
            <ChevronRight size={28} />
          </button>
        )}
      </div>

      {images.length > 1 && (
        <div className="filb-dots">
          {images.map((_, i) => (
            <button
              key={i}
              className={`filb-dot ${i === current ? 'filb-dot-active' : ''}`}
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
            />
          ))}
        </div>
      )}

      <div className="filb-counter">{current + 1} / {images.length}</div>
    </div>
  );
};

export default ForumImageLightbox;
