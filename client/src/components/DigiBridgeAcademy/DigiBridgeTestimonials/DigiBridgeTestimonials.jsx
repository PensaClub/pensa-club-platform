// src/components/DigiBridgeAcademy/DigiBridgeTestimonials/DigiBridgeTestimonials.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAcademy } from '../../contexts/AcademyProvider';
import './digiBridgeTestimonials.css';

export const DigiBridgeTestimonials = () => {
  const { t } = useTranslation();
  const { getApprovedAcademyReviews } = useAcademy();
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await getApprovedAcademyReviews();
      
      const reviews = response?.reviews || [];
      setTestimonials(reviews);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToTestimonial = (index) => {
    setActiveIndex(index);
  };

  if (loading) {
    return (
      <section className="digibridge-testimonials">
        <div className="digibridge-testimonials-container">
          <div className="digibridge-testimonials-loading">
            <div className="digibridge-testimonials-spinner"></div>
            <p>{t('digiBridge.testimonials.loading')}</p>
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return (
      <section className="digibridge-testimonials">
        <div className="digibridge-testimonials-container">
          <div className="digibridge-testimonials-empty">
            <div className="digibridge-testimonials-empty-icon">💬</div>
            <h3>{t('digiBridge.testimonials.noTestimonials')}</h3>
            <p>{t('digiBridge.testimonials.noTestimonialsMessage')}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="digibridge-testimonials">
      <div className="digibridge-testimonials-container">
        
        {/* Header */}
        <div className="digibridge-testimonials-header">
          <span className="digibridge-testimonials-label">
            {t('digiBridge.testimonials.label')}
          </span>
          <h2 className="digibridge-testimonials-title">
            {t('digiBridge.testimonials.title')}
          </h2>
          <p className="digibridge-testimonials-subtitle">
            {t('digiBridge.testimonials.subtitle')}
          </p>
        </div>

        {/* Carousel */}
        <div className="digibridge-testimonials-carousel">
          <button 
            className="digibridge-testimonials-arrow digibridge-testimonials-arrow-prev"
            onClick={prevTestimonial}
            aria-label="Previous testimonial"
            disabled={testimonials.length <= 1}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>

          <div className="digibridge-testimonials-track">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`digibridge-testimonials-card ${index === activeIndex ? 'digibridge-testimonials-card-active' : ''}`}
                style={{
                  transform: `translateX(${(index - activeIndex) * 110}%)`,
                  opacity: index === activeIndex ? 1 : 0.3,
                }}
              >
                <div className="digibridge-testimonials-card-content">
                  <div className="digibridge-testimonials-quote-icon">❝</div>
                  
                  <p className="digibridge-testimonials-text">
                    {testimonial.text}
                  </p>

                  <div className="digibridge-testimonials-rating">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="digibridge-testimonials-star">★</span>
                    ))}
                  </div>

                  <div className="digibridge-testimonials-author">
                    {testimonial.imageUrl ? (
                      <img 
                        src={testimonial.imageUrl} 
                        alt={testimonial.name}
                        className="digibridge-testimonials-author-image"
                      />
                    ) : (
                      <div className="digibridge-testimonials-author-avatar">
                        {testimonial.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="digibridge-testimonials-author-info">
                      <h4 className="digibridge-testimonials-author-name">{testimonial.name}</h4>
                      <p className="digibridge-testimonials-author-role">
                        {testimonial.role === 'participant' 
                          ? t('digiBridge.testimonialForm.roleParticipant') 
                          : t('digiBridge.testimonialForm.roleMentor')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button 
            className="digibridge-testimonials-arrow digibridge-testimonials-arrow-next"
            onClick={nextTestimonial}
            aria-label="Next testimonial"
            disabled={testimonials.length <= 1}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>

        {/* Dots */}
        {testimonials.length > 1 && (
          <div className="digibridge-testimonials-dots">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`digibridge-testimonials-dot ${index === activeIndex ? 'digibridge-testimonials-dot-active' : ''}`}
                onClick={() => goToTestimonial(index)}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};