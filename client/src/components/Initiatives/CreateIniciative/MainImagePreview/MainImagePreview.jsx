// components/MainImagePreview.jsx - ОБНОВЕНО
import { memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { useDebouncedInput } from '../../../hooks/useDebouncedInput';

const MainImagePreview = memo(({ 
  mainImage, 
  onAltChange, 
  onCaptionChange,
  onRemove
}) => {
  const [localAlt, setLocalAlt] = useDebouncedInput(
    mainImage.alt, 
    onAltChange,
    300
  );

  const [localCaption, setLocalCaption] = useDebouncedInput(
    mainImage.caption, 
    onCaptionChange,
    300
  );

  return (
  <div className="initiative-create-main-image-preview">
      <div className="main-image-header">
        <span className="main-image-title">Главна снимка</span>
        <button
          type="button"
          onClick={onRemove}
          className="main-image-remove-btn"
          title="Изтрий главната снимка"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
      
      <img src={mainImage.src} alt="Main Preview" />
      <div className="image-fields">
        <input
          type="text"
          placeholder="Alt текст"
          value={localAlt}
          onChange={(e) => setLocalAlt(e.target.value)}
        />
        <input
          type="text"
          placeholder="Caption"
          value={localCaption}
          onChange={(e) => setLocalCaption(e.target.value)}
        />
      </div>
    </div>
  );
});

export default MainImagePreview;