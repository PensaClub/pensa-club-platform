// src/components/AcademySeminars/AcademySeminarDetail/AcademySeminarDetail.jsx
// Prefix: asd-

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'; // НОВО
import { useParams, useLocation } from 'react-router-dom'; // НОВО
import { LocalizedLink as Link } from '../../LocalizedLink/LocalizedLink'; // НОВО
import { useLocalizedNavigate } from '../../../hooks/useLocalizedNavigate'; // НОВО
import { useTranslation } from 'react-i18next'; // НОВО
import { useAuthContext } from '../../contexts/UserContext'; // НОВО
import { useAcademyCourses } from '../../contexts/AcademyCoursesProvider'; // НОВО
import {
    MapPin, Wifi, Clock, Users, Calendar, Share2,
    ChevronRight, FileText, BookOpen, CheckCircle,
    ArrowLeft, Loader2, AlertCircle, Award, Video, Film,
} from 'lucide-react'; // НОВО
import ScrollToTop from '../../ScrollToTop/ScrollToTop'; // НОВО
import SEOHead from '../../SEO/SEOHead'; // НОВО
import { TextZoom } from '../../TextZoom/TextZoom'; // НОВО
import './academySeminarDetail.css'; // НОВО

// =========================================================
//                    HELPERS
// =========================================================

