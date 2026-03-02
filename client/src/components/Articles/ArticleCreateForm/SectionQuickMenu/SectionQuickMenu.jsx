import { faChevronDown, faChevronUp, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import './sectionQuickMenu.css';
import { useTranslation } from 'react-i18next';

export const SectionQuickMenu = ({
  sectionIndex,
  totalSections,
  onAddSection,
  onMoveUp,
  onMoveDown,
  onRemove
}) => {
  const { t } = useTranslation('content');

  return (
    <div className="sqm-bar">
      <span className="sqm-badge">{sectionIndex + 1}</span>

      <div className="sqm-divider" />

      <button
        type="button"
        className="sqm-btn sqm-btn--add"
        onClick={onAddSection}
        title={t('articles.sectionMenu.addSection')}
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>

      <button
        type="button"
        className="sqm-btn sqm-btn--up"
        onClick={() => onMoveUp(sectionIndex)}
        disabled={sectionIndex === 0}
        title={t('articles.sectionMenu.moveUp')}
      >
        <FontAwesomeIcon icon={faChevronUp} />
      </button>

      <button
        type="button"
        className="sqm-btn sqm-btn--down"
        onClick={() => onMoveDown(sectionIndex)}
        disabled={sectionIndex === totalSections - 1}
        title={t('articles.sectionMenu.moveDown')}
      >
        <FontAwesomeIcon icon={faChevronDown} />
      </button>

      {totalSections > 1 && (
        <>
          <div className="sqm-divider" />
          <button
            type="button"
            className="sqm-btn sqm-btn--delete"
            onClick={() => onRemove(sectionIndex)}
            title={t('articles.sectionMenu.removeSection')}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </>
      )}
    </div>
  );
};
