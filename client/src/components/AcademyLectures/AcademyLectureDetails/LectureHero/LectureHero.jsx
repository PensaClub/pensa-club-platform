// src/components/AcademyLectures/AcademyLectureDetails/components/LectureHero.jsx

import { Link } from 'react-router-dom';

export const LectureHero = ({ lecture, status, categoryStyle, t }) => {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return {
      full: date.toLocaleDateString('bg-BG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      time: date.toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const scheduledDate = formatDate(lecture.scheduledDate);
  const totalCredits = (lecture.creditsForAttendance || 0) + (lecture.creditsForTest || 0);

  return (
    <section className="ald-hero">
      {/* Background */}
      <div className="ald-hero-bg">
        {lecture.thumbnailUrl && (
          <img src={lecture.thumbnailUrl} alt="" className="ald-hero-bg-img" />
        )}
        <div className="ald-hero-overlay"></div>
        <div className="ald-hero-gradient"></div>
        <div className="ald-hero-noise"></div>
        <div className="ald-hero-grid"></div>
      </div>

      <div className="ald-hero-content">
        {/* Breadcrumb */}
        <nav className="ald-breadcrumb">
          <Link to="/academy">Академия</Link>
          <span>›</span>
          <Link to="/academy/lectures">Лекции</Link>
          <span>›</span>
          <span className="ald-breadcrumb-current">{lecture.title}</span>
        </nav>

        {/* Status Badge */}
        <div className={`ald-status ald-status--${status}`}>
          {status === 'live' && <><span className="ald-status-pulse"></span>📡 НА ЖИВО</>}
          {status === 'upcoming' && <>📅 ПРЕДСТОЯЩА</>}
          {status === 'recording' && <>📹 ЗАПИС</>}
          {status === 'cancelled' && <>❌ ОТМЕНЕНА</>}
        </div>

        {/* Category */}
        <div className="ald-category">
          <span>{categoryStyle.icon}</span>
          <span>{lecture.category}</span>
        </div>

        {/* Title */}
        <h1 className="ald-title">{lecture.title}</h1>

        {/* Description */}
        <p className="ald-description">{lecture.shortDescription}</p>

        {/* Meta Info */}
        <div className="ald-meta">
          <div className="ald-meta-item">
            <span>📆</span>
            <span>{scheduledDate.full}</span>
          </div>
          <div className="ald-meta-item">
            <span>🕐</span>
            <span>{scheduledDate.time}</span>
          </div>
          <div className="ald-meta-item">
            <span>⏱️</span>
            <span>{lecture.durationMinutes} мин</span>
          </div>
          {lecture.isOnline && (
            <div className="ald-meta-item ald-meta-item--online">
              <span>🌐</span>
              <span>Онлайн</span>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="ald-quick-stats">
          <div className="ald-quick-stat">
            <span className="ald-quick-stat-value">{totalCredits}</span>
            <span className="ald-quick-stat-label">🪙 Кредита</span>
          </div>
          {lecture.viewsCount > 0 && (
            <div className="ald-quick-stat">
              <span className="ald-quick-stat-value">{lecture.viewsCount}</span>
              <span className="ald-quick-stat-label">👁️ Гледания</span>
            </div>
          )}
          {lecture.rating && (
            <div className="ald-quick-stat">
              <span className="ald-quick-stat-value">{parseFloat(lecture.rating).toFixed(1)}</span>
              <span className="ald-quick-stat-label">⭐ Рейтинг</span>
            </div>
          )}
          {lecture.registeredCount > 0 && (
            <div className="ald-quick-stat">
              <span className="ald-quick-stat-value">{lecture.registeredCount}</span>
              <span className="ald-quick-stat-label">👥 Записани</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};