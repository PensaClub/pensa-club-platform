// src/components/AdminNewsletters/NewsletterSubscribers/NewsletterSubscribers.jsx
// Prefix: ans-

import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';
import './newsletterSubscribers.css';

export const NewsletterSubscribers = () => {
  const { t } = useTranslation('adminNewsletters');

  return (
    <div className="ans-placeholder">
      <div className="ans-placeholder-icon">
        <Users />
      </div>
      <p className="ans-placeholder-text">{t('placeholders.subscribers')}</p>
    </div>
  );
};
