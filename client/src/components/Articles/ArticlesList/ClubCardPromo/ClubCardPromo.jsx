// components/ClubCardPromo/ClubCardPromo.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './clubCardPromo.css';

const ClubCardPromo = () => {
  const { t } = useTranslation('content');
  const promoRef = useRef(null);
  const cardImageRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Анимации при зареждане
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (promoRef.current) {
      observer.observe(promoRef.current);
    }

    return () => {
      if (promoRef.current) {
        observer.unobserve(promoRef.current);
      }
    };
  }, []);

  const handleMouseMove = (e) => {
    if (!promoRef.current) return;

    const rect = promoRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Премахваме ротацията, запазваме само позицията за sparkle ефекта
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  // // Премахваме и ефекта на огъване за изображението на картата
  // const handleCardImageMove = () => {
  //   // Не правим нищо
  // };

  // const resetCardImage = () => {
  //   // Не правим нищо
  // };

  return (
    <div
      className={`club-card-promo ${isHovering ? 'hovering' : ''}`}
      ref={promoRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="card-sparkle"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`
        }}
      ></div>

      <div className="card-background">
        <div className="bg-circles">
          <div className="bg-circle bg-circle-1"></div>
          <div className="bg-circle bg-circle-2"></div>
        </div>
        <div className="bg-pattern"></div>
        <div className="bg-noise"></div>
      </div>

      <div className="active-dot"></div>

      <div className="promo-tag">
        <span className="tag-text">{t('articles.articleClubCard.exclusive')}</span>
        <div className="tag-shine"></div>
      </div>

      <h3 className="promo-title">
        <span className="brand">Pensa</span>
        <span className="card-text">Elite Card</span>
      </h3>

      <div className="card-image-wrapper">
        <div className="card-glow"></div>
        <div
          className="card-image-container"
          ref={cardImageRef}
        >
          <img
            src="/images/pensa-club-card.png"
            alt="Pensa Elite Card"
            className="card-image"
          />
          <div className="card-reflection"></div>
        </div>
      </div>

      <div className="benefits-list">
        <div className="benefit-item">
          <div className="benefit-icon percentage">%</div>
          <p>
            {t('articles.articleClubCard.discountsPrefix')} <span className="highlight-text">200+</span> {t('articles.articleClubCard.discountsSuffix')}
          </p>
        </div>
        <div className="benefit-item">
          <div className="benefit-icon learning">🎓</div>
          <p>
            {t('articles.articleClubCard.exclusiveTrainingPrefix')}{' '}
            <span className="highlight-text">{t('articles.articleClubCard.exclusiveTrainingHighlight')}</span>{' '}
            {t('articles.articleClubCard.exclusiveTrainingSuffix')}
          </p>
        </div>
        <div className="benefit-item">
          <div className="benefit-icon community">🤝</div>
          <p>
            {t('articles.articleClubCard.communityPrefix')}{' '}
            <span className="highlight-text">{t('articles.articleClubCard.communityHighlight')}</span>{' '}
            {t('articles.articleClubCard.communitySuffix')}
          </p>
        </div>
      </div>

      <Link to="/elite-membership" className="join-us-wrapper">
        <div className="join-us-text">
          <span className="join-text">{t('articles.articleClubCard.joinUs')}</span>
          <span className="join-arrow">→</span>
        </div>
      </Link>

      <div className="floating-elements">
        <div className="floating-element element-1"></div>
        <div className="floating-element element-2"></div>
        <div className="floating-element element-3"></div>
        <div className="floating-element element-4"></div>
        <div className="floating-element element-5"></div>
      </div>
    </div>
  );
};

export default ClubCardPromo;
