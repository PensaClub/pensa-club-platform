import { useEffect, useRef } from "react";
import "./hero.css";
import { useTranslation, Trans } from "react-i18next";
import { Link } from "react-router-dom";

export const Hero = () => {
  const { t } = useTranslation();
  const bgRef = useRef(null);
  
  useEffect(() => {
    const handleScroll = () => {
      if (bgRef.current) {
        const scrollY = window.scrollY;
        bgRef.current.style.transform = `translateY(${scrollY * 0.5}px)`;
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="new-hero-container">
      {/* Parallax Background */}
      <div className="hero-bg-image" ref={bgRef}></div>
      <div className="hero-overlay"></div>
      
      {/* Main Content */}
      <div className="hero-content-wrapper">
        <div className="hero-text-container">
          <div className="hero-subtitle">{t("hero.short-desc")}</div>
          <h1 className="hero-title">
            ДОСТОЕН ЖИВОТ<br />В ТРЕТАТА ВЪЗРАСТ
          </h1>
          <div className="hero-description">
            <Trans i18nKey="hero.desc" components={{ span: <strong /> }} />
          </div>
          <Link to="/profile/data" className="hero-button">
            <span>Влез в клуба</span>
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M5 12h14m-6-6l6 6-6 6"/>
            </svg>
          </Link>
        </div>
        
        <div className="hero-video-container">
          <div className="video-frame">
            <div className="video-frame-inner">
              <iframe
                src="https://www.youtube.com/embed/BqSxjmvXzzY?autoplay=1&mute=1&loop=1&playlist=BqSxjmvXzzY&showinfo=0&modestbranding=1"
                title="57 Years Apart - A Boy And a Man Talk About Life"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>
            <div className="video-frame-effect"></div>
            <div className="video-controls">
              <div className="control-btn tooltip">
                <span className="tooltip-text">Намали звука</span>
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="none" stroke="currentColor" strokeWidth="2" d="M11 5L6 9H2v6h4l5 4V5z"/>
                  <path fill="none" stroke="currentColor" strokeWidth="2" d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  <path fill="none" stroke="currentColor" strokeWidth="2" d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                </svg>
              </div>
              <div className="control-btn tooltip">
                <span className="tooltip-text">Цял екран</span>
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="none" stroke="currentColor" strokeWidth="2" d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                </svg>
              </div>
              <div className="control-btn tooltip">
                <span className="tooltip-text">Споделяне</span>
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <circle cx="18" cy="5" r="3" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="6" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="18" cy="19" r="3" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="currentColor" strokeWidth="2"/>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Wave Transition */}
      <div className="wave-container">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,32L48,48C96,64,192,96,288,96C384,96,480,64,576,53.3C672,43,768,53,864,58.7C960,64,1056,64,1152,53.3C1248,43,1344,21,1392,10.7L1440,0L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" 
                fill="#f7f7f7" fillOpacity="1"></path>
        </svg>
      </div>
      
      {/* Scrolling Info Banner */}
      <div className="scrolling-info">
        <div className="info-content">
          <span>{t("hero.slide-info")}</span>
          <span>{t("hero.slide-info")}</span>
        </div>
      </div>
    </div>
  );
};