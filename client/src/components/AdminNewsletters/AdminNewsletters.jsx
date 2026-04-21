// src/components/AdminNewsletters/AdminNewsletters.jsx
// Prefix: an-

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Mail,
  Inbox,
  PenSquare,
  Users,
  BarChart3,
  Settings2,
  Plus,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import SEOHead from '../SEO/SEOHead';
import { useTheme } from '../contexts/ThemeContext';
import { NewslettersList } from './NewslettersList/NewslettersList';
import { NewsletterEditor } from './NewsletterEditor/NewsletterEditor';
import { NewsletterSubscribers } from './NewsletterSubscribers/NewsletterSubscribers';
import { NewsletterStats } from './NewsletterStats/NewsletterStats';
import { NewsletterAutoSettings } from './NewsletterAutoSettings/NewsletterAutoSettings';
import './adminNewsletters.css';

const TABS = [
  { key: 'list', icon: Inbox },
  { key: 'editor', icon: PenSquare },
  { key: 'subscribers', icon: Users },
  { key: 'stats', icon: BarChart3 },
  { key: 'auto', icon: Settings2 },
];

const TAB_KEYS = TABS.map((tab) => tab.key);
const DEFAULT_TAB = 'list';

// Hash format:
//   #list                → { tab: 'list', draftId: null }
//   #editor              → { tab: 'editor', draftId: null } (new draft)
//   #editor-42           → { tab: 'editor', draftId: 42 } (edit draft 42)
const parseHash = () => {
  if (typeof window === 'undefined') return { tab: DEFAULT_TAB, draftId: null };
  const raw = window.location.hash.replace(/^#/, '').trim();
  if (!raw) return { tab: DEFAULT_TAB, draftId: null };

  const match = raw.match(/^([a-z]+)(?:-(\d+))?$/i);
  if (!match) return { tab: DEFAULT_TAB, draftId: null };
  const tab = match[1];
  const idPart = match[2] ? parseInt(match[2], 10) : null;
  if (!TAB_KEYS.includes(tab)) return { tab: DEFAULT_TAB, draftId: null };
  return { tab, draftId: Number.isInteger(idPart) ? idPart : null };
};

const buildHash = (tab, draftId) => {
  if (tab === 'editor' && Number.isInteger(draftId)) {
    return `${tab}-${draftId}`;
  }
  return tab;
};

const AdminNewsletters = () => {
  const { t } = useTranslation('adminNewsletters');
  const { theme } = useTheme();
  const initial = parseHash();
  const [activeTab, setActiveTab] = useState(initial.tab);
  const [editorDraftId, setEditorDraftId] = useState(initial.draftId);
  const [listRefreshKey, setListRefreshKey] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Sync state → URL hash (replaceState to keep history clean)
  useEffect(() => {
    const expected = buildHash(activeTab, editorDraftId);
    const current = window.location.hash.replace(/^#/, '');
    if (current !== expected) {
      const { pathname, search } = window.location;
      window.history.replaceState(null, '', `${pathname}${search}#${expected}`);
    }
  }, [activeTab, editorDraftId]);

  // Sync URL hash → state (browser back/forward, manual hash edit)
  useEffect(() => {
    const handleHashChange = () => {
      const next = parseHash();
      setActiveTab((prev) => (prev === next.tab ? prev : next.tab));
      setEditorDraftId((prev) => (prev === next.draftId ? prev : next.draftId));
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const goToTab = (key, opts = {}) => {
    if (key === 'editor' && opts.draftId === undefined && !opts.keepDraft) {
      setEditorDraftId(null);
    }
    if (opts.draftId !== undefined) setEditorDraftId(opts.draftId);
    setActiveTab(key);
  };

  const handleEditDraft = (id) => {
    goToTab('editor', { draftId: id });
  };

  const handleBackToList = () => {
    setEditorDraftId(null);
    setListRefreshKey((k) => k + 1);
    setActiveTab('list');
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'list':
        return <NewslettersList refreshKey={listRefreshKey} onEdit={handleEditDraft} />;
      case 'editor':
        return (
          <NewsletterEditor
            draftId={editorDraftId}
            onDraftChange={setEditorDraftId}
            onBackToList={handleBackToList}
          />
        );
      case 'subscribers':
        return <NewsletterSubscribers />;
      case 'stats':
        return <NewsletterStats />;
      case 'auto':
        return <NewsletterAutoSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="an-wrapper" data-theme-scope={theme}>
      <SEOHead
        title={`${t('page.title')} | Pensa Club`}
        description={t('page.subtitle')}
        noindex={true}
      />

      <div className="an-page-bg" aria-hidden="true">
        <div className="an-glow-orb an-glow-orb--primary" />
        <div className="an-glow-orb an-glow-orb--secondary" />
      </div>

      <div className="an-container">
        <div className="an-header">
          <nav className="an-breadcrumb" aria-label="breadcrumb">
            <span className="an-breadcrumb-item">{t('page.breadcrumbRoot')}</span>
            <ChevronRight className="an-breadcrumb-sep" />
            <span className="an-breadcrumb-item an-breadcrumb-item--current">
              {t('page.breadcrumbCurrent')}
            </span>
          </nav>

          <div className="an-header-row">
            <div className="an-header-info">
              <h1 className="an-title">
                <span className="an-title-icon">
                  <Mail />
                </span>
                <span className="an-title-text">
                  {t('page.title')}
                </span>
              </h1>
              <p className="an-subtitle">{t('page.subtitle')}</p>
            </div>

            <div className="an-header-actions">
              <button
                type="button"
                className="an-btn an-btn--ghost"
                onClick={() => {
                  setListRefreshKey((k) => k + 1);
                  goToTab('list');
                }}
                aria-label={t('header.refresh')}
              >
                <span className="an-btn-icon">
                  <RefreshCw />
                </span>
                <span className="an-btn-label">{t('header.refresh')}</span>
              </button>
              <button
                type="button"
                className="an-btn an-btn--primary"
                onClick={() => goToTab('editor')}
              >
                <span className="an-btn-icon">
                  <Plus />
                </span>
                <span className="an-btn-label">{t('header.newNewsletter')}</span>
              </button>
            </div>
          </div>
        </div>

        <nav className="an-tabs" role="tablist">
          {TABS.map(({ key, icon: Icon }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`an-tab ${isActive ? 'an-tab--active' : ''}`}
                onClick={() => goToTab(key)}
              >
                <span className="an-tab-icon">
                  <Icon />
                </span>
                <span className="an-tab-label">{t(`tabs.${key}`)}</span>
              </button>
            );
          })}
        </nav>

        <section className="an-content" role="tabpanel">
          {renderTab()}
        </section>
      </div>
    </div>
  );
};

export default AdminNewsletters;
