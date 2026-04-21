// src/components/AdminNewsletters/NewsletterAutoSettings/NewsletterAutoSettings.jsx
// Prefix: ana-

import { useTranslation } from 'react-i18next';
import { Settings2 } from 'lucide-react';
import './newsletterAutoSettings.css';

export const NewsletterAutoSettings = () => {
  const { t } = useTranslation('adminNewsletters');

  return (
    <div className="ana-placeholder">
      <div className="ana-placeholder-icon">
        <Settings2 />
      </div>
      <p className="ana-placeholder-text">{t('placeholders.auto')}</p>
    </div>
  );
};
