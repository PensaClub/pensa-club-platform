// src/components/AcademyCourses/AcademyCoursesHero/AcademyCoursesHero.jsx

import { useTranslation } from 'react-i18next';
import './academyCoursesHero.css';

export const AcademyCoursesHero = ({ totalCourses = 0, totalPrograms = 0, totalEnrolled = 0 }) => {
  const { t } = useTranslation('academy');

  return (
    <section className="academyCoursesHero">
      {/* Background Elements */}
      <div className="academyCoursesHero-bg">
        <div className="academyCoursesHero-bg-gradient"></div>
        <div className="academyCoursesHero-bg-grid"></div>
        <div className="academyCoursesHero-bg-glow academyCoursesHero-bg-glow--1"></div>
        <div className="academyCoursesHero-bg-glow academyCoursesHero-bg-glow--2"></div>
        <div className="academyCoursesHero-bg-glow academyCoursesHero-bg-glow--3"></div>
      </div>

      <div className="academyCoursesHero-container">
        <div className="academyCoursesHero-content">
          {/* Badge */}
          <div className="academyCoursesHero-badge">
            <span className="academyCoursesHero-badge-dot"></span>
            <span className="academyCoursesHero-badge-text">DigiBridge Academy</span>
          </div>

          {/* Title */}
          <h1 className="academyCoursesHero-title">
            {t('academyCoursesHero.titleLine1')}
            <span className="academyCoursesHero-title-gradient">
              {t('academyCoursesHero.titleLine2')}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="academyCoursesHero-subtitle">
            {t('academyCoursesHero.subtitle')}
          </p>

          {/* Stats */}
          <div className="academyCoursesHero-stats">
            <div className="academyCoursesHero-stat">
              <span className="academyCoursesHero-stat-value">{totalPrograms}</span>
              <span className="academyCoursesHero-stat-label">{t('academyCoursesHero.stats.programs')}</span>
            </div>
            <div className="academyCoursesHero-stat-divider"></div>
            <div className="academyCoursesHero-stat">
              <span className="academyCoursesHero-stat-value">{totalCourses}</span>
              <span className="academyCoursesHero-stat-label">{t('academyCoursesHero.stats.courses')}</span>
            </div>
            <div className="academyCoursesHero-stat-divider"></div>
            <div className="academyCoursesHero-stat">
              <span className="academyCoursesHero-stat-value">{totalEnrolled.toLocaleString()}</span>
              <span className="academyCoursesHero-stat-label">{t('academyCoursesHero.stats.enrolled')}</span>
            </div>
            <div className="academyCoursesHero-stat-divider"></div>
            <div className="academyCoursesHero-stat academyCoursesHero-stat--highlight">
              <span className="academyCoursesHero-stat-value">100%</span>
              <span className="academyCoursesHero-stat-label">{t('academyCoursesHero.stats.free')}</span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="academyCoursesHero-scroll">
          <div className="academyCoursesHero-scroll-mouse">
            <div className="academyCoursesHero-scroll-wheel"></div>
          </div>
          <span className="academyCoursesHero-scroll-text">{t('academyCoursesHero.scroll')}</span>
        </div>
      </div>
    </section>
  );
};