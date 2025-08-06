// components/Clubs/AllClubs/ClubsHero/ClubsHero.jsx
import { useState, useEffect } from 'react';
import './clubsHero.css';

export const ClubsHero = ({ totalClubs }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className={`clubs-hero-section ${isVisible ? 'clubs-hero-visible' : ''}`}>
      <div className="clubs-hero-background">
        <div className="clubs-hero-pattern"></div>
        <div className="clubs-hero-gradient"></div>
      </div>
      
      <div className="clubs-hero-content">
        <div className="clubs-hero-text-content">
          <h1 className="clubs-hero-title">
            Открийте своя <span className="clubs-hero-title-highlight">клуб</span>
          </h1>
          <p className="clubs-hero-subtitle">
            Присъединете се към активната общност от пенсионери в България. 
            Намерете близо до вас клуб с интересни дейности и нови приятелства.
          </p>
          <div className="clubs-hero-stats">
            <div className="clubs-hero-stat-item">
              <span className="clubs-hero-stat-number">{totalClubs}</span>
              <span className="clubs-hero-stat-label">Активни клубове</span>
            </div>
            <div className="clubs-hero-stat-divider"></div>
            <div className="clubs-hero-stat-item">
              <span className="clubs-hero-stat-number">50+</span>
              <span className="clubs-hero-stat-label">Града в България</span>
            </div>
            <div className="clubs-hero-stat-divider"></div>
            <div className="clubs-hero-stat-item">
              <span className="clubs-hero-stat-number">2000+</span>
              <span className="clubs-hero-stat-label">Активни членове</span>
            </div>
          </div>
        </div>
        
        <div className="clubs-hero-visual">
          <div className="clubs-hero-circles">
            <div className="clubs-hero-circle clubs-hero-circle-1"></div>
            <div className="clubs-hero-circle clubs-hero-circle-2"></div>
            <div className="clubs-hero-circle clubs-hero-circle-3"></div>
          </div>
        </div>
      </div>
    </section>
  );
};