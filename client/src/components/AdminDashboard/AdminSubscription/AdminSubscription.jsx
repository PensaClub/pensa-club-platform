// src/components/AdminDashboard/AdminSubscription/AdminSubscription.jsx
// Wrapper around the new /admin/newsletters panel — keeps the sidebar link working
// Prefix: asw- (AdminSubscriptionWrapper)

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, ArrowRight, Users } from 'lucide-react';
import { useCommunityContext } from '../../contexts/CommunityContext';
import { useLocalizedNavigate } from '../../../hooks/useLocalizedNavigate';
import './adminSubscription.css';

export const AdminSubscription = ({ setAllSubscriptionEmails }) => {
  const { t } = useTranslation('adminNewsletters');
  const { getSubscribeEmails, subscribeEmails } = useCommunityContext();
  const navigate = useLocalizedNavigate();

  useEffect(() => {
    getSubscribeEmails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof setAllSubscriptionEmails === 'function') {
      setAllSubscriptionEmails(subscribeEmails?.length || 0);
    }
  }, [subscribeEmails, setAllSubscriptionEmails]);

  const openNewsletterPanel = () => {
    navigate('/admin/newsletters');
  };

  const total = subscribeEmails?.length || 0;

  return (
    <div className="asw-wrapper">
      <div className="asw-card">
        <div className="asw-icon">
          <Mail />
        </div>

        <h2 className="asw-title">{t('wrapper.title')}</h2>
        <p className="asw-description">{t('wrapper.description')}</p>

        <div className="asw-meta">
          <span className="asw-meta-icon">
            <Users />
          </span>
          <span className="asw-meta-text">
            {t('wrapper.subscribersCount', { count: total })}
          </span>
        </div>

        <button
          type="button"
          className="asw-cta"
          onClick={openNewsletterPanel}
        >
          <span className="asw-cta-label">{t('wrapper.cta')}</span>
          <span className="asw-cta-icon">
            <ArrowRight />
          </span>
        </button>
      </div>
    </div>
  );
};
