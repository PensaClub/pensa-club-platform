// src/components/Articles/ArticleView/UsefulLinksDisplay/UsefulLinksDisplay.jsx
// Prefix: uld-

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, LinkIcon } from 'lucide-react';
import { getResizedUrl } from '../../../../utils/firebaseImageResize';
import './usefulLinksDisplay.css';

const isFirebaseUrl = (url) => typeof url === 'string' && url.includes('firebasestorage.googleapis.com');

const ensureProtocol = (url) => {
    if (typeof url !== 'string') return '';
    const trimmed = url.trim();
    if (!trimmed) return '';
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const getHostname = (url) => {
    try { return new URL(ensureProtocol(url)).hostname.replace(/^www\./, ''); }
    catch { return ''; }
};

const UsefulLinkCard = ({ link }) => {
    const { t } = useTranslation('content');
    // Two-stage fallback: 0 = try resized (Firebase) or original (non-Firebase),
    // 1 = original (only meaningful for Firebase if resize 404s),
    // 2 = give up → placeholder.
    const [stage, setStage] = useState(0);
    const hostname = getHostname(link.url);

    // Effective image: prefer the user's choice (link.image), fall back to
    // saved ogImage if image is empty (covers links saved before ogImage
    // existed, or future cases where image is cleared without re-saving).
    const effectiveImage = link.image || link.ogImage || null;

    let imgSrc = null;
    if (effectiveImage && stage < 2) {
        if (isFirebaseUrl(effectiveImage)) {
            imgSrc = stage === 0 ? getResizedUrl(effectiveImage, 600) : effectiveImage;
        } else {
            imgSrc = effectiveImage;
        }
    }
    const showImage = !!imgSrc;

    const handleImgError = () => {
        if (isFirebaseUrl(effectiveImage) && stage === 0) {
            setStage(1);
        } else {
            setStage(2);
        }
    };

    const safeHref = ensureProtocol(link.url);

    return (
        <a
            className="uld-card"
            href={safeHref}
            target="_blank"
            rel="noopener noreferrer"
            title={safeHref}
        >
            {showImage ? (
                <div className="uld-card-image-wrap">
                    <img
                        className="uld-card-image"
                        src={imgSrc}
                        alt={link.label || hostname}
                        loading="lazy"
                        onError={handleImgError}
                    />
                </div>
            ) : (
                <div className="uld-card-image-wrap uld-card-image-wrap--placeholder">
                    <LinkIcon size={28} />
                </div>
            )}
            <div className="uld-card-body">
                {hostname && <div className="uld-card-host">{hostname}</div>}
                <div className="uld-card-title">{link.label || link.url}</div>
                {link.description && <div className="uld-card-desc">{link.description}</div>}
            </div>
            <ExternalLink size={14} className="uld-card-ext" aria-hidden="true" />
        </a>
    );
};

const UsefulLinksDisplay = ({ links }) => {
    const { t } = useTranslation('content');

    const cleaned = Array.isArray(links)
        ? links.filter((l) => l && typeof l.url === 'string' && l.url.trim() !== '')
        : [];

    if (cleaned.length === 0) return null;

    return (
        <section className="uld-root" aria-label={t('articles.articleView.usefulLinks.title', 'Полезни връзки')}>
            <h3 className="uld-title">
                <LinkIcon size={18} />
                {t('articles.articleView.usefulLinks.title', 'Полезни връзки')}
            </h3>
            <div className="uld-grid">
                {cleaned.map((link, idx) => (
                    <UsefulLinkCard key={`${link.url}-${idx}`} link={link} />
                ))}
            </div>
        </section>
    );
};

export default UsefulLinksDisplay;
