import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LocalizedLink as Link } from '../../../LocalizedLink/LocalizedLink';
import './projectsSlider.css';
import { truncateText } from '../../../../utils/truncateText';
import { getResizedUrl } from '../../../../utils/firebaseImageResize';

const ProjectsSlider = ({ projects, onSlideClick }) => {
    const { t } = useTranslation('content');
    const sliderRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [slidesToShow, setSlidesToShow] = useState(3);

    // Calculate slides to show based on screen size
    useEffect(() => {
        const updateSlidesToShow = () => {
            const width = window.innerWidth;
            if (width >= 1200) {
                setSlidesToShow(3);
            } else if (width >= 768) {
                setSlidesToShow(2);
            } else {
                setSlidesToShow(1);
            }
        };

        updateSlidesToShow();
        window.addEventListener('resize', updateSlidesToShow);
        return () => window.removeEventListener('resize', updateSlidesToShow);
    }, []);

    // Navigation functions
    const goToSlide = (index) => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex(index);
        setTimeout(() => setIsTransitioning(false), 300);
    };

    const nextSlide = () => {
        const maxIndex = Math.max(0, projects.length - slidesToShow);
        const nextIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
        goToSlide(nextIndex);
    };

    const prevSlide = () => {
        const maxIndex = Math.max(0, projects.length - slidesToShow);
        const prevIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1;
        goToSlide(prevIndex);
    };

    // Auto-play functionality
    useEffect(() => {
        if (projects.length <= slidesToShow) return;

        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [currentIndex, projects.length, slidesToShow]);

    // Touch/swipe functionality
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) {
            nextSlide();
        } else if (isRightSwipe) {
            prevSlide();
        }
    };

    // Helper functions
    const formatDate = (dateString) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('bg-BG', {
            day: 'numeric',
            month: 'short'
        });
    };

    const getStatusInfo = (status) => {
        const statusMap = {
            planned: { color: '#64748b', icon: '📋' },
            active: { color: '#059669', icon: '⚡' },
            'in-progress': { color: '#d97706', icon: '🔄' },
            completed: { color: '#7c3aed', icon: '✅' }
        };
        return statusMap[status] || statusMap.planned;
    };

    if (!projects || projects.length === 0) {
        return (
            <div className="projects-slider-empty">
                <div className="empty-icon">📋</div>
                <p>{t('projects.slider.noProjects')}</p>
            </div>
        );
    }

    const maxIndex = Math.max(0, projects.length - slidesToShow);
    const canNavigate = projects.length > slidesToShow;

    return (
        <div className="projects-slider">
            {/* Navigation Controls */}
            {canNavigate && (
                <>
                    <button
                        className={`proj-slider-nav prev ${currentIndex === 0 ? 'disabled' : ''}`}
                        onClick={prevSlide}
                        disabled={currentIndex === 0}
                        aria-label={t('projects.slider.previous')}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="15,18 9,12 15,6" />
                        </svg>
                    </button>

                    <button
                        className={`proj-slider-nav next ${currentIndex >= maxIndex ? 'disabled' : ''}`}
                        onClick={nextSlide}
                        disabled={currentIndex >= maxIndex}
                        aria-label={t('projects.slider.next')}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="9,18 15,12 9,6" />
                        </svg>
                    </button>
                </>
            )}

            {/* Slider Container */}
            <div
                className="proj-slider-container"
                ref={sliderRef}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                <div
                    className={`proj-slider-track ${isTransitioning ? 'transitioning' : ''}`}
                    style={{
                        transform: `translateX(-${currentIndex * (100 / slidesToShow)}%)`,
                        width: `${Math.max(100, (projects.length / slidesToShow) * 100)}%`
                    }}
                >
                    {projects.map((project, index) => {
                        const statusInfo = getStatusInfo(project.status);

                        return (
                            <div
                                key={project.id}
                                className="proj-slider-slide"
                                style={{
                                    width: `${100 / Math.max(projects.length, slidesToShow)}%`,
                                    minWidth: `${100 / slidesToShow}%`
                                }}
                            >
                                <article className="proj-slider-project-card">
                                    {/* Card Header */}
                                    <div className="proj-slider-card-header">
                                        <div
                                            className="proj-slider-card-image"
                                            onClick={() => onSlideClick && onSlideClick(project)}
                                        >
                                            {project.mainImage?.src ? (
                                                <img
                                                    src={getResizedUrl(project.mainImage.src, 600)}
                                                    alt={project.mainImage.alt || project.title}
                                                    loading="lazy"
                                                    decoding="async"
                                                    onError={(e) => {
                                                        if (e.target.src !== project.mainImage.src) e.target.src = project.mainImage.src;
                                                    }}
                                                />
                                            ) : (
                                                <div className="proj-slider-image-placeholder">
                                                    <span className="proj-placeholder-icon">🚀</span>
                                                </div>
                                            )}
                                            <div className="proj-slider-image-overlay">
                                                <div className="proj-overlay-content">
                                                    <span className="proj-overlay-icon">👁️</span>
                                                    <span className="proj-overlay-text">{t('projects.slider.viewProject')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="proj-slider-badges">
                                            <span
                                                className="proj-slider-status-badge"
                                                style={{ backgroundColor: statusInfo.color }}
                                            >
                                                <span className="proj-badge-icon">{statusInfo.icon}</span>
                                                <span className="badge-text">
                                                    {t(`projects.status.${project.status}`)}
                                                </span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="proj-slider-card-content">
                                        <div className="proj-slider-card-meta">
                                            <div className="proj-meta-items">
                                                {project.category && (
                                                    <span className="proj-meta-item category">
                                                        <span className="proj-meta-icon">🏷️</span>
                                                        <span className="proj-meta-text">{project.category}</span>
                                                    </span>
                                                )}

                                                {project.timeline?.startDate && (
                                                    <span className="proj-meta-item date">
                                                        <span className="proj-meta-icon">📅</span>
                                                        <span className="proj-meta-text">{formatDate(project.timeline.startDate)}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <h3 className="proj-slider-card-title">{truncateText(project.title,30)}</h3>

                                        {project.shortDescription && (
                                            <p className="proj-slider-card-description">{project.shortDescription}</p>
                                        )}

                                        {/* Quick Stats */}
                                        <div className="proj-slider-quick-stats">
                                            {project.budget?.total && (
                                                <div className="proj-quick-stat">
                                                    <span className="proj-stat-icon">💰</span>
                                                    <span className="proj-stat-value">
                                                        {project.budget.total} {project.budget.currency || 'лв.'}
                                                    </span>
                                                </div>
                                            )}

                                            {(project.currentParticipants !== undefined || project.maxParticipants !== undefined) && (
                                                <div className="proj-quick-stat">
                                                    <span className="proj-stat-icon">👥</span>
                                                    <span className="proj-stat-value">
                                                        {project.currentParticipants || 0} / {project.maxParticipants || '∞'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Card Actions */}
                                    <div className="proj-slider-card-actions">
                                        <Link
                                            to={`/projects/${project.slug || project.id}`}
                                            className="proj-slider-view-btn"
                                        >
                                            <span className="btn-text">{t('projects.slider.viewMore')}</span>
                                            <span className="proj-btn-icon">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                                                </svg>
                                            </span>
                                        </Link>

                                        <button
                                            className="proj-slider-feature-btn"
                                            onClick={() => onSlideClick && onSlideClick(project)}
                                            title={t('projects.slider.setAsFeatured')}
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                                            </svg>
                                        </button>
                                    </div>
                                </article>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Dots Indicator */}
            {canNavigate && (
                <div className="proj-slider-dots">
                    {Array.from({ length: maxIndex + 1 }, (_, index) => (
                        <button
                            key={index}
                            className={`proj-slider-dot ${index === currentIndex ? 'active' : ''}`}
                            onClick={() => goToSlide(index)}
                            aria-label={t('projects.slider.goToSlide', { number: index + 1 })}
                        />
                    ))}
                </div>
            )}

            {/* Progress Bar */}
            {canNavigate && (
                <div className="proj-slider-progress">
                    <div
                        className="proj-slider-progress-bar"
                        style={{
                            width: `${((currentIndex + 1) / (maxIndex + 1)) * 100}%`
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default ProjectsSlider;