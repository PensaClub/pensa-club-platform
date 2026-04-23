// src/components/Home/ClubsShowcase/ClubsShowcase.jsx

import { useMemo, useEffect, useRef, useCallback, useState } from 'react';
import { useLocalizedNavigate } from '../../../hooks/useLocalizedNavigate';
import { useTranslation } from 'react-i18next';
import { useClubContext } from '../../contexts/ClubContext';
import './clubsShowcase.css';

const CATEGORY_COLORS = {
  cultural: '#8B5CF6',
  sports: '#10B981',
  social: '#F59E0B',
  educational: '#3B82F6',
  general: '#EC4899',
};

export const ClubsShowcase = () => {
  const { t } = useTranslation('home');
  const navigate = useLocalizedNavigate();
  const { getAllClubs } = useClubContext();

  // Self-contained fetch — only 12 clubs (enough to find 5 with images).
  // Previously this leaned on PlatformStats loading all 500 clubs into
  // ClubContext, which was a 700 KB request just to count them.
  const [showcaseClubs, setShowcaseClubs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getAllClubs(false, 1, 12);
        if (cancelled) return;
        const list = res?.clubs || res || [];
        setShowcaseClubs(Array.isArray(list) ? list : []);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayClubs = useMemo(() => {
    if (!showcaseClubs || showcaseClubs.length === 0) return [];
    return [...showcaseClubs]
      .sort((a, b) => {
        const aImg = a.mainImage || a.logo ? 1 : 0;
        const bImg = b.mainImage || b.logo ? 1 : 0;
        return bImg - aImg;
      })
      .slice(0, 5);
  }, [showcaseClubs]);
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  // IntersectionObserver — staggered entrance
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('cshw-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    const section = sectionRef.current;
    if (section) observer.observe(section);

    cardsRef.current.forEach(card => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, [displayClubs]);

  // 3D tilt on hover
  const handleMouseMove = useCallback((e, cardEl) => {
    if (!cardEl) return;
    const rect = cardEl.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    cardEl.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-8px)`;
  }, []);

  const handleMouseLeave = useCallback((cardEl) => {
    if (cardEl) cardEl.style.transform = '';
  }, []);

  const getCategoryInfo = (category) => {
    const key = category || 'general';
    const color = CATEGORY_COLORS[key] || CATEGORY_COLORS.general;
    const label = t(`clubsShowcase.categories.${key}`, { defaultValue: key });
    return { color, label };
  };

  // Render skeleton
  if (isLoading) {
    return (
      <section className="cshw-section">
        <div className="cshw-aurora" />
        <div className="cshw-container">
          <div className="cshw-header cshw-animate">
            <div className="cshw-skeleton-title cshw-bone" />
            <div className="cshw-skeleton-subtitle cshw-bone" />
          </div>
          <div className="cshw-bento-grid">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`cshw-card cshw-card--${i === 0 ? 'hero' : 'regular'} cshw-skeleton-card`}>
                <div className="cshw-skeleton-image cshw-bone" />
                <div className="cshw-skeleton-content">
                  <div className="cshw-skeleton-badge cshw-bone" />
                  <div className="cshw-skeleton-name cshw-bone" />
                  <div className="cshw-skeleton-meta cshw-bone" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (displayClubs.length === 0) return null;

  return (
    <section className="cshw-section" ref={sectionRef}>
      {/* Aurora background */}
      <div className="cshw-aurora" />

      {/* Floating decorative blobs */}
      <div className="cshw-blob cshw-blob--1" />
      <div className="cshw-blob cshw-blob--2" />
      <div className="cshw-blob cshw-blob--3" />

      <div className="cshw-container">
        {/* Header */}
        <div className="cshw-header cshw-animate">
          <span className="cshw-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {t('clubsShowcase.badge', { defaultValue: 'Общност' })}
          </span>
          <h2 className="cshw-title">
            {t('clubsShowcase.title', { defaultValue: 'Открийте нашите' })}
            {' '}
            <span className="cshw-title-gradient">
              {t('clubsShowcase.titleHighlight', { defaultValue: 'клубове' })}
            </span>
          </h2>
          <p className="cshw-subtitle">
            {t('clubsShowcase.subtitle', { defaultValue: 'Присъединете се към активна общност от хора, които споделят вашите интереси и страст към ученето' })}
          </p>
        </div>

        {/* Bento Grid */}
        <div className="cshw-bento-grid">
          {displayClubs.map((club, index) => {
            const catInfo = getCategoryInfo(club.category);
            const isHero = index === 0;

            return (
              <article
                key={club.id || club.slug || index}
                className={`cshw-card cshw-card--${isHero ? 'hero' : 'regular'} cshw-animate`}
                style={{ '--delay': `${index * 0.1}s`, '--cat-color': catInfo.color }}
                ref={el => cardsRef.current[index] = el}
                onMouseMove={(e) => handleMouseMove(e, cardsRef.current[index])}
                onMouseLeave={() => handleMouseLeave(cardsRef.current[index])}
                onClick={() => navigate(`/clubs/${club.slug}`)}
                role="link"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/clubs/${club.slug}`)}
              >
                {/* Animated border */}
                <div className="cshw-card-border" />

                {/* Image */}
                <div className="cshw-card-image">
                  <img
                    src={club.mainImage || club.logo || 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=400&fit=crop'}
                    alt={club.name}
                    loading="lazy"
                  />
                  <div className="cshw-card-image-overlay" />
                </div>

                {/* Content */}
                <div className="cshw-card-content">
                  <span
                    className="cshw-card-category"
                    style={{ '--cat-color': catInfo.color }}
                  >
                    {catInfo.label}
                  </span>

                  <h3 className="cshw-card-name">{club.name}</h3>

                  {club.shortDescription && (
                    <p className="cshw-card-desc">{club.shortDescription}</p>
                  )}

                  <div className="cshw-card-meta">
                    {club.location?.city && (
                      <span className="cshw-card-meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        {club.location.city}
                      </span>
                    )}
                    {(club.membership?.totalMembers > 0 || club.totalMembers > 0) && (
                      <span className="cshw-card-meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                        </svg>
                        {club.membership?.totalMembers || club.totalMembers}
                      </span>
                    )}
                    {club.metadata?.rating > 0 && (
                      <span className="cshw-card-meta-item cshw-card-rating">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        {Number(club.metadata.rating).toFixed(1)}
                      </span>
                    )}
                  </div>

                  {isHero && (
                    <span className="cshw-card-cta">
                      {t('clubsShowcase.explore', { defaultValue: 'Разгледай' })}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="cshw-footer cshw-animate">
          <button
            className="cshw-cta-btn"
            onClick={() => navigate('/clubs')}
          >
            {t('clubsShowcase.viewAll', { defaultValue: 'Виж всички клубове' })}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default ClubsShowcase;
