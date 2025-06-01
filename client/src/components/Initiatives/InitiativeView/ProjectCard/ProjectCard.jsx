import { truncateText } from '../../../../utils/truncateText';
import './projectCard.css';
import { useTranslation } from 'react-i18next';

export const ProjectCard = ({ project }) => {
  const { t } = useTranslation();

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'in-progress': return '#f59e0b';
      case 'planned': return '#6b7280';
      case 'completed': return '#1B8B8A';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return t('initiatives.projects.statusActive');
      case 'in-progress': return t('initiatives.projects.statusInProgress');
      case 'planned': return t('initiatives.projects.statusPlanned', );
      case 'completed': return t('initiatives.projects.statusCompleted');
      default: return status;
    }
  };

  return (
    <div className="project-card">
      {project.image && (
        <div className="project-image">
          <img src={project.image} alt={project.title} />
          <div 
            className="project-status-badge" 
            style={{ backgroundColor: getStatusColor(project.status) }}
          >
            {getStatusLabel(project.status)}
          </div>
        </div>
      )}
      
      <div className="project-content">
        <h3 className="project-title">
          <a href={project.link} className="project-link">
            {project.title}
          </a>
        </h3>
        
        <p className="project-description">
          {truncateText(project.description,80)}
        </p>
        
        <a href={project.link} className="project-read-more">
          <span className="project-arrow">→</span>
          {t('initiatives.projects.learnMore')}
        </a>
      </div>
    </div>
  );
};