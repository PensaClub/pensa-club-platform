import { Link } from 'react-router-dom';
import './loginRegister.css';

import { UserContext } from '../contexts/UserContext';
import { useContext, useEffect, useState } from 'react';
import { useForm } from '../hooks/useForm';
import { useTranslation } from 'react-i18next';

export const Register = ({ navToLogin }) => {
  const { t } = useTranslation();

  const { onRegisterSubmit } = useContext(UserContext);
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setReShowPassword] = useState(false);

  useEffect(() => {
  window.scrollTo({top:0})
},[])
  
  const { onSubmit, values, onChangeHandler, onBlurHandler, errors } = useForm(
    {
      email: "",
      password: "",
      rePassword: "",
    },
    onRegisterSubmit
  );

  const toggleShowPassword = () => {
    setShowPassword((prevState) => !prevState);
  };

  const toggleShowRePassword = () => {
    setReShowPassword((prevState) => !prevState);
  };

  return (
    <div className="container__form container--signup">
      <form action="#" className="form" id="form1" onSubmit={onSubmit}>
        <h2 className="form__title">{t('form.register')}</h2>

        <label className="label" htmlFor="Email">
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

        <label className="label" htmlFor="rePassword">{t('form.rePassword-label')}</label>
        <div className="password-input-container">
          <input
            type={showRePassword ? "text" : "password"}
            placeholder={t('form.rePassword-placeholder')}
            className="input"
            name="rePassword"
            value={values.rePassword}
            onChange={onChangeHandler}
            onBlur={onBlurHandler}
          />
          <span className="toggle-password" onClick={toggleShowRePassword}>
            {showRePassword ? "👁️" : "👁️‍🗨️"}
          </span>
        </div>

        {errors.rePassword && <p className="error">{t(`${errors.rePassword}`)}</p>}

        <button className="btn-general btn-orange" disabled={!values.password || !values.email || !values.rePassword}>{t('form.register')}</button>
        <Link to="#" className="link link-hidden" onClick={navToLogin}>
        {t('form.register-redirect')} <span>{t('form.login')}</span>
        </Link>
      </form>
    </div>
  );
};
