
import { memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { useDebouncedInput } from '../../../hooks/useDebouncedInput';

const SectionImageItem = memo(({ 
  img, 
  sectionIndex,
  imageIndex, 
  onAltChange, 
  onCaptionChange, 
  onRemove 
}) => {
  const [localAlt, setLocalAlt] = useDebouncedInput(
    img.alt, 
    (value) => onAltChange(sectionIndex, imageIndex, value),
    300
  );

  const [localCaption, setLocalCaption] = useDebouncedInput(
    img.caption, 
    (value) => onCaptionChange(sectionIndex, imageIndex, value),
    300
  );

  return (
    <div className="section-image-item">
      <div className="section-image-header">
        <span className="section-image-number">#{imageIndex + 1}</span>
      </div>
      <img src={img.src} alt={img.alt || `Section image ${imageIndex + 1}`} />

      <div className="section-image-controls">
        <input
          type="text"
          placeholder="Alt текст"
          value={localAlt}
          onChange={(e) => setLocalAlt(e.target.value)}
          className="section-image-input"
        />

        <input
          type="text"
          placeholder="Caption"
          value={localCaption}
          onChange={(e) => setLocalCaption(e.target.value)}
          className="section-image-input"
        />

        <button
          type="button"
          onClick={() => onRemove(sectionIndex, imageIndex)}
          className="section-remove-image-btn"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
    </div>
  );
});

export default SectionImageItem;