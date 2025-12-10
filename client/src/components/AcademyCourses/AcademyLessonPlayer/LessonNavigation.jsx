// src/components/AcademyCourses/AcademyLessonPlayer/components/LessonNavigation.jsx

const LessonNavigation = ({ 
  previousLesson, 
  nextLesson, 
  currentLessonStatus,
  isCompleting, 
  courseSlug, 
  onComplete, 
  onNavigate,
  isLessonAccessible,
  t 
}) => {
  const canGoToPrevious = previousLesson && isLessonAccessible(previousLesson);
  const canGoToNext = nextLesson && isLessonAccessible(nextLesson);
  const isCompleted = currentLessonStatus === 'completed';

  return (
    <div className="alp-nav">
      <button 
        className="alp-nav__btn alp-nav__btn--prev"
        onClick={() => canGoToPrevious && onNavigate(previousLesson)}
        disabled={!canGoToPrevious}
        title={previousLesson?.title || ''}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        <span>{t('academyLessonPlayer.previous', 'Предишен')}</span>
      </button>

      <button 
        className={`alp-nav__btn alp-nav__btn--complete ${isCompleted ? 'alp-nav__btn--completed' : ''}`}
        onClick={onComplete}
        disabled={isCompleting}
      >
        {isCompleting ? (
          <div className="alp-nav__spinner"></div>
        ) : isCompleted ? (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            <span>{nextLesson ? t('academyLessonPlayer.nextLesson', 'Следващ урок') : t('academyLessonPlayer.completed', 'Завършен')}</span>
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{t('academyLessonPlayer.complete', 'Завърши урока')}</span>
          </>
        )}
      </button>

      <button 
        className="alp-nav__btn alp-nav__btn--next"
        onClick={() => canGoToNext && onNavigate(nextLesson)}
        disabled={!canGoToNext}
        title={nextLesson?.title || ''}
      >
        <span>{t('academyLessonPlayer.next', 'Следващ')}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default LessonNavigation;