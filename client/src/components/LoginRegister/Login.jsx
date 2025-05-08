import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../contexts/UserContext';
import { useForm } from '../hooks/useForm';
import { useTranslation } from 'react-i18next';
// import { GoogleLogin } from '@react-oauth/google';
import { useGoogleAuth } from '../contexts/GoogleAuthContext';
import ReCAPTCHA from "react-google-recaptcha";
import './modernAuth.css';
import { CustomGoogleButton } from './CustomGoogleButton';

export const Login = ({ navToRegister }) => {
  const { t } = useTranslation();
  const { onLoginSubmit } = useAuthContext();
  const { handleGoogleLogin, isProcessing } = useGoogleAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [showRecaptcha, setShowRecaptcha] = useState(false);
  const [recaptchaSize, setRecaptchaSize] = useState("normal");
  const recaptchaRef = useRef();

  useEffect(() => {
    window.scrollTo({ top: 0 });

    const updateRecaptchaSize = () => {
      setRecaptchaSize(window.innerWidth <= 450 ? "compact" : "normal");
    };

    updateRecaptchaSize();
    window.addEventListener("resize", updateRecaptchaSize);
    return () => window.removeEventListener("resize", updateRecaptchaSize);
  }, []);

  const { onSubmit, values, onChangeHandler, onBlurHandler, errors } = useForm(
    {
      email: "",
      password: "",
    },
    async (formData) => {
      if (showRecaptcha && !recaptchaToken) {
        alert("Please complete the reCAPTCHA");
        return;
      }

      try {
        const result = await onLoginSubmit(formData);

        if (result === "Email or password are invalid.") {
          setShowRecaptcha(true);
          setRecaptchaToken(null);
          if (recaptchaRef.current) {
            recaptchaRef.current.reset();
          }
        } else {
          setShowRecaptcha(false);
          setRecaptchaToken(null);
        }
      } catch (error) {
        setShowRecaptcha(true);
        setRecaptchaToken(null);
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
      }
    },
    ["email"]
  );

  const toggleShowPassword = () => setShowPassword(prev => !prev);
  const onRecaptchaChange = (token) => setRecaptchaToken(token);

  const onGoogleLoginSuccess = async (credentialResponse) => {
    try {
      await handleGoogleLogin(credentialResponse.credential);
      // Навигация или друга логика при успешен вход
    } catch (error) {
      console.error('Google login failed:', error);
    }
  };

  const onGoogleLoginError = () => {
    console.error('Google login failed');
    // По желание - показване на съобщение за грешка
  };

  return (
    <div className="form-slide login-slide">
      <div className="auth-form">
        <div className="form-header">
          <h2 className="form-title">{t('form.login')}</h2>
          <p className="form-subtitle">Добре дошли отново в нашата платформа</p>
        </div>

        <form onSubmit={onSubmit}>
          <div className="input-group">
            <label htmlFor="email">{t('form.email-label')}</label>
            <div className="input-wrapper-sign-up">
              <input
                type="text"
                id="email"
                name="email"
                className="auth-input"
                placeholder={t('form.email-placeholder')}
                value={values.email}
                onChange={onChangeHandler}
                onBlur={onBlurHandler}
              />
            </div>
            {errors.email && <p className="input-error">{t(`${errors.email}`)}</p>}
          </div>

          <div className="input-group">
            <label htmlFor="password">{t('form.password-label')}</label>
            <div className="input-wrapper-sign-up">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className="auth-input"
                placeholder={t('form.password-placeholder')}
                value={values.password}
                onChange={onChangeHandler}
                onBlur={onBlurHandler}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={toggleShowPassword}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z" fill="currentColor" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 6.5C15.79 6.5 19.17 8.63 20.82 12C20.23 13.42 19.29 14.67 18.11 15.62L19.45 16.97C21.03 15.69 22.25 14 23 12C21.27 7.61 17 4.5 12 4.5C10.6 4.5 9.26 4.75 8 5.2L9.67 6.87C10.4 6.63 11.18 6.5 12 6.5ZM1.89 3.27L4.1 5.47C2.5 6.76 1.26 8.5 0.5 10.5C2.23 14.89 6.5 18 11.5 18C13.05 18 14.54 17.69 15.9 17.12L18.97 20.19L20.23 18.93L3.16 1.85L1.89 3.27ZM9.3 10.67L12.54 13.91C12.37 13.96 12.19 14 12 14C10.34 14 9 12.66 9 11C9 10.81 9.04 10.63 9.1 10.46L9.3 10.67ZM5.47 6.84L7.11 8.48C6.8 9.27 6.63 10.12 6.63 11C6.63 14.54 9.46 17.37 13 17.37C13.88 17.37 14.73 17.2 15.52 16.89L16.74 18.11C15.1 18.67 13.33 19 11.5 19C6.5 19 2.23 15.89 0.5 11.5C1.16 9.81 2.18 8.35 3.46 7.17L5.47 6.84Z" fill="currentColor" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className="input-error">{t(`${errors.password}`)}</p>}
          </div>

          <Link to="/forget-password" className="form-link forgot-password">
            {t('form.password-forgotten')}
          </Link>

          {showRecaptcha && (
            <div className="recaptcha-container">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                onChange={onRecaptchaChange}
                theme="light"
                size={recaptchaSize}
              />
            </div>
          )}

          <button
            type="submit"
            className="auth-btn"
            disabled={!values.password || !values.email || (showRecaptcha && !recaptchaToken)}
          >
            {t('form.login')}
          </button>
        </form>
        <div className="social-auth-separator">
          <span>{t('form.continue-with')}</span>
        </div>
        <div className="google-auth-container">
          <CustomGoogleButton mode="login" />
        </div>
        <div className="form-footer">
          <p>
            {t('form.login-redirect')}
            <span className="switch-form-link" onClick={navToRegister}>
              {t('form.register')}
            </span>
          </p>
        </div>
      </div>

      <div className="floating-shape shape-1"></div>
      <div className="floating-shape shape-2"></div>
    </div>
  );
};