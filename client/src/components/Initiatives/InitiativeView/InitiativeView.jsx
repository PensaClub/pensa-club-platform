import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './initiativeView.css';
import { useTranslation } from 'react-i18next';
import { useInitiativeContext } from '../../contexts/InitiativeProvider';
import { Loader } from '../../Loader/Loader';
import { StoriesPublications } from './StoriesPublications/StoriesPublications';
import { InitiativesMap } from '../InitiativesList/InitiativesMap/InitiativesMap';
import { ProjectCard } from './ProjectCard/ProjectCard';
import { ContactSection } from './ContactSection/ContactSection';

export const InitiativeView = () => {
  const { slug } = useParams();
  const { t } = useTranslation();
  const { getInitiativeById } = useInitiativeContext();
  const [initiative, setInitiative] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInitiative = async () => {
      setIsLoading(true);
      try {
        const data = await getInitiativeById(slug);
        setInitiative(data);
      } catch (error) {
        console.error('Error fetching initiative:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitiative();
  }, [slug, getInitiativeById]);

  // Разделяне на shortDescription
  const getDescriptionParts = (description) => {
    const sentences = description.split(/(?<=[.!?])\s+/);
    const firstSentence = sentences[0] || '';
    const restSentences = sentences.slice(1).join(' ');
    return { firstSentence, restSentences };
  };

  // Mock данни за stories и publications (временно)
  const mockStories = [
    {
      id: 1,
      title: "Как технологиите променят живота на възрастните",
      description: "Истории за успешна дигитална трансформация и как възрастните хора се адаптират към новите технологии.",
      image: { src: "/images/stories/story1.jpg", alt: "Възрастни с технологии" },
      publishedAt: "2024-03-15T10:00:00Z",
      author: "Мария Стоянова",
      link: "/stories/digital-transformation"
    }
  ];

  const mockPublications = [
    {
      id: 1,
      title: "Ръководство за дигитална грамотност",
      description: "Пълно ръководство за основни дигитални умения и безопасност онлайн.",
      image: { src: "/images/publications/guide1.jpg", alt: "Дигитално ръководство" },
      publishedAt: "2024-02-20T10:00:00Z",
      link: "/publications/digital-literacy-guide"
    }
  ];

  if (isLoading) {
    return <Loader />;
  }

  if (!initiative) {
    return (
      <div className="initiative-not-found">
        <h1>{t('initiatives.view.notFound', 'Инициативата не беше намерена')}</h1>
        <Link to="/initiatives" className="back-link">
          {t('initiatives.view.backToList', 'Назад към списъка')}
        </Link>
      </div>
    );
  }

  const { firstSentence, restSentences } = getDescriptionParts(initiative.shortDescription);

  return (
    <div className="initiative-view">
      {/* Hero Section */}
      <div className="initiative-hero">
        <div className="initiative-hero-image">
          <img 
            src={initiative.mainImage.src} 
            alt={initiative.mainImage.alt}
            className="hero-image"
          />
        </div>
        
        <div className="initiative-hero-content">
          <div className="initiative-header">
            <h1 className="initiative-title">{initiative.title}</h1>
            
            <div className="initiative-description">
              <p className="first-sentence">{firstSentence}</p>
              
              {/* Navigation Links */}
              <div className="initiative-nav">
                <a href="#sections" className="nav-link">
                  <span className="nav-icon">📖</span>
                  {t('initiatives.view.stories', 'Stories')}
                </a>
                <a href="#projects" className="nav-link">
                  <span className="nav-icon">🚀</span>
                  {t('initiatives.view.projects', 'Projects')}
                </a>
                <a href="#contact" className="nav-link">
                  <span className="nav-icon">📞</span>
                  {t('initiatives.view.contact', 'Contact')}
                </a>
              </div>
              
              {restSentences && (
                <p className="rest-sentences">{restSentences}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="initiative-content">
        {/* Sections */}
        {initiative.sections && initiative.sections.length > 0 && (
          <section id="sections" className="initiative-sections">
            <h2 className="section-title">
              {t('initiatives.view.aboutInitiative', 'За инициативата')}
            </h2>
            
            <div className="sections-grid">
              {initiative.sections.map((section, index) => (
                <div key={index} className="content-section">
                  <div className="section-content">
                    <h3 className="section-heading">{section.title}</h3>
                    <p className="section-text">{section.content}</p>
                  </div>
                  
                  {section.image && (
                    <div className="section-image">
                      <img 
                        src={section.image.src} 
                        alt={section.image.alt}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Download Materials */}
        {initiative.downloadMaterials && initiative.downloadMaterials.length > 0 && (
          <section className="download-materials">
            <h2 className="section-title">
              {t('initiatives.view.downloadMaterials', 'Материали за изтегляне')}
            </h2>
            
            <div className="materials-grid">
              {initiative.downloadMaterials.map((material) => (
                <div key={material.id} className="material-card">
                  <div className="material-preview">
                    {material.image ? (
                      <img src={material.image.src} alt={material.image.alt} />
                    ) : (
                      <div className="material-icon">
                        {material.fileType === 'pdf' ? '📄' : '📁'}
                      </div>
                    )}
                  </div>
                  
                  <div className="material-info">
                    <h3 className="material-title">{material.title}</h3>
                    <p className="material-description">{material.description}</p>
                    
                    <div className="material-meta">
                      <span className="file-type">{material.fileType.toUpperCase()}</span>
                      <span className="file-size">{material.fileSize}</span>
                    </div>
                    
                    <a 
                      href={material.downloadUrl} 
                      className="download-btn"
                      download
                    >
                      <span className="download-icon">⬇️</span>
                      {t('initiatives.view.download', 'Изтегли')}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Stories & Publications */}
        <StoriesPublications 
          stories={mockStories} 
          publications={mockPublications} 
        />

        {/* Projects Map */}
        {initiative.projects && initiative.projects.length > 0 && (
          <section id="projects" className="projects-section">
            <h2 className="section-title">
              {t('initiatives.view.projectsOnMap', 'Проекти на картата')}
            </h2>
            
            {/* Картата ще покаже проектите вместо инициативи */}
            <InitiativesMap
              initiatives={[initiative]} // Показваме само тази инициатива
              hideMapToggle={true} // Скриваме toggle бутона
            />
          </section>
        )}

        {/* Projects Grid */}
        {initiative.projects && initiative.projects.length > 0 && (
          <section className="projects-grid-section">
            <h2 className="section-title">
              {t('initiatives.view.projectsOverview', 'Преглед на проектите')}
            </h2>
            
            <div className="projects-grid">
              {initiative.projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </section>
        )}

        {/* Contact Section - Заместено с компонент */}
     {(initiative.contact || initiative.additionalContacts) && (
  <ContactSection 
    contact={initiative.contact}
    additionalContacts={initiative.additionalContacts}
  />
)}
      </div>
    </div>
  );
};