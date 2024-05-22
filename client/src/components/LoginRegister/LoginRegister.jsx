import React, { useState } from 'react';
import './loginRegister.css';

import { Login } from './Login';
import { Register } from './Register';
import { Overlay } from './Overlay';
import { NewsSubscribe } from '../Home/NewsSubscribe/NewsSubscribe';


export const LoginRegister = () => {
  const [activeView, setActiveView] = useState('');

  const handleLoginClick = () => {
    setActiveView(false);
  };

  const handleRegisterClick = () => {
    setActiveView(true);
    console.log('here')
  };

  return (
    <>
      <section className="banner-section">
        <div className="container-wrapper">
          <div className={`container ${activeView ? 'right-panel-active' : ''}`}>
            <Login navToRegister={handleRegisterClick}/>
            <Register navToLogin={handleLoginClick}/>
            <Overlay handleSignInClick={handleLoginClick} handleSignUpClick={handleRegisterClick} />
          </div>
        </div>
      </section>
      <NewsSubscribe />
    </>
  );
};

