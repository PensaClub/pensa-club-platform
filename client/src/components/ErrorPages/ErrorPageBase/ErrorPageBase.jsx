import './errorPageBase.css'; 
import { LocalizedNavLink as NavLink } from '../../LocalizedLink/LocalizedLink';
import { useTranslation } from "react-i18next";

export const ErrorPageBase = ({ errorCode, errorDesc }) => {
  const { t } = useTranslation();
  
  const getErrorDetails = (code) => {
    switch(code) {
      case '404':
        return { 
          icon: '🔍', 
          title: t('error-page.404-title'),
          color: '#3B82F6'
        };
      case '500':
        return { 
          icon: '⚡', 
          title: t('error-page.500-title'),
          color: '#EF4444'
        };
      default:
        return { 
          icon: '⚠️', 
          title: t('error-page.general-title'),
          color: '#F59E0B'
        };
    }
  };

  const errorDetails = getErrorDetails(errorCode);

  return (
    <div className="error-page-wrapper">
      <div className="error-background">
        <div className="grid-overlay"></div>
        <div className="floating-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`particle particle-${i + 1}`}></div>
          ))}
        </div>
      </div>
      
      <div className="error-container">
        <div className="error-card">
          <div className="error-header">
            <div className="error-icon-wrapper">
              <div className="error-icon-bg" style={{ backgroundColor: errorDetails.color + '20' }}>
                <span className="error-icon">{errorDetails.icon}</span>
              </div>
            </div>
            
            <div className="error-info">
              <div className="error-code-wrapper">
                <span className="error-code" style={{ color: errorDetails.color }}>
                  {errorCode}
                </span>
              </div>
              <h1 className="error-title">{errorDetails.title}</h1>
            </div>
          </div>
          
          <div className="error-divider"></div>
          
          <div className="error-message">
            <p className="error-description">{errorDesc}</p>
          </div>
          
          <div className="error-actions">
            <NavLink to="/" className="error-btn primary">
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
              <span>{t('error-page.home')}</span>
            </NavLink>
            
            <NavLink to="/map" className="error-btn secondary">
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
                <line x1="8" y1="2" x2="8" y2="18"/>
                <line x1="16" y1="6" x2="16" y2="22"/>
              </svg>
              <span>{t('error-page.map')}</span>
            </NavLink>
            
            <NavLink to="/community" className="error-btn secondary">
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span>{t('error-page.community')}</span>
            </NavLink>
          </div>
          
          <div className="error-footer">
            <div className="error-footer-content">
              <p>{t('error-page.footer-message')}</p>
              <div className="error-footer-actions">
                <button className="refresh-btn" onClick={() => window.location.reload()}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="23 4 23 10 17 10"/>
                    <polyline points="1 20 1 14 7 14"/>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                  </svg>
                  {t('error-page.refresh')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};