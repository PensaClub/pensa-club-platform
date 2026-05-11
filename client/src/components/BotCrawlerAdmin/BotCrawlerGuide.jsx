import { useEffect, useState, useRef } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import {
  ArrowLeft, BookOpen, Bot as BotIcon, Rss, Code, ListFilter, Calendar,
  Eraser, CheckSquare, Mail, FilePlus, HelpCircle, Search, ChevronRight,
} from 'lucide-react';
import { LocalizedLink } from '../LocalizedLink/LocalizedLink';
import './botCrawlerGuide.css';

/**
 * BotCrawlerGuide — prefix `bcg-`. Full admin documentation for the Bot
 * Crawler module. Single page with anchored sections + sticky table of
 * contents. Print-friendly. All copy is i18n'd under `botCrawler.guide.*`.
 */

const SECTIONS = [
  { id: 'overview',     icon: BookOpen },
  { id: 'create',       icon: BotIcon },
  { id: 'sources',      icon: Rss },
  { id: 'selectors',    icon: Code },
  { id: 'pagination',   icon: ChevronRight },
  { id: 'lookback',     icon: Calendar },
  { id: 'cleanup',      icon: Eraser },
  { id: 'bulk',         icon: CheckSquare },
  { id: 'emails',       icon: Mail },
  { id: 'fromFinding',  icon: FilePlus },
  { id: 'faq',          icon: HelpCircle },
];

