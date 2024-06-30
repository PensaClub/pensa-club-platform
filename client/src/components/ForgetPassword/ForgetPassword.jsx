import { useState } from 'react';
import { useAuthContext } from '../contexts/UserContext';
import './forgetPassword.css';
import { useForm } from '../hooks/useForm';
import { useTranslation } from 'react-i18next';

export const ForgetPassword = () => {
  const { t } = useTranslation();
  const { onForgetPasswordSubmit } = useAuthContext();

  const { onSubmit, values, onChangeHandler, onBlurHandler, errors } = useForm(
    {
      email: "",
    },
    onForgetPasswordSubmit
  );

  return (
    <>
      <section className="forget-pass">
        <div className="forget-pass-container">
          <h1>Forget Password</h1>
          <p>Reset your password by providing your account email below.</p>
          <form onSubmit={(e) => onSubmit(e, values)}>
            <div className="forget-pass-input">
              <label htmlFor="Email">{t('Email')}</label>
              <input
                type="email"
                id='Email'
                name='email'
                value={values.email}
                onChange={onChangeHandler}
                placeholder="Email"
                onBlur={onBlurHandler}
                required
              />
              {errors.email && <p className="error">{t(`${errors.email}`)}</p>}
            </div>
            <button type="submit">Next</button>
          </form>
        </div>
      </section>
    </>
  );
}
