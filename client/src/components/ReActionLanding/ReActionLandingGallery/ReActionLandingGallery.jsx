import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './reActionLandingGallery.css';

const INITIAL_COUNT = 12;
const LOAD_MORE_COUNT = 12;

const ReActionLandingGallery = ({ items = [] }) => {
    const { t } = useTranslation('reaction');
    const [lightboxIndex, setLightboxIndex] = useState(null);
    const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
    const touchStartX = useRef(null);

    const openLightbox = (index) => {
        setLightboxIndex(index);
    };

    const closeLightbox = () => {
        setLightboxIndex(null);
    };

    const goNext = useCallback(() => {
        if (lightboxIndex === null) return;
        setLightboxIndex((prev) => (prev + 1) % items.length);
    }, [lightboxIndex, items.length]);

    const goPrev = useCallback(() => {
        if (lightboxIndex === null) return;
        setLightboxIndex((prev) => (prev - 1 + items.length) % items.length);
    }, [lightboxIndex, items.length]);

    // Keyboard navigation
    useEffect(() => {
        if (lightboxIndex === null) return;

        const handleKey = (e) => {
            if (e.key === 'ArrowRight') goNext();
            else if (e.key === 'ArrowLeft') goPrev();
            else if (e.key === 'Escape') closeLightbox();
        };

        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [lightboxIndex, goNext, goPrev]);

    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + LOAD_MORE_COUNT);
    };

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) goNext();
            else goPrev();
        }
        touchStartX.current = null;
    };

    if (items.length === 0) return null;

    const visibleItems = items.slice(0, visibleCount);
    const hasMore = visibleCount < items.length;
    const currentItem = lightboxIndex !== null ? items[lightboxIndex] : null;

    // Rotation patterns for photo album feel
    const rotations = ['-2deg', '1.5deg', '-1deg', '2.5deg', '-0.5deg', '1deg', '-2.5deg', '0.5deg'];

    return (
        <section className="ralg">
            <h2 className="ralg-title">{t('hub.gallery.title', 'Галерия')}</h2>

            <div className="ralg-grid">
                {visibleItems.map((item, i) => (
                    <div
                        key={item.id}
                        className="ralg-item"
                        style={{ '--rotation': rotations[i % rotations.length] }}
                        onClick={() => openLightbox(i)}
                    >
                        <div className="ralg-frame">
                            {item.mediaType === 'image' ? (
                                <img
                                    src={item.mediaUrl}
                                    alt={item.title || ''}
                                    className="ralg-media"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="ralg-video-thumb">
                                    {item.thumbnailUrl ? (
                                        <img
                                            src={item.thumbnailUrl}
                                            alt={item.title || ''}
                                            className="ralg-media"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="ralg-video-placeholder">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <rect x="2" y="4" width="20" height="16" rx="2" />
                                                <polygon points="10 8 16 12 10 16" fill="currentColor" stroke="none" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="ralg-play">
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <polygon points="5 3 19 12 5 21 5 3" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                            {/* Decorative tape on some items */}
                            {i % 3 === 0 && <div className="ralg-tape ralg-tape--tl" />}
                            {i % 4 === 1 && <div className="ralg-tape ralg-tape--tr" />}
                        </div>
                        {item.title && <p className="ralg-caption">{item.title}</p>}
                    </div>
                ))}
            </div>

            {/* Load more */}
            {hasMore && (
                <div className="ralg-more">
                    <button className="ralg-more-btn" onClick={handleLoadMore}>
                        {t('hub.gallery.loadMore', 'Покажи още')} ({items.length - visibleCount})
                    </button>
                </div>
            )}

            {/* Lightbox with arrows */}
            {currentItem && (
                <div className="ralg-lightbox" onClick={closeLightbox} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                    <button className="ralg-lightbox-close" onClick={closeLightbox}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>

                    {/* Left arrow */}
                    <button
                        className="ralg-lightbox-arrow ralg-lightbox-arrow--left"
                        onClick={(e) => { e.stopPropagation(); goPrev(); }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>

                    <div className="ralg-lightbox-content" onClick={(e) => e.stopPropagation()}>
                        {currentItem.mediaType === 'image' ? (
                            <img
                                src={currentItem.mediaUrl}
                                alt={currentItem.title || ''}
                                className="ralg-lightbox-image"
                            />
                        ) : (
                            <video
                                key={currentItem.id}
                                src={currentItem.mediaUrl}
                                controls
                                autoPlay
                                className="ralg-lightbox-video"
                            />
                        )}
                        {currentItem.title && (
                            <p className="ralg-lightbox-caption">{currentItem.title}</p>
                        )}
                        <span className="ralg-lightbox-counter">
                            {lightboxIndex + 1} / {items.length}
                        </span>
                    </div>

                    {/* Right arrow */}
                    <button
                        className="ralg-lightbox-arrow ralg-lightbox-arrow--right"
                        onClick={(e) => { e.stopPropagation(); goNext(); }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>
                </div>
            )}
        </section>
    );
};

export default ReActionLandingGallery;
