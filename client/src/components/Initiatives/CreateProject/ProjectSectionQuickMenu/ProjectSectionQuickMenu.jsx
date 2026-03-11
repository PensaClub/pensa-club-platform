import { useEffect, useRef, useState, useCallback } from 'react';
import { faChevronDown, faChevronUp, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import './projectSectionQuickMenu.css';
import { useTranslation } from 'react-i18next';

export const ProjectSectionQuickMenu = ({
  sectionIndex,
  totalSections,
  onAddSection,
  onMoveUp,
  onMoveDown,
  onRemove
}) => {
  const { t } = useTranslation('content');
  const barRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0, visible: false });

  const updatePosition = useCallback(() => {
    const sectionItems = document.querySelectorAll('.project-sections-item');
    const activeItem = sectionItems[sectionIndex];
    if (!activeItem || !barRef.current) return;

    const rect = activeItem.getBoundingClientRect();
    const barHeight = barRef.current.offsetHeight;
    const barWidth = barRef.current.offsetWidth;

    // Vertically center on the active section
    const top = rect.top + rect.height / 2 - barHeight / 2;
    // To the left of the section
    const left = rect.left - barWidth - 12;

    setPosition({ top, left: Math.max(4, left), visible: true });
  }, [sectionIndex]);

  useEffect(() => {
    updatePosition();

    window.addEventListener('scroll', updatePosition, { passive: true });
    window.addEventListener('resize', updatePosition, { passive: true });

    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [updatePosition]);

  if (totalSections === 0) return null;

  return (
    <div
      ref={barRef}
      className="psqm-bar"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        opacity: position.visible ? 1 : 0
      }}
    >
      <span className="psqm-badge">{sectionIndex + 1}</span>

      <div className="psqm-divider" />

      <button
        type="button"
        className="psqm-btn psqm-btn--add"
        onClick={onAddSection}
        title={t('projects.create.addSection')}
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>

      <button
        type="button"
        className="psqm-btn psqm-btn--up"
        onClick={() => onMoveUp(sectionIndex)}
        disabled={sectionIndex === 0}
        title={t('projects.create.moveUp')}
      >
        <FontAwesomeIcon icon={faChevronUp} />
      </button>

      <button
        type="button"
        className="psqm-btn psqm-btn--down"
        onClick={() => onMoveDown(sectionIndex)}
        disabled={sectionIndex === totalSections - 1}
        title={t('projects.create.moveDown')}
      >
        <FontAwesomeIcon icon={faChevronDown} />
      </button>

      {totalSections > 1 && (
        <>
          <div className="psqm-divider" />
          <button
            type="button"
            className="psqm-btn psqm-btn--delete"
            onClick={() => onRemove(sectionIndex)}
            title={t('projects.create.removeSection')}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </>
      )}
    </div>
  );
};
