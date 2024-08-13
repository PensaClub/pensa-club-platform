import { useTranslation } from 'react-i18next';
import './commentModal.css';

export const CommentModal = ({ isOpen, onClose, onSubmit, children }) => {
  const {t} = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="modal-overlay-admin">
      <div className="modal-content-admin">
        <button className="modal-close-admin" onClick={onClose}>
          &times;
        </button>
        {children}
        <button className="modal-submit-admin" onClick={onSubmit}>
          {t('admin.submit')}
        </button>
      </div>
    </div>
  );
};