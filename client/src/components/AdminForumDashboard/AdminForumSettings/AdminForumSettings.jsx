// src/components/AdminForumDashboard/AdminForumSettings/AdminForumSettings.jsx
// Prefix: afst-

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { forumServiceFactory } from '../../Services/forumServiceFactory';
import { toast } from 'react-toastify';
import {
  Save,
  Settings,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import './adminForumSettings.css';

const TOGGLE_SETTINGS = [
  { key: 'requireApproval', label: 'requireApproval', desc: 'requireApprovalDesc' },
  { key: 'allowPolls', label: 'allowPolls', desc: 'allowPollsDesc' },
  { key: 'allowFileUploads', label: 'allowFileUploads', desc: 'allowFileUploadsDesc' },
  { key: 'enableSpaces', label: 'enableSpaces', desc: 'enableSpacesDesc' },
  { key: 'enableReactions', label: 'enableReactions', desc: 'enableReactionsDesc' },
  { key: 'enableBookmarks', label: 'enableBookmarks', desc: 'enableBookmarksDesc' },
  { key: 'enableReports', label: 'enableReports', desc: 'enableReportsDesc' },
  { key: 'enablePostOfWeek', label: 'enablePostOfWeek', desc: 'enablePostOfWeekDesc' },
  { key: 'autoPublish', label: 'autoPublish', desc: 'autoPublishDesc' },
  { key: 'emailNotifications', label: 'emailNotifications', desc: 'emailNotificationsDesc' },
];

const NUMBER_SETTINGS = [
  { key: 'maxPostLength', label: 'maxPostLength', min: 0, max: 5000 },
  { key: 'maxCommentLength', label: 'maxCommentLength', min: 0, max: 2000 },
  { key: 'maxFileSize', label: 'maxFileSize', min: 0, max: 100 },
  { key: 'maxCommentFileSize', label: 'maxCommentFileSize', min: 0, max: 50 },
  { key: 'postsPerPage', label: 'postsPerPage', min: 5, max: 100 },
  { key: 'cooldownSeconds', label: 'cooldownSeconds', min: 0, max: 3600 },
  { key: 'maxReportsBeforeHide', label: 'maxReportsBeforeHide', min: 0, max: 50 },
];

const CREDIT_SETTINGS = [
  { key: 'creditsForPost', label: 'creditsForPost', min: 0, max: 100 },
  { key: 'creditsForComment', label: 'creditsForComment', min: 0, max: 50 },
  { key: 'creditsForPostOfWeek', label: 'creditsForPostOfWeek', min: 0, max: 200 },
  { key: 'creditsForPopularPost', label: 'creditsForPopularPost', min: 0, max: 100 },
];

const BADGE_SETTINGS = [
  { key: 'badgePostsForContributor', label: 'badgePostsForContributor', min: 0, max: 500 },
  { key: 'badgeCommentsForHelper', label: 'badgeCommentsForHelper', min: 0, max: 500 },
  { key: 'badgePostsForVeteran', label: 'badgePostsForVeteran', min: 0, max: 1000 },
  { key: 'badgeReactionsForPopular', label: 'badgeReactionsForPopular', min: 0, max: 500 },
  { key: 'badgeCommentsForConversation', label: 'badgeCommentsForConversation', min: 0, max: 200 },
  { key: 'badgeReactionsGivenForReactor', label: 'badgeReactionsGivenForReactor', min: 0, max: 1000 },
  { key: 'badgeBookmarksForValuable', label: 'badgeBookmarksForValuable', min: 0, max: 200 },
];

const AdminForumSettings = () => {
  const { t } = useTranslation('admin');
  const forumService = forumServiceFactory();

  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await forumService.adminGetSettings();
      // Convert array of { key, value } to { camelKey: parsedValue }
      const raw = data.settings || data || [];
      if (Array.isArray(raw)) {
        const parsed = {};
        for (const s of raw) {
          const k = s.key.replace('forum_', '');
          if (s.type === 'boolean') {
            parsed[k] = s.value === 'true';
          } else if (['number', 'string'].includes(s.type) && !isNaN(s.value)) {
            parsed[k] = parseInt(s.value, 10);
          } else {
            parsed[k] = s.value;
          }
        }
        setSettings(parsed);
      } else {
        setSettings(raw);
      }
    } catch {
      toast.error(t('forum.settings.loadError', 'Error loading settings'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNumberChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: parseInt(value) || 0 }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Add forum_ prefix for server
      const prefixed = {};
      for (const [k, v] of Object.entries(settings)) {
        prefixed[`forum_${k}`] = v;
      }
      await forumService.adminUpdateSettings({ settings: prefixed });
      toast.success(t('forum.settings.saved', 'Settings saved'));
    } catch {
      toast.error(t('forum.settings.saveError', 'Error saving settings'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="afst-loading">
        <div className="afst-spinner"></div>
      </div>
    );
  }

  return (
    <div className="afst-container">
      <div className="afst-header">
        <h3 className="afst-title">
          <Settings size={20} />
          {t('forum.settings.title', 'Forum Settings')}
        </h3>
        <button className="afst-save-btn" onClick={handleSave} disabled={saving}>
          <Save size={16} />
          {saving
            ? t('forum.settings.saving', 'Saving...')
            : t('forum.settings.save', 'Save Settings')}
        </button>
      </div>

      {/* Toggle settings */}
      <div className="afst-section">
        <h4 className="afst-section-title">{t('forum.settings.toggles', 'Features')}</h4>
        <div className="afst-toggles">
          {TOGGLE_SETTINGS.map(({ key, label, desc }) => (
            <div key={key} className="afst-toggle-row">
              <div className="afst-toggle-info">
                <span className="afst-toggle-label">
                  {t(`forum.settings.${label}`, label)}
                </span>
                <span className="afst-toggle-desc">
                  {t(`forum.settings.${desc}`, '')}
                </span>
              </div>
              <button
                className={`afst-toggle-btn ${settings[key] ? 'afst-toggle-on' : 'afst-toggle-off'}`}
                onClick={() => handleToggle(key)}
              >
                {settings[key] ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Number settings */}
      <div className="afst-section">
        <h4 className="afst-section-title">{t('forum.settings.limits', 'Limits & Numbers')}</h4>
        <div className="afst-numbers">
          {NUMBER_SETTINGS.map(({ key, label, min, max }) => (
            <div key={key} className="afst-number-row">
              <label className="afst-number-label">
                {t(`forum.settings.${label}`, label)}
              </label>
              <input
                type="number"
                className="afst-number-input"
                value={settings[key] || 0}
                onChange={(e) => handleNumberChange(key, e.target.value)}
                min={min}
                max={max}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Credit settings */}
      <div className="afst-section">
        <h4 className="afst-section-title">{t('forum.settings.credits', 'Credits for Activity')}</h4>
        <div className="afst-numbers">
          {CREDIT_SETTINGS.map(({ key, label, min, max }) => (
            <div key={key} className="afst-number-row">
              <label className="afst-number-label">
                {t(`forum.settings.${label}`, label)}
              </label>
              <input
                type="number"
                className="afst-number-input"
                value={settings[key] ?? ''}
                onChange={(e) => handleNumberChange(key, e.target.value)}
                min={min}
                max={max}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Badge settings */}
      <div className="afst-section">
        <h4 className="afst-section-title">{t('forum.settings.badgeMilestones', 'Badge Milestones')}</h4>
        <div className="afst-numbers">
          {BADGE_SETTINGS.map(({ key, label, min, max }) => (
            <div key={key} className="afst-number-row">
              <label className="afst-number-label">
                {t(`forum.settings.${label}`, label)}
              </label>
              <input
                type="number"
                className="afst-number-input"
                value={settings[key] ?? ''}
                onChange={(e) => handleNumberChange(key, e.target.value)}
                min={min}
                max={max}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom save button */}
      <div className="afst-footer">
        <button className="afst-save-btn" onClick={handleSave} disabled={saving}>
          <Save size={16} />
          {saving
            ? t('forum.settings.saving', 'Saving...')
            : t('forum.settings.save', 'Save Settings')}
        </button>
      </div>
    </div>
  );
};

export default AdminForumSettings;
