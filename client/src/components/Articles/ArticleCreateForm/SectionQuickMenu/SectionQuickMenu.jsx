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
  const { t } = useTranslation();

  return (
    <div className="left-quick-menu">

      <button
        type="button"
        className="quick-btn add-btn"
        onClick={onAddSection}
        title={t('articles.sectionMenu.addSection')}
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>

      <button
        type="button"
        className="quick-btn arrow-up-btn"
        onClick={() => onMoveUp(sectionIndex)}
        disabled={sectionIndex === 0}
        title={t('articles.sectionMenu.moveUp')}
      >
        <FontAwesomeIcon icon={faChevronUp} />
      </button>

      <button
        type="button"
        className="quick-btn arrow-down-btn"
        onClick={() => onMoveDown(sectionIndex)}
        disabled={sectionIndex === totalSections - 1}
        title={t('articles.sectionMenu.moveDown')}
      >
        <FontAwesomeIcon icon={faChevronDown} />
      </button>

      {totalSections > 1 && (
        <button
          type="button"
          className="quick-btn delete-btn"
          onClick={() => onRemove(sectionIndex)}
          title={t('articles.sectionMenu.removeSection')}
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      )}
    </div>
  );
};