const getSeminarStatus = (seminar) => { // НОВО
    if (!seminar) return 'unknown';
    if (seminar.status === 'cancelled') return 'cancelled';
    const now = new Date();
    const start = seminar.scheduledDate ? new Date(seminar.scheduledDate) : null;
    const end = seminar.scheduledEndDate ? new Date(seminar.scheduledEndDate) : null;
    if (start && end && now >= start && now <= end) return 'live';
    if (start && !end) {
        const est = new Date(start.getTime() + (seminar.durationMinutes || 90) * 60 * 1000);
        if (now >= start && now <= est) return 'live';
    }
    if (start && now < start) return 'upcoming';
    return 'completed';
};
const getEmbedUrl = (url) => { // НОВО
    if (!url) return null;
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return null;
};
const formatDate = (dateStr) => { // НОВО
    if (!dateStr) return { full: '', time: '' };
    const d = new Date(dateStr);
    return {
        full: d.toLocaleDateString('bg-BG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
        time: d.toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' }),
    };
};

const getMaterialIcon = (mat) => { // НОВО
    const type = mat?.materialType?.toLowerCase() || mat?.mimeType?.toLowerCase() || '';
    const name = mat?.originalFileName?.toLowerCase() || '';
    if (type.includes('pdf') || name.endsWith('.pdf')) return '📄';
    if (type.includes('doc') || name.endsWith('.docx')) return '📝';
    if (type.includes('video') || name.endsWith('.mp4')) return '🎬';
    if (type.includes('image') || name.endsWith('.png') || name.endsWith('.jpg')) return '🖼️';
    if (type.includes('presentation') || name.endsWith('.pptx')) return '📽️';
    return '📁';
};

const formatFileSize = (bytes) => { // НОВО
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
};

const CATEGORY_COLORS = { // НОВО
    'Интернет сигурност': { primary: '#ef4444', icon: '🔒' },
    'Мобилни устройства': { primary: '#3b82f6', icon: '📱' },
    'Дигитална грамотност': { primary: '#f59e0b', icon: '📚' },
    'Социални мрежи': { primary: '#8b5cf6', icon: '💬' },
    'Онлайн услуги': { primary: '#10b981', icon: '🌐' },
    'Здраве и технологии': { primary: '#ec4899', icon: '🏥' },
    'default': { primary: '#ff6347', icon: '🎓' },
};

// =========================================================
//                    COUNTDOWN
// =========================================================

const useCountdown = (targetDate) => { // НОВО
    const [tl, setTl] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
    useEffect(() => {
        if (!targetDate) return;
        const calc = () => {
            const diff = new Date(targetDate).getTime() - Date.now();
            if (diff <= 0) { setTl({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }); return; }
            setTl({
                days: Math.floor(diff / 86400000),
                hours: Math.floor((diff % 86400000) / 3600000),
                minutes: Math.floor((diff % 3600000) / 60000),
                seconds: Math.floor((diff % 60000) / 1000),
                total: diff,
            });
        };
        calc();
        const timer = setInterval(calc, 1000);
        return () => clearInterval(timer);
    }, [targetDate]);
    return tl;
};

// =========================================================
//                    COMPONENT
// =========================================================

const AcademySeminarDetail = () => { // НОВО
    const { slug } = useParams();
    const { t } = useTranslation('academy');
    const navigate = useLocalizedNavigate();
    const { isAuthentication } = useAuthContext();
    const location = useLocation();

    const {
        getSeminarBySlug,
        getSeminarMaterials,
        getSeminarVideos,
        registerForSeminar,
        unregisterFromSeminar,
        checkSeminarRegistration,
        getSeminarReviews,
        addSeminarReview,
    } = useAcademyCourses();

    const [seminar, setSeminar] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [videos, setVideos] = useState([]);
    const [isRegistered, setIsRegistered] = useState(false);
    const [registering, setRegistering] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState(null);
    const [myReview, setMyReview] = useState({ rating: 0, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);
    const reviewStorageKey = `seminar-review-${slug}`;
    const [reviewSubmitted, setReviewSubmitted] = useState(() => localStorage.getItem(reviewStorageKey) === 'true');

    const loadingRef = useRef(false);
    const lastSlugRef = useRef(null);

    useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

    // Load data // НОВО
    useEffect(() => {
        if (!slug) return;
        if (loadingRef.current && lastSlugRef.current === slug) return;

        const loadData = async () => {
            loadingRef.current = true;
            lastSlugRef.current = slug;
            setIsLoading(true);
            setError(null);

            try {
                const data = await getSeminarBySlug(slug);
                const sem = data?.seminar || data;
                if (!sem || !sem.id) { setError('not_found'); return; }

                setSeminar(sem);
                // Провери регистрация за текущия потребител 
                if (isAuthentication) {
                    try {
                        const regCheck = await checkSeminarRegistration(sem.id);
                        setIsRegistered(regCheck.registered || false);
                    } catch {
                        setIsRegistered(false);
                    }
                }

                // Materials come included in the seminar response
                setMaterials(sem.materials || []);

            } catch (err) {
                console.error('Error loading seminar:', err);
                setError('load_failed');
            } finally {
                setIsLoading(false);
                loadingRef.current = false;
            }
        };

        loadData();
    }, [slug]);

    // Load reviews
    useEffect(() => {
        if (!seminar?.id) return;
        const loadReviews = async () => {
            try {
                const data = await getSeminarReviews(seminar.id);
                setReviews(data?.reviews || []);
                setAvgRating(data?.avgRating || null);
            } catch (err) {
                console.error('Failed to load reviews:', err);
            }
        };
        loadReviews();
    }, [seminar?.id]);

    // Load seminar videos
    useEffect(() => {
        if (!seminar?.id) return;
        if (!getSeminarVideos) return;
        const loadVideos = async () => {
            try {
                const data = await getSeminarVideos(seminar.id);
                setVideos(data?.videos || data || []);
            } catch (err) {
                console.error('Failed to load seminar videos:', err);
            }
        };
        loadVideos();
    }, [seminar?.id]);

    // Computed // НОВО
    const status = useMemo(() => getSeminarStatus(seminar), [seminar]);
    const catStyle = useMemo(() => CATEGORY_COLORS[seminar?.category] || CATEGORY_COLORS.default, [seminar]);
    const countdown = useCountdown(status === 'upcoming' ? seminar?.scheduledDate : null);
    const scheduledDate = useMemo(() => formatDate(seminar?.scheduledDate), [seminar]);
    const totalCredits = useMemo(() => {
        if (!seminar) return 0;
        return (seminar.creditsForAttendance || 0) + (seminar.creditsForParticipation || 0) + (seminar.creditsForTest || 0);
    }, [seminar]);
    const spotsLeft = seminar?.maxParticipants ? seminar.maxParticipants - (seminar.registeredCount || 0) : null;

    // Handlers // НОВО
    const handleRegister = useCallback(async () => {
        if (!seminar) return;
        if (!isAuthentication) { navigate('/sign-up?view=login'); return; }
        setRegistering(true);
        try {
            if (isRegistered) {
                await unregisterFromSeminar(seminar.id);
                setIsRegistered(false);
            } else {
                await registerForSeminar(seminar.id);
                setIsRegistered(true);
            }
            // Презареди семинара за актуален registeredCount // НОВО
            const data = await getSeminarBySlug(slug);
            const sem = data?.seminar || data;
            if (sem) setSeminar(sem);
        } catch (err) {
            console.error('Registration error:', err);
        } finally {
            setRegistering(false);
        }
    }, [seminar, isRegistered, isAuthentication, slug]);

    const handleAddToCalendar = () => {
        if (!seminar) return;
        const start = new Date(seminar.scheduledDate);
        const end = seminar.scheduledEndDate
            ? new Date(seminar.scheduledEndDate)
            : new Date(start.getTime() + (seminar.durationMinutes || 90) * 60 * 1000);

        const formatGCalDate = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

        const location = seminar.isOnline
            ? (seminar.meetingLink || 'Online')
            : [seminar.location, seminar.address].filter(Boolean).join(', ');

        const details = [
            seminar.shortDescription || '',
            '',
            `Повече: https://pensa.club/academy/seminars/${seminar.slug}`
        ].join('\n');

        const params = new URLSearchParams({
            action: 'TEMPLATE',
            text: seminar.title,
            dates: `${formatGCalDate(start)}/${formatGCalDate(end)}`,
            details,
            location,
            sf: 'true',
        });

        window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
    };

    const handleSubmitReview = async () => {
        if (!myReview.rating || myReview.rating < 1) return;
        setSubmittingReview(true);
        try {
            await addSeminarReview(seminar.id, myReview);
            setReviewSubmitted(true);
            localStorage.setItem(reviewStorageKey, 'true');
            // Reload reviews
            const data = await getSeminarReviews(seminar.id);
            setReviews(data?.reviews || []);
            setAvgRating(data?.avgRating || null);
        } catch (err) {
            console.error('Error submitting review:', err);
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleShare = useCallback(async () => { // НОВО
        try {
            if (navigator.share) {
                await navigator.share({ title: seminar?.title, text: seminar?.shortDescription, url: window.location.href });
            } else {
                await navigator.clipboard.writeText(window.location.href);
            }
        } catch {}
    }, [seminar]);

    const handleStartTest = useCallback(() => { // НОВО
        navigate(`/academy/seminars/${slug}/test`);
    }, [navigate, slug]);

    // =========================================================
    //                    LOADING / ERROR
    // =========================================================

    if (isLoading) {
        return (
            <div className="asd-loading">
                <Loader2 size={40} className="asd-spin" />
                <p>{t('seminarDetail.loading', 'Зареждане...')}</p>
            </div>
        );
    }

    if (error || !seminar) {
        return (
            <div className="asd-error">
                <div className="asd-error-content">
                    <AlertCircle size={48} />
                    <h2>{error === 'not_found'
                        ? t('seminarDetail.error.notFound', 'Семинарът не е намерен')
                        : t('seminarDetail.error.title', 'Грешка при зареждане')
                    }</h2>
                    <button onClick={() => navigate('/academy/seminars')} className="asd-error-btn">
                        <ArrowLeft size={16} />
                        {t('seminarDetail.error.back', 'Към семинарите')}
                    </button>
                </div>
            </div>
        );
    }

    // =========================================================
    //                    RENDER
    // =========================================================

    return (
        <div className="asd" style={{ '--accent': catStyle.primary }}>
            <TextZoom />
            {seminar && (
                <SEOHead
                    title={`${seminar.title} | DigiBridge Academy`}
                    description={seminar.shortDescription || seminar.description?.substring(0, 160) || ''}
                    keywords={seminar.tags?.join(', ') || seminar.category || ''}
                    image={seminar.thumbnailUrl || '/images/academy/academy-seminars-og.jpg'}
                    type="article"
                    publishedTime={seminar.publishedAt}
                />
            )}

            {/* ========== HERO ========== */}
            <section className="asd-hero">
                <div className="asd-hero-bg">
                    {seminar.thumbnailUrl && <img src={seminar.thumbnailUrl} alt="" className="asd-hero-bg-img" />}
                    <div className="asd-hero-overlay" />
                    <div className="asd-hero-grid" />
                </div>

                <div className="asd-hero-content">
                    {/* Breadcrumb */}
                    <nav className="asd-breadcrumb">
                        <Link to="/academy" className="asd-breadcrumb-link">{t('seminarDetail.breadcrumb.academy', 'Академия')}</Link>
                        <ChevronRight size={14} />
                        <Link to="/academy/seminars" className="asd-breadcrumb-link">{t('seminarDetail.breadcrumb.seminars', 'Семинари')}</Link>
                        <ChevronRight size={14} />
                        <span className="asd-breadcrumb-current">{seminar.title}</span>
                    </nav>

                    {/* Status */}
                    <div className={`asd-status asd-status--${status}`}>
                        {status === 'live' && <span className="asd-status-dot" />}
                        {status === 'live' && t('seminarDetail.status.live', 'В МОМЕНТА')}
                        {status === 'upcoming' && `📅 ${t('seminarDetail.status.upcoming', 'ПРЕДСТОИ')}`}
                        {status === 'completed' && `✅ ${t('seminarDetail.status.completed', 'ПРИКЛЮЧИЛ')}`}
                        {status === 'cancelled' && `❌ ${t('seminarDetail.status.cancelled', 'ОТМЕНЕН')}`}
                    </div>

                    {/* Category */}
                    <div className="asd-category" style={{ color: catStyle.primary }}>
                        <span>{catStyle.icon}</span>
                        <span>{seminar.category}</span>
                    </div>

                    {/* Title */}
                    <h1 className="asd-title">{seminar.title}</h1>

                    {seminar.shortDescription && <p className="asd-subtitle">{seminar.shortDescription}</p>}

                    {/* Meta */}
                    <div className="asd-meta">
                        <div className="asd-meta-item">
                            <Calendar size={16} />
                            <span>{scheduledDate.full}</span>
                        </div>
                        <div className="asd-meta-item">
                            <Clock size={16} />
                            <span>{scheduledDate.time} · {seminar.durationMinutes} {t('seminarDetail.min', 'мин')}</span>
                        </div>
                        <div className="asd-meta-item">
                            {seminar.isOnline ? <Wifi size={16} /> : <MapPin size={16} />}
                            <span>{seminar.isOnline ? t('seminarDetail.online', 'Онлайн') : (seminar.location || t('seminarDetail.inPerson', 'Присъствено'))}</span>
                        </div>
                    </div>

                    {/* Quick stats */}
                    <div className="asd-quick-stats">
                        <div className="asd-quick-stat">
                            <span className="asd-quick-stat-value">{totalCredits}</span>
                            <span className="asd-quick-stat-label">🪙 {t('seminarDetail.stats.credits', 'Кредити')}</span>
                        </div>
                        {seminar.registeredCount > 0 && (
                            <div className="asd-quick-stat">
                                <span className="asd-quick-stat-value">{seminar.registeredCount}</span>
                                <span className="asd-quick-stat-label">👥 {t('seminarDetail.stats.registered', 'Записани')}</span>
                            </div>
                        )}
                        {seminar.attendedCount > 0 && (
                            <div className="asd-quick-stat">
                                <span className="asd-quick-stat-value">{seminar.attendedCount}</span>
                                <span className="asd-quick-stat-label">✅ {t('seminarDetail.stats.attended', 'Присъствали')}</span>
                            </div>
                        )}
                    </div>
                </div>

               {/* ========== ACTION CARD ========== */}
                <div className="asd-action-card">
                    {/* Countdown — само upcoming */}
                    {status === 'upcoming' && countdown.total > 0 && (
                        <div className="asd-countdown">
                            <span className="asd-countdown-label">{t('seminarDetail.countdown', 'Започва след')}</span>
                            <div className="asd-countdown-digits">
                                {countdown.days > 0 && (
                                    <div className="asd-countdown-unit">
                                        <span>{countdown.days}</span>
                                        <small>{t('seminarDetail.days', 'дни')}</small>
                                    </div>
                                )}
                                <div className="asd-countdown-unit">
                                    <span>{countdown.hours}</span>
                                    <small>{t('seminarDetail.hours', 'ч')}</small>
                                </div>
                                <div className="asd-countdown-unit">
                                    <span>{countdown.minutes}</span>
                                    <small>{t('seminarDetail.mins', 'мин')}</small>
                                </div>
                                <div className="asd-countdown-unit">
                                    <span>{countdown.seconds}</span>
                                    <small>{t('seminarDetail.secs', 'сек')}</small>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Register — upcoming + live */}
                    {(status === 'upcoming' || status === 'live') && seminar.requiresRegistration && (
                        <>
                            <button
                                className={`asd-action-btn ${isRegistered ? 'asd-action-btn--registered' : ''}`}
                                onClick={handleRegister}
                                disabled={registering || (spotsLeft !== null && spotsLeft <= 0 && !isRegistered)}
                            >
                                {registering
                                    ? <Loader2 size={18} className="asd-spin" />
                                    : isRegistered
                                        ? <><CheckCircle size={18} />{t('seminarDetail.unregister', 'Отпиши се')}</>
                                        : <><Users size={18} />{t('seminarDetail.register', 'Запиши се')}</>
                                }
                            </button>

                            {seminar.requiresApproval && !isRegistered && (
                                <p className="asd-approval-note">
                                    <Lock size={13} />
                                    {t('seminarDetail.approvalNote', 'Записването изисква одобрение от ментора')}
                                </p>
                            )}
                        </>
                    )}

                    {/* Spots — upcoming + live */}
                    {(status === 'upcoming' || status === 'live') && spotsLeft !== null && (
                        <div className="asd-spots">
                            <div className="asd-spots-bar">
                                <div className="asd-spots-fill" style={{ width: `${Math.min(((seminar.registeredCount || 0) / seminar.maxParticipants) * 100, 100)}%` }} />
                            </div>
                            <span className="asd-spots-text">
                                {spotsLeft > 0
                                    ? `${spotsLeft} ${t('seminarDetail.spotsLeft', 'свободни места')}`
                                    : t('seminarDetail.spotsFull', 'Няма свободни места')
                                }
                                {seminar.minParticipants > 0 && ` · ${t('seminarDetail.minParticipants', 'мин.')} ${seminar.minParticipants}`}
                            </span>
                        </div>
                    )}

                    {/* Completed — записването е затворено */}
                    {status === 'completed' && (
                        <div className="asd-completed-info">
                            <CheckCircle size={20} />
                            <div>
                                <span>{t('seminarDetail.completedInfo', 'Семинарът е приключил')}</span>
                                <span className="asd-completed-closed">{t('seminarDetail.registrationClosed', 'Записването е затворено')}</span>
                                {seminar.attendedCount > 0 && (
                                    <span className="asd-completed-attended">
                                        {seminar.attendedCount} {t('seminarDetail.attended', 'присъствали')}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Cancelled */}
                    {status === 'cancelled' && (
                        <div className="asd-cancelled-info">
                            <AlertCircle size={20} />
                            <div>
                                <span>{t('seminarDetail.cancelledInfo', 'Семинарът е отменен')}</span>
                                {seminar.cancelReason && (
                                    <span className="asd-cancel-reason">{seminar.cancelReason}</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Meeting link — live + online */}
                    {status === 'live' && seminar.isOnline && seminar.meetingLink && (
                        <a href={seminar.meetingLink} target="_blank" rel="noopener noreferrer" className="asd-action-btn asd-action-btn--live">
                            <Wifi size={18} />
                            {t('seminarDetail.joinNow', 'Присъедини се')}
                        </a>
                    )}

                    {/* Video */ // НОВО
                    }
                    {seminar.videoUrl && (() => {
                        const embedUrl = getEmbedUrl(seminar.videoUrl);
                        if (embedUrl) {
                            return (
                                <div className="asd-video-player">
                                    <iframe
                                        src={embedUrl}
                                        title={seminar.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="asd-video-iframe"
                                    />
                                </div>
                            );
                        }
                        return (
                            <a href={seminar.videoUrl} target="_blank" rel="noopener noreferrer" className="asd-video-link">
                                <Video size={16} />
                                {t('seminarDetail.watchVideo', 'Гледай видео')}
                                <ExternalLink size={13} />
                            </a>
                        );
                    })()}

                    {/* Test */}
                    {seminar.hasTest && (
                        <button className="asd-action-btn-secondary" onClick={handleStartTest}>
                            <FileText size={16} />
                            {t('seminarDetail.takeTest', 'Реши теста')}
                            {seminar.creditsForTest > 0 && (
                                <span className="asd-test-credits">+{seminar.creditsForTest} 🪙</span>
                            )}
                        </button>
                    )}

                    {/* Credits */}
                    <div className="asd-credits-info">
                        <div className="asd-credits-row">
                            <span>{t('seminarDetail.credits.attendance', 'За присъствие')}</span>
                            <span>+{seminar.creditsForAttendance || 0} 🪙</span>
                        </div>
                        {seminar.creditsForParticipation > 0 && (
                            <div className="asd-credits-row">
                                <span>{t('seminarDetail.credits.participation', 'За участие')}</span>
                                <span>+{seminar.creditsForParticipation} 🪙</span>
                            </div>
                        )}
                        {seminar.hasTest && seminar.creditsForTest > 0 && (
                            <div className="asd-credits-row">
                                <span>{t('seminarDetail.credits.test', 'За тест')}</span>
                                <span>+{seminar.creditsForTest} 🪙</span>
                            </div>
                        )}
                        <div className="asd-credits-row asd-credits-total">
                            <span>{t('seminarDetail.credits.total', 'Общо')}</span>
                            <span>+{totalCredits} 🪙</span>
                        </div>
                    </div>

                    <button className="asd-calendar-btn" onClick={handleAddToCalendar}>
                        <Calendar size={16} />
                        {t('seminarDetail.addToCalendar', 'Добави в календар')}
                    </button>
                    <button className="asd-share-btn" onClick={handleShare}>
                        <Share2 size={16} />
                        {t('seminarDetail.share', 'Сподели')}
                    </button>
                </div>
            </section>

            {/* ========== MAIN ========== */}
            <main className="asd-main">
                <div className="asd-container">
                    {/* Tabs */}
                    <div className="asd-tabs">
                        <button className={`asd-tab ${activeTab === 'overview' ? 'asd-tab-active' : ''}`} onClick={() => setActiveTab('overview')}>
                            <BookOpen size={16} />
                            <span>{t('seminarDetail.tabs.overview', 'Преглед')}</span>
                        </button>
                        {materials.length > 0 && (
                            <button className={`asd-tab ${activeTab === 'materials' ? 'asd-tab-active' : ''}`} onClick={() => setActiveTab('materials')}>
                                <FileText size={16} />
                                <span>{t('seminarDetail.tabs.materials', 'Материали')}</span>
                                <span className="asd-tab-badge">{materials.length}</span>
                            </button>
                        )}
                        {videos.length > 0 && (
                            <button className={`asd-tab ${activeTab === 'videos' ? 'asd-tab-active' : ''}`} onClick={() => setActiveTab('videos')}>
                                <Film size={16} />
                                <span>{t('seminarDetail.tabs.videos', 'Видеа')}</span>
                                <span className="asd-tab-badge">{videos.length}</span>
                            </button>
                        )}
                    </div>

                    {/* Tab content */}
                    <div className="asd-tab-content">
                        {activeTab === 'overview' && (
                            <div className="asd-overview">
                                {/* Description */}
                                {(seminar.description || seminar.shortDescription) && (
                                    <section className="asd-section">
                                        <h2 className="asd-section-title">
                                            <span>📖</span>
                                            {t('seminarDetail.overview.description', 'Описание')}
                                        </h2>
                                        <p className="asd-text" style={{ whiteSpace: 'pre-line' }}>
                                            {seminar.description || seminar.shortDescription}
                                        </p>
                                    </section>
                                )}

                                {/* Learning points */}
                                {seminar.learningPoints?.length > 0 && (
                                    <section className="asd-section">
                                        <h2 className="asd-section-title">
                                            <span>🎯</span>
                                            {t('seminarDetail.overview.learningPoints', 'Какво ще научите')}
                                        </h2>
                                        <ul className="asd-points">
                                            {seminar.learningPoints.map((point, i) => (
                                                <li key={i} className="asd-point">
                                                    <CheckCircle size={16} />
                                                    <span>{point}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                )}

                                {/* Location */}
                                {!seminar.isOnline && (seminar.location || seminar.address) && (
                                    <section className="asd-section">
                                        <h2 className="asd-section-title">
                                            <span>📍</span>
                                            {t('seminarDetail.overview.location', 'Място на провеждане')}
                                        </h2>
                                        <div className="asd-location-card">
                                            <MapPin size={20} />
                                            <div>
                                                {seminar.location && <span className="asd-location-name">{seminar.location}</span>}
                                                {seminar.address && <span className="asd-location-address">{seminar.address}</span>}
                                            </div>
                                        </div>
                                    </section>
                                )}

                                {/* Prerequisites */}
                                {seminar.prerequisites && (
                                    <section className="asd-section">
                                        <h2 className="asd-section-title">
                                            <span>📋</span>
                                            {t('seminarDetail.overview.prerequisites', 'Изисквания')}
                                        </h2>
                                        <p className="asd-text">{seminar.prerequisites}</p>
                                    </section>
                                )}

                                {/* What to bring */}
                                {seminar.whatToBring && (
                                    <section className="asd-section">
                                        <h2 className="asd-section-title">
                                            <span>🎒</span>
                                            {t('seminarDetail.overview.whatToBring', 'Какво да носите')}
                                        </h2>
                                        <p className="asd-text">{seminar.whatToBring}</p>
                                    </section>
                                )}

                                {/* Mentor */}
                                {seminar.facilitator && (
                                    <section className="asd-section">
                                        <h2 className="asd-section-title">
                                            <span>👨‍🏫</span>
                                            {t('seminarDetail.overview.mentor', 'Ментор')}
                                        </h2>
                                        <div className="asd-mentor-card">
                                            <div className="asd-mentor-avatar">
                                                {seminar.facilitator.photoUrl
                                                    ? <img src={seminar.facilitator.photoUrl} alt={seminar.facilitator.name} />
                                                    : <span>👤</span>
                                                }
                                            </div>
                                            <div className="asd-mentor-info">
                                                <span className="asd-mentor-name">{seminar.facilitator.name}</span>
                                                {seminar.facilitator.specialization && (
                                                    <span className="asd-mentor-spec">{seminar.facilitator.specialization}</span>
                                                )}
                                            </div>
                                        </div>
                                    </section>
                                )}

                                {/* Linked course */}
                                {seminar.course && (
                                    <section className="asd-section">
                                        <h2 className="asd-section-title">
                                            <span>📚</span>
                                            {t('seminarDetail.overview.linkedCourse', 'Свързан курс')}
                                        </h2>
                                        <Link to={`/academy/courses/${seminar.course.slug}`} className="asd-course-link">
                                            <BookOpen size={18} />
                                            <span>{seminar.course.name}</span>
                                            {seminar.course.category && (
                                                <span className="asd-course-link-cat">{seminar.course.category}</span>
                                            )}
                                        </Link>
                                    </section>
                                )}

                                {/* Tags */}
                                {seminar.tags?.length > 0 && (
                                    <div className="asd-tags">
                                        {(Array.isArray(seminar.tags) ? seminar.tags : []).map((tag, i) => (
                                            <span key={i} className="asd-tag">#{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'materials' && (
                            <div className="asd-materials">
                                {materials.map((mat, i) => (

                                     <a key={mat.id || i}
                                        href={mat.fileUrl || mat.externalUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="asd-material-row"
                                    >
                                        <span className="asd-material-icon">{getMaterialIcon(mat)}</span>
                                        <div className="asd-material-info">
                                            <span className="asd-material-name">{mat.title || mat.originalFileName}</span>
                                            {mat.fileSize && <span className="asd-material-size">{formatFileSize(mat.fileSize)}</span>}
                                        </div>
                                        <span className="asd-material-download">⬇️</span>
                                    </a>
                                ))}
                            </div>
                        )}

                        {activeTab === 'videos' && (
                            <div className="asd-videos">
                                {videos.map((vid) => {
                                    const embedUrl = getEmbedUrl(vid.videoUrl);
                                    return (
                                        <div key={vid.id} className="asd-video-item">
                                            {vid.title && <h3 className="asd-video-title">{vid.title}</h3>}
                                            {embedUrl ? (
                                                <div className="asd-video-player">
                                                    <iframe
                                                        src={embedUrl}
                                                        title={vid.title || 'Video'}
                                                        className="asd-video-iframe"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    />
                                                </div>
                                            ) : vid.videoProvider === 'file' || vid.videoUrl?.match(/\.(mp4|webm|mov)(\?|$)/i) ? (
                                                <video
                                                    controls
                                                    className="asd-video-native"
                                                    preload="metadata"
                                                >
                                                    <source src={vid.videoUrl} />
                                                </video>
                                            ) : (
                                                <a href={vid.videoUrl} target="_blank" rel="noopener noreferrer" className="asd-video-link-row">
                                                    <Film size={18} />
                                                    <span>{vid.title || vid.videoUrl}</span>
                                                </a>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Reviews section */}
            {seminar && new Date(seminar.scheduledDate) <= new Date() && (
                <section className="asd-reviews-section">
                    <div className="asd-container">
                        <h2 className="asd-section-title">
                            <span>⭐</span>
                            {t('seminarDetail.reviews.title', 'Отзиви')}
                            {avgRating && <span className="asd-avg-rating">{avgRating} / 5</span>}
                            {reviews.length > 0 && <span className="asd-reviews-count">({reviews.length})</span>}
                        </h2>

                        {/* Write review — only for authenticated users who attended */}
                        {isAuthentication && !reviewSubmitted && (
                            <div className="asd-review-form">
                                <div className="asd-stars-input">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            className={`asd-star-btn ${myReview.rating >= star ? 'asd-star-active' : ''}`}
                                            onClick={() => setMyReview(prev => ({ ...prev, rating: star }))}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    className="asd-review-textarea"
                                    placeholder={t('seminarDetail.reviews.placeholder', 'Споделете вашето мнение (незадължително)...')}
                                    value={myReview.comment}
                                    onChange={(e) => setMyReview(prev => ({ ...prev, comment: e.target.value }))}
                                    rows={3}
                                    maxLength={1000}
                                />
                                <button
                                    className="asd-review-submit"
                                    onClick={handleSubmitReview}
                                    disabled={!myReview.rating || submittingReview}
                                >
                                    {submittingReview ? t('seminarDetail.reviews.submitting', 'Изпращане...') : t('seminarDetail.reviews.submit', 'Изпрати отзив')}
                                </button>
                            </div>
                        )}

                        {reviewSubmitted && (
                            <div className="asd-review-success">
                                <CheckCircle size={18} />
                                <span>{t('seminarDetail.reviews.submitted', 'Благодарим! Отзивът ви ще бъде прегледан от администратор.')}</span>
                            </div>
                        )}

                        {/* Reviews list */}
                        {reviews.length > 0 ? (
                            <div className="asd-reviews-list">
                                {reviews.map(r => (
                                    <div key={r.id} className="asd-review-card">
                                        <div className="asd-review-header">
                                            <div className="asd-review-author">
                                                {r.author?.avatar ? (
                                                    <img src={r.author.avatar} alt="" className="asd-review-avatar" />
                                                ) : (
                                                    <div className="asd-review-avatar-placeholder">{(r.author?.name || '?')[0]}</div>
                                                )}
                                                <span className="asd-review-name">{r.author?.name || 'Анонимен'}</span>
                                            </div>
                                            <div className="asd-review-stars">
                                                {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                                            </div>
                                        </div>
                                        {r.comment && <p className="asd-review-comment">{r.comment}</p>}
                                        <span className="asd-review-date">{new Date(r.createdAt).toLocaleDateString('bg-BG')}</span>
                                    </div>
                                ))}
                            </div>
                        ) : !reviewSubmitted && (
                            <p className="asd-no-reviews">{t('seminarDetail.reviews.noReviews', 'Все още няма отзиви за този семинар.')}</p>
                        )}
                    </div>
                </section>
            )}

            <ScrollToTop />
        </div>
    );
};

export default AcademySeminarDetail;