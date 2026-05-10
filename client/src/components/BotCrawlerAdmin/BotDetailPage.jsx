import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { LocalizedLink } from '../LocalizedLink/LocalizedLink';
import { useCrawlerContext } from '../contexts/CrawlerContext';
import FindingsList from './FindingsList';
import BotSourcesList from './BotSourcesList';
import BotSettings from './BotSettings';
import RunHistory from './RunHistory';
import './botDetailPage.css';

const TABS = ['findings', 'sources', 'settings', 'history'];

const BotDetailPage = () => {
  const { t } = useTranslation('botCrawler');
  const { id } = useParams();
  const botId = Number(id);
  const { getBot } = useCrawlerContext();
  const [bot, setBot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('findings');

  const refresh = useCallback(async () => {
    if (!Number.isFinite(botId)) return;
    setLoading(true);
    try {
      const data = await getBot(botId);
      // Backend returns { item: bot } — unwrap. Tolerate either shape.
      setBot(data?.item ?? data);
    } catch {
      setBot(null);
    } finally {
      setLoading(false);
    }
  }, [botId, getBot]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const status = bot?.status || 'active';

  return (
    <div className="bcd-page">
      <div className="bcd-header">
        <LocalizedLink to="/admin/bot-crawler" className="bcd-back">
          <ArrowLeft size={18} aria-hidden="true" />
          <span>{t('page.title')}</span>
        </LocalizedLink>
        <div className="bcd-title-row">
          <h1 className="bcd-title">{bot?.name || (loading ? '…' : t('page.title'))}</h1>
          {bot && (
            <span className={`bcd-badge bcd-badge-${status}`}>
              {t(`card.status.${status}`)}
            </span>
          )}
        </div>
        {bot?.description && <p className="bcd-desc">{bot.description}</p>}
      </div>

      <div className="bcd-tabs" role="tablist">
        {TABS.map((tabKey) => (
          <button
            key={tabKey}
            type="button"
            role="tab"
            aria-selected={tab === tabKey}
            className={`bcd-tab${tab === tabKey ? ' bcd-tab-active' : ''}`}
            onClick={() => setTab(tabKey)}
          >
            {t(`tabs.${tabKey}`)}
          </button>
        ))}
      </div>

      <div className="bcd-tab-panel">
        {tab === 'findings' && bot && <FindingsList botId={botId} />}
        {tab === 'sources' && bot && <BotSourcesList botId={botId} />}
        {tab === 'settings' && bot && <BotSettings bot={bot} onChanged={refresh} />}
        {tab === 'history' && bot && <RunHistory botId={botId} />}
        {!bot && !loading && (
          <div className="bcd-empty">
            <p>{t('findings.empty')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BotDetailPage;
