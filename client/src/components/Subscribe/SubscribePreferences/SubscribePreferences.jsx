// src/components/Subscribe/SubscribePreferences/SubscribePreferences.jsx
// Prefix: spr-
// Public, token-protected page for managing newsletter category preferences.

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Loader2, AlertTriangle, Save } from 'lucide-react';
import { useCommunityContext } from '../../contexts/CommunityContext';
import './subscribePreferences.css';

const CATEGORIES = [
  'seminars',
  'courses',
  'articles',
  'initiatives',
  'clubs',
  'games',
  'platform',
];

export const SubscribePreferences = () => {
  const { t } = useTranslation('subscribe');
  const { token } = useParams();
  const { getSubscriberPreferences, updateSubscriberPreferences } =
    useCommunityContext();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscriber, setSubscriber] = useState(null);
  const [enabled, setEnabled] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchPrefs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSubscriberPreferences(token);
      setSubscriber(data?.subscriber || null);
      const initial = {};
      CATEGORIES.forEach((c) => {
        initial[c] = (data?.preferences || []).some(
          (p) => p.category === c && p.enabled,
        );
      });
      // If subscriber has NO preferences yet → all enabled by default
      if ((data?.preferences || []).length === 0) {
        CATEGORIES.forEach((c) => {
          initial[c] = true;
        });
      }
      setEnabled(initial);
    } catch (e) {
      setError(e?.message || t('preferences.errorLoad'));
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (token) fetchPrefs();
  }, [fetchPrefs, token]);

  const toggle = (cat) => {
    setEnabled((prev) => ({ ...prev, [cat]: !prev[cat] }));
    setSaved(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);
    try {
      const preferences = CATEGORIES.map((c) => ({
        category: c,
        enabled: !!enabled[c],
      }));
      await updateSubscriberPreferences(token, preferences);
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (e) {
      setError(e?.message || t('preferences.errorSave'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="spr-root">
        <div className="spr-card">
          <div className="spr-state">
            <span className="spr-state-icon spr-spin">
              <Loader2 />
            </span>
            <p className="spr-state-text">{t('preferences.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !subscriber) {
    return (
      <div className="spr-root">
        <div className="spr-card">
          <div className="spr-state">
            <span className="spr-state-icon spr-state-icon--error">
              <AlertTriangle />
            </span>
            <p className="spr-state-text">{error || t('preferences.errorLoad')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="spr-root">
      <div className="spr-card">
        <header className="spr-head">
          <h1 className="spr-title">{t('preferences.title')}</h1>
          <p className="spr-subtitle">
            {t('preferences.subtitle', { email: subscriber.email })}
          </p>
        </header>

        <ul className="spr-list">
          {CATEGORIES.map((cat) => (
            <li key={cat} className="spr-row">
              <label className="spr-label">
                <input
                  type="checkbox"
                  className="spr-checkbox"
                  checked={!!enabled[cat]}
                  onChange={() => toggle(cat)}
                />
                <span className="spr-checkbox-visual" aria-hidden="true">
                  {enabled[cat] && <CheckCircle2 />}
                </span>
                <span className="spr-cat-text">
                  <span className="spr-cat-name">{t(`categories.${cat}`)}</span>
                  <span className="spr-cat-desc">
                    {t(`categoriesDesc.${cat}`)}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>

        <div className="spr-actions">
          {saved && (
            <span className="spr-saved">
              <CheckCircle2 />
              <span>{t('preferences.saved')}</span>
            </span>
          )}
          <button
            type="button"
            className="spr-save-btn"
            onClick={handleSave}
            disabled={isSaving}
          >
            <span className="spr-save-icon">
              {isSaving ? <Loader2 className="spr-spin" /> : <Save />}
            </span>
            <span className="spr-save-label">
              {isSaving ? t('preferences.saving') : t('preferences.save')}
            </span>
          </button>
        </div>

        <p className="spr-foot">
          {t('preferences.unsubscribeHint')}{' '}
          <a href={`/subscribe/unsubscribe/${token}`} className="spr-link">
            {t('preferences.unsubscribeLink')}
          </a>
        </p>
      </div>
    </div>
  );
};
