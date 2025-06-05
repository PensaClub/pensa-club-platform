// hooks/useCommentItem.js
import { useState } from 'react';
import { useAuthContext } from '../contexts/UserContext';

export const useCommentItem = (
    comment, 
    entityId, 
    onUpdate, 
    isReply = false, 
    parentCommentId = null,
    entityType = 'initiative',
    // Функции предавани от Comments компонента
    updateCommentFunc,
    deleteCommentFunc,
    likeCommentFunc,
    addReplyFunc,
    updateReplyFunc,    // ← НОВ за редактиране на replies
    deleteReplyFunc,    // ← НОВ за триене на replies
    likeReplyFunc
) => {
    const { isAuthentication, userEmail } = useAuthContext();
    
    const [isEditing, setIsEditing] = useState(false);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);

    // Permissions
    const isOwner = isAuthentication && userEmail === comment.userEmail;
    const isLiked = isAuthentication && (comment.likes || []).includes(userEmail);
    const hasReplies = comment.replies && comment.replies.length > 0;

    const handleLike = async () => {
        if (!isAuthentication) return;

        try {
            let updatedComment;
            
            // Ако това е reply, използваме likeReplyFunc
            if (isReply && parentCommentId) {
                updatedComment = await likeReplyFunc(entityId, parentCommentId, comment.id);
            } else {
                // Ако това е основен коментар, използваме likeCommentFunc
                updatedComment = await likeCommentFunc(entityId, comment.id);
            }
            
            onUpdate(updatedComment, 'like');
        } catch (error) {
            console.error('Error liking comment:', error);
        }
    };

    const handleEdit = async () => {
        if (!editContent.trim()) return;

        try {
            let updatedComment;
            
            if (isReply && parentCommentId) {
                // За replies използвай updateReplyFunc
                updatedComment = await updateReplyFunc(entityId, parentCommentId, comment.id, editContent);
            } else {
                // За коментари използвай updateCommentFunc
                updatedComment = await updateCommentFunc(entityId, comment.id, editContent);
            }
            
            onUpdate(updatedComment, 'update');
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating comment:', error);
        }
    };

    const handleDelete = async () => {
        try {
            if (isReply && parentCommentId) {
                // За replies използвай deleteReplyFunc
                await deleteReplyFunc(entityId, parentCommentId, comment.id);
            } else {
                // За коментари използвай deleteCommentFunc
                await deleteCommentFunc(entityId, comment.id);
            }
            
            onUpdate(comment, 'delete');
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    const handleReply = async (content) => {
        try {
            const reply = await addReplyFunc(entityId, comment.id, content);
            const updatedComment = {
                ...comment,
                replies: [...(comment.replies || []), reply]
            };
            onUpdate(updatedComment, 'reply');
            setShowReplyForm(false);
            setShowReplies(true);
        } catch (error) {
            console.error('Error adding reply:', error);
        }
    };

    const handleStartEdit = () => {
        setIsEditing(true);
        setEditContent(comment.content);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditContent(comment.content);
    };

    const toggleReplies = () => {
        setShowReplies(!showReplies);
    };

    const toggleReplyForm = () => {
        setShowReplyForm(!showReplyForm);
    };

    return {
        // State
        isEditing,
        showReplyForm,
        showReplies,
        editContent,
        setEditContent,
        
        // Permissions
        isOwner,
        isLiked,
        hasReplies,
        isAuthentication,
        
        // Actions
        handleLike,
        handleEdit,
        handleDelete,
        handleReply,
        handleStartEdit,
        handleCancelEdit,
        toggleReplies,
        toggleReplyForm
    };
};