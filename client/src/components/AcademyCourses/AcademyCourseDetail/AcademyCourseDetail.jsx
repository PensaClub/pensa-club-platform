// src/components/AcademyCourses/AcademyCourseDetail/AcademyCourseDetail.jsx

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { LocalizedLink as Link } from '../../LocalizedLink/LocalizedLink';
import { useLocalizedNavigate } from '../../../hooks/useLocalizedNavigate';
import { useTranslation } from 'react-i18next';
import { useAcademyCourses } from '../../contexts/AcademyCoursesProvider';
import { useAuthContext } from '../../contexts/UserContext';
import { AcademyTrailerModal } from '../AcademyTrailerModal/AcademyTrailerModal';
import { CourseReviewModal } from '../CourseReviewModal/CourseReviewModal';
import academyServiceFactory from '../../Services/academyServiceFactory';
import './academyCourseDetail.css';
import AcademyCourseDetailSkeleton from './AcademyCourseDetailSkeleton/AcademyCourseDetailSkeleton';
import SEOHead from '../../SEO/SEOHead';

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
            {lesson.mentor && (
              <span className="academyCourseDetail-lesson-mentor-tag">
                <img
                  src={lesson.mentor.photoUrl || 'https://via.placeholder.com/14'}
                  alt={lesson.mentor.name}
                  className="academyCourseDetail-lesson-mentor-avatar"
                />
                {lesson.mentor.name}
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
            {module.mentor && (
              <span className="academyCourseDetail-module-mentor-tag">
                <img
                  src={module.mentor.photoUrl || 'https://via.placeholder.com/16'}
                  alt={module.mentor.name}
                  className="academyCourseDetail-module-mentor-avatar"
                />
                {module.mentor.name}
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
  const { t, i18n } = useTranslation('academy');
  const { slug } = useParams();
  const navigate = useLocalizedNavigate();

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

  // Review state
  const [reviewStats, setReviewStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const fetchedSlugRef = useRef(null);
  const enrollmentCheckedRef = useRef(null);
  const materialsLoadedRef = useRef(null);
  const courseTestLoadedRef = useRef(null);
  const reviewsLoadedRef = useRef(null);

  const academyService = useMemo(() => academyServiceFactory(), []);

  const hasPrivilegedAccess = isAdmin || isModerator || isMentor;
  const hasLessonAccess = isEnrolled || hasPrivilegedAccess;
 const location  = useLocation();

  // SEO meta data
  const metaData = useMemo(() => {
    if (!currentCourse) {
      return {
        title: t('academyCoursesSeo.loading', { defaultValue: 'Зареждане на курс... | DigiBridge Academy' }),
        description: t('academyCoursesSeo.loadingDescription', { defaultValue: 'Безплатен онлайн курс в DigiBridge Academy' }),
        keywords: 'курс, DigiBridge Academy, Pensa Club, дигитална грамотност',
        image: 'https://pensa.club/images/digibridge/hero-image.jpg',
        publishedTime: null,
        modifiedTime: null
      };
    }

    const description = (currentCourse.shortDescription || '').replace(/<[^>]*>/g, '').substring(0, 160);

    return {
      title: `${currentCourse.name} | DigiBridge Academy`,
      description: description || 'Безплатен онлайн курс за дигитална грамотност',
      keywords: [
        ...(currentCourse.tags || []),
        currentCourse.category,
        'курс', 'DigiBridge Academy', 'дигитална грамотност', 'Pensa Club', 'безплатен курс'
      ].filter(Boolean).join(', '),
      image: currentCourse.thumbnailUrl || 'https://pensa.club/images/digibridge/hero-image.jpg',
      publishedTime: currentCourse.publishedAt || currentCourse.createdAt,
      modifiedTime: currentCourse.updatedAt
    };
  }, [currentCourse, t]);

  const structuredData = useMemo(() => {
    if (!currentCourse) return null;

    const leadInst = currentCourse.instances?.find(i => i.isLead)?.mentor;

    const courseSchema = {
      "@type": "Course",
      "name": currentCourse.name,
      "description": (currentCourse.shortDescription || currentCourse.description || '').replace(/<[^>]*>/g, '').substring(0, 200),
      "url": window.location.href,
      "provider": {
        "@type": "Organization",
        "name": "DigiBridge Academy",
        "url": "https://pensa.club/academy",
        "sameAs": ["https://www.facebook.com/profile.php?id=61578204366479"]
      },
      "isAccessibleForFree": true,
      "courseMode": "online",
      "inLanguage": i18n.language,
      "educationalLevel": currentCourse.difficultyLevel || "beginner",
      "image": currentCourse.thumbnailUrl || 'https://pensa.club/images/digibridge/hero-image.jpg',
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "BGN",
        "availability": "https://schema.org/InStock"
      }
    };

    if (currentCourse.estimatedHours) {
      courseSchema.timeRequired = `PT${currentCourse.estimatedHours}H`;
    }
    if (currentCourse.maxCredits) {
      courseSchema.numberOfCredits = currentCourse.maxCredits;
    }
    if (leadInst) {
      courseSchema.hasCourseInstance = {
        "@type": "CourseInstance",
        "courseMode": "online",
        "instructor": { "@type": "Person", "name": leadInst.name }
      };
    }
    if (currentCourse.rating > 0) {
      courseSchema.aggregateRating = {
        "@type": "AggregateRating",
        "ratingValue": currentCourse.rating,
        "bestRating": 5,
        "ratingCount": currentCourse.enrolledCount || 1
      };
    }

    return {
      "@context": "https://schema.org",
      "@graph": [
        courseSchema,
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Начало", "item": "https://pensa.club" },
            { "@type": "ListItem", "position": 2, "name": "DigiBridge Academy", "item": "https://pensa.club/academy" },
            { "@type": "ListItem", "position": 3, "name": "Курсове", "item": "https://pensa.club/academy/courses" },
            { "@type": "ListItem", "position": 4, "name": currentCourse.name }
          ]
        }
      ]
    };
  }, [currentCourse, i18n.language]);

    useEffect(() => {
      window.scrollTo(0, 0);
    }, [location.pathname]);
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

  // Load course reviews
  useEffect(() => {
    const loadReviews = async () => {
      if (!currentCourse?.id) return;
      if (reviewsLoadedRef.current === currentCourse.id) return;

      reviewsLoadedRef.current = currentCourse.id;

      try {
        const [statsRes, reviewsRes] = await Promise.allSettled([
          academyService.getCourseReviewStats(currentCourse.id),
          academyService.getApprovedCourseReviews(currentCourse.id)
        ]);

        if (statsRes.status === 'fulfilled') {
          setReviewStats(statsRes.value);
        }
        if (reviewsRes.status === 'fulfilled') {
          const data = reviewsRes.value?.reviews || reviewsRes.value || [];
          setReviews(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Error loading course reviews:', err);
      }

      // Check user review status (only if authenticated)
      if (isAuthentication) {
        try {
          const statusRes = await academyService.checkUserCourseReviewStatus(currentCourse.id);
          setUserHasReviewed(statusRes?.hasReview || false);
        } catch (err) {
          console.error('Error checking user course review status:', err);
        }
      }
    };

    loadReviews();
  }, [currentCourse?.id, isAuthentication, academyService]);

  // Refetch reviews helper
  const refetchReviews = useCallback(async () => {
    if (!currentCourse?.id) return;
    reviewsLoadedRef.current = null;
    try {
      const [statsRes, reviewsRes] = await Promise.allSettled([
        academyService.getCourseReviewStats(currentCourse.id),
        academyService.getApprovedCourseReviews(currentCourse.id)
      ]);

      if (statsRes.status === 'fulfilled') {
        setReviewStats(statsRes.value);
      }
      if (reviewsRes.status === 'fulfilled') {
        const data = reviewsRes.value?.reviews || reviewsRes.value || [];
        setReviews(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error refetching course reviews:', err);
    }
  }, [currentCourse?.id, academyService]);

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
    return <AcademyCourseDetailSkeleton />;
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
      <SEOHead
        title={metaData.title}
        description={metaData.description}
        keywords={metaData.keywords}
        image={metaData.image}
        type="article"
        publishedTime={metaData.publishedTime}
        modifiedTime={metaData.modifiedTime}
        structuredData={structuredData}
      />
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
                {(reviewStats?.avgRating || reviewStats?.averageRating || rating) > 0 && (
                  <div className="academyCourseDetail-hero-stat academyCourseDetail-hero-stat--rating">
                    <div className="academyCourseDetail-hero-stat-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                      </svg>
                    </div>
                    <div className="academyCourseDetail-hero-stat-info">
                      <span className="academyCourseDetail-hero-stat-value">{parseFloat(reviewStats?.avgRating || reviewStats?.averageRating || rating || 0).toFixed(1)}</span>
                      <span className="academyCourseDetail-hero-stat-label">({reviewStats?.totalCount || reviewStats?.totalReviews || enrolledCount} {t('academyCourseDetail.hero.ratings')})</span>
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

              {/* Instructors Preview */}
              {instructors.length > 0 && (
                <div className="academyCourseDetail-hero-instructors">
                  {instructors.map((inst, i) => (
                    <div key={i} className="academyCourseDetail-hero-instructor">
                      <img
                        src={inst.mentor?.photoUrl || 'https://via.placeholder.com/48'}
                        alt={inst.mentor?.name}
                      />
                      <div className="academyCourseDetail-hero-instructor-info">
                        <span className="academyCourseDetail-hero-instructor-label">
                          {inst.isLead
                            ? t('academyCourseDetail.hero.createdBy')
                            : t(`academyCourseDetail.instructor.${ROLE_LABELS[inst.role] || 'roles.mentor'}`)
                          }
                        </span>
                        <span className="academyCourseDetail-hero-instructor-name">
                          {inst.mentor?.name}
                        </span>
                      </div>
                    </div>
                  ))}
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
                <span className="acd-stat-mini-val">⭐ {parseFloat(reviewStats?.avgRating || reviewStats?.averageRating || rating || 0).toFixed(1)}</span>
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
            {instructors.length > 0 ? (
              <div className="acd-mentors-list">
                {instructors.map((inst, i) => (
                  <div key={i} className={`acd-mentor-card ${inst.isLead ? 'acd-mentor-card--lead' : ''}`}>
                    <div className="acd-mentor-card-header">
                      <img
                        src={inst.mentor?.photoUrl || 'https://via.placeholder.com/56'}
                        alt={inst.mentor?.name}
                        className="acd-mentor-card-img"
                      />
                      <div className="acd-mentor-card-main">
                        <span className="acd-mentor-card-name">
                          {inst.mentor?.name}
                          {inst.isLead && <span className="acd-mentor-lead-badge">⭐</span>}
                        </span>
                        <span className="acd-mentor-card-role">
                          {t(`academyCourseDetail.instructor.${ROLE_LABELS[inst.role] || 'roles.mentor'}`)}
                        </span>
                        {inst.mentor?.specialization && (
                          <span className="acd-mentor-card-spec">{inst.mentor.specialization}</span>
                        )}
                      </div>
                    </div>

                    {/* Статистики */}
                    <div className="acd-mentor-card-stats">
                      {inst.mentor?.rating > 0 && (
                        <span className="acd-mentor-stat">
                          ⭐ {parseFloat(inst.mentor.rating).toFixed(1)}
                          {inst.mentor.reviewsCount > 0 && <small> ({inst.mentor.reviewsCount})</small>}
                        </span>
                      )}
                      {inst.mentor?.studentsCount > 0 && (
                        <span className="acd-mentor-stat">
                          🎓 {inst.mentor.studentsCount} {t('academyCourseDetail.mentors.students', 'студенти')}
                        </span>
                      )}
                      {inst.mentor?.languages?.length > 0 && (
                        <span className="acd-mentor-stat">
                          🌐 {inst.mentor.languages.join(', ')}
                        </span>
                      )}
                    </div>

                    {/* Опит / Образование */}
                    {(inst.mentor?.experience || inst.mentor?.education) && (
                      <div className="acd-mentor-card-bio">
                        {inst.mentor.experience && (
                          <p className="acd-mentor-card-bio-text">{inst.mentor.experience}</p>
                        )}
                        {inst.mentor.education && (
                          <p className="acd-mentor-card-bio-text acd-mentor-card-bio-edu">
                            🎓 {inst.mentor.education}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="acd-empty-text">{t('academyCourseDetail.instructor.noInstructor')}</p>
            )}
          </div>

          {/* Отзиви */}
          <div className="acd-bottom-card">
            <h3 className="acd-bottom-card-title">⭐ {t('academyCourseDetail.reviews.studentReviews', 'Отзиви')}</h3>
            {(() => {
              const avgRating = reviewStats?.avgRating || reviewStats?.averageRating || rating || 0;
              const totalCount = reviewStats?.totalCount || reviewStats?.totalReviews || 0;
              const distribution = reviewStats?.distribution || {};
              return (
                <>
                  <div className="acd-review-header">
                    <span className="acd-review-big">{parseFloat(avgRating).toFixed(1)}</span>
                    <div className="acd-review-stars">
                      {[1, 2, 3, 4, 5].map(s => (
                        <svg key={s} width="18" height="18" viewBox="0 0 24 24"
                          fill={s <= Math.round(avgRating) ? 'currentColor' : 'none'}
                          stroke="currentColor" strokeWidth="2"
                        >
                          <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                        </svg>
                      ))}
                    </div>
                    <span className="acd-review-count">
                      {totalCount} {t('academyCourseDetail.reviews.reviews', 'отзива')}
                    </span>
                  </div>
                  <div className="acd-review-bars">
                    {[5, 4, 3, 2, 1].map(stars => {
                      const count = distribution[stars] || 0;
                      const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
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

                  {/* Review list */}
                  {reviews.length > 0 && (
                    <div className="acd-review-list">
                      {reviews.map((review) => (
                        <div key={review.id} className="acd-review-card">
                          <div className="acd-review-card-header">
                            <div className="acd-review-card-avatar">
                              {review.user?.photoUrl || review.reviewer?.photoUrl ? (
                                <img src={review.user?.photoUrl || review.reviewer?.photoUrl} alt="" />
                              ) : (
                                <span>👤</span>
                              )}
                            </div>
                            <div className="acd-review-card-info">
                              <span className="acd-review-card-name">
                                {review.user?.name || review.name || review.reviewer?.name || review.reviewerName || t('academyCourseDetail.reviews.anonymous', 'Анонимен')}
                              </span>
                              <span className="acd-review-card-date">
                                {review.createdAt && new Date(review.createdAt).toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </span>
                            </div>
                            <div className="acd-review-card-stars">
                              {[1, 2, 3, 4, 5].map(s => (
                                <svg key={s} width="14" height="14" viewBox="0 0 24 24"
                                  fill={s <= (review.rating || 0) ? 'currentColor' : 'none'}
                                  stroke="currentColor" strokeWidth="2"
                                >
                                  <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                                </svg>
                              ))}
                            </div>
                          </div>
                          {(review.comment || review.text || review.content) && (
                            <p className="acd-review-card-text">{review.comment || review.text || review.content}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Rate this course button */}
                  {isAuthentication && !userHasReviewed && (
                    <button
                      className="acd-review-btn"
                      onClick={() => setShowReviewModal(true)}
                    >
                      ⭐ {t('academyCourseDetail.reviews.rateCourse', 'Оцени курса')}
                    </button>
                  )}
                </>
              );
            })()}
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

      {/* Course Review Modal */}
      {showReviewModal && (
        <CourseReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          course={course}
          onSuccess={() => {
            setShowReviewModal(false);
            setUserHasReviewed(true);
            refetchReviews();
          }}
        />
      )}
    </div>
  );
};

export default AcademyCourseDetail;