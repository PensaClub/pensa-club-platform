// templates/SportsTemplate.jsx

import FitnessPrograms from "../components/FitnessPrograms/FitnessPrograms";
import HealthActivities from "../components/HealthActivities/HealthActivities";
import SportsAbout from "../components/SportsAbout/SportsAbout";
import SportsActivities from "../components/SportsActivities/SportsActivities";
import SportsHero from "../components/SportsHero/SportsHero";
import WellnessServices from "../components/WellnessServices/WellnessServices";

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
      {/* <SportEvents club={club} /> */}
      
      {/* Health Tracking секция - следене на прогрес */}
      {/* <HealthTracking club={club} /> */}
      
      {/* Sports Gallery секция - снимки от активности */}
      {/* <SportsGallery club={club} /> */}
      
      {/* Fitness Partners секция - партньори и спонсори */}
      {/* <FitnessPartners club={club} /> */}
      
      {/* Location секция */}
      {/* <SportsLocation club={club} /> */}
      
      {/* Contacts секция */}
      {/* <SportsContacts club={club} /> */}
    </div>
  );
};

export default SportsTemplate;