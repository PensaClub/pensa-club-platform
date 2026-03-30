// src/components/AdminForumDashboard/AdminForumRules/AdminForumRules.jsx
// Prefix: afrl-

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { forumServiceFactory } from '../../Services/forumServiceFactory';
import { toast } from 'react-toastify';
import {
  Save,
  RefreshCw,
  BookOpen,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import './adminForumRules.css';

const LANGUAGES = ['bg', 'en', 'de'];

const AdminForumRules = () => {
  const { t } = useTranslation('admin');
  const forumService = forumServiceFactory();

  const [rules, setRules] = useState({ bg: '', en: '', de: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeLang, setActiveLang] = useState('bg');
  const [resetting, setResetting] = useState(false);

  const fetchRules = useCallback(async () => {
    try {
      setLoading(true);
      const data = await forumService.adminGetRules();
      setRules({
        bg: data.bg || data.rules?.bg || '',
        en: data.en || data.rules?.en || '',
        de: data.de || data.rules?.de || '',
      });
    } catch {
      toast.error(t('forum.rules.loadError', 'Error loading rules'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await forumService.adminUpdateRules(rules);
      toast.success(t('forum.rules.saved', 'Rules saved'));
    } catch {
      toast.error(t('forum.rules.saveError', 'Error saving rules'));
    } finally {
      setSaving(false);
    }
  };

  const handleResetAcceptance = async () => {
    if (!window.confirm(t('forum.rules.confirmReset', 'Reset all users\' rules acceptance? They will need to re-accept.'))) return;
    try {
      setResetting(true);
      await forumService.adminResetRulesAcceptance();
      toast.success(t('forum.rules.resetSuccess', 'Rules acceptance reset'));
    } catch {
      toast.error(t('forum.rules.resetError', 'Error resetting acceptance'));
    } finally {
      setResetting(false);
    }
  };

  const handleChange = (lang, value) => {
    setRules((prev) => ({ ...prev, [lang]: value }));
  };

  if (loading) {
    return (
      <div className="afrl-loading">
        <div className="afrl-spinner"></div>
      </div>
    );
  }

  return (
    <div className="afrl-container">
      <div className="afrl-header">
        <h3 className="afrl-title">
          <BookOpen size={20} />
          {t('forum.rules.title', 'Forum Rules')}
        </h3>
        <div className="afrl-header-actions">
          <button
            className="afrl-reset-btn"
            onClick={handleResetAcceptance}
            disabled={resetting}
          >
            <RotateCcw size={16} />
            {resetting
              ? t('forum.rules.resetting', 'Resetting...')
              : t('forum.rules.resetAcceptance', 'Reset Acceptance')}
          </button>
          <button
            className="afrl-save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            <Save size={16} />
            {saving
              ? t('forum.rules.saving', 'Saving...')
              : t('forum.rules.save', 'Save Rules')}
          </button>
        </div>
      </div>

      <div className="afrl-info">
        <AlertTriangle size={16} />
        {t('forum.rules.info', 'These rules are displayed to users before they can post. Markdown format is supported.')}
      </div>

      <div className="afrl-lang-tabs">
        {LANGUAGES.map((lang) => (
          <button
            key={lang}
            className={`afrl-lang-tab ${activeLang === lang ? 'afrl-lang-tab-active' : ''}`}
            onClick={() => setActiveLang(lang)}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="afrl-editor">
        <textarea
          className="afrl-textarea"
          value={rules[activeLang] || ''}
          onChange={(e) => handleChange(activeLang, e.target.value)}
          placeholder={t('forum.rules.placeholder', 'Enter forum rules for this language...')}
          rows={20}
        />
      </div>

      <div className="afrl-char-count">
        {(rules[activeLang] || '').length} {t('forum.rules.characters', 'characters')}
      </div>
    </div>
  );
};

export default AdminForumRules;
