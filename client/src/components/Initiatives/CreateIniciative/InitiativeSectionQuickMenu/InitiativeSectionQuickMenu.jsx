import { faChevronDown, faChevronUp, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import './initiativeSectionQuickMenu.css';
import { useTranslation } from 'react-i18next';

export const InitiativeSectionQuickMenu = ({
  sectionIndex,
  totalSections,
  onAddSection,
  onMoveUp,
  onMoveDown,
  onRemove
}) => {
  const { t } = useTranslation();

  return (
    <div className="initiative-quick-menu">
      <div className="initiative-quick-menu-header">
        <span className="menu-title">Секция {sectionIndex + 1}</span>
      </div>
      
      <div className="initiative-quick-buttons">
        <button
          type="button"
          className="initiative-quick-btn add-btn-initiative"
          onClick={onAddSection}
          title="Добави нова секция"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span className="btn-tooltip">Добави</span>
        </button>

        <button
          type="button"
          className="initiative-quick-btn move-btn-initiative up-btn"
          onClick={() => onMoveUp(sectionIndex)}
          disabled={sectionIndex === 0}
          title="Премести нагоре"
        >
          <FontAwesomeIcon icon={faChevronUp} />
          <span className="btn-tooltip">Нагоре</span>
        </button>

        <button
          type="button"
          className="initiative-quick-btn move-btn-initiative down-btn-initiative"
          onClick={() => onMoveDown(sectionIndex)}
          disabled={sectionIndex === totalSections - 1}
          title="Премести надолу"
        >
          <FontAwesomeIcon icon={faChevronDown} />
          <span className="btn-tooltip">Надолу</span>
        </button>

        {totalSections > 1 && (
          <button
            type="button"
            className="initiative-quick-btn delete-btn-initiative"
            onClick={() => onRemove(sectionIndex)}
            title="Премахни секция"
          >
            <FontAwesomeIcon icon={faTrash} />
            <span className="btn-tooltip">Изтрий</span>
          </button>
        )}
      </div>
      
      <div className="menu-indicator">
        <div className="indicator-line"></div>
        <div className="indicator-dot"></div>
      </div>
    </div>
  );
};