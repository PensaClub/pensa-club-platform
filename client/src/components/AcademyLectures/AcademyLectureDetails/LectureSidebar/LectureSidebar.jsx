// src/components/AcademyLectures/AcademyLectureDetails/components/LectureSidebar.jsx

import { Link } from 'react-router-dom';

export const LectureSidebar = ({ lecture, t }) => {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return {
      short: date.toLocaleDateString('bg-BG', { day: 'numeric', month: 'short' }),
      time: date.toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const scheduledDate = formatDate(lecture.scheduledDate);
  const platformNames = { youtube: 'YouTube', google_meet: 'Google Meet', zoom: 'Zoom' };

  return (
    <aside className="ald-sidebar">
      
      {/* Lecturer Card */}
      <div className="ald-lecturer-card">
        <div className="ald-lecturer-header">
          <h3>Лектор</h3>
        </div>
        <div className="ald-lecturer-content">
          <div className="ald-lecturer-avatar">
            {lecture.lecturer?.photoUrl ? (
              <img src={lecture.lecturer.photoUrl} alt={lecture.lecturer.name} />
            ) : (
              <div className="ald-lecturer-avatar-placeholder">👤</div>
            )}
            <div className="ald-lecturer-avatar-glow"></div>
          </div>
          <h4 className="ald-lecturer-name">{lecture.lecturer?.name || 'Неизвестен лектор'}</h4>
          {lecture.lecturer?.specialization && (
            <p className="ald-lecturer-spec">{lecture.lecturer.specialization}</p>
          )}
        </div>
      </div>

      {/* Related Course */}
      {lecture.course && (
        <div className="ald-course-card">
          <div className="ald-course-header">
            <span>📚 Част от курс</span>
          </div>
          <div className="ald-course-content">
            <h4 className="ald-course-title">{lecture.course.name}</h4>
            <Link to={`/academy/courses/${lecture.course.slug}`} className="ald-course-link">
              Виж курса →
            </Link>
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="ald-info-card">
        <h3 className="ald-info-title">Информация</h3>
        <div className="ald-info-list">
          <div className="ald-info-row">
            <span>📅 Дата</span>
            <span>{scheduledDate.short}</span>
          </div>
          <div className="ald-info-row">
            <span>🕐 Час</span>
            <span>{scheduledDate.time}</span>
          </div>
          <div className="ald-info-row">
            <span>⏱️ Продължителност</span>
            <span>{lecture.durationMinutes} мин</span>
          </div>
          <div className="ald-info-row">
            <span>🌐 Формат</span>
            <span>{lecture.isOnline ? 'Онлайн' : 'На място'}</span>
          </div>
          <div className="ald-info-row">
            <span>🎬 Тип</span>
            <span>{lecture.lectureType === 'live' ? 'На живо' : 'Запис'}</span>
          </div>
          {lecture.videoProvider && (
            <div className="ald-info-row">
              <span>📺 Платформа</span>
              <span>{platformNames[lecture.videoProvider] || lecture.videoProvider}</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};