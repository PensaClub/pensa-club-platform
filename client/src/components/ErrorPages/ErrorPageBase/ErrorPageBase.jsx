import './errorPageBase.css'; 

import { NavLink } from 'react-router-dom';
import { useTranslation } from "react-i18next";

export const ErrorPageBase = ({ errorCode, errorDesc }) => {
  const {t} = useTranslation();
  return (
    
      <div className="container-wrapper">
      <div className="not-found">
        <h1>{t('error-page.error')} {errorCode}</h1>

        <h2>{errorDesc}</h2>
        
        <div className="menu-list">
          <NavLink to="/" className="btn-general btn-green">
          {t('error-page.home')}
          </NavLink>

          <NavLink to="/map" className="btn-general btn-green">
          {t('error-page.map')}
          </NavLink>

          <NavLink to="/craigslist" className="btn-general btn-green">
          {t('error-page.craigslist')}
          </NavLink>
        </div>
      </div>
    </div>
    
  );
};
