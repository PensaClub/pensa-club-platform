// src/components/Home/NewsSubscribe/ShowcaseSlider/ShowcaseSlider.jsx

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocalizedNavigate } from '../../../../hooks/useLocalizedNavigate';
import './showcaseSlider.css';

const ShowcaseSlider = ({ slides }) => {
    const { t } = useTranslation('home');
    const navigate = useLocalizedNavigate();
    const [current, setCurrent] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const progressRef = useRef(null);
    const timerRef = useRef(null);

    const count = slides.length;
    if (count === 0) return null;

    const duration = (slides[current]?.durationSeconds || 6) * 1000;

    const goTo = useCallback((idx) => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrent(idx);
        setTimeout(() => setIsTransitioning(false), 800);
    }, [isTransitioning]);

    const next = useCallback(() => {
        goTo((current + 1) % count);
    }, [current, count, goTo]);

    const prev = useCallback(() => {
        goTo((current - 1 + count) % count);
    }, [current, count, goTo]);

    useEffect(() => {
        if (isPaused || count <= 1) return;
        timerRef.current = setTimeout(next, duration);
        return () => clearTimeout(timerRef.current);
    }, [current, isPaused, count, duration, next]);

    const handleClick = (linkUrl) => {
        if (!linkUrl) return;
        if (linkUrl.startsWith('http')) {
            window.open(linkUrl, '_blank');
        } else {
            navigate(linkUrl);
        }
    };

    return (
        <div
            className="shs-container"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {slides.map((slide, i) => {
                // Escape any double quotes inside the URL and wrap in quotes —
                // raw `url(${x})` breaks when filenames contain `()`, spaces,
                // or other special chars (CSS parser stops at the first `)`).
                const safeUrl = String(slide.imageUrl || '').replace(/"/g, '\\"');
                return (
                <div
                    key={slide.id || i}
                    className={`shs-slide ${i === current ? 'shs-slide-active' : ''}`}
                >
                    <div
                        className={`shs-image ${i === current ? 'shs-zoom-out' : ''}`}
                        style={{
                            backgroundImage: `url("${safeUrl}")`,
                            animationDuration: `${slide.durationSeconds || 6}s`,
                        }}
                    />
                    <div className="shs-overlay" />
                    <div className="shs-content">
                        {slide.categoryLabel && (
                            <span className="shs-category">{slide.categoryLabel}</span>
                        )}
                        <h3 className="shs-title">{slide.title}</h3>
                        {slide.description && (
                            <p className="shs-desc">{slide.description}</p>
                        )}
                        {slide.linkUrl && (
                            <button
                                className="shs-btn"
                                onClick={() => handleClick(slide.linkUrl)}
                            >
                                {slide.buttonText || t('news-subscribe.showcase.cta', 'Разгледай още')}
                            </button>
                        )}
                    </div>
                </div>
                );
            })}

            {count > 1 && (
                <>
                    <button className="shs-arrow shs-arrow-left" onClick={prev} aria-label="Previous">
                        <ChevronLeft size={22} />
                    </button>
                    <button className="shs-arrow shs-arrow-right" onClick={next} aria-label="Next">
                        <ChevronRight size={22} />
                    </button>

                    <div className="shs-dots">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                className={`shs-dot ${i === current ? 'shs-dot-active' : ''}`}
                                onClick={() => goTo(i)}
                                aria-label={`Slide ${i + 1}`}
                            />
                        ))}
                    </div>

                    <div className="shs-progress-bar">
                        <div
                            ref={progressRef}
                            className={`shs-progress-fill ${isPaused ? 'shs-progress-paused' : ''}`}
                            key={current}
                            style={{ animationDuration: `${(slides[current]?.durationSeconds || 6)}s` }}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default ShowcaseSlider;
