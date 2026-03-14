import { useState, useRef, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useReAction } from '../../contexts/ReActionProvider';
import { useAuthContext } from '../../contexts/UserContext';
import './reActionLandingTestimonials.css';

const STATIC_IMAGES = [
    '/images/reaction/collage/photo_2026-03-14_08-15-25.jpg',
    '/images/reaction/collage/photo_2026-03-14_08-15-38.jpg',
    '/images/reaction/collage/reaction.jpg',
    '/images/reaction/collage/front-about.jpg',
    '/images/reaction/collage/Center_teatar.jpg',
    '/images/reaction/collage/senior-group-meeting-stockcake.webp',
    '/images/reaction/collage/photo_2026-03-14_08-15-32.jpg',
    '/images/reaction/collage/front-join.jpg',
    '/images/reaction/collage/media-literacy-impact.jpg',
    '/images/reaction/collage/thumb2_Morska_gradina_1.jpg',
    '/images/reaction/collage/589470c2574743fcba6f9fa1b60c4a0b.jpg',
    '/images/reaction/collage/Older-adult-woman.jpg',
    '/images/reaction/collage/1280-840-pensii-fond-shvejcarsko-pravilo-pensioner.jpg',
    '/images/reaction/collage/1280-840-pensioner-pensioneri.jpg',
    '/images/reaction/collage/76164af92ef62188984fef144014e00a.jpg',
    '/images/reaction/collage/Senior-Tech.-W4-1.png',
    '/images/reaction/collage/analogicus-electricity-4666566_1920.jpg',
    '/images/reaction/collage/images (14).jpg',
    '/images/reaction/collage/old-people-sectinon-2.webp',
];

// Seeded pseudo-random for consistent positions across renders
const seededRandom = (seed) => {
    const x = Math.sin(seed * 9301 + 49297) * 49297;
    return x - Math.floor(x);
};

