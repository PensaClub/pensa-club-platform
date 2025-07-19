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
          entries[0].target.classList.add('pens-about-visible');
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
      <section className="pens-about-main-section" ref={sectionRef}>
        <div className="pens-about-bg-wrapper">
          <div className="pens-about-shape pens-about-shape-primary"></div>
          <div className="pens-about-shape pens-about-shape-secondary"></div>
          <div className="pens-about-logo-bg">
            <img src="/images/homePage/logo-2.png" alt={t("about.logo_alt")} />
          </div>
        </div>

        <div className="pens-about-content-container">
          <div className="pens-about-image-block">
            <div className="pens-about-img-wrapper">
              <img src="/images/homePage/about-img.webp" alt={t("about.about_image_alt")} className="pens-about-main-image" />
              <div className="pens-about-img-accent"></div>
            </div>
            <div className="pens-about-overlay-label">{t("about.overlay_pensa")}</div>
          </div>

          <div className="pens-about-text-content">
            <div className="pens-about-content-accent-line"></div>
            <h2 className="pens-about-section-title">{t("about.title")}</h2>
            <p className="pens-about-section-description">{t("about.desc")}</p>

            <div className="pens-about-action-buttons">
              <Link to="/profile/data" className="pens-about-btn pens-about-btn-primary">
                <span>{t("motto.about-btn")}</span>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z" fill="currentColor"/>
                </svg>
              </Link>
              <Link to="/suggest-user" className="pens-about-btn pens-about-btn-secondary">
                <span>{t("motto.suggestion-btn")}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="pens-about-main-section" ref={visionRef}>
        <div className="pens-about-bg-wrapper">
          <div className="pens-about-shape pens-about-shape-primary"></div>
          <div className="pens-about-shape pens-about-shape-secondary"></div>
          <div className="pens-about-logo-bg">
            <img src="/images/homePage/logo-2.png" alt={t("about.logo_alt")} />
          </div>
        </div>

        <div className="pens-about-content-container pens-about-vision-layout">
          <div className="pens-about-image-block">
            <div className="pens-about-img-wrapper">
              <img src="/images/homePage/old-people-sectinon-2.webp" alt={t("about.vision_image_alt")} className="pens-about-main-image" />
              <div className="pens-about-img-accent"></div>
            </div>
            <div className="pens-about-overlay-label">{t("about.overlay_vision")}</div>
          </div>

          <div className="pens-about-text-content">
            <div className="pens-about-content-accent-line"></div>
            <h2 className="pens-about-section-title">{t('about.ourVision')}</h2>
            <p className="pens-about-section-description">{t('about.visionDesc')}</p>

            <div className="pens-about-action-buttons">
              <Link to="/vision" className="pens-about-btn pens-about-btn-primary">
                <span>{t('motto.learn-more-btn')}</span>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z" fill="currentColor"/>
                </svg>
              </Link>
              <Link to="/join-community" className="pens-about-btn pens-about-btn-secondary">
                <span>{t('motto.join-us-btn')}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};