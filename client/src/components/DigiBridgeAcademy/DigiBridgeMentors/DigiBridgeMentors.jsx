import { LocalizedLink as Link } from '../../LocalizedLink/LocalizedLink';
import { useTranslation } from 'react-i18next';
import './digiBridgeMentors.css';
import { useLocation } from 'react-router-dom';

export const DigiBridgeMentors = ({ stats, loading }) => {
    const { t } = useTranslation('digibridge');
    const location = useLocation();

    const mentorQualities = [
        {
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
            ),
            title: t('digiBridge.mentors.quality1.title', 'Търпение'),
            description: t('digiBridge.mentors.quality1.description', 'Обясняват толкова пъти, колкото е необходимо'),
            color: '#6366f1'
        },
        {
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
            ),
            title: t('digiBridge.mentors.quality2.title', 'Емпатия'),
            description: t('digiBridge.mentors.quality2.description', 'Разбират предизвикателствата и се отнасят с уважение'),
            color: '#ef4444'
        },
        {
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <circle cx="12" cy="12" r="6"/>
                    <circle cx="12" cy="12" r="2"/>
                </svg>
            ),
            title: t('digiBridge.mentors.quality3.title', 'Фокус'),
            description: t('digiBridge.mentors.quality3.description', 'Адаптират обучението към индивидуалните нужди'),
            color: '#0ea5e9'
        },
        {
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
            ),
            title: t('digiBridge.mentors.quality4.title', 'Подкрепа'),
            description: t('digiBridge.mentors.quality4.description', 'Винаги готови да помогнат и насърчат'),
            color: '#10b981'
        },
    ];

   useEffect(() => {
      window.scrollTo(0, 0);
    }, [location.pathname]);
    
    return (
        <section className="dbm-section">
            {/* Background */}
            <div className="dbm-grid"></div>
            <div className="dbm-glow dbm-glow--1"></div>
            <div className="dbm-glow dbm-glow--2"></div>

            <div className="dbm-container">
                {/* Left Content */}
                <div className="dbm-content">
                    <span className="dbm-label">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                        {t('digiBridge.mentors.label', 'Ментори')}
                    </span>
                    
                    <h2 className="dbm-title">
                        {t('digiBridge.mentors.titlePart1', 'Обучени ')}
                        <span className="dbm-title-highlight">
                            {t('digiBridge.mentors.titlePart2', 'млади хора')}
                        </span>
                        {t('digiBridge.mentors.titlePart3', ' готови да помогнат')}
                    </h2>
                    
                    <p className="dbm-description">
                        {t('digiBridge.mentors.description', 'Нашите ментори са специално подбрани и обучени млади хора, които искат да направят разлика в живота на възрастните.')}
                    </p>

                    {/* Qualities */}
                    <div className="dbm-qualities">
                        {mentorQualities.map((quality, index) => (
                            <div 
                                key={index} 
                                className="dbm-quality"
                                style={{ '--quality-color': quality.color }}
                            >
                                <div className="dbm-quality-icon">
                                    {quality.icon}
                                </div>
                                <div className="dbm-quality-content">
                                    <h3 className="dbm-quality-title">{quality.title}</h3>
                                    <p className="dbm-quality-desc">{quality.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="dbm-actions">
                        <Link to="/academy/mentors" className="dbm-btn dbm-btn--primary">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"/>
                                <path d="m21 21-4.35-4.35"/>
                            </svg>
                            {t('digiBridge.mentors.findMentor', 'Намери ментор')}
                        </Link>
                        <Link to="/academy/become-mentor" className="dbm-btn dbm-btn--outline">
                            {t('digiBridge.mentors.becomeMentor', 'Стани ментор')}
                        </Link>
                    </div>
                </div>

                {/* Right Visual */}
                <div className="dbm-visual">
                    <div className="dbm-img-wrapper">
                        <div className="dbm-img-frame">
                            <img 
                                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80" 
                                alt="Ментор и обучаем" 
                                className="dbm-img"
                            />
                            <div className="dbm-img-overlay"></div>
                        </div>

                        {/* Stats Card */}
                        <div className="dbm-stats-card">
                            <div className="dbm-stat">
                                <div className="dbm-stat-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                        <circle cx="9" cy="7" r="4"/>
                                    </svg>
                                </div>
                                <div className="dbm-stat-content">
                                    <span className="dbm-stat-number">
                                        {loading ? '...' : `${stats?.activeMentors || 0}+`}
                                    </span>
                                    <span className="dbm-stat-label">{t('digiBridge.mentors.activeMentors', 'Активни ментори')}</span>
                                </div>
                            </div>
                            <div className="dbm-stat-divider"></div>
                            <div className="dbm-stat">
                                <div className="dbm-stat-icon dbm-stat-icon--green">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                        <polyline points="22 4 12 14.01 9 11.01"/>
                                    </svg>
                                </div>
                                <div className="dbm-stat-content">
                                    <span className="dbm-stat-number">
                                        {loading ? '...' : `${stats?.satisfaction || 100}%`}
                                    </span>
                                    <span className="dbm-stat-label">{t('digiBridge.mentors.satisfaction', 'Удовлетвореност')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Floating Badge */}
                        <div className="dbm-float-badge">
                            <span className="dbm-float-badge-icon">🎓</span>
                            <span className="dbm-float-badge-text">{t('digiBridge.mentors.trained', 'Обучени професионално')}</span>
                        </div>

                        {/* Decorative Ring */}
                        <div className="dbm-ring"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};