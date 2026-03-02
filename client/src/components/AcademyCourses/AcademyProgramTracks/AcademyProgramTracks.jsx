// src/components/AcademyCourses/AcademyProgramTracks/AcademyProgramTracks.jsx

import { useTranslation } from 'react-i18next';
import './academyProgramTracks.css';

export const AcademyProgramTracks = ({ programs = [], selectedProgram, onProgramSelect }) => {
  const { t } = useTranslation('academy');

  return (
    <div className="academyProgramTracks">
      <div className="academyProgramTracks-grid">
        {programs.map((program, index) => (
          <article 
            key={program.id || index}
            className={`academyProgramTracks-card ${selectedProgram === program.slug ? 'is-active' : ''}`}
            style={{ 
              '--program-color': program.primary,
              '--program-gradient': program.gradient,
              '--animation-delay': `${index * 0.1}s`
            }}
            onClick={() => onProgramSelect(program.slug)}
          >
            {/* Glow Effect */}
            <div className="academyProgramTracks-card-glow"></div>
            
            {/* Background Pattern */}
            <div className="academyProgramTracks-card-pattern"></div>

            {/* Content */}
            <div className="academyProgramTracks-card-content">
              {/* Icon */}
              <div className="academyProgramTracks-card-icon">
                <span className="academyProgramTracks-card-icon-emoji">{program.icon}</span>
                <div className="academyProgramTracks-card-icon-ring"></div>
              </div>

              {/* Text */}
              <div className="academyProgramTracks-card-text">
                <h3 className="academyProgramTracks-card-title">{program.name}</h3>
                <p className="academyProgramTracks-card-count">
                  {program.courseCount} {program.courseCount === 1 
                    ? t('academyProgramTracks.course') 
                    : t('academyProgramTracks.courses')
                  }
                </p>
              </div>

              {/* Arrow */}
              <div className="academyProgramTracks-card-arrow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>
            </div>

            {/* Bottom Accent */}
            <div className="academyProgramTracks-card-accent"></div>
          </article>
        ))}
      </div>
    </div>
  );
};