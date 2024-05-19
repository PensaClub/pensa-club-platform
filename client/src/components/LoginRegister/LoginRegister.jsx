import React, { useState } from 'react';
import './loginRegister.css';

import { Login } from './Login';
import { Register } from './Register';
import { Overlay } from './Overlay';


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
    <div className="login-register-wrapper">
      <div className={`container ${activeView ? 'right-panel-active' : ''}`}>
        <Login />
        <Register />
        <Overlay handleSignInClick={handleLoginClick} handleSignUpClick={handleRegisterClick} />
      </div>
    </div>
  );
};

