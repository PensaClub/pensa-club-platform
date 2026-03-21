// src/components/AcademySeminars/SeminarsHero/SeminarsHero.jsx
// Prefix: asmh-

import { useTranslation } from 'react-i18next';
import './seminarsHero.css';

const SeminarsHero = ({ stats }) => {
    const { t } = useTranslation('academy');

    return (
        <section className="asmh-hero">
            <div className="asmh-hero-bg">
                <img
                    src="/images/academy/seminars-1.jpg"
                    alt=""
                    className="asmh-hero-bg-img"
                    onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div className="asmh-hero-overlay" />
                <div className="asmh-hero-noise" />
                <div className="asmh-hero-grid" />
            </div>

            <div className="asmh-hero-content">
                <div className="asmh-hero-badge">
                    <span className="asmh-hero-badge-icon">🏫</span>
                    <span className="asmh-hero-badge-text">{t('seminarsHero.badge', 'Присъствени обучения')}</span>
                </div>

                <h1 className="asmh-hero-title">
                    {t('seminarsHero.title', 'Семинари за')}
                    <span className="asmh-hero-title-glow">{t('seminarsHero.titleAccent', 'дигитална грамотност')}</span>
                </h1>

                <p className="asmh-hero-subtitle">
                    {t('seminarsHero.subtitle', 'Практически занятия на място в пенсионерските клубове с квалифицирани ментори')}
                </p>

                <div className="asmh-hero-stats">
                    <div className="asmh-hero-stat">
                        <div className="asmh-hero-stat-icon">🏫</div>
                        <div className="asmh-hero-stat-value">{stats.total}</div>
                        <div className="asmh-hero-stat-label">{t('seminarsHero.stats.total', 'семинара')}</div>
                    </div>
                    <div className="asmh-hero-stat">
                        <div className="asmh-hero-stat-icon">📅</div>
                        <div className="asmh-hero-stat-value">{stats.upcoming}</div>
                        <div className="asmh-hero-stat-label">{t('seminarsHero.stats.upcoming', 'предстоящи')}</div>
                    </div>
                    <div className="asmh-hero-stat">
                        <div className="asmh-hero-stat-icon">✅</div>
                        <div className="asmh-hero-stat-value">{stats.completed}</div>
                        <div className="asmh-hero-stat-label">{t('seminarsHero.stats.completed', 'проведени')}</div>
                    </div>
                    <div className="asmh-hero-stat asmh-hero-stat--accent">
                        <div className="asmh-hero-stat-icon">🪙</div>
                        <div className="asmh-hero-stat-value">{stats.totalCredits}</div>
                        <div className="asmh-hero-stat-label">{t('seminarsHero.stats.credits', 'кредити')}</div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SeminarsHero;