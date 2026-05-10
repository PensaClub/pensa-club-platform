import { Fragment, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCrawlerContext } from '../contexts/CrawlerContext';
import './runHistory.css';

const RunHistory = ({ botId }) => {
  const { t, i18n } = useTranslation('botCrawler');
  const { listRuns } = useCrawlerContext();
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await listRuns(botId, 30);
    const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
    setRuns(list);
    setLoading(false);
  }, [botId, listRuns]);

  useEffect(() => {
    refresh();
  }, [refresh]);

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

  const renderErrorLog = (errorLog) => {
    if (!errorLog) return null;
    if (Array.isArray(errorLog)) {
      return (
        <ul className="bcrh-error-list">
          {errorLog.map((err, idx) => (
            <li key={idx} className="bcrh-error-item">
              {typeof err === 'string' ? err : JSON.stringify(err)}
            </li>
          ))}
        </ul>
      );
    }
    if (typeof errorLog === 'object') {
      return <pre className="bcrh-error-pre">{JSON.stringify(errorLog, null, 2)}</pre>;
    }
    return <pre className="bcrh-error-pre">{String(errorLog)}</pre>;
  };

  if (loading) return <div className="bcrh-empty">…</div>;
  if (runs.length === 0) return <div className="bcrh-empty"><p>{t('findings.empty')}</p></div>;

  return (
    <div className="bcrh-wrap">
      <div className="bcrh-table-wrap">
        <table className="bcrh-table">
          <thead>
            <tr>
              <th>{t('runs.columns.startedAt')}</th>
              <th>{t('runs.columns.trigger')}</th>
              <th>{t('runs.columns.status')}</th>
              <th>{t('runs.columns.sourcesScanned')}</th>
              <th>{t('runs.columns.itemsSeen')}</th>
              <th>{t('runs.columns.itemsNew')}</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => {
              const isExpandable = !!run.errorLog;
              const isOpen = expanded === run.id;
              return (
                <Fragment key={run.id}>
                  <tr
                    className={`bcrh-row${isExpandable ? ' bcrh-row-expandable' : ''}${isOpen ? ' bcrh-row-open' : ''}`}
                    onClick={() => isExpandable && setExpanded(isOpen ? null : run.id)}
                  >
                    <td>{formatDate(run.startedAt)}</td>
                    <td>{t(`runs.trigger.${run.trigger || 'manual'}`)}</td>
                    <td>
                      <span className={`bcrh-badge bcrh-badge-${run.status}`}>
                        {t(`runs.status.${run.status}`)}
                      </span>
                    </td>
                    <td>{run.sourcesScanned ?? 0}</td>
                    <td>{run.itemsSeen ?? 0}</td>
                    <td>{run.itemsNew ?? 0}</td>
                  </tr>
                  {isExpandable && isOpen && (
                    <tr className="bcrh-error-row">
                      <td colSpan={6}>
                        {renderErrorLog(run.errorLog)}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RunHistory;
