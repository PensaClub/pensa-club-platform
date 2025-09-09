import { ClubAbout } from "../components/ClubAbout/ClubAbout";
import ClubActivities from "../components/ClubActivities/ClubActivities";
import ClubContact from "../components/ClubContact/ClubContact";
import ClubEvents from "../components/ClubEvents/ClubEvents";
import ClubGallery from "../components/ClubGallery/ClubGallery";
import ClubHero from "../components/ClubHero/ClubHero";
import ClubLocation from "../components/ClubLocation/ClubLocation";
import ClubManagement from "../components/ClubManagement/ClubManagement";
import ClubPensionersSpecific from "../components/ClubPensionersSpecific/ClubPensionersSpecific";


const GeneralTemplate = ({ club }) => {
  return (
    <div className="general-template">
      <ClubHero club={club} />
      <ClubAbout club={club} />
      <ClubActivities club={club} />
      <ClubEvents club={club} />
      <ClubManagement club={club} />
         <ClubPensionersSpecific club={club} />
      <ClubGallery club={club} />
      <ClubLocation club={club} />
      <ClubContact club={club} />
    
    </div>
  );
};

export default GeneralTemplate;