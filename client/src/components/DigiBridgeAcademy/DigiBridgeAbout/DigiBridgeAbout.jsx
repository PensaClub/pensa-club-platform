import { useTranslation } from 'react-i18next';
import './digiBridgeAbout.css';

export const DigiBridgeAbout = ({ stats, loading }) => {
    const { t } = useTranslation('digibridge');

    return (
        <section className="dba-about">
            {/* Background Elements */}
            <div className="dba-about-glow dba-about-glow--1"></div>
            <div className="dba-about-glow dba-about-glow--2"></div>

            <div className="dba-about-container">
                <div className="dba-about-content">
                    
                    {/* Text Side */}
                    <div className="dba-about-text">
                        <span className="dba-about-label">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M12 16v-4M12 8h.01"/>
                            </svg>
                            {t('digiBridge.about.label', 'За нас')}
                        </span>
                        
                        <h2 className="dba-about-title">
                            {t('digiBridge.about.titlePart1', 'Свързваме ')}
                            <span className="dba-about-title-highlight">
                                {t('digiBridge.about.titlePart2', 'поколенията')}
                            </span>
                            {t('digiBridge.about.titlePart3', ' чрез технологии')}
                        </h2>
                        
                        <p className="dba-about-description">
                            {t('digiBridge.about.description', 'DigiBridge Academy е част от европейския проект BRIDGE, който цели да преодолее дигиталното разделение между поколенията. Нашите обучени млади ментори помагат на възрастни хора да овладеят технологиите с търпение и разбиране.')}
                        </p>

                        {/* Stats Grid */}
                        <div className="dba-about-stats">
                            <div className="dba-about-stat">
                                <div className="dba-about-stat-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                        <polyline points="22 4 12 14.01 9 11.01"/>
                                    </svg>
                                </div>
                                <div className="dba-about-stat-content">
                                    <span className="dba-about-stat-number">
                                        {loading ? '...' : `${stats?.satisfaction || 100}%`}
                                    </span>
                                    <span className="dba-about-stat-label">{t('digiBridge.about.stat1', 'Удовлетвореност')}</span>
                                </div>
                            </div>

                            <div className="dba-about-stat">
                                <div className="dba-about-stat-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                        <circle cx="9" cy="7" r="4"/>
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                    </svg>
                                </div>
                                <div className="dba-about-stat-content">
                                    <span className="dba-about-stat-number">
                                        {loading ? '...' : `${stats?.activeMentors || 0}+`}
                                    </span>
                                    <span className="dba-about-stat-label">{t('digiBridge.about.stat2', 'Активни ментори')}</span>
                                </div>
                            </div>

                            <div className="dba-about-stat">
                                <div className="dba-about-stat-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"/>
                                        <line x1="2" y1="12" x2="22" y2="12"/>
                                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                                    </svg>
                                </div>
                                <div className="dba-about-stat-content">
                                    <span className="dba-about-stat-number">
                                        {loading ? '...' : stats?.countries || 3}
                                    </span>
                                    <span className="dba-about-stat-label">{t('digiBridge.about.stat3', 'Държави')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Features List */}
                        <div className="dba-about-features">
                            <div className="dba-about-feature">
                                <div className="dba-about-feature-check">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <polyline points="20 6 9 17 4 12"/>
                                    </svg>
                                </div>
                                <span>{t('digiBridge.about.feature1', 'Безплатно за всички участници')}</span>
                            </div>
                            <div className="dba-about-feature">
                                <div className="dba-about-feature-check">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <polyline points="20 6 9 17 4 12"/>
                                    </svg>
                                </div>
                                <span>{t('digiBridge.about.feature2', 'Индивидуален подход')}</span>
                            </div>
                            <div className="dba-about-feature">
                                <div className="dba-about-feature-check">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <polyline points="20 6 9 17 4 12"/>
                                    </svg>
                                </div>
                                <span>{t('digiBridge.about.feature3', 'Финансирано от ЕС')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Image Side */}
                    <div className="dba-about-visual">
                        <div className="dba-about-img-wrapper">
                            <div className="dba-about-img-frame">
                                <img 
                                    src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80" 
                                    alt="Интергенерационно обучение" 
                                    className="dba-about-img"
                                />
                                <div className="dba-about-img-overlay"></div>
                            </div>

                            {/* Floating Badge */}
                            <div className="dba-about-float-badge">
                                <div className="dba-about-float-badge-icon">🇪🇺</div>
                                <div className="dba-about-float-badge-text">
                                    <span className="dba-about-float-badge-title">BRIDGE Project</span>
                                    <span className="dba-about-float-badge-sub">EU Funded</span>
                                </div>
                            </div>

                            {/* Decorative Ring */}
                            <div className="dba-about-ring"></div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};