const BotCrawlerGuide = () => {
  const { t } = useTranslation('botCrawler');
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  const observerRef = useRef(null);

  // Scroll-spy: highlight TOC entry of the section closest to top.
  useEffect(() => {
    const opts = { rootMargin: '-20% 0px -70% 0px', threshold: 0 };
    const cb = (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length > 0) setActiveId(visible[0].target.id);
    };
    observerRef.current = new IntersectionObserver(cb, opts);
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observerRef.current.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, []);

  // Smooth-scroll handler for TOC clicks (also writes hash for share links).
  const handleTocClick = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    window.history.replaceState(null, '', `#${id}`);
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Open the section pointed to by location.hash on first paint.
  useEffect(() => {
    const hash = window.location.hash?.slice(1);
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el) {
      // Delay one tick so the layout settles before scrolling.
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }
  }, []);

  return (
    <div className="bcg-page">
      <div className="bcg-header">
        <LocalizedLink to="/admin/bot-crawler" className="bcg-back">
          <ArrowLeft size={18} aria-hidden="true" />
          <span>{t('guide.backToBots')}</span>
        </LocalizedLink>
        <div className="bcg-title-row">
          <BookOpen size={28} className="bcg-title-icon" aria-hidden="true" />
          <h1 className="bcg-title">{t('guide.pageTitle')}</h1>
        </div>
        <p className="bcg-subtitle">{t('guide.pageSubtitle')}</p>
      </div>

      <div className="bcg-layout">
        {/* Sticky TOC */}
        <aside className="bcg-toc" aria-label={t('guide.toc.label')}>
          <div className="bcg-toc-title">{t('guide.toc.title')}</div>
          <nav className="bcg-toc-nav">
            {SECTIONS.map(({ id, icon: Icon }) => (
              <a
                key={id}
                href={`#${id}`}
                className={`bcg-toc-link${activeId === id ? ' bcg-toc-link-active' : ''}`}
                onClick={(e) => handleTocClick(e, id)}
              >
                <Icon size={14} aria-hidden="true" className="bcg-toc-icon" />
                <span>{t(`guide.sections.${id}.title`)}</span>
              </a>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="bcg-content">
          <Section id="overview" icon={BookOpen} title={t('guide.sections.overview.title')}>
            <P><Trans i18nKey="botCrawler:guide.sections.overview.p1" /></P>
            <P><Trans i18nKey="botCrawler:guide.sections.overview.p2" /></P>
            <Callout type="info">{t('guide.sections.overview.callout')}</Callout>
          </Section>

          <Section id="create" icon={BotIcon} title={t('guide.sections.create.title')}>
            <P>{t('guide.sections.create.intro')}</P>
            <Steps items={t('guide.sections.create.steps', { returnObjects: true })} />
            <Callout type="tip">{t('guide.sections.create.tip')}</Callout>
          </Section>

          <Section id="sources" icon={Rss} title={t('guide.sections.sources.title')}>
            <P>{t('guide.sections.sources.intro')}</P>
            <div className="bcg-grid">
              <Card title={t('guide.sections.sources.rss.title')} body={t('guide.sections.sources.rss.body')} badge="RSS" />
              <Card title={t('guide.sections.sources.html.title')} body={t('guide.sections.sources.html.body')} badge="HTML" />
              <Card title={t('guide.sections.sources.auto.title')} body={t('guide.sections.sources.auto.body')} badge="AUTO" />
            </div>
            <Callout type="warning">{t('guide.sections.sources.warning')}</Callout>
          </Section>

          <Section id="selectors" icon={Code} title={t('guide.sections.selectors.title')}>
            <P>{t('guide.sections.selectors.intro')}</P>
            <table className="bcg-table">
              <thead>
                <tr>
                  <th>{t('guide.sections.selectors.tableField')}</th>
                  <th>{t('guide.sections.selectors.tableExample')}</th>
                  <th>{t('guide.sections.selectors.tableNote')}</th>
                </tr>
              </thead>
              <tbody>
                {(t('guide.sections.selectors.rows', { returnObjects: true }) || []).map((row, i) => (
                  <tr key={i}>
                    <td data-label={t('guide.sections.selectors.tableField')}><strong>{row.field}</strong></td>
                    <td data-label={t('guide.sections.selectors.tableExample')}><code className="bcg-code">{row.example}</code></td>
                    <td data-label={t('guide.sections.selectors.tableNote')}>{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Callout type="tip">{t('guide.sections.selectors.tip')}</Callout>
          </Section>

          <Section id="pagination" icon={ChevronRight} title={t('guide.sections.pagination.title')}>
            <P>{t('guide.sections.pagination.p1')}</P>
            <P>{t('guide.sections.pagination.p2')}</P>
            <Callout type="warning">{t('guide.sections.pagination.warning')}</Callout>
          </Section>

          <Section id="lookback" icon={Calendar} title={t('guide.sections.lookback.title')}>
            <P>{t('guide.sections.lookback.p1')}</P>
            <P>{t('guide.sections.lookback.p2')}</P>
          </Section>

          <Section id="cleanup" icon={Eraser} title={t('guide.sections.cleanup.title')}>
            <P>{t('guide.sections.cleanup.intro')}</P>
            <h3 className="bcg-h3">{t('guide.sections.cleanup.autoTitle')}</h3>
            <P>{t('guide.sections.cleanup.autoBody')}</P>
            <Callout type="info">{t('guide.sections.cleanup.autoExample')}</Callout>
            <h3 className="bcg-h3">{t('guide.sections.cleanup.manualTitle')}</h3>
            <P>{t('guide.sections.cleanup.manualBody')}</P>
            <ul className="bcg-list">
              {(t('guide.sections.cleanup.manualList', { returnObjects: true }) || []).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </Section>

          <Section id="bulk" icon={CheckSquare} title={t('guide.sections.bulk.title')}>
            <P>{t('guide.sections.bulk.intro')}</P>
            <Steps items={t('guide.sections.bulk.steps', { returnObjects: true })} />
            <Callout type="tip">{t('guide.sections.bulk.tip')}</Callout>
          </Section>

          <Section id="emails" icon={Mail} title={t('guide.sections.emails.title')}>
            <P>{t('guide.sections.emails.p1')}</P>
            <P>{t('guide.sections.emails.p2')}</P>
            <Callout type="info">{t('guide.sections.emails.callout')}</Callout>
          </Section>

          <Section id="fromFinding" icon={FilePlus} title={t('guide.sections.fromFinding.title')}>
            <P>{t('guide.sections.fromFinding.intro')}</P>
            <Steps items={t('guide.sections.fromFinding.steps', { returnObjects: true })} />
            <Callout type="warning">{t('guide.sections.fromFinding.warning')}</Callout>
          </Section>

          <Section id="faq" icon={HelpCircle} title={t('guide.sections.faq.title')}>
            {(t('guide.sections.faq.items', { returnObjects: true }) || []).map((q, i) => (
              <details key={i} className="bcg-faq">
                <summary>{q.q}</summary>
                <div className="bcg-faq-body">
                  {q.a.split('\n').map((line, idx) => (
                    <p key={idx} className="bcg-faq-line">{line}</p>
                  ))}
                </div>
              </details>
            ))}
          </Section>

          <div className="bcg-footer">
            <Search size={16} aria-hidden="true" />
            <span>{t('guide.footer')}</span>
          </div>
        </main>
      </div>
    </div>
  );
};

// ── Small inline building blocks ───────────────────────────────────────────

const Section = ({ id, icon: Icon, title, children }) => (
  <section id={id} className="bcg-section">
    <h2 className="bcg-h2">
      <Icon size={20} aria-hidden="true" className="bcg-h2-icon" />
      <span>{title}</span>
    </h2>
    <div className="bcg-section-body">{children}</div>
  </section>
);

const P = ({ children }) => <p className="bcg-p">{children}</p>;

const Callout = ({ type = 'info', children }) => (
  <div className={`bcg-callout bcg-callout-${type}`}>
    <span className="bcg-callout-body">{children}</span>
  </div>
);

const Steps = ({ items }) => {
  const list = Array.isArray(items) ? items : [];
  return (
    <ol className="bcg-steps">
      {list.map((step, i) => (
        <li key={i} className="bcg-step">
          <span className="bcg-step-num">{i + 1}</span>
          <span className="bcg-step-text">{step}</span>
        </li>
      ))}
    </ol>
  );
};

const Card = ({ title, body, badge }) => (
  <div className="bcg-card">
    <div className="bcg-card-head">
      <span className="bcg-card-title">{title}</span>
      {badge && <span className="bcg-card-badge">{badge}</span>}
    </div>
    <p className="bcg-card-body">{body}</p>
  </div>
);

export default BotCrawlerGuide;
