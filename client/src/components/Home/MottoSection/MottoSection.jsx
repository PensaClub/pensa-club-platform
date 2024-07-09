import './motto.css';

import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import 'react-toastify/dist/ReactToastify.css';

export const MottoSection = () => {
  const { t } = useTranslation();

  return (
    <>
      <section className="motto-section">
        <div className="motto-desc">
          <img src="/images/homePage/logo.png" alt="logo" />
          <div className="motto-info">
            <h3>{t('motto.title1')} </h3>
            <h3>{t('motto.title2')}</h3>
            <h3>{t('motto.title3')} </h3>
            <p>
              {' '}
              <Trans i18nKey="motto.desc" components={{ span: <strong /> }} />
            </p>
          </div>
          <Link to="/#" className="btn-general btn-orange" id="btn-join">
            {t('motto.about-btn')}
          </Link>{' '}
          </div>
      </section>
    </>
  );
};
