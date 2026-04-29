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
    Settings, Radio, Pencil, X,
} from 'lucide-react'; // НОВО
import ScrollToTop from '../../ScrollToTop/ScrollToTop'; // НОВО
import SEOHead from '../../SEO/SEOHead'; // НОВО
import { TextZoom } from '../../TextZoom/TextZoom'; // НОВО
import { useTrackContentView } from '../../hooks/useTrackContentView';
import './academySeminarDetail.css'; // НОВО

// =========================================================
//                    HELPERS
// =========================================================

const getSeminarStatus = (seminar) => { // НОВО
    if (!seminar) return 'unknown';
    if (seminar.status === 'cancelled') return 'cancelled';
    if (seminar.status === 'live') return 'live';
    if (seminar.status === 'completed') return 'completed';
    const now = new Date();
    const start = seminar.scheduledDate ? new Date(seminar.scheduledDate) : null;
    const end = seminar.scheduledEndDate ? new Date(seminar.scheduledEndDate) : null;
    // If end date exists and hasn't passed, it's still upcoming/active
    if (end && now < end) return 'upcoming';
    if (start && now < start) return 'upcoming';
    // Start passed but no end date — check if within duration
    if (start && !end) {
        const duration = (seminar.durationMinutes || 90) * 60 * 1000;
        if (now < new Date(start.getTime() + duration)) return 'upcoming';
    }
    return 'scheduled';
};
const getEmbedUrl = (url) => { // НОВО
    if (!url) return null;
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/live\/)([^&?/]+)/);
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

