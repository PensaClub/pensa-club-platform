// components/MainImageGalleryItem.jsx
import { memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { useDebouncedInput } from '../../../hooks/useDebouncedInput';

const MainImageGalleryItem = memo(({ 
  img, 
  index, 
  onAltChange, 
  onCaptionChange, 
  onSetMain,
  onRemove 
}) => {
  const [localAlt, setLocalAlt] = useDebouncedInput(
    img.alt, 
    (value) => onAltChange(index, value),
    300
  );

  const [localCaption, setLocalCaption] = useDebouncedInput(
    img.caption, 
    (value) => onCaptionChange(index, value),
    300
  );

  return (
    <div className="initiative-create-gallery-item">
      <img src={img.src} alt={img.alt || `Gallery ${index + 1}`} />

      <div className="initiative-create-gallery-controls">
        <input
          type="text"
          placeholder="Alt текст"
          value={localAlt}
          onChange={(e) => setLocalAlt(e.target.value)}
          className="initiative-create-gallery-input"
        />

        <input
          type="text"
          placeholder="Caption"
          value={localCaption}
          onChange={(e) => setLocalCaption(e.target.value)}
          className="initiative-create-gallery-input"
        />

        <button
          type="button"
          onClick={() => onSetMain(index)}
          className="initiative-create-set-main-btn"
        >
          Задай като главна
        </button>

        <button
          type="button"
          onClick={() => onRemove(index)}
          className="initiative-create-remove-img-btn"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
    </div>
  );
});

export default MainImageGalleryItem;