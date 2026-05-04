// UsefulLinksSection — prefix `.aul-`, namespace 'content'.
//
// Container component that owns the list of useful-link rows and forwards
// CRUD actions to the parent (which is wired to the useCreateArticle hook).
// The actual row UI + metadata fetching lives in UsefulLinkRow; image
// picking lives in UsefulLinkImagePicker.

import { useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import UsefulLinkRow from './UsefulLinkRow/UsefulLinkRow';
import './usefulLinksSection.css';

const UsefulLinksSection = ({
  usefulLinks,
  onAdd,
  onUpdate,
  onRemove,
  onReorder,
}) => {
  const { t } = useTranslation('content');

  const list = Array.isArray(usefulLinks) ? usefulLinks : [];

  const handleMoveUp = useCallback((index) => {
    if (index <= 0) return;
    onReorder?.(index, index - 1);
  }, [onReorder]);

  const handleMoveDown = useCallback((index) => {
    if (index >= list.length - 1) return;
    onReorder?.(index, index + 1);
  }, [onReorder, list.length]);

  return (
    <div className="aul-wrapper">
      <p className="aul-subtitle">{t('usefulLinks.subtitle')}</p>

      <div className="aul-list">
        {list.length === 0 ? (
          <div className="aul-empty">{t('usefulLinks.empty')}</div>
        ) : (
          list.map((link, index) => (
            <UsefulLinkRow
              key={index}
              link={link}
              index={index}
              total={list.length}
              onUpdate={(partial) => onUpdate?.(index, partial)}
              onRemove={() => onRemove?.(index)}
              onMoveUp={() => handleMoveUp(index)}
              onMoveDown={() => handleMoveDown(index)}
            />
          ))
        )}
      </div>

      <div className="aul-add-row">
        <button type="button" className="aul-add-btn" onClick={onAdd}>
          <FontAwesomeIcon icon={faPlus} />
          {t('usefulLinks.addBtn')}
        </button>
      </div>
    </div>
  );
};

export default UsefulLinksSection;