const getPlatformName = (url) => {
    if (!url) return 'линка';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
    if (url.includes('meet.google')) return 'Google Meet';
    if (url.includes('zoom.us') || url.includes('zoom.com')) return 'Zoom';
    if (url.includes('teams.microsoft') || url.includes('teams.live')) return 'Microsoft Teams';
    if (url.includes('webex')) return 'Webex';
    if (url.includes('discord')) return 'Discord';
    return 'линка';
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
    const { isAuthentication, isAdmin, profileData } = useAuthContext();
    const isMentorOrAdmin = isAdmin || profileData?.isMentor;
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
        startSeminar,
        stopSeminar,
        getSeminarSessions,
    } = useAcademyCourses();

    const [seminar, setSeminar] = useState(null);
    useTrackContentView('seminar', seminar?.id);
    const [materials, setMaterials] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [selectedSessionIds, setSelectedSessionIds] = useState([]);
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
    const [adminPanelOpen, setAdminPanelOpen] = useState(false);
    const [adminActionLoading, setAdminActionLoading] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [passwordUnlocked, setPasswordUnlocked] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showSessionPrompt, setShowSessionPrompt] = useState(false);
    const [showGuestForm, setShowGuestForm] = useState(false);
    const [guestData, setGuestData] = useState({ firstName: '', lastName: '', email: '', phone: '' });
    const [guestRegistering, setGuestRegistering] = useState(false);
    const [guestRegistered, setGuestRegistered] = useState(false);

    const handleGuestRegister = async () => {
        if (!guestData.firstName.trim() || !guestData.lastName.trim()) return;
        const activeSessionsGuest = sessions.filter(s => !s.cancelled);
        if (activeSessionsGuest.length > 0 && selectedSessionIds.length === 0) {
            setShowSessionPrompt(true);
            setShowAuthModal(false);
            return;
        }
        setGuestRegistering(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const res = await fetch(`${apiUrl}/academy/seminars/${seminar.id}/guest-register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...guestData, sessionIds: selectedSessionIds.length > 0 ? selectedSessionIds : undefined }),
            });
            const data = await res.json();
            if (data.success) {
                setGuestRegistered(true);
            } else {
                alert(data.message || 'Грешка при записване');
            }
        } catch {
            alert('Грешка при записване');
        } finally {
            setGuestRegistering(false);
        }
    };

    const needsPassword = seminar?.meetingPassword && seminar.meetingPassword.trim() !== '';
    const isLiveAccessAllowed = !needsPassword || passwordUnlocked || isMentorOrAdmin;

    const handlePasswordCheck = () => {
        if (passwordInput === seminar.meetingPassword) {
            setPasswordUnlocked(true);
            setPasswordError(false);
        } else {
            setPasswordError(true);
        }
    };

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

                // Load sessions
                try {
                    const sessData = await getSeminarSessions(sem.id);
                    setSessions(sessData || []);
                } catch { setSessions([]); }

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
        if (!isAuthentication) { setShowAuthModal(true); return; }

        // If active sessions exist and none selected — prompt to select
        const activeSessions = sessions.filter(s => !s.cancelled);
        if (!isRegistered && activeSessions.length > 0 && selectedSessionIds.length === 0) {
            setShowSessionPrompt(true);
            return;
        }

        setRegistering(true);
        try {
            if (isRegistered) {
                await unregisterFromSeminar(seminar.id);
                setIsRegistered(false);
                setSelectedSessionIds([]);
            } else {
                await registerForSeminar(seminar.id, { sessionIds: selectedSessionIds.length > 0 ? selectedSessionIds : undefined });
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
    }, [seminar, isRegistered, isAuthentication, slug, selectedSessionIds, sessions]);

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

    // Admin controls
    const handleAdminStartLive = async () => {
        if (!seminar?.id) return;
        setAdminActionLoading(true);
        try {
            await startSeminar(seminar.id);
            setSeminar(prev => ({ ...prev, status: 'live' }));
        } catch (err) {
            console.error('Error starting live:', err);
        } finally {
            setAdminActionLoading(false);
        }
    };

    const handleAdminStopLive = async () => {
        if (!seminar?.id) return;
        setAdminActionLoading(true);
        try {
            await stopSeminar(seminar.id);
            setSeminar(prev => ({ ...prev, status: 'scheduled' }));
        } catch (err) {
            console.error('Error stopping live:', err);
        } finally {
            setAdminActionLoading(false);
        }
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
                    <img
                        src={seminar.thumbnailUrl || '/images/academy/academy-seminars-og.jpg'}
                        alt=""
                        className="asd-hero-bg-img"
                    />
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

                    {/* Sessions schedule */}
                    {sessions.length > 0 && (
                        <div className="asd-sessions-section">
                            <h3 className="asd-sessions-title">
                                <Calendar size={16} />
                                {t('seminarDetail.schedule', 'График')}
                            </h3>
                            <div className="asd-sessions-list">
                                {sessions.map(session => {
                                    const isSelected = selectedSessionIds.includes(session.id);
                                    const dateStr = new Date(session.date).toLocaleDateString('bg-BG', { weekday: 'short', day: 'numeric', month: 'short' });
                                    const spotsLeft = session.maxParticipants ? session.maxParticipants - (session.registeredCount || 0) : null;
                                    if (session.cancelled) {
                                        return (
                                            <div key={session.id} className="asd-session-card asd-session-cancelled">
                                                <div className="asd-session-info">
                                                    <span className="asd-session-date" style={{ textDecoration: 'line-through' }}>{dateStr}</span>
                                                    <span className="asd-session-time" style={{ textDecoration: 'line-through' }}>{session.startTime}{session.endTime ? ` — ${session.endTime}` : ''}</span>
                                                </div>
                                                <span className="asd-session-badge-cancelled">Отменен</span>
                                            </div>
                                        );
                                    }
                                    return (
                                        <label key={session.id} className={`asd-session-card ${isSelected ? 'asd-session-selected' : ''}`}>
                                            {!isRegistered && (status === 'upcoming' || status === 'live') && (
                                                <input
                                                    type="checkbox"
                                                    className="asd-session-check"
                                                    checked={isSelected}
                                                    onChange={() => {
                                                        setSelectedSessionIds(prev =>
                                                            prev.includes(session.id)
                                                                ? prev.filter(id => id !== session.id)
                                                                : [...prev, session.id]
                                                        );
                                                    }}
                                                />
                                            )}
                                            <div className="asd-session-info">
                                                <span className="asd-session-date">{dateStr}</span>
                                                <span className="asd-session-time">{session.startTime}{session.endTime ? ` — ${session.endTime}` : ''}</span>
                                                {session.location && <span className="asd-session-location"><MapPin size={11} /> {session.location}</span>}
                                            </div>
                                            {isSelected && isRegistered && (
                                                <span className="asd-session-badge-registered">✓ Записан</span>
                                            )}
                                            {spotsLeft !== null && !isSelected && (
                                                <span className={`asd-session-spots ${spotsLeft <= 0 ? 'asd-spots-full' : ''}`}>
                                                    {spotsLeft > 0 ? `${spotsLeft} места` : 'Пълен'}
                                                </span>
                                            )}
                                        </label>
                                    );
                                })}
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
                    {status === 'live' && seminar.isOnline && seminar.meetingLink && isLiveAccessAllowed && (
                        <div className="asd-live-buttons">
                            <a href={seminar.meetingLink} target="_blank" rel="noopener noreferrer" className="asd-action-btn asd-action-btn--external">
                                <Video size={18} />
                                {t('seminarDetail.watchOn', 'Гледай на')} {getPlatformName(seminar.meetingLink)}
                            </a>
                            {seminar.secondaryLink && (
                                <a href={seminar.secondaryLink} target="_blank" rel="noopener noreferrer" className="asd-action-btn asd-action-btn--secondary">
                                    <Film size={18} />
                                    {t('seminarDetail.watchOn', 'Гледай на')} {getPlatformName(seminar.secondaryLink)}
                                </a>
                            )}
                            {getEmbedUrl(seminar.meetingLink) && (
                                <button className="asd-action-btn asd-action-btn--live" onClick={() => setActiveTab('live')}>
                                    <Wifi size={18} />
                                    {t('seminarDetail.joinNow', 'Присъедини се')}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Password gate — live + online + has password + registered */}
                    {status === 'live' && seminar.isOnline && seminar.meetingLink && needsPassword && !isLiveAccessAllowed && isRegistered && (
                        <div className="asd-password-gate">
                            <div className="asd-password-gate-icon">🔒</div>
                            <p className="asd-password-gate-text">{t('seminarDetail.passwordRequired', 'Този семинар изисква парола за достъп')}</p>
                            <div className="asd-password-gate-input">
                                <input
                                    type="password"
                                    value={passwordInput}
                                    onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
                                    placeholder={t('seminarDetail.enterPassword', 'Въведете парола...')}
                                    className={passwordError ? 'asd-input-error' : ''}
                                    onKeyDown={(e) => e.key === 'Enter' && handlePasswordCheck()}
                                />
                                <button onClick={handlePasswordCheck}>
                                    {t('seminarDetail.unlock', 'Отключи')}
                                </button>
                            </div>
                            {passwordError && <span className="asd-password-error">{t('seminarDetail.wrongPassword', 'Грешна парола')}</span>}
                        </div>
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

            {/* ========== LIVE STREAM ========== */}
            {status === 'live' && seminar.meetingLink && isLiveAccessAllowed && (
                <section className="asd-live-section">
                    <div className="asd-container">
                        <div className="asd-live-header">
                            <span className="asd-live-indicator">
                                <span className="asd-live-dot" />
                                {t('seminarDetail.liveNow', 'На живо')}
                            </span>
                            <div className="asd-live-buttons-header">
                                <a href={seminar.meetingLink} target="_blank" rel="noopener noreferrer" className="asd-live-external-btn">
                                    <Video size={16} />
                                    {t('seminarDetail.watchOn', 'Гледай на')} {getPlatformName(seminar.meetingLink)}
                                </a>
                                {seminar.secondaryLink && (
                                    <a href={seminar.secondaryLink} target="_blank" rel="noopener noreferrer" className="asd-live-external-btn asd-live-secondary-btn">
                                        <Film size={16} />
                                        {t('seminarDetail.watchOn', 'Гледай на')} {getPlatformName(seminar.secondaryLink)}
                                    </a>
                                )}
                            </div>
                        </div>
                        {(() => {
                            const embedUrl = getEmbedUrl(seminar.meetingLink);
                            if (embedUrl) {
                                return (
                                    <div className="asd-video-player">
                                        <iframe
                                            src={embedUrl}
                                            title={seminar.title}
                                            className="asd-video-iframe"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    </div>
                                );
                            }
                            return null;
                        })()}
                    </div>
                </section>
            )}

            {/* ========== RECORDED VIDEO (when not live) ========== */}
            {status !== 'live' && videos.length > 0 && (() => {
                const firstVideo = videos[0];
                const embedUrl = getEmbedUrl(firstVideo.videoUrl);
                const isFile = firstVideo.videoProvider === 'file'
                    || firstVideo.videoUrl?.match(/\.(mp4|webm|mov)(\?|$)/i);
                if (!embedUrl && !isFile) return null;
                return (
                    <section className="asd-live-section">
                        <div className="asd-container">
                            {embedUrl ? (
                                <div className="asd-video-player">
                                    <iframe
                                        src={embedUrl}
                                        title={firstVideo.title || seminar.title}
                                        className="asd-video-iframe"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            ) : (
                                <video controls className="asd-video-native" preload="metadata">
                                    <source src={firstVideo.videoUrl} />
                                </video>
                            )}
                        </div>
                    </section>
                );
            })()}

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

                                {/* Facilitators (mentor / admin / external) */}
                                {(() => {
                                    const facilitators = Array.isArray(seminar.facilitators) && seminar.facilitators.length > 0
                                        ? seminar.facilitators
                                        : seminar.facilitator
                                            ? [{
                                                type: 'mentor',
                                                name: seminar.facilitator.name,
                                                photoUrl: seminar.facilitator.photoUrl,
                                                specialization: seminar.facilitator.specialization,
                                                isLead: true,
                                            }]
                                            : [];
                                    if (facilitators.length === 0) return null;

                                    // Sort: lead first, then rest.
                                    const sorted = [...facilitators].sort((a, b) => {
                                        if (a.isLead && !b.isLead) return -1;
                                        if (!a.isLead && b.isLead) return 1;
                                        return 0;
                                    });

                                    const typeLabel = (type) => {
                                        if (type === 'mentor') return t('seminarDetail.facilitators.typeMentor', 'Ментор');
                                        if (type === 'admin') return t('seminarDetail.facilitators.typeAdmin', 'Администратор');
                                        if (type === 'external') return t('seminarDetail.facilitators.typeExternal', 'Външен лектор');
                                        return '';
                                    };

                                    return (
                                        <section className="asd-section">
                                            <h2 className="asd-section-title">
                                                <span>👨‍🏫</span>
                                                {facilitators.length > 1
                                                    ? t('seminarDetail.facilitators.titleMulti', 'Водещи на семинара')
                                                    : t('seminarDetail.facilitators.titleSingle', 'Водещ на семинара')}
                                            </h2>

                                            <div className="asd-facilitators-grid">
                                                {sorted.map((f, idx) => (
                                                    <div
                                                        key={`${f.type}-${f.sourceId || idx}`}
                                                        className={`asd-mentor-card${f.isLead ? ' asd-mentor-card--lead' : ''}`}
                                                    >
                                                        {f.isLead && (
                                                            <span className="asd-lead-ribbon" title={t('seminarDetail.facilitators.leadLabel', 'Главен водещ')}>★</span>
                                                        )}
                                                        <div className="asd-mentor-avatar">
                                                            {f.photoUrl
                                                                ? <img src={f.photoUrl} alt={f.name} />
                                                                : <span>👤</span>
                                                            }
                                                        </div>
                                                        <div className="asd-mentor-info">
                                                            <span className="asd-mentor-name">{f.name}</span>
                                                            <span className="asd-mentor-type-badge">
                                                                {typeLabel(f.type)}
                                                                {f.role && f.role !== 'mentor' && ` · ${t(`seminarDetail.facilitators.roles.${f.role}`, f.role)}`}
                                                            </span>
                                                            {(f.specialization || f.organization) && (
                                                                <span className="asd-mentor-spec">
                                                                    {f.specialization || f.organization}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    );
                                })()}

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
            {seminar && (
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

            {/* Admin floating panel */}
            {isMentorOrAdmin && seminar && (
                <>
                    <button
                        className={`asd-admin-toggle ${adminPanelOpen ? 'asd-admin-toggle-open' : ''}`}
                        onClick={() => setAdminPanelOpen(!adminPanelOpen)}
                        title="Admin"
                    >
                        {adminPanelOpen ? <X size={18} /> : <Settings size={18} />}
                    </button>

                    {adminPanelOpen && (
                        <div className="asd-admin-panel">
                            <div className="asd-admin-panel-title">Управление</div>

                            <button
                                className="asd-admin-btn"
                                onClick={() => navigate(`/academy/admin/edit-seminar/${seminar.slug}`)}
                            >
                                <Pencil size={15} />
                                Редактирай
                            </button>

                            {status !== 'live' && status !== 'cancelled' && (
                                <button
                                    className="asd-admin-btn asd-admin-btn-live"
                                    onClick={handleAdminStartLive}
                                    disabled={adminActionLoading}
                                >
                                    <Radio size={15} />
                                    На живо
                                </button>
                            )}

                            {status === 'live' && (
                                <button
                                    className="asd-admin-btn asd-admin-btn-stop"
                                    onClick={handleAdminStopLive}
                                    disabled={adminActionLoading}
                                >
                                    <Radio size={15} />
                                    Спри на живо
                                </button>
                            )}

                            <button
                                className="asd-admin-btn"
                                onClick={() => navigate('/academy/admin/seminar-attendance')}
                            >
                                <Users size={15} />
                                Присъствие
                            </button>
                        </div>
                    )}
                </>
            )}

            <ScrollToTop />

            {/* Auth modal for unregistered users */}
            {showSessionPrompt && (
                <div className="asd-auth-overlay" onClick={() => setShowSessionPrompt(false)}>
                    <div className="asd-auth-modal" onClick={e => e.stopPropagation()}>
                        <button className="asd-auth-close" onClick={() => setShowSessionPrompt(false)}>
                            <X size={18} />
                        </button>
                        <div className="asd-auth-icon">📅</div>
                        <h3 className="asd-auth-title">Изберете ден</h3>
                        <p className="asd-auth-text">Моля, изберете поне един ден от графика, в който искате да присъствате.</p>
                        <button
                            className="asd-auth-btn asd-auth-btn-login"
                            onClick={() => setShowSessionPrompt(false)}
                            style={{ width: '100%' }}
                        >
                            Разбрах
                        </button>
                    </div>
                </div>
            )}

            {showAuthModal && (
                <div className="asd-auth-overlay" onClick={() => { setShowAuthModal(false); setShowGuestForm(false); setGuestRegistered(false); }}>
                    <div className="asd-auth-modal" onClick={e => e.stopPropagation()}>
                        <button className="asd-auth-close" onClick={() => { setShowAuthModal(false); setShowGuestForm(false); setGuestRegistered(false); }}>
                            <X size={18} />
                        </button>

                        {guestRegistered ? (
                            /* Success state */
                            <>
                                <div className="asd-auth-icon">✅</div>
                                <h3 className="asd-auth-title">Записахте се успешно!</h3>
                                <p className="asd-auth-text">Ще получите потвърждение по имейл (ако сте го посочили). Регистрирайте се в платформата за кредити!</p>
                                <div className="asd-auth-buttons">
                                    <a href={`/sign-up?redirect=${encodeURIComponent(location.pathname)}`} className="asd-auth-btn asd-auth-btn-login">
                                        🏆 Регистрирай се за кредити
                                    </a>
                                    <button className="asd-auth-btn asd-auth-btn-register" onClick={() => { setShowAuthModal(false); setGuestRegistered(false); setShowGuestForm(false); }}>
                                        Затвори
                                    </button>
                                </div>
                            </>
                        ) : showGuestForm ? (
                            /* Guest form */
                            <>
                                <div className="asd-auth-icon">📝</div>
                                <h3 className="asd-auth-title">Запишете се като гост</h3>
                                <div className="asd-guest-form">
                                    <input
                                        className="asd-guest-input"
                                        type="text"
                                        placeholder="Име *"
                                        value={guestData.firstName}
                                        onChange={e => setGuestData(prev => ({ ...prev, firstName: e.target.value }))}
                                    />
                                    <input
                                        className="asd-guest-input"
                                        type="text"
                                        placeholder="Фамилия *"
                                        value={guestData.lastName}
                                        onChange={e => setGuestData(prev => ({ ...prev, lastName: e.target.value }))}
                                    />
                                    <input
                                        className="asd-guest-input"
                                        type="email"
                                        placeholder="Имейл (за потвърждение)"
                                        value={guestData.email}
                                        onChange={e => setGuestData(prev => ({ ...prev, email: e.target.value }))}
                                    />
                                    <span className="asd-guest-hint">Ще получите имейл потвърждение</span>
                                    <input
                                        className="asd-guest-input"
                                        type="tel"
                                        placeholder="Телефон (за SMS напомняне)"
                                        value={guestData.phone}
                                        onChange={e => setGuestData(prev => ({ ...prev, phone: e.target.value }))}
                                    />
                                    <span className="asd-guest-hint">За SMS напомняне преди семинара</span>
                                    <div className="asd-auth-buttons" style={{ marginTop: 16 }}>
                                        <button
                                            className="asd-auth-btn asd-auth-btn-login"
                                            onClick={handleGuestRegister}
                                            disabled={guestRegistering || !guestData.firstName.trim() || !guestData.lastName.trim()}
                                        >
                                            {guestRegistering ? 'Записване...' : 'Запиши се'}
                                        </button>
                                        <button className="asd-auth-btn asd-auth-btn-register" onClick={() => setShowGuestForm(false)}>
                                            ← Назад
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* Choice: register or guest */
                            <>
                                <div className="asd-auth-icon">🎓</div>
                                <h3 className="asd-auth-title">Запишете се за семинара</h3>
                                <div className="asd-auth-credits-badge">
                                    🏆 Като регистриран потребител получавате кредити за всеки посетен семинар!
                                </div>
                                <div className="asd-auth-buttons-stack">
                                    <a href={`/sign-up?redirect=${encodeURIComponent(location.pathname)}`} className="asd-auth-btn asd-auth-btn-login">
                                        🏆 Регистрирай се и спечели кредити
                                    </a>
                                    <button className="asd-auth-btn asd-auth-btn-register" onClick={() => setShowGuestForm(true)}>
                                        📝 Продължи като гост
                                    </button>
                                    <a href={`/sign-up?view=login&redirect=${encodeURIComponent(location.pathname)}`} className="asd-auth-link">
                                        Вече имате акаунт? Вход
                                    </a>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AcademySeminarDetail;