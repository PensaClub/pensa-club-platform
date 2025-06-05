// Comments/Comments.jsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './comments.css';
import { useAuthContext } from '../../../contexts/UserContext';
import { useInitiativeContext } from '../../../contexts/InitiativeProvider';
import { CommentItem } from '../CommentItem/CommentItem';
import { CommentForm } from '../CommentForm/CommentForm';
import { Link } from 'react-router-dom';

export const Comments = ({
    initiativeId,        // За backward compatibility с InitiativeView
    entityId,           // Унифициран ID за проекти
    entityType = 'initiative', // 'initiative' или 'project'
    commentsEnabled = true,
    onCommentsChange
}) => {
    const { t } = useTranslation();
    const { isAuthentication } = useAuthContext();
    const {
        // Initiative functions
        getComments, addComment, updateComment, deleteComment, likeComment, addReply, updateReply, deleteReply, likeReply,
        // Project functions  
        getProjectComments, addProjectComment, updateProjectComment, deleteProjectComment, likeProjectComment, addProjectReply, updateProjectReply, deleteProjectReply, likeProjectReply,
        commentsLoading
    } = useInitiativeContext();

    const [comments, setComments] = useState([]);
    const [showCommentForm, setShowCommentForm] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    const targetId = initiativeId || entityId;
    const isProject = entityType === 'project';

    const fetchComments = isProject ? getProjectComments : getComments;
    const submitComment = isProject ? addProjectComment : addComment;
    const updateCommentFunc = isProject ? updateProjectComment : updateComment;
    const deleteCommentFunc = isProject ? deleteProjectComment : deleteComment;
    const likeCommentFunc = isProject ? likeProjectComment : likeComment;
    const addReplyFunc = isProject ? addProjectReply : addReply;
    const updateReplyFunc = isProject ? updateProjectReply : updateReply; 
    const deleteReplyFunc = isProject ? deleteProjectReply : deleteReply;  
    const likeReplyFunc = isProject ? likeProjectReply : likeReply;

    useEffect(() => {
        if (!commentsEnabled || !targetId) return;

        const loadComments = async () => {
            try {
                const commentsData = await fetchComments(targetId);
                // Проверяваме че данните са валидни и осигуряваме replies
                if (Array.isArray(commentsData)) {
                    const commentsWithReplies = commentsData.map(comment => ({
                        ...comment,
                        replies: comment.replies || []
                    }));
                    setComments(commentsWithReplies);
                } else {
                    setComments([]);
                }
                setIsLoaded(true);
            } catch (error) {
                console.error('Error fetching comments:', error);
                setComments([]);
                setIsLoaded(true);
            }
        };

        loadComments();
    }, [targetId, commentsEnabled, fetchComments]);

    const handleAddComment = async (content) => {
        if (!isAuthentication) {
            alert(t('comments.loginRequired'));
            return;
        }

        try {
            const newComment = await submitComment(targetId, content);
            if (newComment && newComment.id) {
                const commentWithReplies = {
                    ...newComment,
                    replies: newComment.replies || []
                };
                const newComments = [commentWithReplies, ...comments];
                setComments(newComments);

                // Уведоми родителя за промяната
                if (onCommentsChange) {
                    onCommentsChange(newComments.length);
                }
            }
            setShowCommentForm(false);
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleUpdateComments = (updatedComment, action) => {
        if (!updatedComment) return;

        setComments(prev => {
            let newComments;
            switch (action) {
                case 'update':
                    newComments = prev.map(comment =>
                        comment?.id === updatedComment.id ? updatedComment : comment
                    );
                    break;
                case 'delete':
                    newComments = prev.filter(comment => comment?.id !== updatedComment.id);
                    break;
                case 'like':
                case 'reply':
                    newComments = prev.map(comment =>
                        comment?.id === updatedComment.id ? updatedComment : comment
                    );
                    break;
                default:
                    return prev;
            }

            // Уведоми родителя за промяната в броя коментари
            if (onCommentsChange && action === 'delete') {
                onCommentsChange(newComments.length);
            }

            return newComments;
        });
    };

    if (!commentsEnabled) {
        return (
            <section className="initiative-comments-section" id="comments">
                <div className="initiative-comments-disabled">
                    <div className="initiative-comments-disabled-icon">🔒</div>
                    <h3 className="initiative-comments-disabled-title">
                        {t('comments.disabled.title')}
                    </h3>
                    <p className="initiative-comments-disabled-message">
                        {t('comments.disabled.message')}
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="initiative-comments-section" id="comments">
            <div className="initiative-comments-header">
                <h2 className="initiative-comments-section-title">
                    {t('comments.title')} ({comments.length})
                </h2>

                {isAuthentication && (
                    <button
                        className="initiative-add-comment-btn"
                        onClick={() => setShowCommentForm(!showCommentForm)}
                    >
                        {showCommentForm ? t('comments.cancel') : t('comments.addComment')}
                    </button>
                )}
            </div>

            {!isAuthentication && (
                <div className="initiative-login-prompt">
                    <p>{t('comments.loginPrompt')}</p>
                    <Link to="/sign-up?tab=login" className="initiative-login-link">
                        {t('comments.loginLink')}
                    </Link>
                </div>
            )}

            {showCommentForm && (
                <CommentForm
                    onSubmit={handleAddComment}
                    onCancel={() => setShowCommentForm(false)}
                    placeholder={t('comments.placeholder')}
                />
            )}

            {commentsLoading && !isLoaded ? (
                <div className="initiative-comments-loading">
                    <div className="initiative-loading-spinner"></div>
                    <p>{t('comments.loading')}</p>
                </div>
            ) : (
                <div className="initiative-comments-list">
                    {comments.length === 0 ? (
                        <div className="initiative-no-comments">
                            <div className="initiative-no-comments-icon">💬</div>
                            <p>{t('comments.noComments')}</p>
                        </div>
                    ) : (
                        comments
                            .filter(comment => comment && comment.id) // Филтрираме валидни коментари
                            .map(comment => (
                                <CommentItem
                                    key={comment.id}
                                    comment={comment}
                                    entityId={targetId}
                                    entityType={entityType}
                                    onUpdate={handleUpdateComments}
                                    updateCommentFunc={updateCommentFunc}
                                    deleteCommentFunc={deleteCommentFunc}
                                    likeCommentFunc={likeCommentFunc}
                                    addReplyFunc={addReplyFunc}
                                    likeReplyFunc={likeReplyFunc}
                                    updateReplyFunc={updateReplyFunc}
                                    deleteReplyFunc={deleteReplyFunc}
                                />
                            ))
                    )}
                </div>
            )}
        </section>
    );
};