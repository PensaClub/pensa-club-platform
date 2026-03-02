import { useTranslation } from 'react-i18next';
import { LocalizedLink as Link } from '../../LocalizedLink/LocalizedLink';
import './mentorCard.css';

// Цветови теми за менторите
const colorThemes = [
    {
        name: 'coral',
        primary: '#ff6b6b',
        secondary: '#ffa8a8',
        gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ffa8a8 50%, #ffd4d4 100%)',
        light: '#fff5f5',
        accent: '#ff4757'
    },
    {
        name: 'ocean',
        primary: '#4facfe',
        secondary: '#00f2fe',
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 50%, #a8edea 100%)',
        light: '#f0f9ff',
        accent: '#0984e3'
    },
    {
        name: 'purple',
        primary: '#a855f7',
        secondary: '#d8b4fe',
        gradient: 'linear-gradient(135deg, #a855f7 0%, #d8b4fe 50%, #f3e8ff 100%)',
        light: '#faf5ff',
        accent: '#9333ea'
    },
    {
        name: 'emerald',
        primary: '#10b981',
        secondary: '#6ee7b7',
        gradient: 'linear-gradient(135deg, #10b981 0%, #6ee7b7 50%, #d1fae5 100%)',
        light: '#ecfdf5',
        accent: '#059669'
    },
    {
        name: 'sunset',
        primary: '#f59e0b',
        secondary: '#fcd34d',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #fcd34d 50%, #fef3c7 100%)',
        light: '#fffbeb',
        accent: '#d97706'
    },
    {
        name: 'rose',
        primary: '#ec4899',
        secondary: '#f9a8d4',
        gradient: 'linear-gradient(135deg, #ec4899 0%, #f9a8d4 50%, #fce7f3 100%)',
        light: '#fdf2f8',
        accent: '#db2777'
    }
];

