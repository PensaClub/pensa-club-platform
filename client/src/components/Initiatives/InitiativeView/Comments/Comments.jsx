// Comments/Comments.jsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './comments.css';
import { useAuthContext } from '../../../contexts/UserContext';
import { useInitiativeContext } from '../../../contexts/InitiativeProvider';
import { CommentItem } from '../CommentItem/CommentItem';
import { CommentForm } from '../CommentForm/CommentForm';

export const Comments = ({ initiativeId, commentsEnabled = true }) => {
    const { t } = useTranslation();
    const { isAuthentication } = useAuthContext();
    const { 
        getComments, 
        addComment, 
        commentsLoading 
    } = useInitiativeContext();
    
    const [comments, setComments] = useState([]); 
    const [showCommentForm, setShowCommentForm] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false); 

    useEffect(() => {
        if (!commentsEnabled || !initiativeId) return;
        
        const fetchComments = async () => {
            try {
                const commentsData = await getComments(initiativeId);
                // Проверяваме че данните са валидни
                if (Array.isArray(commentsData)) {
                    setComments(commentsData);
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

        fetchComments();
    }, [initiativeId, commentsEnabled, getComments]);

    const handleAddComment = async (content) => {
        if (!isAuthentication) {
            alert(t('comments.loginRequired'));
            return;
        }

        try {
            const newComment = await addComment(initiativeId, content);
            // Проверяваме че newComment е валиден
            if (newComment && newComment.id) {
                setComments(prev => [newComment, ...prev]);
            }
            setShowCommentForm(false);
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleUpdateComments = (updatedComment, action) => {
        if (!updatedComment) return;
        
        setComments(prev => {
            switch (action) {
                case 'update':
                    return prev.map(comment => 
                        comment?.id === updatedComment.id ? updatedComment : comment
                    );
                case 'delete':
                    return prev.filter(comment => comment?.id !== updatedComment.id);
                case 'like':
                case 'reply':
                    return prev.map(comment => 
                        comment?.id === updatedComment.id ? updatedComment : comment
                    );
                default:
                    return prev;
            }
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
                    <a href="/sign-up" className="initiative-login-link">
                        {t('comments.loginLink')}
                    </a>
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
                                    initiativeId={initiativeId}
                                    onUpdate={handleUpdateComments}
                                />
                            ))
                    )}
                </div>
            )}
        </section>
    );
};