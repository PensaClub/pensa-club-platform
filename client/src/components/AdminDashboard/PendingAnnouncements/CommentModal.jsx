import './commentModal.css';

export const CommentModal = ({ isOpen, onClose, onSubmit, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay-admin">
      <div className="modal-content-admin">
        <button className="modal-close-admin" onClick={onClose}>
          &times;
        </button>
        {children}
        <button className="modal-submit-admin" onClick={onSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
};
