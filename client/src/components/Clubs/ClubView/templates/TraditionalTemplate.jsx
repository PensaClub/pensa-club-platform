import React from 'react';

import './traditionalTemplate.css';
import TraditionalHero from '../components/TraditionalHero/TraditionalHero';
import TraditionalAbout from '../components/TraditionalAbout/TraditionalAbout';
import TraditionalTraditions from '../components/TraditionalTraditions/TraditionalTraditions';
import TraditionalFolklore from '../components/TraditionalFolklore/TraditionalFolklore';
import TraditionalPerformances from '../components/TraditionalPerformances/TraditionalPerformances';
import TraditionalCostumes from '../components/TraditionalCostumes/TraditionalCostumes';
import TraditionalMusic from '../components/TraditionalMusic/TraditionalMusic';
import TraditionalCalendar from '../components/TraditionalCalendar/TraditionalCalendar';
import TraditionalGallery from '../components/TraditionalGallery/TraditionalGallery';
import TraditionalContacts from '../components/TraditionalContacts/TraditionalContacts';
import TraditionalLocation from '../components/TraditionalLocation/TraditionalLocation';

const TraditionalTemplate = ({ club }) => {
  return (
    <div className="traditional-template">
      {/* Hero секция - винаги се показва ако има данни */}

      <TraditionalHero club={club} />
      {/* About секция */}
      <TraditionalAbout club={club} />
      
      {/* Traditions секция */}
      <TraditionalTraditions club={club} />
      
      {/* Folklore секция */}
     <TraditionalFolklore club={club} />
      
      {/* Performances секция */}
      <TraditionalPerformances club={club} />
      
      {/* Costumes секция */}
     <TraditionalCostumes club={club} />
      
      {/* Music секция */}
     <TraditionalMusic club={club} />
      
      {/* Calendar секция */}
      <TraditionalCalendar club={club} />
      
      {/* Gallery секция */}
      <TraditionalGallery club={club} />
      
      {/* Contacts секция */}
      <TraditionalContacts club={club} />
      
      {/* Location секция */}
    <TraditionalLocation club={club} />
    </div>
  );
};

export default TraditionalTemplate;