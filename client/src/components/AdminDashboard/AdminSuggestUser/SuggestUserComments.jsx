import './suggestUserComments.css';
import { useTranslation } from 'react-i18next';

export const SuggestUserComments = ({ isOpen, onClose, onSubmit, comments, comment, setComment, error,setError }) => {
  const { t } = useTranslation('auth');

  if (!isOpen) return null;
  return (
    <div className="modal-overlay-admin">
      <div className="modal-content-admin">
        <button className="modal-close-admin" onClick={onClose}>
          &times;
        </button>
        <h2>{t('user-suggestion.comments')}</h2>

        <div className="comments-section">
          {comments?.length > 0 ? (
            <ul className="comments-list">
              {comments.map((cmt, index) => (
                <li key={index}>
                  <div>
                    <strong>{t('user-suggestion.date')}:</strong> {cmt?.date}
                  </div>
                  <div>
                    <strong>{t('user-suggestion.comment')}:</strong> {cmt?.comment}  
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>{t('user-suggestion.no_comments_yet')}</p>
          )}
        </div>
        <div className="new-comment-section">
          <h2>{t('user-suggestion.add_new_comment')}</h2>
          <textarea
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              setError(''); 
            }}
            rows="5"
            cols="50"
          />
          {error && <p className="error-text">{error}</p>} 
        </div>
        <button className="modal-submit-admin" onClick={onSubmit}>
          {t('user-suggestion.submit')}
        </button>
      </div>
    </div>
  );
};
