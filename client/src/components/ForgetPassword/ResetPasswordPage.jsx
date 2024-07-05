import { Link, useLocation, useNavigate } from 'react-router-dom';
import './forgetPassword.css';
import { useAuthContext } from '../contexts/UserContext';
import { useTranslation } from 'react-i18next';
import { useForm } from '../hooks/useForm';
import { useState } from 'react';

export const ResetPasswordPage = () => {
    const { t } = useTranslation();
    const { onPasswordReset } = useAuthContext();
    const [showPassword, setShowPassword] = useState(false);
    const [showRePassword, setReShowPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    const { onSubmit, values, onChangeHandler, onBlurHandler, errors } = useForm(
        {
          newPassword: "",
          reNewPassword: "",
        },
        (data) => {
          const resetData = {
            newPassword: data.newPassword,
            reNewPassword: data.reNewPassword,
            token,
            tokenType: 'reset',
          };
          onPasswordReset(resetData)
            .then(() => navigate('/sign-up'))
            .catch((error) => console.error(error));
        }
      );

    const toggleShowPassword = () => {
        setShowPassword((prevState) => !prevState);
    };

    const toggleShowRePassword = () => {
        setReShowPassword((prevState) => !prevState);
    };

    return (
        <>
            <section className="forget-pass">
                <div className="forget-pass-container">
                    <h2>{t('form.reset-password')}</h2>
                    <p>{t('form.enter-new-password')}</p>
                    <form onSubmit={(e) => onSubmit(e, values)}>
                        <div className="forget-pass-input">
                            <label htmlFor="newPassword">{t('form.new-password')}</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                id='newPassword'
                                name='newPassword'
                                value={values.newPassword}
                                onChange={onChangeHandler}
                                onBlur={onBlurHandler}
                                required
                            />
                            <span className="toggle-password" onClick={toggleShowPassword}>
                                {showPassword ? "👁️" : "👁️‍🗨️"}
                            </span>
                        </div>
                        {errors.newPassword && <p className="error">{t(`${errors.newPassword}`)}</p>}

                        <div className="forget-pass-input">
                            <label htmlFor="reNewPassword">{t('form.confirm-new-password')}</label>
                            <input
                                type={showRePassword ? "text" : "password"}
                                id='reNewPassword'
                                name='reNewPassword'
                                value={values.reNewPassword}
                                onChange={onChangeHandler}
                                onBlur={onBlurHandler}
                                required
                            />
                            <span className="toggle-password-second" onClick={toggleShowRePassword}>
                                {showRePassword ? "👁️" : "👁️‍🗨️"}
                            </span>
                        </div>
                        {errors.reNewPassword && <p className="error">{t(`${errors.reNewPassword}`)}</p>}

                        <button className='forget-submit-btn' type="submit">{t('form.next-button')}</button>
                    </form>
                    <Link to="/sign-up">{t('form.back-to-login')}</Link>
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
