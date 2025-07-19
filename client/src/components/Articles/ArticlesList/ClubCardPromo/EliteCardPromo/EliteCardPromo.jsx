import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './eliteCardPromo.css';

export const EliteCardPromo = ({ 
  className = '', 
  autoAnimate = true,
  showParticles = true 
}) => {
  const { t } = useTranslation();
  const cardRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Intersection Observer за анимация при влизане в viewport
  useEffect(() => {
    if (!autoAnimate || !cardRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          cardRef.current.classList.add('animated');
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [autoAnimate]);

  // Mouse tracking за sparkle ефект
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (cardRef.current) {
      cardRef.current.classList.add('hovering');
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (cardRef.current) {
      cardRef.current.classList.remove('hovering');
    }
  };

  return (
    <div 
      ref={cardRef}
      className={`elite-card-promo ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Mystical Background */}
      <div className="elite-background">
        <div className="neural-network"></div>
        <div className="geometric-grid"></div>
        <div className="bg-noise"></div>
      </div>
      
      {/* Floating Particles */}
      {showParticles && (
        <div className="elite-particles">
          <div className="particle particle-1"></div>
          <div className="particle particle-2"></div>
          <div className="particle particle-3"></div>
          <div className="particle particle-4"></div>
          <div className="particle particle-5"></div>
        </div>
      )}
      
      {/* Mystical Lines */}
      <div className="elite-lines">
        <div className="elite-line line-1"></div>
        <div className="elite-line line-2"></div>
        <div className="elite-line line-3"></div>
      </div>
      
      {/* Card Sparkle Effect */}
      <div 
        className="card-sparkle"
        style={{
          left: mousePosition.x,
          top: mousePosition.y
        }}
      ></div>
      
      {/* Elite Status */}
      <div className="elite-status"></div>
      
      {/* VIP Badge */}
      <div className="vip-badge">
        <div className="vip-text">{t('eliteCard.badge')}</div>
        <div className="tag-shine"></div>
      </div>
      
      {/* Title Section */}
      <div className="elite-title">
        <div className="elite-brand">{t('eliteCard.brand')}</div>
        <div className="elite-subtitle">{t('eliteCard.subtitle')}</div>
      </div>
      
      {/* Elite Card Visual */}
      <div className="elite-card-visual">
        <div className="card-glow"></div>
        <div className="elite-card-container">
          <div className="elite-card-inner">
            <div className="card-chip"></div>
            <div className="card-logo">PE</div>
            <div className="card-number">•••• •••• •••• 2024</div>
            <div className="card-holder">{t('eliteCard.cardHolder')}</div>
            <div className="card-reflection"></div>
          </div>
        </div>
      </div>
      
      {/* Elite Features */}
      <div className="elite-features">
        <div className="elite-feature">
          <div className="feature-icon exclusive">
            <span>★</span>
          </div>
          <div className="feature-text">
            <span className="feature-highlight">{t('eliteCard.features.exclusive.highlight')}</span> {t('eliteCard.features.exclusive.text')}
          </div>
        </div>
        
        <div className="elite-feature">
          <div className="feature-icon priority">
            <span>⚡</span>
          </div>
          <div className="feature-text">
            <span className="feature-highlight">{t('eliteCard.features.priority.highlight')}</span> {t('eliteCard.features.priority.text')}
          </div>
        </div>
        
        <div className="elite-feature">
          <div className="feature-icon premium">
            <span>◆</span>
          </div>
          <div className="feature-text">
            <span className="feature-highlight">{t('eliteCard.features.premium.highlight')}</span> {t('eliteCard.features.premium.text')}
          </div>
        </div>
      </div>
      
      {/* Elite CTA */}
      <a href="/elite-membership" className="elite-cta">
        <div className="cta-content">
          <span className="cta-text">{t('eliteCard.cta.text')}</span>
          <span className="cta-arrow">→</span>
        </div>
      </a>

      {/* Floating Elements */}
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

export default EliteCardPromo;