import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './reActionLandingLinks.css';

const ReActionLandingLinks = () => {
    const { t } = useTranslation('reaction');

    const links = [
        {
            key: 'book',
            to: '/reaction/book',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                    <path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" />
                </svg>
            ),
            title: t('hub.links.book.title', 'Заяви посещение'),
            description: t('hub.links.book.description', 'Попълни формата и ще се свържем с теб'),
            color: '#dc2626',
        },
        {
            key: 'factcheck',
            to: '/fact-check',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
            ),
            title: t('hub.links.factCheck.title', 'FactCheck'),
            description: t('hub.links.factCheck.description', 'Провери информация и подай сигнал'),
            color: '#7c3aed',
        },
        {
            key: 'track',
            to: '/reaction/track',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
            ),
            title: t('hub.links.track.title', 'Проследи заявка'),
            description: t('hub.links.track.description', 'Виж статуса на твоята заявка'),
            color: '#0891b2',
        },
    ];

    return (
        <section className="rall">
            <h2 className="rall-title">{t('hub.links.title', 'Бързи връзки')}</h2>
            <div className="rall-grid">
                {links.map((link, i) => (
                    <Link key={link.key} to={link.to} className={`rall-card rall-card--${i + 1}`}>
                        <div className="rall-card-tape" />
                        <div className="rall-card-icon" style={{ background: link.color }}>
                            {link.icon}
                        </div>
                        <h3 className="rall-card-title">{link.title}</h3>
                        <p className="rall-card-desc">{link.description}</p>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default ReActionLandingLinks;
