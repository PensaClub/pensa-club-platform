import React, { useEffect, useState } from 'react';
import { Login } from './Login';
import { Register } from './Register';
import { NewsSubscribe } from '../Home/NewsSubscribe/NewsSubscribe';
import { useLocation } from 'react-router-dom';
import './modernAuth.css';
import { useTranslation } from 'react-i18next';

export const LoginRegister = () => {
  const { t } = useTranslation('auth');
  const location = useLocation();
  const [activeView, setActiveView] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const view = query.get('view');
    const tab = query.get('tab');

    if (view === 'register' || tab === 'register') {
      setActiveView(true);
    } else if (view === 'login' || tab === 'login') {
      setActiveView(false);
    } else {
      setActiveView(false);
    }

    if (window.google && window.google.accounts) {
      window.google.accounts.id.cancel();
    }
  }, [location.search]);

  const handleLoginClick = () => {
    setActiveView(false);

    if (window.google && window.google.accounts) {
      window.google.accounts.id.cancel();
    }
  };

  const handleRegisterClick = () => {
    setActiveView(true);

    if (window.google && window.google.accounts) {
      window.google.accounts.id.cancel();
    }
  };

  return (
    <>
      <section className="auth-section">
        <div className="auth-container">
          <div className="glass-card">
            <div className="sidebar">
              <div className="sidebar-content">
                <div>
                  <h1 className="sidebar-title">
                    {activeView ? t('form.welcome-left-side') : t('form.welcome-back-left-side')}
                  </h1>
                  <p className="sidebar-text">
                    {activeView
                      ? t('form.join-community')
                      : t('form.welcome-back-left-side-desc')}
                  </p>
                </div>

                <button
                  className="auth-btn"
                  onClick={activeView ? handleLoginClick : handleRegisterClick}
                >
                  {activeView ? t('form.login') : t('form.register')}
                </button>
              </div>
              <div className="sidebar-decoration"></div>
            </div>

            <div className="forms-container">
              <div className={`auth-forms-wrapper ${activeView ? 'show-register' : 'show-login'}`}>
                {/* Използваме ключове и ререндериране, но запазваме CSS анимациите */}
                {activeView ? (
                  <Register navToLogin={handleLoginClick} />
                ) : (
                  <Login navToRegister={handleRegisterClick} />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <NewsSubscribe />
    </>
  );
};
