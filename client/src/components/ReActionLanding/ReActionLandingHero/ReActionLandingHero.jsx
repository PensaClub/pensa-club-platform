import { useTranslation } from 'react-i18next';
import './reActionLandingHero.css';

const ReActionLandingHero = ({ stats, galleryItems = [] }) => {
    const { t } = useTranslation('reaction');

    // Pick up to 5 images for the hero background collage
    const heroImages = galleryItems
        .filter((item) => item.mediaType === 'image')
        .slice(0, 5);

    return (
        <section className="ralh">
            {/* Background photo collage */}
            <div className="ralh-photos">
                {heroImages.map((img, i) => (
                    <div
                        key={img.id}
                        className={`ralh-photo ralh-photo--${i + 1}`}
                        style={{ backgroundImage: `url(${img.mediaUrl})` }}
                    />
                ))}
                {heroImages.length === 0 && (
                    <div
                        className="ralh-photo ralh-photo--fallback"
                        style={{ backgroundImage: 'url(/images/reaction/reaction.jpg)' }}
                    />
                )}
            </div>

            {/* Gradient overlay */}
            <div className="ralh-overlay" />

            {/* Content */}
            <div className="ralh-content">
                <div className="ralh-logos">
                    <img
                        src="/images/partners/BFFW-20Logo-Prink2.svg"
                        alt="Bulgarian Fund for Women"
                        className="ralh-logo"
                    />
                    <span className="ralh-logos-divider">×</span>
                    <img
                        src="/images/homePage/logo.png"
                        alt="Pensa Club"
                        className="ralh-logo"
                    />
                </div>

                <h1 className="ralh-title">{t('hub.hero.title', 'Програма ReАкция')}</h1>
                <p className="ralh-subtitle">
                    {t('hub.hero.subtitle', 'Безплатни менторски посещения за медийна грамотност в пенсионерски клубове')}
                </p>

                {(stats.visitsCompleted > 0 || stats.clubsReached > 0) && (
                    <div className="ralh-stats">
                        <div className="ralh-stat">
                            <span className="ralh-stat-number">{stats.visitsCompleted}</span>
                            <span className="ralh-stat-label">{t('stats.visitsCompleted', 'Посещения')}</span>
                        </div>
                        <div className="ralh-stat">
                            <span className="ralh-stat-number">{stats.clubsReached}</span>
                            <span className="ralh-stat-label">{t('stats.clubsReached', 'Клубове')}</span>
                        </div>
                        <div className="ralh-stat">
                            <span className="ralh-stat-number">{stats.citiesCovered}</span>
                            <span className="ralh-stat-label">{t('stats.citiesCovered', 'Градове')}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* "Leaking" photos that extend below the hero */}
            <div className="ralh-overflow-photos">
                {heroImages.slice(0, 3).map((img, i) => (
                    <div
                        key={`overflow-${img.id}`}
                        className={`ralh-overflow-photo ralh-overflow-photo--${i + 1}`}
                    >
                        <img src={img.mediaUrl} alt={img.title || ''} />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ReActionLandingHero;
