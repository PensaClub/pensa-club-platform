
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../../contexts/UserContext';
import { useCommentForm } from '../../../hooks/useCommentForm';
import './commentForm.css';

export const CommentForm = ({
    onSubmit,
    onCancel,
    placeholder,
    isReply = false
}) => {
    const { t } = useTranslation('content');
    const { username, userEmail, profileData } = useAuthContext();

    const {
        content,
        isSubmitting,
        error,
        handleSubmit,
        handleCancel,
        handleContentChange,
        handleKeyDown,
        isValid
    } = useCommentForm(onSubmit, onCancel);

    // Получаваме име на потребителя
    const displayName = username || profileData?.details?.firstName || userEmail?.split('@')[0] || t('comments.form.defaultUser');

    const handleInputSubmit = (e) => {
        e.preventDefault();
        if (content.trim() && !isSubmitting) {
            handleSubmit(e);
        }
    };

    return (
        <div className={`initiative-comment-form ${isReply ? 'initiative-comment-form-reply' : ''}`}>
            <div className="initiative-comment-form-avatar">
                {profileData?.details?.imageURL ? (
                    <img src={profileData.details.imageURL} alt={displayName}
                        onError={(e) => {
                            e.target.src = "/images/homePage/user-it.png";
                        }}
                    />
                ) : (
                    <div className="initiative-comment-form-avatar-placeholder">
                        {displayName.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>

            <div className="initiative-comment-form-input-container">
                <form onSubmit={handleInputSubmit} className="initiative-comment-form-form">
                    <div className="initiative-comment-form-input-wrapper">
                        <textarea
                            value={content}
                            onChange={(e) => handleContentChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder || t('comments.form.placeholder')}
                            className="initiative-comment-form-textarea"
                            rows="1"
                            disabled={isSubmitting}
                            required
                        />

                        {content.trim() && (
                            <button
                                type="submit"
                                className="initiative-comment-form-send-btn"
                                disabled={isSubmitting || !isValid}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {error && (
                        <div className="initiative-comment-form-error">
                            {error}
                        </div>
                    )}
                </form>

                {isReply && (
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="initiative-comment-form-cancel-reply"
                        disabled={isSubmitting}
                    >
                        {t('comments.form.cancel')}
                    </button>
                )}
            </div>
        </div>
    );
};