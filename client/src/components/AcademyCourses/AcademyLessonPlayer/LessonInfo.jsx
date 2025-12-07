// src/components/AcademyCourses/AcademyLessonPlayer/components/LessonInfo.jsx

const LessonTypeIcon = ({ type }) => {
  const icons = {
    video: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    ),
    live: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" fill="currentColor" />
      </svg>
    ),
    text: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    quiz: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    )
  };

  return icons[type] || null;
};

const LessonInfo = ({ lesson, materials, t }) => {
  if (!lesson) return null;

  const formatDuration = (minutes) => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes} мин`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} ч ${mins} мин` : `${hours} ч`;
  };

  const lessonTypeLabels = {
    video: t('academyLessonPlayer.typeVideo', 'Видео урок'),
    live: t('academyLessonPlayer.typeLive', 'На живо'),
    text: t('academyLessonPlayer.typeText', 'Текстов'),
    quiz: t('academyLessonPlayer.typeQuiz', 'Тест')
  };

  return (
    <div className="alp-info">
      {/* Meta badges */}
      <div className="alp-info__meta">
        <div className="alp-info__badge">
          <LessonTypeIcon type={lesson.lessonType} />
          <span>{lessonTypeLabels[lesson.lessonType]}</span>
        </div>

        {lesson.durationMinutes > 0 && (
          <div className="alp-info__badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>{formatDuration(lesson.durationMinutes)}</span>
          </div>
        )}

        {lesson.maxCredits > 0 && (
          <div className="alp-info__badge alp-info__badge--credits">
            <span>🪙</span>
            <span>+{lesson.maxCredits} {t('academyLessonPlayer.credits', 'кредита')}</span>
          </div>
        )}

        {lesson.viewsCount > 0 && (
          <div className="alp-info__badge alp-info__badge--views">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>{lesson.viewsCount}</span>
          </div>
        )}
      </div>

      {/* Title */}
      <h1 className="alp-info__title">{lesson.title}</h1>

      {/* Description */}
      {lesson.description && (
        <p className="alp-info__description">{lesson.description}</p>
      )}

      {/* Mentor */}
      {lesson.mentor && (
        <div className="alp-info__mentor">
          <img 
            src={lesson.mentor.photoUrl || '/images/default-avatar.png'} 
            alt={lesson.mentor.name}
            onError={(e) => { e.target.src = '/images/default-avatar.png'; }}
          />
          <div>
            <span className="alp-info__mentor-name">{lesson.mentor.name}</span>
            {lesson.mentor.specialization && (
              <span className="alp-info__mentor-spec">{lesson.mentor.specialization}</span>
            )}
          </div>
        </div>
      )}

      {/* Test Section */}
      {lesson.hasTest && (
        <div className="alp-info__test">
          <div className="alp-info__test-content">
            <div className="alp-info__test-icon">📝</div>
            <div>
              <h3>{t('academyLessonPlayer.testTitle', 'Тест към урока')}</h3>
              <p>
                {t('academyLessonPlayer.testPassingScore', 'Минимален резултат')}: {lesson.testPassingScore}%
                {lesson.creditsForTest > 0 && (
                  <span className="alp-info__test-credits">
                    • +{lesson.creditsForTest} 🪙
                  </span>
                )}
              </p>
            </div>
          </div>
          <button className="alp-info__test-btn">
            {t('academyLessonPlayer.startTest', 'Започни теста')}
          </button>
        </div>
      )}

      {/* Materials */}
      {materials && materials.length > 0 && (
        <div className="alp-info__materials">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {t('academyLessonPlayer.materials', 'Материали')}
          </h3>
          <div className="alp-info__materials-list">
            {materials.map((material, index) => (
              <a 
                key={material.id || index}
                href={material.url}
                target="_blank"
                rel="noopener noreferrer"
                className="alp-info__material"
              >
                <span className="alp-info__material-icon">
                  {material.type === 'pdf' ? '📄' : 
                   material.type === 'doc' ? '📝' :
                   material.type === 'video' ? '🎬' :
                   material.type === 'link' ? '🔗' : '📎'}
                </span>
                <span className="alp-info__material-name">{material.name || material.title}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonInfo;