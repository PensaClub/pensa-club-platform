import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTheaterMasks,
  faMusic,
  faBookOpen,
  faAward,
  faHeart,
  faPalette,
  faUsers,
  faHandsHelping,
  faStar,
  faQuoteLeft,
  faCalendarAlt,
  faGem
} from '@fortawesome/free-solid-svg-icons';
import './culturalAbout.css';

export const CulturalAbout = ({ club }) => {
  const currentYear = new Date().getFullYear();
  const yearsActive = currentYear - (club.foundedYear || 2010);

  const culturalValues = [
    {
      icon: faTheaterMasks,
      title: "Културно наследство",
      description: "Съхраняваме и предаваме българските традиции на следващите поколения"
    },
    {
      icon: faMusic,
      title: "Художествено творчество", 
      description: "Развиваме таланта и креативността на всеки член на клуба"
    },
    {
      icon: faUsers,
      title: "Обществена ангажираност",
      description: "Активно участваме в културния живот на общността"
    },
    {
      icon: faHeart,
      title: "Взаимопомощ",
      description: "Създаваме топла семейна атмосфера на подкрепа и приятелство"
    }
  ];

  const achievements = club.achievements?.awards || [
    {
      name: "Най-активен клуб на годината",
      year: 2023,
      awardedBy: "Столична община"
    },
    {
      name: "Приз за културна дейност", 
      year: 2022,
      awardedBy: "Министерство на културата"
    }
  ];

  const specialties = [
    {
      icon: faMusic,
      title: "Хорово пеене",
      description: "Традиционни български песни и класическа музика"
    },
    {
      icon: faTheaterMasks,
      title: "Народни танци",
      description: "Автентични танци от всички краища на България"
    },
    {
      icon: faPalette,
      title: "Изобразително изкуство",
      description: "Рисуване, занаяти и художествени работилници"
    },
    {
      icon: faBookOpen,
      title: "Литературни четения",
      description: "Поезия, проза и дискусии за българската литература"
    }
  ];

  return (
    <section id="club-about" className="cultural-about-main-section">
      <div className="cultural-about-container">
        
        {/* Header */}
        <div className="cultural-about-header">
          <div className="cultural-about-badge">
            <FontAwesomeIcon icon={faBookOpen} />
            <span>За клуба</span>
          </div>
          <h2 className="cultural-about-title">Нашата история и мисия</h2>
          <p className="cultural-about-subtitle">
            Повече от {yearsActive} години създаваме незабравими моменти и съхраняваме българската култура
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="cultural-about-content-grid">
          
          {/* Left Column - Story & Mission */}
          <div className="cultural-about-main-content">
            
            {/* Club Story */}
            <div className="cultural-about-story-card">
              <div className="cultural-about-story-header">
                <FontAwesomeIcon icon={faBookOpen} />
                <h3>Нашата история</h3>
              </div>
              <div className="cultural-about-story-content">
                <p className="cultural-about-story-text">
                  {club.fullDescription || `Клуб "${club.name}" е основан през ${club.foundedYear || '2010'} година с мисията да създаде пространство за културно развитие и социално общуване на пенсионерите в ${club.location.city}. От самото си създаване клубът се отличава с богата програма от културни дейности, които съчетават традиционните български обичаи с модерни форми на изкуство.`}
                </p>
                
                {club.foundedYear && (
                  <div className="cultural-about-timeline-highlight">
                    <div className="cultural-about-timeline-year">{club.foundedYear}</div>
                    <div className="cultural-about-timeline-event">Основаване на клуба</div>
                  </div>
                )}
              </div>
            </div>

            {/* Mission & Values */}
            <div className="cultural-about-mission-card">
              <div className="cultural-about-mission-header">
                <FontAwesomeIcon icon={faGem} />
                <h3>Нашите ценности</h3>
              </div>
              <div className="cultural-about-values-grid">
                {culturalValues.map((value, index) => (
                  <div key={index} className="cultural-about-value-item">
                    <div className="cultural-about-value-icon">
                      <FontAwesomeIcon icon={value.icon} />
                    </div>
                    <div className="cultural-about-value-content">
                      <h4>{value.title}</h4>
                      <p>{value.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quote Section */}
            <div className="cultural-about-quote-card">
              <div className="cultural-about-quote-content">
                <FontAwesomeIcon icon={faQuoteLeft} className="cultural-about-quote-icon" />
                <blockquote>
                  "Културата е мостът между поколенията. В нашия клуб всеки ден строим този мост с песни, танци и топли усмивки."
                </blockquote>
                <cite>
                  - {club.management?.board?.[0]?.name || 'Председател на клуба'}
                </cite>
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Specialties */}
          <div className="cultural-about-sidebar">
            
            {/* Key Numbers */}
            <div className="cultural-about-stats-card">
              <div className="cultural-about-stats-header">
                <FontAwesomeIcon icon={faStar} />
                <h3>Ключови цифри</h3>
              </div>
              <div className="cultural-about-stats-list">
                <div className="cultural-about-stat-item">
                  <div className="cultural-about-stat-number">{club.membership?.totalMembers || '67'}</div>
                  <div className="cultural-about-stat-label">Активни членове</div>
                </div>
                <div className="cultural-about-stat-item">
                  <div className="cultural-about-stat-number">{yearsActive}</div>
                  <div className="cultural-about-stat-label">Години опит</div>
                </div>
                <div className="cultural-about-stat-item">
                  <div className="cultural-about-stat-number">{club.activities?.regular?.length || '4'}</div>
                  <div className="cultural-about-stat-label">Редовни програми</div>
                </div>
                <div className="cultural-about-stat-item">
                  <div className="cultural-about-stat-number">{achievements.length || '2'}</div>
                  <div className="cultural-about-stat-label">Престижни награди</div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="cultural-about-achievements-card">
              <div className="cultural-about-achievements-header">
                <FontAwesomeIcon icon={faAward} />
                <h3>Постижения</h3>
              </div>
              <div className="cultural-about-achievements-list">
                {achievements.map((achievement, index) => (
                  <div key={index} className="cultural-about-achievement-item">
                    <div className="cultural-about-achievement-year">{achievement.year}</div>
                    <div className="cultural-about-achievement-content">
                      <h4>{achievement.name}</h4>
                      <p>{achievement.awardedBy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Specialties */}
            <div className="cultural-about-specialties-card">
              <div className="cultural-about-specialties-header">
                <FontAwesomeIcon icon={faPalette} />
                <h3>Нашите специалности</h3>
              </div>
              <div className="cultural-about-specialties-list">
                {specialties.map((specialty, index) => (
                  <div key={index} className="cultural-about-specialty-item">
                    <div className="cultural-about-specialty-icon">
                      <FontAwesomeIcon icon={specialty.icon} />
                    </div>
                    <div className="cultural-about-specialty-content">
                      <h4>{specialty.title}</h4>
                      <p>{specialty.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Community Impact */}
        <div className="cultural-about-community-impact">
          <div className="cultural-about-impact-header">
            <FontAwesomeIcon icon={faHandsHelping} />
            <h3>Нашият принос към общността</h3>
          </div>
          <div className="cultural-about-impact-grid">
            <div className="cultural-about-impact-item">
              <div className="cultural-about-impact-number">150+</div>
              <div className="cultural-about-impact-label">Културни събития годишно</div>
            </div>
            <div className="cultural-about-impact-item">
              <div className="cultural-about-impact-number">500+</div>
              <div className="cultural-about-impact-label">Посетители на концерти</div>
            </div>
            <div className="cultural-about-impact-item">
              <div className="cultural-about-impact-number">25+</div>
              <div className="cultural-about-impact-label">Доброволни инициативи</div>
            </div>
            <div className="cultural-about-impact-item">
              <div className="cultural-about-impact-number">80+</div>
              <div className="cultural-about-impact-label">Семейства подкрепени</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="cultural-about-cta-section">
          <div className="cultural-about-cta-content">
            <h3>Станете част от нашето културно семейство</h3>
            <p>Присъединете се към нас и откройте красотата на българската култура заедно с нови приятели</p>
            <div className="cultural-about-cta-buttons">
              <button className="cultural-about-btn-primary">
                <FontAwesomeIcon icon={faUsers} />
                Присъединете се
              </button>
              <button className="cultural-about-btn-secondary">
                <FontAwesomeIcon icon={faCalendarAlt} />
                Разгледайте програмата
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CulturalAbout;