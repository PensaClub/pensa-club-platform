// src/components/AdminNewsletters/NewsletterEditor/NewsletterTargetAudience/NewsletterTargetAudience.jsx
// Prefix: anta- (AdminNewsletters → Target Audience)

import { useTranslation } from 'react-i18next';
import { Users, Check, Tag } from 'lucide-react';
import './newsletterTargetAudience.css';

const CATEGORIES = [
  'seminars',
  'courses',
  'articles',
  'initiatives',
  'clubs',
  'games',
  'platform',
];

export const NewsletterTargetAudience = ({ value, onChange }) => {
  const { t } = useTranslation('adminNewsletters');
  // null/undefined = all subscribers. Array (even empty) = segmented mode.
  const isAll = !Array.isArray(value);
  const selected = Array.isArray(value) ? value : [];

  const setAll = () => onChange?.(null);
  const toggleCategory = (key) => {
    const set = new Set(selected);
    if (set.has(key)) set.delete(key);
    else set.add(key);
    // Preserve array (even when empty) so segment mode stays active.
    onChange?.(Array.from(set));
  };
  const selectAllCategories = () => onChange?.([...CATEGORIES]);
  const clearAll = () => onChange?.([]);

  return (
    <div className="anta-root">
      {/* Mode toggles */}
      <div className="anta-mode-row">
        <button
          type="button"
          className={`anta-mode ${isAll ? 'anta-mode--active' : ''}`}
          onClick={setAll}
        >
          <span className="anta-mode-icon">
            <Users />
          </span>
          <div className="anta-mode-text">
            <span className="anta-mode-title">{t('editor.audience.allTitle')}</span>
            <span className="anta-mode-desc">{t('editor.audience.allDescription')}</span>
          </div>
          {isAll && (
            <span className="anta-mode-check" aria-hidden="true">
              <Check />
            </span>
          )}
        </button>

        <button
          type="button"
          className={`anta-mode ${!isAll ? 'anta-mode--active' : ''}`}
          onClick={() => {
            if (isAll) onChange?.([]);
          }}
        >
          <span className="anta-mode-icon">
            <Tag />
          </span>
          <div className="anta-mode-text">
            <span className="anta-mode-title">{t('editor.audience.segmentTitle')}</span>
            <span className="anta-mode-desc">{t('editor.audience.segmentDescription')}</span>
          </div>
          {!isAll && (
            <span className="anta-mode-check" aria-hidden="true">
              <Check />
            </span>
          )}
        </button>
      </div>

      {/* Category checkboxes */}
      {!isAll && (
        <div className="anta-segment">
          <div className="anta-segment-header">
            <span className="anta-segment-count">
              {t('editor.audience.selected', { count: selected.length })}
            </span>
            <div className="anta-segment-actions">
              <button
                type="button"
                className="anta-segment-link"
                onClick={selectAllCategories}
              >
                {t('editor.audience.selectAll')}
              </button>
              <span className="anta-segment-sep">·</span>
              <button
                type="button"
                className="anta-segment-link"
                onClick={clearAll}
              >
                {t('editor.audience.clearAll')}
              </button>
            </div>
          </div>

          <div className="anta-grid">
            {CATEGORIES.map((key) => {
              const checked = selected.includes(key);
              return (
                <label
                  key={key}
                  className={`anta-chip ${checked ? 'anta-chip--checked' : ''}`}
                >
                  <input
                    type="checkbox"
                    className="anta-chip-input"
                    checked={checked}
                    onChange={() => toggleCategory(key)}
                  />
                  <span className="anta-chip-box" aria-hidden="true">
                    {checked && (
                      <span className="anta-chip-check">
                        <Check />
                      </span>
                    )}
                  </span>
                  <span className="anta-chip-label">{t(`editor.categories.${key}`)}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
