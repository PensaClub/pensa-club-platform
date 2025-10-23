import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './digiBridgeTestimonials.css';

export const DigiBridgeTestimonials = () => {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: t('digiBridge.testimonials.testimonial1.name'),
      role: t('digiBridge.testimonials.testimonial1.role'),
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
      text: t('digiBridge.testimonials.testimonial1.text'),
      rating: 5,
    },
    {
      id: 2,
      name: t('digiBridge.testimonials.testimonial2.name'),
      role: t('digiBridge.testimonials.testimonial2.role'),
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
      text: t('digiBridge.testimonials.testimonial2.text'),
      rating: 5,
    },
    {
      id: 3,
      name: t('digiBridge.testimonials.testimonial3.name'),
      role: t('digiBridge.testimonials.testimonial3.role'),
      image: 'https://randomuser.me/api/portraits/women/65.jpg',
      text: t('digiBridge.testimonials.testimonial3.text'),
      rating: 5,
    },
  ];

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToTestimonial = (index) => {
    setActiveIndex(index);
  };

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
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="digibridge-testimonials-author-image"
                    />
                    <div className="digibridge-testimonials-author-info">
                      <h4 className="digibridge-testimonials-author-name">{testimonial.name}</h4>
                      <p className="digibridge-testimonials-author-role">{testimonial.role}</p>
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
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>

        {/* Dots */}
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

      </div>
    </section>
  );
};