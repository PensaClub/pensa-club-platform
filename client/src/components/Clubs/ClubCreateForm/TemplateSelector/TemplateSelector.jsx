import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheck, 
  faInfo, 
  faEye,
  faStar,
  faChevronRight,
  faImage,
  faExclamationCircle,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { getAllTemplates, getTemplateById } from '../data/clubTemplates';
import './templateSelector.css';

const TemplateSelector = ({ selectedTemplate, onTemplateChange, disabled = false }) => {
  const { t } = useTranslation();
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  
  const templates = getAllTemplates();

  const handleTemplateSelect = (templateId) => {
    if (!disabled) {
      onTemplateChange(templateId);
    }
  };

  const handlePreview = (templateId, event) => {
    event.stopPropagation();
    setPreviewTemplate(templateId);
  };

  const closePreview = () => {
    setPreviewTemplate(null);
  };

  const handleImageError = (templateId) => {
    setImageErrors(prev => ({ ...prev, [templateId]: true }));
  };

  const getDifficultyInfo = (difficulty) => {
    const difficulties = {
      easy: {
        label: t('clubForm.template.difficulty.easy'),
        color: '#22c55e',
        description: t('clubForm.template.difficulty.easyDesc')
      },
      medium: {
        label: t('clubForm.template.difficulty.medium'),
        color: '#f59e0b',
        description: t('clubForm.template.difficulty.mediumDesc')
      },
      hard: {
        label: t('clubForm.template.difficulty.hard'),
        color: '#ef4444',
        description: t('clubForm.template.difficulty.hardDesc')
      }
    };
    return difficulties[difficulty] || difficulties.easy;
  };

  return (
    <div className="template-selector">
      <div className="template-selector-header">
        <h3 className="template-selector-title">
          {t('clubForm.template.title')}
        </h3>
        <p className="template-selector-subtitle">
          {t('clubForm.template.subtitle')}
        </p>
      </div>

      <div className="template-grid">
        {templates.map((template) => {
          const isSelected = selectedTemplate === template.id;
          const difficultyInfo = getDifficultyInfo(template.difficulty);
          const hasImageError = imageErrors[template.id];

          return (
            <div
              key={template.id}
              className={`template-card ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
              onClick={() => handleTemplateSelect(template.id)}
            >
              {/* Recommended badge */}
              {template.recommended && (
                <div className="template-recommended-badge">
                  <FontAwesomeIcon icon={faStar} />
                  {t('clubForm.template.recommended')}
                </div>
              )}

              {/* Template preview image */}
              <div className="template-preview">
                {!hasImageError ? (
                  <img
                    src={template.thumbnail}
                    alt={t('clubForm.template.previewAlt', { name: template.name })}
                    onError={() => handleImageError(template.id)}
                    loading="lazy"
                  />
                ) : (
                  <div className="template-preview-fallback">
                    <FontAwesomeIcon icon={faImage} />
                    <span>{t('clubForm.template.noPreview')}</span>
                  </div>
                )}
                
                {/* Preview overlay */}
                <div className="template-preview-overlay">
                  <button
                    className="template-preview-btn"
                    onClick={(e) => handlePreview(template.id, e)}
                    title={t('clubForm.template.viewPreview')}
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                </div>
              </div>

              {/* Template info */}
              <div className="template-info">
                <div className="template-header">
                  <h4 className="template-name" style={{ color: template.color }}>
                    {template.name}
                  </h4>
                  <div className="template-selection-indicator">
                    {isSelected && (
                      <div 
                        className="template-check"
                        style={{ background: template.gradient }}
                      >
                        <FontAwesomeIcon icon={faCheck} />
                      </div>
                    )}
                  </div>
                </div>

                <p className="template-description">
                  {template.description}
                </p>

                {/* Difficulty badge */}
                <div className="template-difficulty">
                  <span 
                    className="template-difficulty-badge"
                    style={{ 
                      background: `${difficultyInfo.color}20`,
                      color: difficultyInfo.color,
                      borderColor: difficultyInfo.color
                    }}
                  >
                    {difficultyInfo.label}
                  </span>
                </div>

                {/* Features list */}
                <div className="template-features">
                  <h5 className="template-features-title">
                    {t('clubForm.template.features')}:
                  </h5>
                  <ul className="template-features-list">
                    {template.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="template-feature">
                        <FontAwesomeIcon icon={faCheck} className="template-feature-icon" />
                        {feature}
                      </li>
                    ))}
                    {template.features.length > 3 && (
                      <li className="template-feature-more">
                        +{template.features.length - 3} {t('clubForm.template.moreFeatures')}
                      </li>
                    )}
                  </ul>
                </div>

                {/* Select button */}
                <button
                  className={`template-select-btn ${isSelected ? 'selected' : ''}`}
                  style={{ 
                    background: isSelected ? template.gradient : 'transparent',
                    borderColor: template.color,
                    color: isSelected ? 'white' : template.color
                  }}
                  disabled={disabled}
                >
                  {isSelected ? (
                    <>
                      <FontAwesomeIcon icon={faCheck} />
                      {t('clubForm.template.selected')}
                    </>
                  ) : (
                    <>
                      {t('clubForm.template.select')}
                      <FontAwesomeIcon icon={faChevronRight} />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Template preview modal */}
      {previewTemplate && (
        <div className="template-preview-modal">
          <div className="template-preview-overlay-modal" onClick={closePreview}></div>
          <div className="template-preview-container">
            <button className="template-preview-close" onClick={closePreview}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="template-preview-content">
              {(() => {
                const template = getTemplateById(previewTemplate);
                const hasImageError = imageErrors[previewTemplate];
                
                return (
                  <>
                    <div className="template-preview-image">
                      {!hasImageError ? (
                        <img
                          src={template.preview}
                          alt={t('clubForm.template.previewAlt', { name: template.name })}
                          onError={() => handleImageError(previewTemplate)}
                        />
                      ) : (
                        <div className="template-preview-image-fallback">
                          <FontAwesomeIcon icon={faImage} />
                          <h3>{template.name}</h3>
                          <p>{t('clubForm.template.noPreviewAvailable')}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="template-preview-info">
                      <h3 style={{ color: template.color }}>{template.name}</h3>
                      <p>{template.description}</p>
                      
                      <div className="template-preview-features">
                        <h4>{t('clubForm.template.allFeatures')}:</h4>
                        <ul>
                          {template.features.map((feature, index) => (
                            <li key={index}>
                              <FontAwesomeIcon icon={faCheck} />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        className="template-preview-select-btn"
                        style={{ background: template.gradient }}
                        onClick={() => {
                          handleTemplateSelect(template.id);
                          closePreview();
                        }}
                      >
                        {t('clubForm.template.selectThis')}
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Help section */}
      <div className="template-help">
        <div className="template-help-icon">
          <FontAwesomeIcon icon={faInfo} />
        </div>
        <div className="template-help-content">
          <h4>{t('clubForm.template.help.title')}</h4>
          <p>{t('clubForm.template.help.description')}</p>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;