// Comments/CommentItem/CommentItem.jsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCommentItem } from '../../../hooks/useCommentItem';
import { formatDistanceToNow } from 'date-fns';
import { bg, enUS } from 'date-fns/locale';
import { getResizedUrl } from '../../../../utils/firebaseImageResize';
import './commentItem.css';

export const CommentItem = ({
    comment,
    entityId,
    entityType = 'initiative',
    isReply = false,
    parentCommentId = null,
    // Основни функции
    updateCommentFunc,
    deleteCommentFunc,
    likeCommentFunc,
    addCommentFunc
}) => {
    const { t, i18n } = useTranslation('content');

    const {
        isEditing,
        showReplyForm,
        showReplies,
        editContent,
        setEditContent,
        isOwner,
        isLiked,
        hasReplies,
        isAuthentication,
        handleLike,
        handleEdit,
        handleDelete,
        handleReply,
        handleStartEdit,
        handleCancelEdit,
        toggleReplies,
        toggleReplyForm,
        isAdminOrModerator
    } = useCommentItem(
        comment,
        entityId,
        isReply,
        parentCommentId,
        entityType,
        updateCommentFunc,
        deleteCommentFunc,
        likeCommentFunc,
        addCommentFunc
    );

    // Динамичен импорт на CommentForm
    const [CommentForm, setCommentForm] = useState(null);

    const loadCommentForm = async () => {
        if (!CommentForm) {
            const { CommentForm: FormComponent } = await import('../CommentForm/CommentForm');
            setCommentForm(() => FormComponent);
        }
    };

    const handleShowReplyForm = () => {
        if (showReplyForm) {
            toggleReplyForm();
        } else {
            loadCommentForm();
            toggleReplyForm();
        }
    };

    const handleDeleteWithConfirm = () => {
        if (window.confirm(t('comments.item.deleteConfirm'))) {
            handleDelete();
        }
    };

    const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
        addSuffix: true,
        locale: i18n.language === 'bg' ? bg : enUS
    });

    return (
        <div className={`initiative-comment-item ${isReply ? 'initiative-comment-reply' : ''}`}>
            <div className="initiative-comment-avatar">
                {comment.userAvatar ? (
                    <img
                        src={getResizedUrl(comment.userAvatar, 200)}
                        alt={comment.userName}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                            if (e.target.src !== comment.userAvatar) e.target.src = comment.userAvatar;
                        }}
                    />
                ) : (
                    <div className="initiative-avatar-placeholder">
                        {comment.userName.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>

            <div className="initiative-comment-content">
                <div className="initiative-comment-bubble">
                    <div className="initiative-comment-header">
                        <span className="initiative-comment-author">{comment.userName}</span>
                        {comment.updatedAt && (
                            <span className="initiative-comment-edited">
                                ({t('comments.item.edited')})
                            </span>
                        )}
                    </div>

                    {isEditing ? (
                        <div className="initiative-comment-edit-form">
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="initiative-edit-textarea"
                                autoFocus
                            />
                            <div className="initiative-edit-actions">
                                <button
                                    onClick={handleEdit}
                                    className="initiative-save-btn"
                                    disabled={!editContent.trim()}
                                >
                                    {t('comments.item.save')}
                                </button>
                                <button
                                    onClick={handleCancelEdit}
                                    className="initiative-cancel-btn"
                                >
                                    {t('comments.item.cancel')}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="initiative-comment-text-container">
                            <div className="initiative-comment-text">
                                {comment.content}
                            </div>
                        </div>
                    )}
                </div>

                <div className="initiative-comment-meta">
                    <span className="initiative-comment-time">{timeAgo}</span>

                    <button
                        onClick={handleLike}
                        className={`initiative-like-btn ${isLiked ? 'liked' : ''}`}
                        disabled={!isAuthentication}
                    >
                        {isLiked ? 'Харесано' : 'Харесай'}
                        {comment.likesCount > 0 && ` (${comment.likesCount})`}
                    </button>

                    {!isReply && isAuthentication && (
                        <button
                            onClick={handleShowReplyForm}
                            className="initiative-reply-btn"
                        >
                            {t('comments.item.reply')}
                        </button>
                    )}

                    {isOwner && (
                        <>
                            <button
                                onClick={handleStartEdit}
                                className="initiative-edit-btn"
                            >
                                {t('comments.item.edit')}
                            </button>
                            <button
                                onClick={handleDeleteWithConfirm}
                                className="initiative-delete-btn"
                            >
                                {t('comments.item.delete')}
                            </button>
                        </>
                    )}

                    {isAdminOrModerator && (
                    <button
                        onClick={handleDeleteWithConfirm}
                        className="initiative-delete-btn"
                    >
                        {t('comments.item.delete')}
                    </button>

                    )}
                    {hasReplies && (
                        <button
                            onClick={toggleReplies}
                            className="initiative-show-replies-btn"
                        >
                            {showReplies
                                ? t('comments.item.hideReplies', { count: (comment.replies || []).length })
                                : t('comments.item.showReplies', { count: (comment.replies || []).length })
                            }
                        </button>
                    )}
                </div>

                {showReplyForm && CommentForm && (
                    <CommentForm
                        onSubmit={handleReply}
                        onCancel={toggleReplyForm}
                        placeholder={t('comments.item.replyPlaceholder', { name: comment.userName })}
                        isReply={true}
                    />
                )}

                {showReplies && hasReplies && (
                    <div className="initiative-replies-list">
                        {(comment.replies || []).map(reply => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                entityId={entityId}
                                entityType={entityType}
                                isReply={true}
                                parentCommentId={comment.id}
                                updateCommentFunc={updateCommentFunc}
                                deleteCommentFunc={deleteCommentFunc}
                                likeCommentFunc={likeCommentFunc}
                                addCommentFunc={addCommentFunc}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};