import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import './projectView.css';
import { useInitiativeContext } from '../../../contexts/InitiativeProvider';
import { useAuthContext } from '../../../contexts/UserContext';
import { BookmarkIcon } from '../../Icons/InitiativeIcons';
import { StoriesPublications } from '../StoriesPublications/StoriesPublications';
import { Comments } from '../Comments/Comments';

export const ProjectView = () => {
  const { slug } = useParams();
  const { t } = useTranslation();
  const { 
    getProjectById, 
    currentProject, 
    isLoading,
    getProjectComments, // Запазваме само за навигацията
    applyToProject,
    isBookmarked,
    toggleBookmark
  } = useInitiativeContext();
  
  const { isAuthentication } = useAuthContext();
  const [activeSection, setActiveSection] = useState('overview');
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  // Запазваме само за навигацията - брой коментари
  const [commentsCount, setCommentsCount] = useState(0);

  useEffect(() => {
    if (slug) {
      getProjectById(slug);
    }
  }, [slug, getProjectById]);

  // Зареждаме само броя коментари за навигацията
  useEffect(() => {
    if (currentProject) {
      loadCommentsCount();
    }
  }, [currentProject]);
useEffect(() => {
    const navLinks = document.querySelector('.project-view-nav-links');
    if (!navLinks) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    const handleMouseDown = (e) => {
        isDown = true;
        navLinks.style.cursor = 'grabbing';
        startX = e.pageX - navLinks.offsetLeft;
        scrollLeft = navLinks.scrollLeft;
    };

    const handleMouseLeave = () => {
        isDown = false;
        navLinks.style.cursor = 'grab';
    };

    const handleMouseUp = () => {
        isDown = false;
        navLinks.style.cursor = 'grab';
    };

    const handleMouseMove = (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - navLinks.offsetLeft;
        const walk = (x - startX) * 1; // Колко бързо да скролира
        navLinks.scrollLeft = scrollLeft - walk;
    };

    navLinks.addEventListener('mousedown', handleMouseDown);
    navLinks.addEventListener('mouseleave', handleMouseLeave);
    navLinks.addEventListener('mouseup', handleMouseUp);
    navLinks.addEventListener('mousemove', handleMouseMove);

    return () => {
        navLinks.removeEventListener('mousedown', handleMouseDown);
        navLinks.removeEventListener('mouseleave', handleMouseLeave);
        navLinks.removeEventListener('mouseup', handleMouseUp);
        navLinks.removeEventListener('mousemove', handleMouseMove);
    };
}, [currentProject]);
  const loadCommentsCount = async () => {
    if (currentProject) {
      try {
        const projectComments = await getProjectComments(currentProject.id);
        setCommentsCount(projectComments.length);
      } catch (error) {
        console.error('Error loading comments count:', error);
        setCommentsCount(0);
      }
    }
  };

  // Callback функция за обновяване на броя коментари
  const handleCommentsChange = (newCount) => {
    setCommentsCount(newCount);
  };

  const handleApplicationSubmit = async (applicationData) => {
    try {
      await applyToProject(currentProject.id, applicationData);
      setShowApplicationForm(false);
    } catch (error) {
      console.error('Application failed:', error);
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  if (isLoading || !currentProject) {
    return <div className="project-view-loading">Loading...</div>;
  }

  const canApply = currentProject.applicationStatus === 'open' && 
                   currentProject.currentParticipants < currentProject.maxParticipants;

  return (
    <div className="project-view-container">
      {/* Hero Section */}
      <section className="project-view-hero">
        <div className="project-view-hero-background">
          <img 
            src={currentProject.mainImage.src} 
            alt={currentProject.mainImage.alt}
            className="project-view-hero-image"
          />
          <div className="project-view-hero-overlay"></div>
        </div>
        
        <div className="project-view-hero-content">
          <div className="container">
            {/* Breadcrumb */}
            <div className="project-view-breadcrumb">
              <Link to="/initiatives" className="project-view-breadcrumb-link">
                Инициативи
              </Link>
              <span className="project-view-breadcrumb-separator">›</span>
              <Link 
                to={`/initiatives/${currentProject.initiativeSlug}`}
                className="project-view-breadcrumb-link"
              >
                Връщане към инициативата
              </Link>
              <span className="project-view-breadcrumb-separator">›</span>
              <span className="project-view-breadcrumb-current">{currentProject.title}</span>
            </div>

            <div className="project-view-hero-main">
              <div className="project-view-hero-text">
                <div className="project-view-badges">
                  <span className={`project-view-status ${currentProject.status}`}>
                    {currentProject.status}
                  </span>
                  <span className={`project-view-priority ${currentProject.priority}`}>
                    {currentProject.priority} приоритет
                  </span>
                </div>

                <h1 className="project-view-title">{currentProject.title}</h1>
                <p className="project-view-description">{currentProject.fullDescription}</p>

                <div className="project-view-meta">
                  <div className="project-view-meta-item">
                    <span className="project-view-meta-label">Категория:</span>
                    <span className="project-view-meta-value">{currentProject.category}</span>
                  </div>
                  <div className="project-view-meta-item">
                    <span className="project-view-meta-label">Локация:</span>
                    <span className="project-view-meta-value">{currentProject.location.address}</span>
                  </div>
                  <div className="project-view-meta-item">
                    <span className="project-view-meta-label">Участници:</span>
                    <span className="project-view-meta-value">
                      {currentProject.currentParticipants} / {currentProject.maxParticipants}
                    </span>
                  </div>
                </div>

                <div className="project-view-actions">
                  {isAuthentication && canApply && (
                    <button 
                      className="project-view-btn-apply"
                      onClick={() => setShowApplicationForm(true)}
                    >
                      Кандидатствай
                    </button>
                  )}
                  
                  <button 
                    className={`project-view-btn-bookmark ${isBookmarked(currentProject.id) ? 'bookmarked' : ''}`}
                    onClick={() => toggleBookmark(currentProject.id)}
                  >
                    <BookmarkIcon />
                    Запази
                  </button>
                </div>
              </div>

              <div className="project-view-stats-card">
                <div className="project-view-stats-item">
                  <div className="project-view-stats-number">
                    {Math.round((currentProject.budget.funded / currentProject.budget.total) * 100)}%
                  </div>
                  <div className="project-view-stats-label">Финансирано</div>
                </div>
                <div className="project-view-stats-item">
                  <div className="project-view-stats-number">{currentProject.timeline.estimatedDuration}</div>
                  <div className="project-view-stats-label">Продължителност</div>
                </div>
                <div className="project-view-stats-item">
                  <div className="project-view-stats-number">{currentProject.team.length}</div>
                  <div className="project-view-stats-label">Екип</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <nav className="project-view-nav">
        <div className="container">
          <div className="project-view-nav-links">
            {currentProject.sections?.map((section) => (
              <button
                key={section.titleSlug}
                className={`project-view-nav-link ${activeSection === section.titleSlug ? 'active' : ''}`}
                onClick={() => scrollToSection(section.titleSlug)}
              >
                {section.title}
              </button>
            ))}
            
            {currentProject.publications?.length > 0 && (
              <button
                className={`project-view-nav-link ${activeSection === 'publications' ? 'active' : ''}`}
                onClick={() => scrollToSection('publications')}
              >
                Публикации
              </button>
            )}
            
            <button
              className={`project-view-nav-link ${activeSection === 'team' ? 'active' : ''}`}
              onClick={() => scrollToSection('team')}
            >
              Екип
            </button>
            
            <button
              className={`project-view-nav-link ${activeSection === 'comments' ? 'active' : ''}`}
              onClick={() => scrollToSection('comments')}
            >
              Коментари ({commentsCount})
            </button>
          </div>
        </div>
      </nav>

      {/* Content Sections */}
      <div className="project-view-content">
        <div className="container">
          {/* Project Sections */}
          {currentProject.sections?.map((section, index) => (
            <section 
              key={section.titleSlug}
              id={section.titleSlug}
              className={`project-view-section ${index % 2 === 0 ? 'project-view-section-left' : 'project-view-section-right'}`}
            >
              <div className="project-view-section-content">
                <div className="project-view-section-text">
                  <h2 className="project-view-section-title">{section.title}</h2>
                  <div className="project-view-section-description">
                    {section.content}
                  </div>
                </div>
                <div className="project-view-section-image">
                  <img 
                    src={section.image.src} 
                    alt={section.image.alt}
                  />
                </div>
              </div>
            </section>
          ))}

          {/* Publications */}
          {currentProject.publications?.length > 0 && (
            <section id="publications" className="project-view-section project-view-publications-section">
              <h2 className="project-view-section-title">Публикации</h2>
              <StoriesPublications 
                stories={[]}
                publications={currentProject.publications}
                showViewAll={false}
              />
            </section>
          )}

          {/* Team Section */}
          <section id="team" className="project-view-section project-view-team-section">
            <h2 className="project-view-section-title">Екип</h2>
            <div className="project-view-team-grid">
              {currentProject.team.map((member, index) => (
                <div key={index} className="project-view-team-member">
                  <div className="project-view-member-image">
                    <img src={member.image} alt={member.name} />
                  </div>
                  <div className="project-view-member-info">
                    <h3 className="project-view-member-name">{member.name}</h3>
                    <p className="project-view-member-position">{member.position}</p>
                    <div className="project-view-member-contact">
                      <a href={`mailto:${member.email}`} className="project-view-contact-link">
                        {member.email}
                      </a>
                      <a href={`tel:${member.phone}`} className="project-view-contact-link">
                        {member.phone}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Comments Section */}
          <section id="comments" className="project-view-section project-view-comments-section">
            <Comments
              entityId={currentProject.id}
              entityType="project"
              commentsEnabled={currentProject.commentsEnabled}
              onCommentsChange={handleCommentsChange}
            />
          </section>
        </div>
      </div>

      {/* Application Modal */}
      {/* {showApplicationForm && (
        <ApplicationForm
          project={currentProject}
          onSubmit={handleApplicationSubmit}
          onClose={() => setShowApplicationForm(false)}
        />
      )} */}
    </div>
  );
};