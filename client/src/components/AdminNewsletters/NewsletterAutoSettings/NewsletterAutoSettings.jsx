// src/components/AdminNewsletters/NewsletterAutoSettings/NewsletterAutoSettings.jsx
// Prefix: ana-

import { useTranslation } from 'react-i18next';
import { CalendarClock, Repeat, CheckCircle2 } from 'lucide-react';
import './newsletterAutoSettings.css';

const ITEMS = [
  { key: 'weekly', icon: CalendarClock },
  { key: 'scheduled', icon: Repeat },
];

export const NewsletterAutoSettings = () => {
  const { t } = useTranslation('adminNewsletters');

  return (
    <div className="ana-root">
      <header className="ana-header">
        <h2 className="ana-title">{t('autoSettings.title')}</h2>
        <p className="ana-subtitle">{t('autoSettings.subtitle')}</p>
      </header>

      <div className="ana-list">
        {ITEMS.map(({ key, icon: Icon }) => (
          <div key={key} className="ana-card">
            <div className="ana-card-head">
              <span className="ana-card-icon">
                <Icon />
              </span>
              <div className="ana-card-text">
                <h3 className="ana-card-title">{t(`autoSettings.${key}Title`)}</h3>
                <p className="ana-card-schedule">{t(`autoSettings.${key}Schedule`)}</p>
              </div>
              <span className="ana-status">
                <span className="ana-status-icon">
                  <CheckCircle2 />
                </span>
                <span className="ana-status-text">{t('autoSettings.active')}</span>
              </span>
            </div>
            <p className="ana-card-desc">{t(`autoSettings.${key}Desc`)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
