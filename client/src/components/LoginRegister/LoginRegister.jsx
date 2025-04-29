import React, { useEffect, useState } from 'react';
import { Login } from './Login';
import { Register } from './Register';
import { NewsSubscribe } from '../Home/NewsSubscribe/NewsSubscribe';
import { useLocation } from 'react-router-dom';
import './modernAuth.css';

export const LoginRegister = () => {
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

  }, [location.search]);

  const handleLoginClick = () => {
    setActiveView(false);
  };

  const handleRegisterClick = () => {
    setActiveView(true);
  };

  return (
    <>
      <section className="auth-section">
        <div className="auth-container">
          <div className="glass-card">
            {/* Странична лента - показва се само на десктоп */}
            <div className="sidebar">
              <div className="sidebar-content">
                <div>
                  <h1 className="sidebar-title">
                    {activeView ? 'Добре дошли!' : 'Здравейте отново!'}
                  </h1>
                  <p className="sidebar-text">
                    {activeView 
                      ? 'Присъединете се към нашето общество и открийте всички възможности, които предлагаме.' 
                      : 'Радваме се да Ви видим отново. Влезте в профила си, за да продължите своето пътуване с нас.'}
                  </p>
                </div>
                
                <button 
                  className="auth-btn" 
                  onClick={activeView ? handleLoginClick : handleRegisterClick}
                >
                  {activeView ? 'Вход' : 'Регистрация'}
                </button>
              </div>
              <div className="sidebar-decoration"></div>
            </div>
            
            {/* Контейнер за формите */}
            <div className="forms-container">
              <div className={`auth-forms-wrapper ${activeView ? 'show-register' : 'show-login'}`}>
                <Login navToRegister={handleRegisterClick} />
                <Register navToLogin={handleLoginClick} />
              </div>
            </div>
          </div>
        </div>
      </section>
      <NewsSubscribe />
    </>
  );
};