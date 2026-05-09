import { useTranslation } from 'react-i18next';
import { Play, Pencil, Pause, PlayCircle, Trash2, Eye } from 'lucide-react';
import { LocalizedLink } from '../LocalizedLink/LocalizedLink';
import './botCard.css';

/**
 * BotCard — prefix `bcc-`. Card per bot in the BotCrawlerPage list.
 *
 * Wrapping the whole card in a navigable link is intentionally avoided
 * because it would conflict with the inline action buttons. Instead, the
 * "Преглед" button + the title use a real <Link> while the rest of the
 * card stays static.
 */
const BotCard = ({ bot, onRunNow, onEdit, onTogglePause, onDelete }) => {
  const { t, i18n } = useTranslation('botCrawler');

  const status = bot.status || 'active';
  const isPaused = status === 'paused';
  const detailHref = `/admin/bot-crawler/${bot.id}`;

  const formatDate = (iso) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString(i18n.language === 'bg' ? 'bg-BG' : i18n.language, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const sourcesCount = typeof bot.sourcesCount === 'number' ? bot.sourcesCount : null;
  const newFindings = typeof bot.findingsNew === 'number' ? bot.findingsNew : 0;

  return (
    <div className={`bcc-card bcc-status-${status}`}>
      <div className="bcc-head">
        <LocalizedLink to={detailHref} className="bcc-title-link">
          <h3 className="bcc-title">{bot.name}</h3>
        </LocalizedLink>
        <span className={`bcc-badge bcc-badge-${status}`}>
          {t(`card.status.${status}`)}
        </span>
      </div>

      {bot.description && <p className="bcc-desc">{bot.description}</p>}

      {isPaused && (
        <div className="bcc-paused-hint" role="note">
          {t('card.pausedHint')}
        </div>
      )}

      <dl className="bcc-meta">
        <div className="bcc-meta-row">
          <dt>{t('card.lastRun')}</dt>
          <dd>{formatDate(bot.lastRunAt)}</dd>
        </div>
        {sourcesCount !== null && (
          <div className="bcc-meta-row">
            <dt>{t('card.sources')}</dt>
            <dd>{sourcesCount}</dd>
          </div>
        )}
        <div className="bcc-meta-row">
          <dt>{t('card.newFindings')}</dt>
          <dd>
            <span className={`bcc-findings-badge${newFindings > 0 ? ' bcc-findings-hot' : ''}`}>
              {newFindings}
            </span>
          </dd>
        </div>
      </dl>

      <div className="bcc-actions">
        <LocalizedLink to={detailHref} className="bcc-btn bcc-btn-secondary" aria-label={t('card.actions.view')}>
          <Eye size={16} aria-hidden="true" />
          <span>{t('card.actions.view')}</span>
        </LocalizedLink>
        <button
          type="button"
          className="bcc-btn bcc-btn-primary"
          onClick={() => onRunNow?.(bot)}
          aria-label={t('card.actions.runNow')}
        >
          <Play size={16} aria-hidden="true" />
          <span>{t('card.actions.runNow')}</span>
        </button>
        <button
          type="button"
          className="bcc-btn bcc-btn-secondary"
          onClick={() => onEdit?.(bot)}
          aria-label={t('card.actions.edit')}
        >
          <Pencil size={16} aria-hidden="true" />
          <span>{t('card.actions.edit')}</span>
        </button>
        <button
          type="button"
          className="bcc-btn bcc-btn-secondary"
          onClick={() => onTogglePause?.(bot)}
          aria-label={isPaused ? t('card.actions.resume') : t('card.actions.pause')}
        >
          {isPaused ? <PlayCircle size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
          <span>{isPaused ? t('card.actions.resume') : t('card.actions.pause')}</span>
        </button>
        <button
          type="button"
          className="bcc-btn bcc-btn-danger"
          onClick={() => onDelete?.(bot)}
          aria-label={t('card.actions.delete')}
        >
          <Trash2 size={16} aria-hidden="true" />
          <span>{t('card.actions.delete')}</span>
        </button>
      </div>
    </div>
  );
};

export default BotCard;
