// templates/SportsTemplate.jsx

import FitnessPrograms from "../components/FitnessPrograms/FitnessPrograms";
import HealthActivities from "../components/HealthActivities/HealthActivities";
import SportsHealthTracking from "../components/SportsHealthTracking/SportsHealthTracking";
import SportEvents from "../components/SportEvents/SportEvents";
import SportsAbout from "../components/SportsAbout/SportsAbout";
import SportsActivities from "../components/SportsActivities/SportsActivities";
import SportsEventsCalendar from "../components/SportsEventsCalendar/SportsEventsCalendar";
import SportsHero from "../components/SportsHero/SportsHero";
import WellnessServices from "../components/WellnessServices/WellnessServices";
import SportsGallery from "../components/SportsGallery/SportsGallery";
import SportsPartners from "../components/SportsPartners/SportsPartners";
import SportsLocation from "../components/SportsLocation/SportsLocation";
import SportsContacts from "../components/SportsContacts/SportsContacts";

const SportsTemplate = ({ club }) => {
  return (
    <div className="sports-template">
      {/* Hero секция - спортна мотивация */}
      <SportsHero club={club} />
      
      {/* About секция - за активния клуб */}
      <SportsAbout club={club} />
      <SportsActivities club={club} />
      
      {/* Fitness Programs секция - тренировъчни програми */}
      <FitnessPrograms club={club} />
      
      {/* Health Activities секция - здравни дейности */}
      <HealthActivities club={club} />
      
      {/* Wellness Services секция - услуги за благосъстояние */}
      <WellnessServices club={club} />
      
      {/* Sport Events секция - спортни събития */}
      <SportEvents club={club} />
      <SportsEventsCalendar club={club} />
      {/* Health Tracking секция - следене на прогрес */}
      <SportsHealthTracking club={club} />
      
      {/* Sports Gallery секция - снимки от активности */}
      <SportsGallery club={club} />
      
      {/* Fitness Partners секция - партньори и спонсори */}
      <SportsPartners club={club} />
      
      {/* Location секция */}
      <SportsLocation club={club} />
      
      {/* Contacts секция */}
      <SportsContacts club={club} />
    </div>
  );
};

export default SportsTemplate;