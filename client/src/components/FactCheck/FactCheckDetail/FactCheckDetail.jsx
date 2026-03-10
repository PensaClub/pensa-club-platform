import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LocalizedLink as Link } from '../../LocalizedLink/LocalizedLink';
import { useFactCheck } from '../../contexts/FactCheckProvider';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { useTheme } from '../../contexts/ThemeContext';
import { TextZoom } from '../../TextZoom/TextZoom';
import SEOHead from '../../SEO/SEOHead';
import './factCheckDetail.css';

const FactCheckDetail = () => {
  const { slug } = useParams();
  const location = useLocation();
  const { t } = useTranslation('factcheck');
  const { getModuleBySlug } = useFactCheck();
  const { trackFactCheck } = useAnalytics();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Default to light theme on this page, persist across refresh and back-navigation
  useEffect(() => {
    const isRefresh = localStorage.getItem('fc-page-active') === 'true';

    if (!isRefresh) {
      localStorage.setItem('fc-prev-theme', theme);
      const savedFcTheme = localStorage.getItem('fc-theme') || 'light';
      localStorage.setItem('fc-theme', savedFcTheme);
      if (theme !== savedFcTheme) {
        toggleTheme();
      }
    }
    localStorage.setItem('fc-page-active', 'true');

    return () => {
      localStorage.removeItem('fc-page-active');
      const prevTheme = localStorage.getItem('fc-prev-theme');
      if (prevTheme) {
        localStorage.removeItem('fc-prev-theme');
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme !== prevTheme) {
          toggleTheme();
        }
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Track theme changes while on FC page
  useEffect(() => {
    if (localStorage.getItem('fc-page-active') === 'true') {
      localStorage.setItem('fc-theme', theme);
    }
  }, [theme]);

  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    const loadModule = async () => {
      try {
        const response = await getModuleBySlug(slug);
        const mod = response?.module || null;
        setModule(mod);
        if (mod) {
          trackFactCheck(mod.id, mod.claimText.substring(0, 100));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (slug) loadModule();
  }, [slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank', 'width=600,height=400');
  };

  if (loading) {
    return (
      <div className="fcd">
        <TextZoom />
        <div className="fcd-skeleton">
          <div className="fcd-skeleton-bar" style={{ width: '80px', height: '28px' }}></div>
          <div className="fcd-skeleton-bar" style={{ width: '100%', height: '24px' }}></div>
          <div className="fcd-skeleton-bar" style={{ width: '100%', height: '120px' }}></div>
          <div className="fcd-skeleton-bar" style={{ width: '100%', height: '120px' }}></div>
        </div>
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="fcd">
        <TextZoom />
        <div className="fcd-error">
          <h2>{error || 'Module not found'}</h2>
          <Link to="/fact-check" className="fcd-back-btn">{t('detail.backToList')}</Link>
        </div>
      </div>
    );
  }

  const date = new Date(module.createdAt).toLocaleDateString('bg-BG', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="fcd">
      <SEOHead
        title={`${t(`verdicts.${module.verdict}`)}: ${module.claimText.substring(0, 80)}... | Pensa Club`}
        description={module.verification.substring(0, 160)}
        keywords={`${module.category}, проверка на факти, ${t(`verdicts.${module.verdict}`)}, Pensa Club`}
        image="/images/factcheck/factcheck.jpg"
        type="article"
        publishedTime={module.createdAt}
      />
      <TextZoom />

      {/* Hero band with gradient */}
      <div className="fcd-hero">
        <div className="fcd-hero-container">
          <Link to="/fact-check" className="fcd-back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {t('detail.backToList')}
          </Link>

          <div className="fcd-header">
            <span className={`fcd-verdict fcd-verdict--${module.verdict}`}>
              {t(`verdicts.${module.verdict}`)}
            </span>
            <span className="fcd-category">{module.category}</span>
            <span className="fcd-meta">{t('detail.checkedOn')} {date} &middot; {module.viewsCount} {t('detail.views')}</span>
          </div>
        </div>
      </div>

      {/* Content sections */}
      <div className="fcd-content">
        <div className="fcd-container">
          {/* Section 1: The claim */}
          <div className="fcd-section fcd-section--claim">
            <span className="fcd-section-label">{t('detail.claimLabel')}</span>
            <h2 className="fcd-section-title">{t('detail.section1Title')}</h2>
            <blockquote className="fcd-claim-quote">
              &ldquo;{module.claimText}&rdquo;
            </blockquote>
          </div>

          {/* Section 2: Verification */}
          <div className="fcd-section fcd-section--verification">
            <span className="fcd-section-label">{t('detail.verificationLabel')}</span>
            <h2 className="fcd-section-title">{t('detail.section2Title')}</h2>
            <div className="fcd-section-body">{module.verification}</div>
            {module.sourceUrl && (
              <a href={module.sourceUrl} target="_blank" rel="noopener noreferrer" className="fcd-source-link">
                {t('detail.source')}: {module.sourceName || module.sourceUrl} &rarr;
              </a>
            )}
          </div>

          {/* Section 3: Why spreads */}
          <div className="fcd-section fcd-section--spreads">
            <h2 className="fcd-section-title">{t('detail.section3Title')}</h2>
            <div className="fcd-section-body">{module.whySpreads}</div>
          </div>

          {/* Section 4: How to react */}
          <div className="fcd-section fcd-section--react">
            <h2 className="fcd-section-title">{t('detail.section4Title')}</h2>
            <div className="fcd-section-body">{module.howToReact}</div>
          </div>

          {/* Actions */}
          <div className="fcd-actions">
            {module.pdfUrl && (
              <a href={module.pdfUrl} target="_blank" rel="noopener noreferrer" className="fcd-action-btn fcd-action-btn--pdf">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {t('detail.downloadPdf')}
              </a>
            )}
            <button className="fcd-action-btn fcd-action-btn--facebook" onClick={handleShareFacebook}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
              {t('detail.shareOnFacebook')}
            </button>
            <button className="fcd-action-btn fcd-action-btn--copy" onClick={handleCopyLink}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              {linkCopied ? t('detail.linkCopied') : t('detail.copyLink')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FactCheckDetail;
