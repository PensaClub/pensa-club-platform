/* eslint-disable react-hooks/exhaustive-deps */
// Comments/Comments.jsx - заменете с тази актуализирана версия:

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './comments.css';
import { useAuthContext } from '../../../contexts/UserContext';
import { useInitiativeContext } from '../../../contexts/InitiativeProvider';
import { CommentItem } from '../CommentItem/CommentItem';
import { CommentForm } from '../CommentForm/CommentForm';
import { Link } from 'react-router-dom';

export const Comments = ({
    initiativeId,
    entityId,
    entityType = 'initiative',
    commentsEnabled = true,
    onCommentsChange
}) => {
    const { t } = useTranslation('content');
    const { isAuthentication } = useAuthContext();
    const {
        // Initiative functions
        getComments, addComment, updateComment, deleteComment, likeComment,
        // Project functions
        getProjectComments, addProjectComment, updateProjectComment, deleteProjectComment, likeProjectComment,
        // Publication functions
        getPublicationComments, addPublicationComment, updatePublicationComment, deletePublicationComment, likePublicationComment,
        commentsLoading,
        comments
    } = useInitiativeContext();

    const [showCommentForm, setShowCommentForm] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Определяме ID и ключ според типа
    const targetId = initiativeId || entityId;
    const isProject = entityType === 'project';
    const isPublication = entityType === 'publication';
    const commentsKey = isProject ? `project-${targetId}` : isPublication ? `publication-${targetId}` : targetId;

    // Избираме правилните функции според типа
    const fetchComments = isProject ? getProjectComments : isPublication ? getPublicationComments : getComments;
    const submitComment = isProject ? addProjectComment : isPublication ? addPublicationComment : addComment;
    const updateCommentFunc = isProject ? updateProjectComment : isPublication ? updatePublicationComment : updateComment;
    const deleteCommentFunc = isProject ? deleteProjectComment : isPublication ? deletePublicationComment : deleteComment;
    const likeCommentFunc = isProject ? likeProjectComment : isPublication ? likePublicationComment : likeComment;

    // Вземаме коментарите с правилния ключ
    const currentComments = comments[commentsKey] || [];

    useEffect(() => {
        if (!commentsEnabled || !targetId) return;

        const loadComments = async () => {
            try {
                await fetchComments(targetId);
                setIsLoaded(true);
            } catch (error) {
                console.error('Error fetching comments:', error);
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
            await submitComment(targetId, content);
            setShowCommentForm(false);
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    // Уведомяваме родителя за промяна в броя коментари
    useEffect(() => {
        if (onCommentsChange) {
            // Броим всички коментари (главни + replies)
            const totalCount = currentComments.reduce((sum, comment) => {
                return sum + 1 + (comment.replies?.length || 0);
            }, 0);
            onCommentsChange(totalCount);
        }
    }, [currentComments, onCommentsChange]);

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
                    {t('comments.title')} ({currentComments.reduce((sum, comment) =>
                        sum + 1 + (comment.replies?.length || 0), 0)})
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
                    {currentComments.length === 0 ? (
                        <div className="initiative-no-comments">
                            <div className="initiative-no-comments-icon">💬</div>
                            <p>{t('comments.noComments')}</p>
                        </div>
                    ) : (
                        currentComments.map(comment => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                entityId={targetId}
                                entityType={entityType}
                                updateCommentFunc={updateCommentFunc}
                                deleteCommentFunc={deleteCommentFunc}
                                likeCommentFunc={likeCommentFunc}
                                addCommentFunc={submitComment}
                            />
                        ))
                    )}
                </div>
            )}
        </section>
    );
};
