
import CulturalAbout from '../components/CulturalAbout/CulturalAbout';
import CulturalActivities from '../components/CulturalActivities/CulturalActivities';
import CulturalContacts from '../components/CulturalContacts/CulturalContacts';
import CulturalEvents from '../components/CulturalEvents/CulturalEvents';
import CulturalGallery from '../components/CulturalGallery/CulturalGallery';
import CulturalHero from '../components/CulturalHero/CulturalHero';
import CulturalLocation from '../components/CulturalLocation/CulturalLocation';
import CulturalManagement from '../components/CulturalManagement/CulturalManagement';

const CulturalTemplate = ({ club }) => {
  return (
    <div className="cultural-template">
      <CulturalHero club={club} />
      <CulturalAbout club={club} />
      <CulturalActivities club={club} />
   
      <CulturalEvents club={club} />
      <CulturalManagement club={club} />
      <CulturalGallery club={club} />
      <CulturalLocation club={club} />
      <CulturalContacts club={club} />

    </div>
  );
};

export default CulturalTemplate;