import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAcademy } from '../../contexts/AcademyProvider';
import './digiBridgeTestimonials.css';

export const DigiBridgeTestimonials = () => {
    const { t } = useTranslation('digibridge');
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

    if (loading || testimonials.length === 0) {
        return null;
    }

    return (
        <section className="dbt-section">
            {/* Background */}
            <div className="dbt-glow dbt-glow--1"></div>
            <div className="dbt-glow dbt-glow--2"></div>

            <div className="dbt-container">
                {/* Header */}
                <div className="dbt-header">
                    <span className="dbt-label">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        {t('digiBridge.testimonials.label', 'Отзиви')}
                    </span>
                    <h2 className="dbt-title">
                        {t('digiBridge.testimonials.titlePart1', 'Какво казват ')}
                        <span className="dbt-title-highlight">
                            {t('digiBridge.testimonials.titlePart2', 'нашите участници')}
                        </span>
                    </h2>
                    <p className="dbt-subtitle">
                        {t('digiBridge.testimonials.subtitle', 'Истински истории от хора, които вече са част от DigiBridge Academy')}
                    </p>
                </div>

                {/* Carousel */}
                <div className="dbt-carousel">
                    {/* Prev Arrow */}
                    <button 
                        className="dbt-arrow dbt-arrow--prev"
                        onClick={prevTestimonial}
                        aria-label="Previous testimonial"
                        disabled={testimonials.length <= 1}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M15 18l-6-6 6-6"/>
                        </svg>
                    </button>

                    {/* Track */}
                    <div className="dbt-track">
                        {testimonials.map((testimonial, index) => (
                            <div
                                key={testimonial.id}
                                className={`dbt-card ${index === activeIndex ? 'dbt-card--active' : ''}`}
                                style={{
                                    transform: `translateX(${(index - activeIndex) * 110}%)`,
                                    opacity: index === activeIndex ? 1 : 0.3,
                                }}
                            >
                                <div className="dbt-card-inner">
                                    {/* Quote Icon */}
                                    <div className="dbt-quote-icon">
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                                        </svg>
                                    </div>

                                    {/* Text */}
                                    <p className="dbt-text">{testimonial.text}</p>

                                    {/* Rating */}
                                    <div className="dbt-rating">
                                        {[...Array(5)].map((_, i) => (
                                            <svg 
                                                key={i} 
                                                className={`dbt-star ${i < testimonial.rating ? 'dbt-star--filled' : ''}`}
                                                viewBox="0 0 24 24" 
                                                fill={i < testimonial.rating ? 'currentColor' : 'none'}
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                            >
                                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                            </svg>
                                        ))}
                                    </div>

                                    {/* Author */}
                                    <div className="dbt-author">
                                        {testimonial.imageUrl ? (
                                            <img 
                                                src={testimonial.imageUrl} 
                                                alt={testimonial.name}
                                                className="dbt-author-img"
                                            />
                                        ) : (
                                            <div className="dbt-author-avatar">
                                                {testimonial.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="dbt-author-info">
                                            <h4 className="dbt-author-name">{testimonial.name}</h4>
                                            <p className="dbt-author-role">
                                                <span className={`dbt-author-badge ${testimonial.role === 'mentor' ? 'dbt-author-badge--mentor' : ''}`}>
                                                    {testimonial.role === 'participant' 
                                                        ? t('digiBridge.testimonialForm.roleParticipant', 'Участник') 
                                                        : t('digiBridge.testimonialForm.roleMentor', 'Ментор')}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Decorative corner */}
                                    <div className="dbt-card-corner"></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Next Arrow */}
                    <button 
                        className="dbt-arrow dbt-arrow--next"
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
                    <div className="dbt-dots">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                className={`dbt-dot ${index === activeIndex ? 'dbt-dot--active' : ''}`}
                                onClick={() => goToTestimonial(index)}
                                aria-label={`Go to testimonial ${index + 1}`}
                            />
                        ))}
                    </div>
                )}

                {/* Counter */}
                <div className="dbt-counter">
                    <span className="dbt-counter-current">{String(activeIndex + 1).padStart(2, '0')}</span>
                    <span className="dbt-counter-divider">/</span>
                    <span className="dbt-counter-total">{String(testimonials.length).padStart(2, '0')}</span>
                </div>
            </div>
        </section>
    );
};