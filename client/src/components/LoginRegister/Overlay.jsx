import './loginRegister.css';

import { useTranslation } from 'react-i18next';

export const Overlay = ({ handleSignInClick, handleSignUpClick }) => {
  const { t } = useTranslation();

  return (
    <div className="container__overlay">
      <div className="overlay">
        <div className="overlay__panel overlay--left">
          <button
            className="btn-general btn-orange"
            id="signIn"
            onClick={handleSignInClick}
          >
            {t('form.login')}
          </button>
        </div>
        <div className="overlay__panel overlay--right">
          <button
            className="btn-general btn-orange"
            id="signUp"
            onClick={handleSignUpClick}
          >
            {t('form.register')}
          </button>
        </div>
      </div>
    </div>
  );
};