export const MentorCard = ({ mentor, index, onViewProfile }) => {
    const { t } = useTranslation('digibridge');

    const isImageRight = index % 2 !== 0;
    const isAvailable = mentor.isOnline;
    const theme = colorThemes[index % colorThemes.length];

    // Вземи курсовете на ментора
    const courses = mentor.courses || [];

    return (
        <div
            className={`mzz-section ${isImageRight ? 'mzz-section--right' : 'mzz-section--left'}`}
            style={{ '--mzz-primary': theme.primary, '--mzz-secondary': theme.secondary, '--mzz-accent': theme.accent, '--mzz-light': theme.light }}
        >
            {/* Decorative background elements */}
            <div className="mzz-bg-pattern"></div>
            <div className="mzz-bg-blob"></div>

            {/* IMAGE SIDE */}
            <div className="mzz-image-side">
                <div className="mzz-image-wrapper" style={{ background: theme.gradient }}>
                    {/* Floating decorative elements */}
                    <div className="mzz-float mzz-float--1">💡</div>
                    <div className="mzz-float mzz-float--2">📚</div>
                    <div className="mzz-float mzz-float--3">⭐</div>

                    {/* Main image with blob mask */}
                    <div className="mzz-image-blob">
                        <img
                            src={mentor.photoUrl}
                            alt={mentor.name}
                            className="mzz-image"
                        />
                    </div>

                    {/* Status badge */}
                    <div className={`mzz-status ${isAvailable ? 'mzz-status--online' : 'mzz-status--offline'}`}>
                        {isAvailable && <span className="mzz-status-dot"></span>}
                        <span>{t(`digiBridge.mentorsPage.card.${isAvailable ? 'available' : 'busy'}`)}</span>
                    </div>

                    {/* Experience badge */}
                    <div className="mzz-exp-badge">
                        <span className="mzz-exp-number">{mentor.sessionsCount || 0}</span>
                        <span className="mzz-exp-label">{t('digiBridge.mentorsPage.card.sessions', 'сесии')}</span>
                    </div>
                </div>

                {/* Courses sidebar */}
                {courses.length > 0 && (
                    <div className="mzz-courses-sidebar">
                        <div className="mzz-courses-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                            </svg>
                            <span>{t('digiBridge.mentorsPage.card.teaches', 'Преподава')}</span>
                        </div>
                        <div className="mzz-courses-list">
                            {courses.slice(0, 3).map((course, idx) => (
                                <Link
                                    key={course.id || idx}
                                    to={`/academy/courses/${course.slug || course.id}`}
                                    className="mzz-course-chip"
                                    style={{ animationDelay: `${idx * 0.1}s` }}
                                >
                                    <span className="mzz-course-icon">📖</span>
                                    <span className="mzz-course-name">{course.courseName || course.name}</span>
                                    <span className="mzz-course-students">
                                        {course.enrolledStudents || 0} 👥
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* CONTENT SIDE */}
            <div className="mzz-content-side">
                {/* Header with name and specialization */}
                <div className="mzz-header">
                    <div className="mzz-name-row">
                        <h2 className="mzz-name">{mentor.name}</h2>
                        <span className="mzz-age">{mentor.age} {t('digiBridge.mentorsPage.card.years')}</span>
                    </div>

                    <div className="mzz-spec-tag" style={{ background: theme.light, borderColor: theme.primary }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                        <span>{mentor.specialization}</span>
                    </div>
                </div>

                {/* Bio */}
                <p className="mzz-bio">{mentor.bio || mentor.motivation}</p>

                {/* Languages */}
                {mentor.languages && mentor.languages.length > 0 && (
                    <div className="mzz-languages">
                        <span className="mzz-languages-label">{t('digiBridge.mentorsPage.card.speaks', 'Говори')}:</span>
                        <div className="mzz-languages-flags">
                            {mentor.languages.map((lang) => (
                                <span key={lang} className="mzz-flag" title={lang}>
                                    {lang === 'bg' ? '🇧🇬' : lang === 'en' ? '🇬🇧' : lang === 'de' ? '🇩🇪' : lang === 'fr' ? '🇫🇷' : '🌐'}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="mzz-stats">
                    <div className="mzz-stat">
                        <div className="mzz-stat-icon" style={{ background: theme.gradient }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </div>
                        <div className="mzz-stat-content">
                            <span className="mzz-stat-value">{mentor.studentsCount || 0}</span>
                            <span className="mzz-stat-label">{t('digiBridge.mentorsPage.card.students')}</span>
                        </div>
                    </div>

                    <div className="mzz-stat">
                        <div className="mzz-stat-icon" style={{ background: theme.gradient }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                        </div>
                        <div className="mzz-stat-content">
                            <span className="mzz-stat-value">{parseFloat(mentor.reviewsAvgRating || 0).toFixed(1)}</span>
                            <span className="mzz-stat-label">{t('digiBridge.mentorsPage.card.rating')}</span>
                        </div>
                    </div>

                    <div className="mzz-stat">
                        <div className="mzz-stat-icon" style={{ background: theme.gradient }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                        </div>
                        <div className="mzz-stat-content">
                            <span className="mzz-stat-value">{mentor.reviewsCount || 0}</span>
                            <span className="mzz-stat-label">{t('digiBridge.mentorsPage.card.reviews', 'отзиви')}</span>
                        </div>
                    </div>
                </div>

                {/* Availability info */}
                {mentor.availability && (
                    <div className="mzz-availability">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>{mentor.availability}</span>
                    </div>
                )}

                {/* Action buttons */}
                <div className="mzz-actions">
                    <button
                        className="mzz-btn mzz-btn--primary"
                        onClick={onViewProfile}
                        style={{ background: theme.gradient }}
                    >
                        <span>{t('digiBridge.mentorsPage.card.viewProfile')}</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </button>

                    {mentor.priorityContact && (
                        <div className="mzz-quick-contact">
                            <span className="mzz-quick-label">{t('digiBridge.mentorsPage.card.quickContact', 'Бърз контакт')}:</span>
                            <div className="mzz-contact-icons">
                                {mentor.viber && (
                                    <a href={`viber://chat?number=${mentor.viber}`} className="mzz-contact-icon mzz-contact-icon--viber" title="Viber">
                                        📱
                                    </a>
                                )}
                                {mentor.facebook && (
                                    <a href={mentor.facebook} target="_blank" rel="noopener noreferrer" className="mzz-contact-icon mzz-contact-icon--fb" title="Facebook">
                                        📘
                                    </a>
                                )}
                                {mentor.linkedin && (
                                    <a href={mentor.linkedin} target="_blank" rel="noopener noreferrer" className="mzz-contact-icon mzz-contact-icon--li" title="LinkedIn">
                                        💼
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};