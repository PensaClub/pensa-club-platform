import './loginRegister.css';

import { Link } from 'react-router-dom';

import './loginRegister.css';
import { useAuthContext } from '../contexts/UserContext';
import { useForm } from '../hooks/useForm';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const Login = ({ navToRegister }) => {
  const { t } = useTranslation();

  const { onLoginSubmit } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
  window.scrollTo({top:0})
},[])
  const { onSubmit, values, onChangeHandler, onBlurHandler, errors } = useForm(
    {
      email: "",
      password: "",
    },
    onLoginSubmit
  );

  const toggleShowPassword = () => {
    setShowPassword((prevState) => !prevState);
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

        <Link to="/forget-password" className="link">
          {t('form.password-forgotten')}
        </Link>
        <button className="btn-general btn-orange">{t('form.login')}</button>
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

