// src/components/AdminNewsletters/NewsletterStats/NewsletterStats.jsx
// Prefix: anst-

import { useTranslation } from 'react-i18next';
import { BarChart3 } from 'lucide-react';
import './newsletterStats.css';

export const NewsletterStats = () => {
  const { t } = useTranslation('adminNewsletters');

  return (
    <div className="anst-placeholder">
      <div className="anst-placeholder-icon">
        <BarChart3 />
      </div>
      <p className="anst-placeholder-text">{t('placeholders.stats')}</p>
    </div>
  );
};
