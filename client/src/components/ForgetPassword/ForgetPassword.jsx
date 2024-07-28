import { useAuthContext } from '../contexts/UserContext';
import './forgetPassword.css';
import { useForm } from '../hooks/useForm';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

export const ForgetPassword = () => {
  const { t } = useTranslation();
  const { onForgetPasswordSubmit } = useAuthContext();
  const navigate = useNavigate();
  const { onSubmit, values, onChangeHandler, onBlurHandler, errors } = useForm(
    {
      email: "",
    },
    (data) => {
      onForgetPasswordSubmit(data)
        .then(() => navigate('/resend-email', { state: { email: data.email } }))
        .catch((error) => console.error(error));
    }

  );

  return (
    <>
      <section className="forget-pass">
        <div className="forget-pass-container">
          <h2>{t('form.forget-password')}</h2>
          <p>{t('form.reset-forget-password')}</p>
          <form onSubmit={(e) => onSubmit(e, values)}>
            <div className="forget-pass-input">
              <label htmlFor="Email">{t('form.email-label')}</label>
              <input
                type="email"
                id='Email'
                name='email'
                value={values.email}
                onChange={onChangeHandler}
                // placeholder="Email"
                onBlur={onBlurHandler}
                required
              />
              {errors.email && <p className="error">{t(`${errors.email}`)}</p>}
            </div>
            <button className='forget-submit-btn' type="submit">{t('form.next-button')}</button>
          </form>
          <Link to="/sign-up"> {t('form.back-to-login')}</Link>

        </div>
        <div className="logo-forget-pass">
        <div className="logo-forget-pass">
                    <Link to="/">
                        <img src="/images/homePage/logo.png" alt="logo" className='logo-reset-pass' /> Penca Club&copy; 
                    </Link>
                </div>
        </div>
      </section>
    </>
  );
}
