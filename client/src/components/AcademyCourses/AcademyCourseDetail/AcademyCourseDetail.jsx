// src/components/AcademyCourses/AcademyCourseDetail/AcademyCourseDetail.jsx

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAcademyCourses } from '../../contexts/AcademyCoursesProvider';
import { useAuthContext } from '../../contexts/UserContext';
import { AcademyTrailerModal } from '../AcademyTrailerModal/AcademyTrailerModal';
import './academyCourseDetail.css';

// Level colors
const LEVEL_CONFIG = {
  beginner: { color: '#10b981', label: 'beginner', icon: '🌱' },
  intermediate: { color: '#f59e0b', label: 'intermediate', icon: '🌿' },
  advanced: { color: '#ef4444', label: 'advanced', icon: '🌳' }
};

// Category colors
const CATEGORY_COLORS = {
  'Мобилни устройства': '#3b82f6',
  'Интернет сигурност': '#ef4444',
  'Дигитална грамотност': '#f59e0b',
  'Социални мрежи': '#8b5cf6',
  'Офис приложения': '#10b981',
  'Онлайн банкиране': '#06b6d4',
  'default': '#ff6347'
};

// Role translations
const ROLE_LABELS = {
  lecturer: 'roles.lecturer',
  assistant: 'roles.assistant',
  mentor: 'roles.mentor'
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const isLessonScheduledAccessible = (scheduledDate) => {
  if (!scheduledDate) return true;
  const scheduled = new Date(scheduledDate);
  const now = new Date();
  return scheduled <= now;
};

const formatScheduledDate = (scheduledDate) => {
  if (!scheduledDate) return null;
  const date = new Date(scheduledDate);
  return date.toLocaleDateString('bg-BG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getMaterialIcon = (material) => {
  const type = material.materialType?.toLowerCase() || material.type?.toLowerCase() || material.fileType?.toLowerCase() || '';
  const name = material.name?.toLowerCase() || material.title?.toLowerCase() || '';

  if (type.includes('pdf') || name.endsWith('.pdf')) return '📄';
  if (type.includes('doc') || name.endsWith('.doc') || name.endsWith('.docx')) return '📝';
  if (type.includes('video') || name.endsWith('.mp4') || name.endsWith('.avi')) return '🎬';
  if (type.includes('image') || name.endsWith('.jpg') || name.endsWith('.png') || name.endsWith('.gif')) return '🖼️';
  if (type.includes('zip') || type.includes('rar') || name.endsWith('.zip')) return '📦';
  if (type.includes('excel') || name.endsWith('.xlsx') || name.endsWith('.xls')) return '📊';
  if (type.includes('presentation') || name.endsWith('.pptx') || name.endsWith('.ppt')) return '📽️';
  if (type.includes('audio') || name.endsWith('.mp3') || name.endsWith('.wav')) return '🎵';
  return '🔗';
};

const formatFileSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ============================================
// SUB-COMPONENTS
// ============================================

const LessonTypeIcon = ({ type }) => {
  switch (type) {
    case 'video':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="5,3 19,12 5,21" />
        </svg>
      );
    case 'text':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    case 'quiz':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case 'live':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="2" />
          <path d="M16.24 7.76a6 6 0 010 8.49m-8.48-.01a6 6 0 010-8.49m11.31-2.82a10 10 0 010 14.14m-14.14 0a10 10 0 010-14.14" />
        </svg>
      );
    default:
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none" />
        </svg>
      );
  }
};

