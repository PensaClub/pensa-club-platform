import { faChevronDown, faChevronUp, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import './sectionQuickMenu.css';

export const SectionQuickMenu = ({ 
  sectionIndex, 
  totalSections, 
  onAddSection, 
  onMoveUp, 
  onMoveDown, 
  onRemove 
}) => {
  return (
    <div className="left-quick-menu">

      <button
        type="button"
        className="quick-btn add-btn"
        onClick={onAddSection}
        title="Добави нова секция"
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>

      <button
        type="button"
        className="quick-btn arrow-up-btn"
        onClick={() => onMoveUp(sectionIndex)}
        disabled={sectionIndex === 0}
        title="Премести нагоре"
      >
        <FontAwesomeIcon icon={faChevronUp} />
      </button>

      <button
        type="button"
        className="quick-btn arrow-down-btn"
        onClick={() => onMoveDown(sectionIndex)}
        disabled={sectionIndex === totalSections - 1}
        title="Премести надолу"
      >
        <FontAwesomeIcon icon={faChevronDown} />
      </button>

      {totalSections > 1 && (
        <button
          type="button"
          className="quick-btn delete-btn"
          onClick={() => onRemove(sectionIndex)}
          title="Премахни секцията"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      )}
    </div>
  );
};