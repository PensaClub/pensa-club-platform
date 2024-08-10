import './loginRegister.css';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../contexts/UserContext';
import { useForm } from '../hooks/useForm';
import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ReCAPTCHA from "react-google-recaptcha";

export const Login = ({ navToRegister }) => {
  const { t } = useTranslation();
  const { onLoginSubmit } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [showRecaptcha, setShowRecaptcha] = useState(false);
  const [recaptchaSize, setRecaptchaSize] = useState("normal");
  const recaptchaRef = useRef();

  useEffect(() => {
    window.scrollTo({ top: 0 });

    const updateRecaptchaSize = () => {
      if (window.innerWidth <= 450) {
        setRecaptchaSize("compact");
      } else {
        setRecaptchaSize("normal");
      }
    };

    updateRecaptchaSize(); // Initial check
    window.addEventListener("resize", updateRecaptchaSize);

    return () => {
      window.removeEventListener("resize", updateRecaptchaSize);
    };
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

  const toggleShowPassword = () => {
    setShowPassword((prevState) => !prevState);
  };

  const onRecaptchaChange = (token) => {
    setRecaptchaToken(token);
  };

  return (
    <div className="container__form container--signin">
      <form action="#" className="form" id="form2" onSubmit={onSubmit}>
        <h2 className="form__title">{t('form.login')}</h2>

        <label className="label" htmlFor="email">
          {t('form.email-label')}
        </label>

        <input
          type="text"
          placeholder={t('form.email-placeholder')}
          className="input"
          name="email"
          value={values.email}
          onChange={onChangeHandler}
          onBlur={onBlurHandler}
        />

        {errors.email && <p className="error">{t(`${errors.email}`)}</p>}

        <label className="label" htmlFor="password">{t('form.password-label')}</label>
        <div className="password-input-container">
          <input
            type={showPassword ? "text" : "password"}
            placeholder={t('form.password-placeholder')}
            className="input"
            name="password"
            value={values.password}
            onChange={onChangeHandler}
            onBlur={onBlurHandler}
          />
          <span className="toggle-password" onClick={toggleShowPassword}>
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </span>
        </div>
        {errors.password && <p className="error">{t(`${errors.password}`)}</p>}

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

        <Link to="/forget-password" className="link">
          {t('form.password-forgotten')}
        </Link>
        <button className="btn-general btn-orange" disabled={!values.password || !values.email || (showRecaptcha && !recaptchaToken)}>
          {t('form.login')}
        </button>
        <Link
          to="/sign-up"
          className="link link-hidden"
          onClick={navToRegister}
        >
          {t('form.login-redirect')} <span>{t('form.register')}</span>
        </Link>
      </form>
    </div>
  );
};
