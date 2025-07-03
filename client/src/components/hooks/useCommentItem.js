// hooks/useCommentItem.js
import { useState } from 'react';
import { useAuthContext } from '../contexts/UserContext';

export const useCommentItem = (
    comment, 
    entityId, 
    isReply = false, 
    parentCommentId = null,
    entityType = 'initiative',
    // Основни функции
    updateCommentFunc,
    deleteCommentFunc,
    likeCommentFunc,
    addCommentFunc
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
            await likeCommentFunc(entityId, comment.id);
        } catch (error) {
            console.error('Error liking comment:', error);
        }
    };

    const handleEdit = async () => {
        if (!editContent.trim()) return;

        try {
            await updateCommentFunc(entityId, comment.id, editContent);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating comment:', error);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteCommentFunc(entityId, comment.id);
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    const handleReply = async (content) => {
        try {
            await addCommentFunc(entityId, content, comment.id);
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