const ReActionLandingTestimonials = ({ testimonials = [], galleryItems = [] }) => {
    const { t } = useTranslation('reaction');
    const { submitTestimonial } = useReAction();
    const { userEmail, isAuthentication } = useAuthContext();

    // Per-user localStorage key so different users on the same computer can each submit
    const storageKey = isAuthentication && userEmail
        ? `ralt-submitted-${userEmail}`
        : 'ralt-submitted';

    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(() => localStorage.getItem(storageKey) === 'true');
    const [formData, setFormData] = useState({
        clubName: '',
        city: '',
        authorName: '',
        quote: '',
    });
    const [errors, setErrors] = useState({});
    const formOpenedAt = useRef(null);

    const handleOpenForm = () => {
        formOpenedAt.current = Date.now();
        setShowForm(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.clubName.trim() || formData.clubName.trim().length < 2) {
            newErrors.clubName = t('hub.testimonials.errors.clubName', 'Моля, въведете името на клуба (поне 2 символа).');
        }
        if (!formData.city.trim() || formData.city.trim().length < 2) {
            newErrors.city = t('hub.testimonials.errors.city', 'Моля, въведете града (поне 2 символа).');
        }
        if (!formData.quote.trim() || formData.quote.trim().length < 10) {
            newErrors.quote = t('hub.testimonials.errors.quote', 'Отзивът трябва да е поне 10 символа.');
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        try {
            await submitTestimonial({
                clubName: formData.clubName.trim(),
                city: formData.city.trim(),
                quote: formData.quote.trim(),
                authorName: formData.authorName.trim() || '',
                formOpenedAt: formOpenedAt.current,
            });
            setSubmitted(true);
            localStorage.setItem(storageKey, 'true');
            setFormData({ clubName: '', city: '', authorName: '', quote: '' });
        } catch {
            // toast is handled in context
        } finally {
            setSubmitting(false);
        }
    };

    const collageImages = useMemo(() => {
        const galleryUrls = galleryItems
            .filter(item => item.mediaType === 'image')
            .map(item => item.mediaUrl);

        const allSources = [...STATIC_IMAGES, ...galleryUrls];
        const count = allSources.length;
        const r = seededRandom;

        // Split into rows/cols so every zone gets a photo
        const cols = Math.round(Math.sqrt(count * 1.6));
        const rows = Math.ceil(count / cols);
        const cellW = 100 / cols;
        const cellH = 100 / rows;

        // Shuffle order so same-source images don't cluster
        const indices = allSources.map((_, i) => i);
        for (let k = indices.length - 1; k > 0; k--) {
            const j = Math.floor(r(k * 97 + 13) * (k + 1));
            [indices[k], indices[j]] = [indices[j], indices[k]];
        }

        // Extra images pinned to bottom-right corner (grid doesn't reach there)
        const bottomRight = [
            { src: allSources[0], style: { top: '82%', left: '80%', transform: 'rotate(-6deg)', width: '210px', height: '140px' } },
            { src: allSources[Math.min(3, count - 1)], style: { top: '70%', left: '88%', transform: 'rotate(9deg)', width: '195px', height: '130px' } },
            { src: allSources[Math.min(7, count - 1)], style: { top: '90%', left: '72%', transform: 'rotate(4deg)', width: '200px', height: '135px' } },
        ];

        const gridImages = indices.map((origIdx, slotIdx) => {
            const col = slotIdx % cols;
            const row = Math.floor(slotIdx / cols);

            // Random position within cell (60% jitter range)
            const jX = (r(origIdx * 7 + 1) - 0.5) * cellW * 0.6;
            const jY = (r(origIdx * 7 + 2) - 0.5) * cellH * 0.6;
            const top = Math.max(-2, Math.min(94, row * cellH + cellH * 0.5 + jY - 5));
            const left = Math.max(-2, Math.min(94, col * cellW + cellW * 0.5 + jX - 5));

            const rotate = (r(origIdx * 7 + 3) - 0.5) * 28;
            const w = 185 + r(origIdx * 7 + 4) * 65;
            const h = w * (0.62 + r(origIdx * 7 + 5) * 0.12);

            return {
                src: allSources[origIdx],
                style: {
                    top: `${top.toFixed(1)}%`,
                    left: `${left.toFixed(1)}%`,
                    transform: `rotate(${rotate.toFixed(1)}deg)`,
                    width: `${w.toFixed(0)}px`,
                    height: `${h.toFixed(0)}px`,
                },
            };
        });

        return [...gridImages, ...bottomRight];
    }, [galleryItems]);

    return (
        <section className="ralt">
            <div className="ralt-collage" aria-hidden="true">
                {collageImages.map((img, i) => (
                    <img key={i} src={img.src} alt="" className="ralt-collage-img" style={img.style} loading="lazy" />
                ))}
            </div>
            <div className="ralt-container">
                <h2 className="ralt-title">{t('hub.testimonials.title', 'Какво казват клубовете')}</h2>

                {testimonials.length > 0 && (
                    <div className="ralt-grid">
                        {testimonials.map((item, index) => (
                            <div key={item.id || index} className="ralt-card">
                                <div className="ralt-card-quote">
                                    <svg className="ralt-card-quote-icon" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                                    </svg>
                                    <p className="ralt-card-text">{item.quote}</p>
                                </div>
                                <div className="ralt-card-footer">
                                    <div className="ralt-card-info">
                                        <span className="ralt-card-club">{item.clubName}</span>
                                        <span className="ralt-card-city">{item.city}</span>
                                    </div>
                                    {item.authorName && (
                                        <span className="ralt-card-author">— {item.authorName}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Submit testimonial section */}
                <div className="ralt-submit-section">
                    {!showForm && !submitted && (
                        <button className="ralt-submit-toggle" onClick={handleOpenForm}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                            {t('hub.testimonials.writeReview', 'Напишете отзив')}
                        </button>
                    )}

                    {submitted && (
                        <div className="ralt-success">
                            <svg className="ralt-success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                            <p className="ralt-success-text">
                                {t('hub.testimonials.successMessage', 'Благодарим за отзива! Ще бъде публикуван след одобрение от екипа.')}
                            </p>
                        </div>
                    )}

                    {showForm && !submitted && (
                        <form className="ralt-form" onSubmit={handleSubmit}>
                            <h3 className="ralt-form-title">{t('hub.testimonials.formTitle', 'Вашият отзив')}</h3>

                            <div className="ralt-form-row">
                                <div className="ralt-form-field">
                                    <label className="ralt-form-label">{t('hub.testimonials.clubName', 'Име на клуба')} *</label>
                                    <input
                                        type="text"
                                        name="clubName"
                                        className={`ralt-form-input ${errors.clubName ? 'ralt-form-input--error' : ''}`}
                                        value={formData.clubName}
                                        onChange={handleChange}
                                        placeholder={t('hub.testimonials.clubNamePlaceholder', 'Име на клуба')}
                                    />
                                    {errors.clubName && <span className="ralt-form-error">{errors.clubName}</span>}
                                </div>

                                <div className="ralt-form-field">
                                    <label className="ralt-form-label">{t('hub.testimonials.city', 'Град')} *</label>
                                    <input
                                        type="text"
                                        name="city"
                                        className={`ralt-form-input ${errors.city ? 'ralt-form-input--error' : ''}`}
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder={t('hub.testimonials.cityPlaceholder', 'Град')}
                                    />
                                    {errors.city && <span className="ralt-form-error">{errors.city}</span>}
                                </div>
                            </div>

                            <div className="ralt-form-field">
                                <label className="ralt-form-label">{t('hub.testimonials.authorName', 'Вашето име')} <span className="ralt-form-optional">({t('hub.testimonials.optional', 'незадължително')})</span></label>
                                <input
                                    type="text"
                                    name="authorName"
                                    className="ralt-form-input"
                                    value={formData.authorName}
                                    onChange={handleChange}
                                    placeholder={t('hub.testimonials.authorNamePlaceholder', 'Име')}
                                />
                            </div>

                            <div className="ralt-form-field">
                                <label className="ralt-form-label">{t('hub.testimonials.quote', 'Вашият отзив')} *</label>
                                <textarea
                                    name="quote"
                                    className={`ralt-form-textarea ${errors.quote ? 'ralt-form-input--error' : ''}`}
                                    value={formData.quote}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder={t('hub.testimonials.quotePlaceholder', 'Вашето впечатление...')}
                                />
                                {errors.quote && <span className="ralt-form-error">{errors.quote}</span>}
                            </div>

                            <div className="ralt-form-actions">
                                <button type="button" className="ralt-form-cancel" onClick={() => { setShowForm(false); setErrors({}); }}>
                                    {t('hub.testimonials.cancel', 'Отказ')}
                                </button>
                                <button type="submit" className="ralt-form-submit" disabled={submitting}>
                                    {submitting
                                        ? t('hub.testimonials.submitting', 'Изпращане...')
                                        : t('hub.testimonials.submit', 'Изпрати отзива')
                                    }
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ReActionLandingTestimonials;