const LessonItem = ({
  lesson,
  index,
  t,
  showNumber = true,
  isAuthenticated,
  hasAccess,
  onLessonClick
}) => {
  const isScheduleAccessible = isLessonScheduledAccessible(lesson.scheduledDate);
  const isAccessible = isAuthenticated && hasAccess && isScheduleAccessible;
  const [showMaterials, setShowMaterials] = useState(false);

  const getLockReason = () => {
    if (!isAuthenticated) return 'login';
    if (!hasAccess) return 'enroll';
    if (!isScheduleAccessible) return 'scheduled';
    return null;
  };

  const lockReason = getLockReason();
  const scheduledDateFormatted = formatScheduledDate(lesson.scheduledDate);
  const materials = lesson.materials || [];
  const tests = lesson.tests || [];
  const hasMaterials = materials.length > 0;

  const handleClick = () => {
    if (isAccessible && onLessonClick) {
      onLessonClick(lesson);
    }
  };

  const handleMaterialsToggle = (e) => {
    e.stopPropagation();
    setShowMaterials(!showMaterials);
  };

  return (
    <div className="academyCourseDetail-lesson-wrapper">
      <div
        className={`academyCourseDetail-lesson ${isAccessible ? 'is-accessible' : 'is-locked'} ${lockReason === 'scheduled' ? 'is-scheduled' : ''}`}
        style={{ '--delay': `${index * 0.05}s` }}
        onClick={handleClick}
        role={isAccessible ? 'button' : undefined}
        tabIndex={isAccessible ? 0 : undefined}
      >
        {showNumber && (
          <div className="academyCourseDetail-lesson-number">{index + 1}</div>
        )}

        <div className="academyCourseDetail-lesson-icon">
          <LessonTypeIcon type={lesson.lessonType} />
        </div>

        <div className="academyCourseDetail-lesson-info">
          <h4 className="academyCourseDetail-lesson-title">
            {lesson.title}
            {lockReason === 'scheduled' && scheduledDateFormatted && (
              <span className="academyCourseDetail-lesson-scheduled">
                📅 {t('academyCourseDetail.content.availableOn')} {scheduledDateFormatted}
              </span>
            )}
          </h4>
          <div className="academyCourseDetail-lesson-meta">
            {lesson.durationMinutes > 0 && (
              <span className="academyCourseDetail-lesson-duration">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12,6 12,12 16,14" />
                </svg>
                {lesson.durationMinutes} {t('academyCourseDetail.content.minutes')}
              </span>
            )}
            {lesson.hasTest && (
              <span className="academyCourseDetail-lesson-test">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
                {t('academyCourseDetail.content.hasTest')}
              </span>
            )}
            {lesson.maxCredits > 0 && (
              <span className="academyCourseDetail-lesson-credits">
                🪙 +{lesson.maxCredits}
              </span>
            )}
            {hasMaterials && (
              <span
                className="academyCourseDetail-lesson-materials-badge"
                onClick={handleMaterialsToggle}
              >
                📎 {materials.length} {t('academyCourseDetail.content.materialsCount', 'материал(а)')}
              </span>
            )}
          </div>
        </div>

        <div className="academyCourseDetail-lesson-action">
          {isAccessible ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none" />
            </svg>
          ) : lockReason === 'scheduled' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          )}
        </div>
      </div>

      {/* Lesson Materials (expandable) */}
      {showMaterials && hasMaterials && isAccessible && (
        <div className="academyCourseDetail-lesson-materials">
          {materials.map((mat, matIdx) => (
            <a
              key={mat.id}
              href={mat.fileUrl || mat.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="academyCourseDetail-lesson-material-item"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="academyCourseDetail-lesson-material-icon">
                {getMaterialIcon(mat)}
              </span>
              <span className="academyCourseDetail-lesson-material-name">
                {mat.title}
              </span>
              {mat.fileSize > 0 && (
                <span className="academyCourseDetail-lesson-material-size">
                  {formatFileSize(mat.fileSize)}
                </span>
              )}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

const ModuleAccordion = ({
  module,
  index,
  t,
  accentColor,
  isAuthenticated,
  hasAccess,
  onLessonClick
}) => {
  const [isOpen, setIsOpen] = useState(index === 0);

  const totalDuration = module.totalDurationMinutes ||
    module.lessons?.reduce((acc, l) => acc + (l.durationMinutes || 0), 0) || 0;

  const accessibleLessonsCount = module.lessons?.filter(lesson =>
    isAuthenticated && hasAccess && isLessonScheduledAccessible(lesson.scheduledDate)
  ).length || 0;

  const totalLessonsCount = module.lessons?.length || module.lessonsCount || 0;

  const totalMaterials = module.lessons?.reduce((acc, l) => acc + (l.materials?.length || 0), 0) || 0;
  const totalTests = module.lessons?.filter(l => l.hasTest || l.tests?.length > 0).length || 0;

  return (
    <div
      className={`academyCourseDetail-module ${isOpen ? 'is-open' : ''}`}
      style={{ '--delay': `${index * 0.1}s`, '--accent': accentColor }}
    >
      <button
        className="academyCourseDetail-module-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="academyCourseDetail-module-number">{index + 1}</div>
        <div className="academyCourseDetail-module-info">
          <h3 className="academyCourseDetail-module-title">
            <span className="academyCourseDetail-module-label">
              {t('academyCourseDetail.content.moduleLabel', 'Модул')} {index + 1}:
            </span>
            {' '}{module.title}
          </h3>
          <div className="academyCourseDetail-module-meta">
            <span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              {hasAccess ? `${accessibleLessonsCount}/${totalLessonsCount}` : totalLessonsCount} {t('academyCourseDetail.content.lessonsShort')}
            </span>
            <span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12,6 12,12 16,14" />
              </svg>
              {totalDuration} {t('academyCourseDetail.content.minutes')}
            </span>
            {totalMaterials > 0 && (
              <span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                </svg>
                {totalMaterials} {t('academyCourseDetail.content.materialsShort', 'материал(а)')}
              </span>
            )}
            {totalTests > 0 && (
              <span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
                {totalTests} {t('academyCourseDetail.content.testsShort', 'тест(а)')}
              </span>
            )}
          </div>
        </div>
        <div className="academyCourseDetail-module-toggle">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6,9 12,15 18,9" />
          </svg>
        </div>
      </button>

      {module.description && (
        <p className="academyCourseDetail-module-description">{module.description}</p>
      )}

      <div className="academyCourseDetail-module-content">
        <div className="academyCourseDetail-module-lessons">
          {module.lessons?.map((lesson, lessonIndex) => (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              index={lessonIndex}
              t={t}
              showNumber={false}
              isAuthenticated={isAuthenticated}
              hasAccess={hasAccess}
              onLessonClick={onLessonClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Course Material Item Component
const CourseMaterialItem = ({ material, index, t }) => {
  return (
    <a
      href={material.url || material.fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="academyCourseDetail-material"
      style={{ '--delay': `${index * 0.05}s` }}
      download={material.downloadable !== false}
    >
      <div className="academyCourseDetail-material-icon">
        {getMaterialIcon(material)}
      </div>
      <div className="academyCourseDetail-material-info">
        <h4 className="academyCourseDetail-material-name">
          {material.name || material.title || t('academyCourseDetail.content.material', 'Материал')}
        </h4>
        <div className="academyCourseDetail-material-meta">
          {material.fileType && (
            <span className="academyCourseDetail-material-type">
              {material.fileType.toUpperCase()}
            </span>
          )}
          {material.fileSize && (
            <span className="academyCourseDetail-material-size">
              {formatFileSize(material.fileSize)}
            </span>
          )}
          {material.description && (
            <span className="academyCourseDetail-material-desc">
              {material.description}
            </span>
          )}
        </div>
      </div>
      <div className="academyCourseDetail-material-download">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </div>
    </a>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const AcademyCourseDetail = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const navigate = useNavigate();

  const {
    getCourseBySlug,
    currentCourse,
    isLoading,
    enrollInCourse,
    getEnrollmentStatus,
    getCourseMaterials,
    getCourseTestStatus
  } = useAcademyCourses();
  const { isAuthentication, setRedirectAfterLogin, isAdmin, isModerator, isMentor } = useAuthContext();

  // State
  const [error, setError] = useState(null);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  // const [activeTab, setActiveTab] = useState('overview');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [isCheckingEnrollment, setIsCheckingEnrollment] = useState(false);
  const [courseMaterials, setCourseMaterials] = useState([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);

  const [courseTestData, setCourseTestData] = useState(null);
  const [isLoadingCourseTest, setIsLoadingCourseTest] = useState(false);

  const fetchedSlugRef = useRef(null);
  const enrollmentCheckedRef = useRef(null);
  const materialsLoadedRef = useRef(null);
  const courseTestLoadedRef = useRef(null);

  const hasPrivilegedAccess = isAdmin || isModerator || isMentor;
  const hasLessonAccess = isEnrolled || hasPrivilegedAccess;

  // Load course
  useEffect(() => {
    if (!slug || fetchedSlugRef.current === slug) return;

    const loadCourse = async () => {
      setError(null);
      fetchedSlugRef.current = slug;
      try {
        await getCourseBySlug(slug);
      } catch (err) {
        setError(err.message || 'Failed to load course');
      }
    };

    loadCourse();
  }, [slug, getCourseBySlug]);

  // Check enrollment
  useEffect(() => {
    const verifyEnrollment = async () => {
      if (!currentCourse?.id || !isAuthentication) {
        setIsEnrolled(false);
        setEnrollmentData(null);
        return;
      }

      if (enrollmentCheckedRef.current === currentCourse.id) {
        return;
      }

      setIsCheckingEnrollment(true);
      enrollmentCheckedRef.current = currentCourse.id;

      try {
        const status = await getEnrollmentStatus(currentCourse.id);
        setIsEnrolled(status?.enrolled || false);
        setEnrollmentData(status?.enrollment || null);
      } catch (err) {
        console.error('Error checking enrollment:', err);
        setIsEnrolled(false);
        setEnrollmentData(null);
      } finally {
        setIsCheckingEnrollment(false);
      }
    };

    verifyEnrollment();
  }, [currentCourse?.id, isAuthentication, getEnrollmentStatus]);

  // Load course materials always
  useEffect(() => {
    const loadMaterials = async () => {
      if (!slug || materialsLoadedRef.current === slug) return;

      setIsLoadingMaterials(true);
      materialsLoadedRef.current = slug;

      try {
        const materials = await getCourseMaterials(slug);
        setCourseMaterials(materials || []);
      } catch (err) {
        console.error('Error loading course materials:', err);
        setCourseMaterials([]);
      } finally {
        setIsLoadingMaterials(false);
      }
    };

    loadMaterials();
  }, [slug, getCourseMaterials]);

  // Load course test status
  useEffect(() => {
    const loadCourseTest = async () => {
      if (!currentCourse?.id || !isAuthentication) return;
      if (courseTestLoadedRef.current === currentCourse.id) return;

      setIsLoadingCourseTest(true);
      courseTestLoadedRef.current = currentCourse.id;

      try {
        const data = await getCourseTestStatus(currentCourse.id);
        setCourseTestData(data);
      } catch (err) {
        console.error('Error loading course test:', err);
        setCourseTestData(null);
      } finally {
        setIsLoadingCourseTest(false);
      }
    };

    loadCourseTest();
  }, [currentCourse?.id, isAuthentication, getCourseTestStatus]);

  const course = currentCourse;

  const handleEnroll = async () => {
    if (!isAuthentication) {
      setRedirectAfterLogin(`/academy/courses/${slug}`);
      navigate('/sign-up');
      return;
    }

    if (hasPrivilegedAccess) {
      const firstAccessibleLesson = modules.flatMap(m => m.lessons || [])
        .find(l => isLessonScheduledAccessible(l.scheduledDate));
      if (firstAccessibleLesson) {
        handleLessonClick(firstAccessibleLesson);
      }
      return;
    }

    setIsEnrolling(true);
    try {
      const result = await enrollInCourse(course.id);
      if (result?.success) {
        setIsEnrolled(true);
        setEnrollmentData(result?.enrollment || null);
        enrollmentCheckedRef.current = null;
      }
    } catch (err) {
      console.error('Error enrolling:', err);
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleLessonClick = (lesson) => {
    navigate(`/academy/courses/${slug}/lessons/${lesson.slug}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="academyCourseDetail academyCourseDetail--loading">
        <div className="academyCourseDetail-loader">
          <div className="academyCourseDetail-loader-ring">
            <div></div>
            <div></div>
            <div></div>
          </div>
          <p>{t('academyCourseDetail.loading')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !course) {
    return (
      <div className="academyCourseDetail academyCourseDetail--error">
        <div className="academyCourseDetail-error">
          <div className="academyCourseDetail-error-icon">😕</div>
          <h2>{t('academyCourseDetail.notFound')}</h2>
          <p>{t('academyCourseDetail.notFoundText')}</p>
          <button onClick={() => navigate('/academy/courses')}>
            {t('academyCourseDetail.backToCourses')}
          </button>
        </div>
      </div>
    );
  }

  // Extract course data
  const title = course.name || course.title || 'Untitled Course';
  const shortDescription = course.shortDescription || '';
  const fullDescription = course.description || shortDescription;
  const imageUrl = course.thumbnailUrl || course.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80';
  const trailerUrl = course.trailerUrl || null;
  const category = course.category || '';
  const categoryColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.default;
  const level = LEVEL_CONFIG[course.difficultyLevel] || LEVEL_CONFIG.beginner;
  const duration = course.estimatedHours || 0;
  const weeks = course.durationWeeks || 0;
  const lessonsCount = course.totalLessons || 0;
  const enrolledCount = course.enrolledCount || 0;
  const completedCount = course.completedCount || 0;
  const rating = typeof course.rating === 'string' ? parseFloat(course.rating) : (course.rating || 0);
  const maxCredits = course.maxCredits || 0;
  const creditsForCompletion = course.creditsForCompletion || 0;
  const hasCertificate = course.hasCertificate || false;
  const tags = course.tags || [];
  const targetAudience = course.targetAudience || [];

  const modules = course.modules || [];
  const lessons = course.lessons || [];

  const instructors = course.instances || [];
  const leadInstructor = instructors.find(i => i.isLead) || instructors[0];
  const assistants = instructors.filter(i => !i.isLead);

  // const tabs = [
  //   { id: 'overview', label: t('academyCourseDetail.tabs.overview'), icon: '📋' },
  //   { id: 'content', label: t('academyCourseDetail.tabs.content'), icon: '📚' },
  //   { id: 'instructor', label: t('academyCourseDetail.tabs.instructor'), icon: '👨‍🏫' },
  //   { id: 'reviews', label: t('academyCourseDetail.tabs.reviews'), icon: '⭐' }
  // ];

  const getCtaConfig = () => {
    if (isEnrolled) {
      return {
        text: t('academyCourseDetail.card.continueLearning'),
        icon: '▶',
        action: () => {
          const firstAccessibleLesson = modules.flatMap(m => m.lessons || [])
            .find(l => isLessonScheduledAccessible(l.scheduledDate));
          if (firstAccessibleLesson) {
            handleLessonClick(firstAccessibleLesson);
          }
        },
        variant: 'continue'
      };
    }

    if (hasPrivilegedAccess) {
      return {
        text: t('academyCourseDetail.card.startLearning'),
        icon: '▶',
        action: () => {
          const firstAccessibleLesson = modules.flatMap(m => m.lessons || [])
            .find(l => isLessonScheduledAccessible(l.scheduledDate));
          if (firstAccessibleLesson) {
            handleLessonClick(firstAccessibleLesson);
          }
        },
        variant: 'continue'
      };
    }

    if (!isAuthentication) {
      return {
        text: t('academyCourseDetail.card.loginToEnroll'),
        icon: '→',
        action: handleEnroll,
        variant: 'login'
      };
    }

    return {
      text: t('academyCourseDetail.card.enrollNow'),
      icon: '→',
      action: handleEnroll,
      variant: 'enroll'
    };
  };

  const ctaConfig = getCtaConfig();
  const showEnrollNotice = !hasLessonAccess && !isCheckingEnrollment;

  return (
    <div className="academyCourseDetail" style={{ '--accent-color': categoryColor }}>
      {/* Background Effects */}
      <div className="academyCourseDetail-bgEffects">
        <div className="academyCourseDetail-bgGlow academyCourseDetail-bgGlow--1"></div>
        <div className="academyCourseDetail-bgGlow academyCourseDetail-bgGlow--2"></div>
        <div className="academyCourseDetail-bgGlow academyCourseDetail-bgGlow--3"></div>
        <div className="academyCourseDetail-bgGrid"></div>
      </div>
      {/* Sticky Navigation Bar */}
      <div className="academyCourseDetail-topBar">
        <Link to="/academy/courses" className="academyCourseDetail-topBar-back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {t('academyCourseDetail.backToCourses', '← Към курсовете')}
        </Link>
        {/* <span className="academyCourseDetail-topBar-title">{title}</span> */}
      </div>
      {/* Hero Section */}
      <section className="academyCourseDetail-hero">
        <div className="academyCourseDetail-hero-bg">
          <img src={imageUrl} alt="" />
          <div className="academyCourseDetail-hero-overlay"></div>
        </div>

        <div className="academyCourseDetail-hero-container">
          {/* Breadcrumb */}
          <nav className="academyCourseDetail-breadcrumb">
            <Link to="/academy">{t('academyCourseDetail.breadcrumb.academy')}</Link>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m9 18 6-6-6-6" />
            </svg>
            <Link to="/academy/courses">{t('academyCourseDetail.breadcrumb.courses')}</Link>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m9 18 6-6-6-6" />
            </svg>
            <span className="academyCourseDetail-breadcrumb-current">{title}</span>
          </nav>

          <div className="academyCourseDetail-hero-content">
            {/* Left - Info */}
            <div className="academyCourseDetail-hero-info">
              {/* Status Badges */}
              <div className="academyCourseDetail-status-badges">
                {isEnrolled && (
                  <div className="academyCourseDetail-enrolled-badge">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    {t('academyCourseDetail.hero.youAreEnrolled')}
                  </div>
                )}
                {hasPrivilegedAccess && !isEnrolled && (
                  <div className="academyCourseDetail-privileged-badge">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    {isAdmin ? t('academyCourseDetail.hero.adminAccess') :
                      isMentor ? t('academyCourseDetail.hero.mentorAccess') :
                        t('academyCourseDetail.hero.moderatorAccess')}
                  </div>
                )}
              </div>

              {/* Category & Level */}
              <div className="academyCourseDetail-hero-badges">
                {category && (
                  <span className="academyCourseDetail-badge academyCourseDetail-badge--category">
                    {category}
                  </span>
                )}
                <span
                  className="academyCourseDetail-badge academyCourseDetail-badge--level"
                  style={{ '--level-color': level.color }}
                >
                  {level.icon} {t(`academyCourseDetail.levels.${level.label}`)}
                </span>
                {hasCertificate && (
                  <span className="academyCourseDetail-badge academyCourseDetail-badge--certificate">
                    🏆 {t('academyCourseDetail.hero.certificateBadge')}
                  </span>
                )}
              </div>

              <h1 className="academyCourseDetail-hero-title">{title}</h1>
              <p className="academyCourseDetail-hero-description">{shortDescription}</p>

              {/* Meta Stats */}
              <div className="academyCourseDetail-hero-meta">
                {rating > 0 && (
                  <div className="academyCourseDetail-hero-stat academyCourseDetail-hero-stat--rating">
                    <div className="academyCourseDetail-hero-stat-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                      </svg>
                    </div>
                    <div className="academyCourseDetail-hero-stat-info">
                      <span className="academyCourseDetail-hero-stat-value">{rating.toFixed(1)}</span>
                      <span className="academyCourseDetail-hero-stat-label">({enrolledCount} {t('academyCourseDetail.hero.ratings')})</span>
                    </div>
                  </div>
                )}
                <div className="academyCourseDetail-hero-stat">
                  <div className="academyCourseDetail-hero-stat-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                    </svg>
                  </div>
                  <div className="academyCourseDetail-hero-stat-info">
                    <span className="academyCourseDetail-hero-stat-value">{enrolledCount.toLocaleString()}</span>
                    <span className="academyCourseDetail-hero-stat-label">{t('academyCourseDetail.hero.enrolledStudents')}</span>
                  </div>
                </div>
                <div className="academyCourseDetail-hero-stat">
                  <div className="academyCourseDetail-hero-stat-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12,6 12,12 16,14" />
                    </svg>
                  </div>
                  <div className="academyCourseDetail-hero-stat-info">
                    <span className="academyCourseDetail-hero-stat-value">{duration}ч</span>
                    <span className="academyCourseDetail-hero-stat-label">{t('academyCourseDetail.hero.duration')}</span>
                  </div>
                </div>
                <div className="academyCourseDetail-hero-stat">
                  <div className="academyCourseDetail-hero-stat-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                  </div>
                  <div className="academyCourseDetail-hero-stat-info">
                    <span className="academyCourseDetail-hero-stat-value">{lessonsCount}</span>
                    <span className="academyCourseDetail-hero-stat-label">{t('academyCourseDetail.hero.lessonsLabel')}</span>
                  </div>
                </div>
              </div>

              {/* Instructor Preview */}
              {leadInstructor && (
                <div className="academyCourseDetail-hero-instructor">
                  <img
                    src={leadInstructor.mentor?.photoUrl || 'https://via.placeholder.com/48'}
                    alt={leadInstructor.mentor?.name}
                  />
                  <div className="academyCourseDetail-hero-instructor-info">
                    <span className="academyCourseDetail-hero-instructor-label">
                      {t('academyCourseDetail.hero.createdBy')}
                    </span>
                    <span className="academyCourseDetail-hero-instructor-name">
                      {leadInstructor.mentor?.name}
                    </span>
                  </div>
                </div>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div className="academyCourseDetail-hero-tags">
                  {tags.slice(0, 5).map((tag, index) => (
                    <span key={index} className="academyCourseDetail-tag">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Right - Preview Card */}
            <div className="academyCourseDetail-hero-card">
              <div className="academyCourseDetail-card-preview">
                <img src={imageUrl} alt={title} />
                <div className="academyCourseDetail-card-preview-overlay"></div>

                {trailerUrl && (
                  <button
                    className="academyCourseDetail-card-play"
                    onClick={() => setIsTrailerOpen(true)}
                  >
                    <div className="academyCourseDetail-card-play-icon">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5,3 19,12 5,21" />
                      </svg>
                    </div>
                    <span>{t('academyCourseDetail.card.watchPreview')}</span>
                  </button>
                )}

                {maxCredits > 0 && (
                  <div className="academyCourseDetail-card-credits">
                    <span>+{maxCredits}</span>
                    <span>🪙</span>
                  </div>
                )}

                {isEnrolled && (
                  <div className="academyCourseDetail-card-enrolled">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {t('academyCourseDetail.card.youAreEnrolled')}
                  </div>
                )}
              </div>

              <div className="academyCourseDetail-card-content">
                <div className="academyCourseDetail-card-price">
                  <span className="academyCourseDetail-card-price-free">
                    {t('academyCourseDetail.card.free')}
                  </span>
                </div>

                <button
                  className={`academyCourseDetail-card-cta academyCourseDetail-card-cta--${ctaConfig.variant}`}
                  onClick={ctaConfig.action}
                  disabled={isEnrolling || isCheckingEnrollment}
                >
                  {isEnrolling || isCheckingEnrollment ? (
                    <>
                      <span className="academyCourseDetail-card-cta-spinner"></span>
                      <span>{isEnrolling ? t('academyCourseDetail.card.enrolling') : t('academyCourseDetail.card.checking')}</span>
                    </>
                  ) : (
                    <>
                      <span>{ctaConfig.text}</span>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </>
                  )}
                </button>

                {!isAuthentication && (
                  <p className="academyCourseDetail-card-hint">
                    {t('academyCourseDetail.card.loginHint')}
                  </p>
                )}

                {trailerUrl && (
                  <button
                    className="academyCourseDetail-card-secondary"
                    onClick={() => setIsTrailerOpen(true)}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                    <span>{t('academyCourseDetail.card.watchTrailer')}</span>
                  </button>
                )}

                <ul className="academyCourseDetail-card-features">
                  <li>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                    <span>{lessonsCount} {t('academyCourseDetail.card.lessons')}</span>
                  </li>
                  <li>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12,6 12,12 16,14" />
                    </svg>
                    <span>{duration} {t('academyCourseDetail.card.hours')}</span>
                  </li>
                  {weeks > 0 && (
                    <li>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span>{weeks} {t('academyCourseDetail.card.weeks')}</span>
                    </li>
                  )}
                  {hasCertificate && (
                    <li className="academyCourseDetail-card-feature--highlight">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="8" r="6" />
                        <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
                      </svg>
                      <span>{t('academyCourseDetail.card.certificate')}</span>
                    </li>
                  )}
                  {creditsForCompletion > 0 && (
                    <li className="academyCourseDetail-card-feature--credits">
                      <span className="academyCourseDetail-card-feature-emoji">🪙</span>
                      <span>+{creditsForCompletion} {t('academyCourseDetail.card.creditsOnComplete')}</span>
                    </li>
                  )}
                </ul>

                <div className="academyCourseDetail-card-guarantee">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9,12 11,14 15,10" />
                  </svg>
                  <span>{t('academyCourseDetail.card.guarantee')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

     {/* ========== FULL WIDTH CONTENT ========== */}
      <section className="acd-content">

        {/* ===== УЧЕБНА ПРОГРАМА (full width) ===== */}
        <div className="acd-curriculum">
          <div className="acd-section-header">
            <span className="acd-section-icon">📚</span>
            <h2 className="acd-section-title">
              {t('academyCourseDetail.curriculum.title', 'Учебна програма')}
            </h2>
          </div>

          <div className="acd-curriculum-summary">
            {modules.length > 0 && (
              <>
                <span className="acd-curriculum-tag">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  {modules.length} {t('academyCourseDetail.content.modules', 'модула')}
                </span>
              </>
            )}
            <span className="acd-curriculum-tag">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              {lessonsCount} {t('academyCourseDetail.content.lessonsTotal', 'урока')}
            </span>
            <span className="acd-curriculum-tag">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12,6 12,12 16,14" />
              </svg>
              {duration} {t('academyCourseDetail.content.hoursTotal', 'часа')}
            </span>
          </div>

          {showEnrollNotice && (
            <div className="acd-access-notice">
              <span className="acd-access-notice-icon">{isAuthentication ? '📋' : '🔑'}</span>
              <div className="acd-access-notice-body">
                <strong>{isAuthentication ? t('academyCourseDetail.content.enrollToAccess') : t('academyCourseDetail.content.loginToAccess')}</strong>
                <p>{isAuthentication ? t('academyCourseDetail.content.enrollToAccessDesc') : t('academyCourseDetail.content.loginToAccessDesc')}</p>
              </div>
              <button className="acd-access-notice-btn" onClick={handleEnroll}>
                {isAuthentication ? t('academyCourseDetail.card.enrollNow') : t('academyCourseDetail.card.loginToEnroll')}
              </button>
            </div>
          )}

          {modules.length > 0 && (
            <div className="academyCourseDetail-modules">
              {modules.map((module, moduleIndex) => (
                <ModuleAccordion
                  key={module.id}
                  module={module}
                  index={moduleIndex}
                  t={t}
                  accentColor={categoryColor}
                  isAuthenticated={isAuthentication}
                  hasAccess={hasLessonAccess}
                  onLessonClick={handleLessonClick}
                />
              ))}
            </div>
          )}

          {lessons.length > 0 && (
            <div className="academyCourseDetail-standalone-lessons">
              <h3 className="academyCourseDetail-standalone-title">
                {t('academyCourseDetail.content.standaloneLessons', 'Самостоятелни уроци')}
              </h3>
              <div className="academyCourseDetail-lessons">
                {lessons.map((lesson, index) => (
                  <LessonItem
                    key={lesson.id}
                    lesson={lesson}
                    index={index}
                    t={t}
                    isAuthenticated={isAuthentication}
                    hasAccess={hasLessonAccess}
                    onLessonClick={handleLessonClick}
                  />
                ))}
              </div>
            </div>
          )}

          {modules.length === 0 && lessons.length === 0 && (
            <div className="academyCourseDetail-content-empty">
              <div className="academyCourseDetail-content-empty-icon">🔭</div>
              <p>{t('academyCourseDetail.content.noContent')}</p>
            </div>
          )}

          {/* Materials */}
          {(courseMaterials.length > 0 || isLoadingMaterials) && (
            <div className="acd-sub-section">
              <h3 className="acd-sub-title">📎 {t('academyCourseDetail.content.courseMaterials', 'Материали към курса')}</h3>
              {isLoadingMaterials ? (
                <div className="academyCourseDetail-materials-loading">
                  <div className="academyCourseDetail-materials-spinner"></div>
                </div>
              ) : (
                <div className="academyCourseDetail-materials-list">
                  {courseMaterials.map((material, index) => (
                    <CourseMaterialItem key={material.id || index} material={material} index={index} t={t} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Final Test */}
          {isAuthentication && courseTestData?.hasTest && (
            <div className="acd-sub-section">
              <h3 className="acd-sub-title">📝 {t('academyCourseDetail.finalTest.title', 'Финален тест')}</h3>
              <div className="academyCourseDetail-final-test-card">
                <div className="academyCourseDetail-final-test-info">
                  <div className="academyCourseDetail-final-test-meta">
                    {courseTestData.test?.totalQuestions && (
                      <span>📋 {courseTestData.test.totalQuestions} {t('academyCourseDetail.finalTest.questions', 'въпроса')}</span>
                    )}
                    {courseTestData.test?.passingScore && (
                      <span>🎯 {t('academyCourseDetail.finalTest.passingScore', 'Мин. резултат')}: {courseTestData.test.passingScore}%</span>
                    )}
                    {courseTestData.test?.timeLimitMinutes && (
                      <span>⏱️ {courseTestData.test.timeLimitMinutes} {t('academyCourseDetail.finalTest.minutes', 'мин')}</span>
                    )}
                    {courseTestData.test?.maxAttempts && (
                      <span>🔄 {t('academyCourseDetail.finalTest.maxAttempts', 'Макс. опити')}: {courseTestData.test.maxAttempts}</span>
                    )}
                  </div>
                  {courseTestData.bestAttempt && (
                    <div className="academyCourseDetail-final-test-best">
                      ✅ {t('academyCourseDetail.finalTest.bestScore', 'Най-добър резултат')}: {courseTestData.bestAttempt.score}%
                    </div>
                  )}
                </div>
                {!courseTestData.testAccessible && (
                  <div className="academyCourseDetail-final-test-locked">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span>{t('academyCourseDetail.finalTest.locked', 'Завършете всички уроци за да отключите теста.')}</span>
                  </div>
                )}
                {courseTestData.testAccessible && (
                  <div className="academyCourseDetail-final-test-actions">
                    {courseTestData.activeAttempt ? (
                      <button className="academyCourseDetail-final-test-btn academyCourseDetail-final-test-btn--continue" onClick={() => navigate(`/academy/courses/${slug}/test`)}>
                        ▶ {t('academyCourseDetail.finalTest.continueAttempt', 'Продължи опита')}
                      </button>
                    ) : courseTestData.canStartNew ? (
                      <button className="academyCourseDetail-final-test-btn academyCourseDetail-final-test-btn--start" onClick={() => navigate(`/academy/courses/${slug}/test`)}>
                        📝 {t('academyCourseDetail.finalTest.startTest', 'Започни тест')}
                      </button>
                    ) : (
                      <div className="academyCourseDetail-final-test-exhausted">
                        {t('academyCourseDetail.finalTest.noMoreAttempts', 'Изчерпахте всички опити.')}
                      </div>
                    )}
                    {courseTestData.remainingAttempts !== null && courseTestData.canStartNew && (
                      <span className="academyCourseDetail-final-test-remaining">
                        {t('academyCourseDetail.finalTest.remaining', 'Оставащи опити')}: {courseTestData.remainingAttempts}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ===== ЗА КУРСА (2x2 grid) ===== */}
        <div className="acd-about-grid">
          <div className="acd-about-card">
            <h3 className="acd-about-card-title">📖 {t('academyCourseDetail.overview.aboutCourse', 'Описание')}</h3>
            <p className="acd-about-card-text">{fullDescription}</p>
          </div>

          <div className="acd-about-card">
            <h3 className="acd-about-card-title">🎓 {t('academyCourseDetail.overview.whatYouLearn', 'Какво ще научиш')}</h3>
            <div className="acd-about-card-list">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="acd-about-card-list-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                  <span>{t(`academyCourseDetail.overview.learnItems.item${i}`)}</span>
                </div>
              ))}
            </div>
          </div>

          {targetAudience.length > 0 && (
            <div className="acd-about-card">
              <h3 className="acd-about-card-title">🎯 {t('academyCourseDetail.overview.targetAudience', 'За кого е курсът')}</h3>
              <div className="acd-about-card-list">
                {targetAudience.map((aud, idx) => (
                  <div key={idx} className="acd-about-card-list-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20,6 9,17 4,12" />
                    </svg>
                    <span>{aud}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="acd-about-card">
            <h3 className="acd-about-card-title">📊 {t('academyCourseDetail.overview.stats.title', 'Статистики')}</h3>
            <div className="acd-stats-mini">
              <div className="acd-stat-mini">
                <span className="acd-stat-mini-val">{enrolledCount.toLocaleString()}</span>
                <span className="acd-stat-mini-lbl">{t('academyCourseDetail.overview.stats.totalEnrolled', 'записани')}</span>
              </div>
              <div className="acd-stat-mini">
                <span className="acd-stat-mini-val">{completedCount.toLocaleString()}</span>
                <span className="acd-stat-mini-lbl">{t('academyCourseDetail.overview.stats.completed', 'завършили')}</span>
              </div>
              <div className="acd-stat-mini">
                <span className="acd-stat-mini-val">⭐ {rating.toFixed(1)}</span>
                <span className="acd-stat-mini-lbl">{t('academyCourseDetail.overview.stats.rating', 'рейтинг')}</span>
              </div>
              <div className="acd-stat-mini">
                <span className="acd-stat-mini-val">{maxCredits} 🪙</span>
                <span className="acd-stat-mini-lbl">{t('academyCourseDetail.overview.stats.maxCredits', 'кредити')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== МЕНТОРИ + ОТЗИВИ (side by side) ===== */}
        <div className="acd-bottom-grid">
          {/* Ментори */}
          <div className="acd-bottom-card">
            <h3 className="acd-bottom-card-title">👨‍🏫 {t('academyCourseDetail.mentors.title', 'Ментори')}</h3>
            {leadInstructor ? (
              <div className="acd-mentor-row">
                <img
                  src={leadInstructor.mentor?.photoUrl || 'https://via.placeholder.com/48'}
                  alt={leadInstructor.mentor?.name}
                  className="acd-mentor-img"
                />
                <div className="acd-mentor-info">
                  <span className="acd-mentor-name">{leadInstructor.mentor?.name}</span>
                  <span className="acd-mentor-role">
                    {t(`academyCourseDetail.instructor.${ROLE_LABELS[leadInstructor.role] || 'roles.lecturer'}`)}
                    {leadInstructor.isLead && ` • ${t('academyCourseDetail.instructor.leadInstructor')}`}
                  </span>
                  {leadInstructor.mentor?.specialization && (
                    <span className="acd-mentor-spec">{leadInstructor.mentor.specialization}</span>
                  )}
                </div>
              </div>
            ) : (
              <p className="acd-empty-text">{t('academyCourseDetail.instructor.noInstructor')}</p>
            )}
            {assistants.length > 0 && (
              <div className="acd-assistants-list">
                {assistants.map((a, i) => (
                  <div key={i} className="acd-assistant-row">
                    <img src={a.mentor?.photoUrl || 'https://via.placeholder.com/32'} alt={a.mentor?.name} />
                    <span>{a.mentor?.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Отзиви */}
          <div className="acd-bottom-card">
            <h3 className="acd-bottom-card-title">⭐ {t('academyCourseDetail.reviews.studentReviews', 'Отзиви')}</h3>
            <div className="acd-review-header">
              <span className="acd-review-big">{rating.toFixed(1)}</span>
              <div className="acd-review-stars">
                {[1, 2, 3, 4, 5].map(s => (
                  <svg key={s} width="18" height="18" viewBox="0 0 24 24"
                    fill={s <= Math.round(rating) ? 'currentColor' : 'none'}
                    stroke="currentColor" strokeWidth="2"
                  >
                    <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                  </svg>
                ))}
              </div>
              <span className="acd-review-count">{enrolledCount} {t('academyCourseDetail.reviews.reviews', 'отзива')}</span>
            </div>
            <div className="acd-review-bars">
              {[5, 4, 3, 2, 1].map(stars => {
                const pct = stars === 5 ? 75 : stars === 4 ? 18 : stars === 3 ? 5 : stars === 2 ? 1 : 1;
                return (
                  <div key={stars} className="acd-review-bar">
                    <span className="acd-review-bar-label">{stars}★</span>
                    <div className="acd-review-bar-track">
                      <div className="acd-review-bar-fill" style={{ width: `${pct}%` }}></div>
                    </div>
                    <span className="acd-review-bar-pct">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </section>

      {/* Trailer Modal */}
      <AcademyTrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        videoUrl={trailerUrl}
        courseTitle={title}
        accentColor={categoryColor}
      />
    </div>
  );
};