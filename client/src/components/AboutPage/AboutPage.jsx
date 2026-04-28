import { useTranslation } from 'react-i18next';
import './aboutPage.css';
import AboutHero from './AboutHero/AboutHero';
import AboutPlatform from './AboutPlatform/AboutPlatform';
import AboutFoundation from './AboutFoundation/AboutFoundation';
import AboutTeam from './AboutTeam/AboutTeam';
import AboutContact from './AboutContact/AboutContact';
import { TextZoom } from '../TextZoom/TextZoom';
import ScrollToTop from '../ScrollToTop/ScrollToTop';
import AboutPartners from './AboutPartners/AboutPartners';
import AboutPartnersTimeline from './AboutPartnersTimeline/AboutPartnersTimeline';
import AboutPartnersCards from './AboutPartnersCards/AboutPartnersCards';
import SEOHead from '../SEO/SEOHead';
// import { AboutPlatform } from './components/AboutPlatform';
// import { AboutFoundation } from './components/AboutFoundation';
// import { AboutTeam } from './components/AboutTeam';
// import { AboutContact } from './components/AboutContact';

export const AboutPage = () => {
  const { t } = useTranslation();

  return (
    <div className="aboutpage-wrapper">
      <SEOHead
        title={t('about.meta.title', { defaultValue: 'За Pensa Club — мисия, екип и партньори | Pensa Club' })}
        description={t('about.meta.description', { defaultValue: 'Pensa Foundation създава Pensa Club, за да обедини 150+ пенсионерски клуба, доброволни ментори и общности в дигиталното пространство.' })}
        keywords={t('about.meta.keywords', { defaultValue: 'Pensa Foundation, мисия, екип, партньори, DigiBridge Academy, пенсионерски клубове' })}
        image="/images/about_us/about-us.webp"
      />
      <AboutHero />
      <AboutPlatform />
      <AboutFoundation />
      <AboutTeam />
      <AboutPartners /> {/* Вариант 1 */}
      {/* <AboutPartnersTimeline /> {/* Вариант 2*/}
      {/* <AboutPartnersCards />   {/* Вариант 3*/}
      <AboutContact />
      <TextZoom />
      <ScrollToTop />
    </div>
  );
};

export default AboutPage;