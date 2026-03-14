import { useState, useEffect, useRef } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../contexts/UserContext';
import { useReAction } from '../contexts/ReActionProvider';
import { useTheme } from '../contexts/ThemeContext';
import { TextZoom } from '../TextZoom/TextZoom';
import SEOHead from '../SEO/SEOHead';
import './reActionTrack.css';

const STATUSES = ['new', 'in_review', 'mentor_assigned', 'confirmed', 'completed', 'cancelled'];

const ReActionTrack = () => {
  const { t } = useTranslation('reaction');
  const location = useLocation();
  const { code: urlCode } = useParams();
  const { isAuthentication } = useAuthContext();
  const { trackRequest, cancelByCode } = useReAction();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Default to light theme, shared across all ReAction pages (ra- prefix)
  useEffect(() => {
    const isRefresh = localStorage.getItem('ra-page-active') === 'true';

    if (!isRefresh) {
      localStorage.setItem('ra-prev-theme', theme);
      const savedTheme = localStorage.getItem('ra-theme') || 'light';
      localStorage.setItem('ra-theme', savedTheme);
      if (theme !== savedTheme) {
        toggleTheme();
      }
    }
    localStorage.setItem('ra-page-active', 'true');

    return () => {
      localStorage.removeItem('ra-page-active');
      const prevTheme = localStorage.getItem('ra-prev-theme');
      if (prevTheme) {
        localStorage.removeItem('ra-prev-theme');
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme !== prevTheme) {
          toggleTheme();
        }
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (localStorage.getItem('ra-page-active') === 'true') {
      localStorage.setItem('ra-theme', theme);
    }
  }, [theme]);

  const [code, setCode] = useState(urlCode ? urlCode.toUpperCase() : '');
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const autoSearched = useRef(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Auto-search when code is in URL
  useEffect(() => {
    if (urlCode && !autoSearched.current) {
      autoSearched.current = true;
      const searchCode = urlCode.toUpperCase();
      setCode(searchCode);
      setSearching(true);
      setResult(null);
      setNotFound(false);
      trackRequest(searchCode)
        .then((response) => {
          if (response?.request) {
            setResult(response.request);
          } else {
            setNotFound(true);
          }
        })
        .catch(() => setNotFound(true))
        .finally(() => setSearching(false));
    }
  }, [urlCode, trackRequest]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setSearching(true);
    setResult(null);
    setNotFound(false);

    try {
      const response = await trackRequest(code.trim());
      if (response?.request) {
        setResult(response.request);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setSearching(false);
    }
  };

  const getStatusIndex = (status) => {
    const idx = STATUSES.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  const getStatusColor = (status) => {
    const colors = {
      new: '#6b7280',
      in_review: '#f59e0b',
      mentor_assigned: '#3b82f6',
      confirmed: '#8b5cf6',
      completed: '#16a34a',
      cancelled: '#dc2626',
    };
    return colors[status] || '#6b7280';
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelByCode(code.trim(), { cancelReason: cancelReason.trim() || undefined });
      setResult((prev) => ({ ...prev, status: 'cancelled' }));
      setShowCancelModal(false);
      setCancelReason('');
    } catch {
      // toast handled in provider
    } finally {
      setCancelling(false);
    }
  };

  const activeStatuses = STATUSES.filter((s) => s !== 'cancelled');

  return (
    <div className="ratr">
      <SEOHead
        title={`${t('track.title')} | Pensa Club`}
        description={t('seo.description')}
        keywords={t('seo.keywords')}
      />
      <TextZoom />

      <section className="ratr-hero">
        <div className="ratr-hero-bg">
          <div className="ratr-hero-bg-pattern"></div>
          <div className="ratr-hero-bg-glow ratr-hero-bg-glow--1"></div>
          <div className="ratr-hero-bg-glow ratr-hero-bg-glow--2"></div>
        </div>

        <div className="ratr-hero-container">
          <h1 className="ratr-hero-title">{t('track.title')}</h1>

          <form className="ratr-search" onSubmit={handleSubmit}>
            <input
              type="text"
              className="ratr-search-input"
              placeholder={t('track.placeholder')}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={8}
            />
            <button
              type="submit"
              className="ratr-search-btn"
              disabled={searching || !code.trim()}
            >
              {searching ? t('track.searching') : t('track.submit')}
            </button>
          </form>
        </div>
      </section>

      <section className="ratr-content">
        <div className="ratr-container">
          {/* Not Found */}
          {notFound && (
            <div className="ratr-not-found">
              <svg className="ratr-not-found-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <h3>{t('track.notFound')}</h3>
              <p>{t('track.notFoundDesc')}</p>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="ratr-result">
              {/* Status Badge */}
              <div className="ratr-status-badge" style={{ background: getStatusColor(result.status) }}>
                {t(`track.statusLabels.${result.status}`)}
              </div>

              {/* Timeline */}
              {result.status !== 'cancelled' && (
                <div className="ratr-timeline">
                  {activeStatuses.map((status, i) => {
                    const currentIdx = getStatusIndex(result.status);
                    const isActive = i <= currentIdx;
                    const isCurrent = i === currentIdx;

                    return (
                      <div
                        key={status}
                        className={`ratr-timeline-step ${isActive ? 'ratr-timeline-step--active' : ''} ${isCurrent ? 'ratr-timeline-step--current' : ''}`}
                      >
                        <div className="ratr-timeline-dot"></div>
                        <span className="ratr-timeline-label">
                          {t(`track.statusLabels.${status}`)}
                        </span>
                        {i < activeStatuses.length - 1 && (
                          <div className={`ratr-timeline-line ${i < currentIdx ? 'ratr-timeline-line--active' : ''}`}></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Details */}
              <div className="ratr-details">
                <div className="ratr-detail">
                  <span className="ratr-detail-label">{t('track.clubName')}</span>
                  <span className="ratr-detail-value">{result.clubName}</span>
                </div>
                <div className="ratr-detail">
                  <span className="ratr-detail-label">{t('track.preferredDate')}</span>
                  <span className="ratr-detail-value">
                    {result.preferredDate ? new Date(result.preferredDate).toLocaleDateString('bg-BG') : '—'}
                  </span>
                </div>
                <div className="ratr-detail">
                  <span className="ratr-detail-label">{t('track.topic')}</span>
                  <span className="ratr-detail-value">
                    {result.topic ? t(`form.topicOptions.${result.topic}`, result.topic) : '—'}
                  </span>
                </div>
                <div className="ratr-detail">
                  <span className="ratr-detail-label">{t('track.submittedAt')}</span>
                  <span className="ratr-detail-value">
                    {result.createdAt ? new Date(result.createdAt).toLocaleDateString('bg-BG') : '—'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {['new', 'reviewing', 'mentor_assigned'].includes(result.status) && (
                <div className="ratr-actions">
                  <button
                    type="button"
                    className="ratr-cancel-btn"
                    onClick={() => setShowCancelModal(true)}
                  >
                    {t('track.cancelRequest')}
                  </button>
                  {isAuthentication && (
                    <Link to="/reaction/my" className="ratr-action-link">
                      {t('track.manageRequests')}
                    </Link>
                  )}
                </div>
              )}

              {result.status === 'cancelled' && (
                <div className="ratr-actions">
                  <Link to="/reaction" className="ratr-action-link">
                    {t('track.backToProgram')}
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="ratr-modal-overlay" onClick={() => !cancelling && setShowCancelModal(false)}>
          <div className="ratr-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="ratr-modal-title">{t('track.cancelTitle')}</h3>
            <p className="ratr-modal-text">{t('track.cancelConfirm')}</p>
            <textarea
              className="ratr-modal-textarea"
              placeholder={t('track.cancelReasonPlaceholder')}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
            />
            <div className="ratr-modal-actions">
              <button
                type="button"
                className="ratr-modal-btn ratr-modal-btn--secondary"
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
              >
                {t('track.cancelBack')}
              </button>
              <button
                type="button"
                className="ratr-modal-btn ratr-modal-btn--danger"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? t('track.cancelling') : t('track.cancelConfirmBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReActionTrack;
