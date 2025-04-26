import { useEffect, useRef } from "react";
import "./about.css";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export const AboutSection = () => {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  const visionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          entries[0].target.classList.add('visible');
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    if (visionRef.current) {
      observer.observe(visionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
      if (visionRef.current) {
        observer.unobserve(visionRef.current);
      }
    };
  }, []);

  return (
    <>
      <section className="about-modern" ref={sectionRef}>
        <div className="about-background">
          <div className="bg-shape shape1"></div>
          <div className="bg-shape shape2"></div>
          <div className="bg-logo">
            <img src="/images/homePage/logo-2.png" alt={t("about.logo_alt")} />
          </div>
        </div>

        <div className="about-container">
          <div className="about-image-container">
            <div className="image-wrapper">
              <img src="/images/homePage/about-img.webp" alt={t("about.about_image_alt")} className="about-image" />
              <div className="image-accent"></div>
            </div>
            <div className="image-overlay-text">{t("about.overlay_pensa")}</div>
          </div>

          <div className="about-content-modern">
            <div className="content-accent"></div>
            <h2 className="about-title">{t("about.title")}</h2>
            <p className="about-description">{t("about.desc")}</p>

            <div className="about-actions">
              <Link to="/profile/data" className="about-button primary">
                <span>{t("motto.about-btn")}</span>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z" fill="currentColor"/>
                </svg>
              </Link>
              <Link to="/suggest-user" className="about-button secondary">
                <span>{t("motto.suggestion-btn")}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="about-modern" ref={visionRef}>
        <div className="about-background">
          <div className="bg-shape shape1"></div>
          <div className="bg-shape shape2"></div>
          <div className="bg-logo">
            <img src="/images/homePage/logo-2.png" alt={t("about.logo_alt")} />
          </div>
        </div>

        <div className="about-container vison" >
          <div className="about-image-container">
            <div className="image-wrapper">
              <img src="/images/homePage/old-people-sectinon-2.webp" alt={t("about.vision_image_alt")} className="about-image" />
              <div className="image-accent"></div>
            </div>
            <div className="image-overlay-text">{t("about.overlay_vision")}</div>
          </div>

          <div className="about-content-modern">
            <div className="content-accent"></div>
            <h2 className="about-title">{t('about.ourVision')}</h2>
            <p className="about-description">{t('about.visionDesc')}</p>

            <div className="about-actions">
              <Link to="/vision" className="about-button primary">
                <span>{t('motto.learn-more-btn')}</span>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z" fill="currentColor"/>
                </svg>
              </Link>
              <Link to="/join-community" className="about-button secondary">
                <span>{t('motto.join-us-btn')}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
