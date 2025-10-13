import { useTranslation } from 'react-i18next';
import './aboutPage.css';
import AboutHero from './AboutHero/AboutHero';
import AboutPlatform from './AboutPlatform/AboutPlatform';
import AboutFoundation from './AboutFoundation/AboutFoundation';
import AboutTeam from './AboutTeam/AboutTeam';
import AboutContact from './AboutContact/AboutContact';
import { TextZoom } from '../TextZoom/TextZoom';
import ScrollToTop from '../ScrollToTop/ScrollToTop';
// import { AboutPlatform } from './components/AboutPlatform';
// import { AboutFoundation } from './components/AboutFoundation';
// import { AboutTeam } from './components/AboutTeam';
// import { AboutContact } from './components/AboutContact';

export const AboutPage = () => {
  const { t } = useTranslation();

  return (
    <div className="aboutpage-wrapper">
      <AboutHero />
      <AboutPlatform />
      <AboutFoundation />
      <AboutTeam />
      <AboutContact />
      <TextZoom />
      <ScrollToTop />
    </div>
  );
};

export default AboutPage;