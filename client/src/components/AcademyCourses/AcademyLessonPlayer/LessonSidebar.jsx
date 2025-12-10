// src/components/AcademyCourses/AcademyLessonPlayer/components/LessonSidebar.jsx

import { useMemo } from 'react';

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
      </svg>
    ),
    quiz: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      </svg>
    )
  };
  return icons[type] || icons.video;
};

const LessonSidebar = ({ 
  course, 
  currentLesson,
  lessonSlug, 
  courseSlug, 
  isOpen, 
  onToggle, 
  onClose, 
  onLessonSelect,
  isLessonAccessible,
  t 
}) => {
  // Only show published lessons
  const filteredModules = useMemo(() => {
    if (!course?.modules) return [];
    
    return course.modules
      .map(module => ({
        ...module,
        lessons: (module.lessons || []).filter(l => l.isPublished || l.status === 'published')
      }))
      .filter(module => module.lessons.length > 0);
  }, [course]);

  // All lessons for dropdown
  const allLessons = useMemo(() => {
    return filteredModules.flatMap(module => 
      module.lessons.map(l => ({
        ...l,
        moduleTitle: module.title,
        moduleId: module.id
      }))
    );
  }, [filteredModules]);

  const formatDuration = (minutes) => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes} мин`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}ч ${mins}м` : `${hours}ч`;
  };

  const handleLessonClick = (lesson, e) => {
    e.preventDefault();
    
    if (!isLessonAccessible(lesson)) {
      return; // Don't navigate to inaccessible lessons
    }
    
    onLessonSelect(lesson);
  };

  const handleDropdownChange = (e) => {
    const selectedSlug = e.target.value;
    const selectedLesson = allLessons.find(l => l.slug === selectedSlug);
    if (selectedLesson) {
      onLessonSelect(selectedLesson);
    }
  };

  // Current module ID
  const currentModuleId = currentLesson?.moduleId;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button className="alp-sidebar-toggle" onClick={onToggle}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <span>{t('academyLessonPlayer.courseContent', 'Съдържание')}</span>
      </button>

      {/* Sidebar */}
      <aside className={`alp-sidebar ${isOpen ? 'alp-sidebar--open' : ''}`}>
        {/* Overlay */}
        {isOpen && <div className="alp-sidebar__overlay" onClick={onClose}></div>}

        <div className="alp-sidebar__content">
          {/* Header */}
          <div className="alp-sidebar__header">
            <h2>{t('academyLessonPlayer.courseContent', 'Съдържание на курса')}</h2>
            <button className="alp-sidebar__close" onClick={onClose}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Mobile Dropdown */}
          <div className="alp-sidebar__dropdown">
            <select 
              value={lessonSlug}
              onChange={handleDropdownChange}
            >
              {allLessons.map((l, index) => (
                <option 
                  key={l.id || l.slug} 
                  value={l.slug}
                  disabled={!isLessonAccessible(l)}
                >
                  {index + 1}. {l.title} {!isLessonAccessible(l) ? '🔒' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Modules List */}
          <div className="alp-sidebar__modules">
            {filteredModules.map((module, moduleIndex) => {
              const isCurrentModule = module.id === currentModuleId;
              
              return (
                <div 
                  key={module.id} 
                  className={`alp-sidebar__module ${isCurrentModule ? 'alp-sidebar__module--current' : ''}`}
                >
                  <div className="alp-sidebar__module-header">
                    <span className="alp-sidebar__module-num">{moduleIndex + 1}</span>
                    <span className="alp-sidebar__module-title">{module.title}</span>
                  </div>
                  
                  <div className="alp-sidebar__lessons">
                    {module.lessons.map((lesson) => {
                      const isActive = lesson.slug === lessonSlug;
                      const isAccessible = isLessonAccessible(lesson);
                      
                      return (
                        
                       <a   key={lesson.id || lesson.slug}
                          href={`/academy/courses/${courseSlug}/lessons/${lesson.slug}`}
                          onClick={(e) => handleLessonClick(lesson, e)}
                          className={`alp-sidebar__lesson 
                            ${isActive ? 'alp-sidebar__lesson--active' : ''} 
                            ${!isAccessible ? 'alp-sidebar__lesson--locked' : ''}`}
                        >
                          <div className="alp-sidebar__lesson-icon">
                            {!isAccessible ? (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                              </svg>
                            ) : (
                              <LessonTypeIcon type={lesson.lessonType} />
                            )}
                          </div>
                          
                          <div className="alp-sidebar__lesson-info">
                            <span className="alp-sidebar__lesson-title">{lesson.title}</span>
                            {lesson.durationMinutes > 0 && (
                              <span className="alp-sidebar__lesson-duration">
                                {formatDuration(lesson.durationMinutes)}
                              </span>
                            )}
                          </div>
                          
                          {isActive && (
                            <span className="alp-sidebar__lesson-playing">▶</span>
                          )}
                        </a>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Chat Placeholder (only for live lessons) */}
          {currentLesson?.lessonType === 'live' && (
            <div className="alp-sidebar__chat">
              <div className="alp-sidebar__chat-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span>{t('academyLessonPlayer.liveChat', 'Чат на живо')}</span>
              </div>
              <div className="alp-sidebar__chat-body">
                <p>{t('academyLessonPlayer.chatComingSoon', 'Чатът ще бъде наличен скоро!')}</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default LessonSidebar;