import React, { useEffect, useState } from 'react';
import './loginRegister.css';

import { Login } from './Login';
import { Register } from './Register';
import { Overlay } from './Overlay';
import { NewsSubscribe } from '../Home/NewsSubscribe/NewsSubscribe';
import { useLocation } from 'react-router-dom';

export const LoginRegister = () => {
  const location = useLocation();
  const [activeView, setActiveView] = useState('');

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
  }, [location.search]);

  const handleLoginClick = () => {
    setActiveView(false);
  };

  const handleRegisterClick = () => {
    setActiveView(true);
  };

  return (
    <>
      <section className="banner-section">
        <div className="container-wrapper">
          <div className={`container ${activeView ? 'right-panel-active' : ''}`}>
            <Login navToRegister={handleRegisterClick} />
            <Register navToLogin={handleLoginClick} />
            <Overlay handleSignInClick={handleLoginClick} handleSignUpClick={handleRegisterClick} />
          </div>
        </div>
      </section>
      <NewsSubscribe />
    </>
  );
};

