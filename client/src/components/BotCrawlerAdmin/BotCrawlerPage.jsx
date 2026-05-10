import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Bot as BotIcon } from 'lucide-react';
import { useCrawlerContext } from '../contexts/CrawlerContext';
import { notify } from '../../utils/notify.jsx';
import BotCard from './BotCard';
import BotEditModal from './BotEditModal';
import DeleteConfirmModal from '../Articles/AdminArticles/DeleteConfirmModal/DeleteConfirmModal';
import './botCrawlerPage.css';

const STATUS_FILTERS = ['all', 'active', 'paused', 'archived'];

const BotCrawlerPage = () => {
  const { t } = useTranslation('botCrawler');
  const { listBots, createBot, updateBot, deleteBot, runBotNow } = useCrawlerContext();

  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const [editOpen, setEditOpen] = useState(false);
  const [editingBot, setEditingBot] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletePending, setDeletePending] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const params = {};
    if (statusFilter !== 'all') params.status = statusFilter;
    const response = await listBots(params);
    setBots(Array.isArray(response?.items) ? response.items : []);
    setLoading(false);
  }, [listBots, statusFilter]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleNew = () => {
    setEditingBot(null);
    setEditOpen(true);
  };

  const handleEdit = (bot) => {
    setEditingBot(bot);
    setEditOpen(true);
  };

  const handleSave = async (payload) => {
    try {
      if (editingBot) {
        await updateBot(editingBot.id, payload);
        notify('success', null, t('toast.botUpdated'));
      } else {
        await createBot(payload);
        notify('success', null, t('toast.botCreated'));
      }
      setEditOpen(false);
      setEditingBot(null);
      refresh();
    } catch {
      // Error already toasted by context.
    }
  };

  const handleRunNow = async (bot) => {
    try {
      const response = await runBotNow(bot.id);
      const itemsNew = response?.summary?.itemsNew ?? 0;
      notify('success', null, t('toast.runFinished', { count: itemsNew }));
      refresh();
    } catch {
      // toasted by context
    }
  };

  const handleTogglePause = async (bot) => {
    const next = bot.status === 'active' ? 'paused' : 'active';
    try {
      await updateBot(bot.id, { status: next });
      notify('success', null, t('toast.botUpdated'));
      refresh();
    } catch {
      // toasted
    }
  };

  const handleDelete = (bot) => setDeleteTarget(bot);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeletePending(true);
    try {
      await deleteBot(deleteTarget.id);
      notify('success', null, t('toast.botDeleted'));
      setDeleteTarget(null);
      refresh();
    } catch {
      // toasted
    } finally {
      setDeletePending(false);
    }
  };

  return (
    <div className="bca-page">
      <div className="bca-header">
        <div className="bca-title-wrap">
          <BotIcon size={28} className="bca-title-icon" aria-hidden="true" />
          <h1 className="bca-title">{t('page.title')}</h1>
        </div>
        <button type="button" className="bca-btn bca-btn-primary" onClick={handleNew}>
          <Plus size={18} aria-hidden="true" />
          <span>{t('page.newBot')}</span>
        </button>
      </div>

      <div className="bca-filters" role="tablist" aria-label={t('page.title')}>
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={statusFilter === s}
            className={`bca-chip${statusFilter === s ? ' bca-chip-active' : ''}`}
            onClick={() => setStatusFilter(s)}
          >
            {s === 'all' ? t('findings.filters.all') : t(`card.status.${s}`)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bca-skeleton-grid">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bca-skeleton-card" aria-hidden="true" />
          ))}
        </div>
      ) : bots.length === 0 ? (
        <div className="bca-empty">
          <h2 className="bca-empty-title">{t('page.empty.title')}</h2>
          <p className="bca-empty-subtitle">{t('page.empty.subtitle')}</p>
          <button type="button" className="bca-btn bca-btn-primary" onClick={handleNew}>
            <Plus size={18} aria-hidden="true" />
            <span>{t('page.empty.cta')}</span>
          </button>
        </div>
      ) : (
        <div className="bca-grid">
          {bots.map((bot) => (
            <BotCard
              key={bot.id}
              bot={bot}
              onRunNow={handleRunNow}
              onEdit={handleEdit}
              onTogglePause={handleTogglePause}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <BotEditModal
        open={editOpen}
        bot={editingBot}
        onClose={() => { setEditOpen(false); setEditingBot(null); }}
        onSave={handleSave}
        onChanged={refresh}
      />

      <DeleteConfirmModal
        open={!!deleteTarget}
        title={t('confirm.deleteBot.title')}
        message={t('confirm.deleteBot.message', { name: deleteTarget?.name || '' })}
        cancelLabel={t('card.actions.cancel', 'Cancel')}
        confirmLabel={t('card.actions.delete')}
        loading={deletePending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default BotCrawlerPage;
