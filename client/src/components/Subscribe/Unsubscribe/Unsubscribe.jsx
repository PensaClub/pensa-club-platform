// src/components/Subscribe/Unsubscribe/Unsubscribe.jsx
// Prefix: unsp-
// Public, token-protected page that unsubscribes the user with one click,
// after explicit confirmation. Lets them re-enable from preferences if changed mind.

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, AlertTriangle, Loader2, MailX, Settings2 } from 'lucide-react';
import { useCommunityContext } from '../../contexts/CommunityContext';
import './unsubscribe.css';

export const Unsubscribe = () => {
  const { t } = useTranslation('subscribe');
  const { token } = useParams();
  const { getSubscriberPreferences, unsubscribeWithToken } = useCommunityContext();

  const [stage, setStage] = useState('confirm'); // confirm | submitting | done | error
  const [errorMsg, setErrorMsg] = useState(null);
  const [subscriber, setSubscriber] = useState(null);

  // Load subscriber data so we can show their email in the confirm prompt
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getSubscriberPreferences(token);
        if (!cancelled) setSubscriber(data?.subscriber || null);
      } catch {
        if (!cancelled) setSubscriber(null);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleConfirm = async () => {
    setStage('submitting');
    setErrorMsg(null);
    try {
      await unsubscribeWithToken(token);
      setStage('done');
    } catch (e) {
      setErrorMsg(e?.message || t('unsubscribe.errorGeneric'));
      setStage('error');
    }
  };

  return (
    <div className="unsp-root">
      <div className="unsp-card">
        <span className="unsp-icon">
          {stage === 'done' ? <CheckCircle2 /> : stage === 'error' ? <AlertTriangle /> : <MailX />}
        </span>

        {stage === 'confirm' && (
          <>
            <h1 className="unsp-title">{t('unsubscribe.title')}</h1>
            <p className="unsp-body">
              {subscriber?.email
                ? t('unsubscribe.bodyWithEmail', { email: subscriber.email })
                : t('unsubscribe.body')}
            </p>
            <div className="unsp-actions">
              <a
                href={`/subscribe/preferences/${token}`}
                className="unsp-btn unsp-btn--ghost"
              >
                <span className="unsp-btn-icon">
                  <Settings2 />
                </span>
                <span className="unsp-btn-label">{t('unsubscribe.adjustPrefs')}</span>
              </a>
              <button
                type="button"
                className="unsp-btn unsp-btn--danger"
                onClick={handleConfirm}
              >
                <span className="unsp-btn-label">{t('unsubscribe.confirm')}</span>
              </button>
            </div>
          </>
        )}

        {stage === 'submitting' && (
          <>
            <h1 className="unsp-title">{t('unsubscribe.submittingTitle')}</h1>
            <span className="unsp-spin"><Loader2 /></span>
          </>
        )}

        {stage === 'done' && (
          <>
            <h1 className="unsp-title">{t('unsubscribe.doneTitle')}</h1>
            <p className="unsp-body">{t('unsubscribe.doneBody')}</p>
            <a href="/" className="unsp-btn unsp-btn--ghost">
              <span className="unsp-btn-label">{t('unsubscribe.backHome')}</span>
            </a>
          </>
        )}

        {stage === 'error' && (
          <>
            <h1 className="unsp-title">{t('unsubscribe.errorTitle')}</h1>
            <p className="unsp-body">{errorMsg || t('unsubscribe.errorGeneric')}</p>
            <button
              type="button"
              className="unsp-btn unsp-btn--ghost"
              onClick={() => setStage('confirm')}
            >
              <span className="unsp-btn-label">{t('unsubscribe.retry')}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
