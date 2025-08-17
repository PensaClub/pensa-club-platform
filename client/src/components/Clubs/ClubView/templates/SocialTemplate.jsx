
// import SocialHero from '../components/SocialHero/SocialHero';
// import SocialAbout from '../components/SocialAbout/SocialAbout';
// import SocialProjects from '../components/SocialProjects/SocialProjects';
// import SocialVolunteering from '../components/SocialVolunteering/SocialVolunteering';
// import SocialSupport from '../components/SocialSupport/SocialSupport';
// import SocialImpact from '../components/SocialImpact/SocialImpact';
// import SocialGallery from '../components/SocialGallery/SocialGallery';
// import SocialPartnerships from '../components/SocialPartnerships/SocialPartnerships';
// import SocialLocation from '../components/SocialLocation/SocialLocation';
// import SocialContacts from '../components/SocialContacts/SocialContacts';

import CommunityEvents from "../components/CommunityEvents/CommunityEvents";
import SocialAbout from "../components/SocialAbout/SocialAbout";
import SocialContacts from "../components/SocialContacts/SocialContacts";
import SocialGallery from "../components/SocialGallery/SocialGallery";
import SocialHero from "../components/SocialHero/SocialHero";
import SocialImpact from "../components/SocialImpact/SocialImpact";
import SocialLocation from "../components/SocialLocation/SocialLocation";
import SocialPartnerships from "../components/SocialPartnerships/SocialPartnerships";
import SocialProjects from "../components/SocialProjects/SocialProjects";
import SocialSupport from "../components/SocialSupport/SocialSupport";
import SocialVolunteering from "../components/SocialVolunteering/SocialVolunteering";

const SocialTemplate = ({ club }) => {
  return (
    <div className="social-template">
      {/* Hero секция - винаги се показва ако има данни */}
      <SocialHero club={club} />
      
      {/* About секция */}
      <SocialAbout club={club} />
      
      {/* Social Projects секция */}
      <SocialProjects club={club} />
      
      {/* Volunteering секция */}
      <SocialVolunteering club={club} />
      
      {/* Support Services секция */}
      <SocialSupport club={club} />
      
      {/* Social Impact секция */}
      <SocialImpact club={club} />
      <CommunityEvents club={club} />
      
      {/* Gallery секция */}
      <SocialGallery club={club} />
      
      {/* Partnerships секция */}
      <SocialPartnerships club={club} />
      
      {/* Location секция */}
      <SocialLocation club={club} />
      
      {/* Contacts секция */}
      <SocialContacts club={club} />
    </div>
  );
};

export default SocialTemplate;