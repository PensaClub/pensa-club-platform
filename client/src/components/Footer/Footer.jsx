import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuthContext } from '../contexts/UserContext';
import { Mail, MapPin, ChevronUp } from 'lucide-react';
import { partnersData } from '../Home/PartnersShowcase/partnersData';
import './footer.css';

export const Footer = ({ additionalClasses }) => {
  const { t } = useTranslation();
  const { isAuthentication } = useAuthContext();

  const orderedPartners = [
    ...partnersData.filter(p => p.tier === 'main'),
    ...partnersData.filter(p => p.tier === 'standard')
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={`pft-footer ${additionalClasses || ''}`}>

      <button className="pft-top-btn" onClick={scrollToTop} aria-label="Back to top">
        <ChevronUp size={20} />
      </button>

      <div className="pft-main">
        <div className="pft-watermark">
          <img src="/images/homePage/logo-2.png" alt="" aria-hidden="true" />
        </div>

        <div className="pft-container">

          {/* Brand */}
          <div className="pft-brand">
            <Link to="/" className="pft-logo-link" onClick={scrollToTop}>
              <img src="/images/homePage/logo-2.png" alt="Pensa Club" className="pft-logo" />
              <span className="pft-logo-text">Pensa Club</span>
            </Link>
            <p className="pft-tagline">
              {t('footer.tagline', { defaultValue: 'Достоен живот в третата възраст' })}
            </p>

            <div className="pft-contact-items">
              <a href="mailto:office@pensa.club" className="pft-contact-link">
                <Mail size={14} />
                <span>office@pensa.club</span>
              </a>
              <div className="pft-contact-link">
                <MapPin size={14} />
                <span>{t('footer.country-city', { defaultValue: 'България, София' })}</span>
              </div>
            </div>

            <div className="pft-social">
              
              <a  href="https://www.facebook.com/profile.php?id=61578204366479"
                target="_blank"
                rel="noopener noreferrer"
                className="pft-social-link"
                aria-label="Facebook"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Sitemap */}
          <div className="pft-column">
            <h4 className="pft-column-title">
              {t('footer.site-map', { defaultValue: 'Карта на сайта' })}
            </h4>
            <nav className="pft-nav">
              <Link to="/articles" className="pft-nav-link">{t('header.articles', { defaultValue: 'Статии' })}</Link>
              <Link to="/clubs" className="pft-nav-link">{t('header.clubs', { defaultValue: 'Клубове' })}</Link>
              <Link to="/map" className="pft-nav-link">{t('footer.map', { defaultValue: 'Карта' })}</Link>
              <Link to="/initiatives" className="pft-nav-link">{t('header.initiatives', { defaultValue: 'Инициативи' })}</Link>
              <Link to="/about" className="pft-nav-link">{t('header.about', { defaultValue: 'За нас' })}</Link>
              <Link to="/contact" className="pft-nav-link">{t('footer.contact', { defaultValue: 'Свържете се с нас' })}</Link>
              {/* {isAuthentication && (
                <Link to="/ad/create" className="pft-nav-link">{t('footer.add-ad', { defaultValue: 'Добави обява' })}</Link>
              )} */}
            </nav>
          </div>

          {/* Partners */}
          <div className="pft-column pft-column-partners">
            <h4 className="pft-column-title">
              {t('footer.partners', { defaultValue: 'Партньори' })}
            </h4>
            <div className="pft-partners-list">
              {orderedPartners.map(partner => (
                <a
                  key={partner.id}
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pft-partner-item"
                  title={partner.name}
                >
                  <img
                    src={partner.footerLogo}
                    alt={partner.alt}
                    className="pft-partner-logo"
                    loading="lazy"
                  />
                  <span className="pft-partner-name">{partner.name}</span>
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="pft-bottom">
        <div className="pft-bottom-inner">
          <p className="pft-nonprofit">
            {t('footer.foundation-name', { defaultValue: 'Фондация „Пенса"' })} | {t('footer.nonprofit-status', { defaultValue: 'ЮЛНЦ в обществена полза' })} | {t('footer.eik', { defaultValue: 'ЕИК' })}: 208034387
          </p>
          <div className="pft-bottom-links">
            <Link to="/privacy-policy" className="pft-bottom-link">
              {t('footer.privacy', { defaultValue: 'Политика за поверителност' })}
            </Link>
            <span className="pft-bottom-sep">·</span>
            <span className="pft-copyright">&copy; {new Date().getFullYear()} Pensa Club</span>
          </div>
        </div>
      </div>

    </footer>
  );
};