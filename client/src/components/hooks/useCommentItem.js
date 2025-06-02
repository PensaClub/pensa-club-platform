// hooks/useCommentItem.js
import { useState } from 'react';
import { useAuthContext } from '../contexts/UserContext';
import { useInitiativeContext } from '../contexts/InitiativeProvider';

export const useCommentItem = (comment, initiativeId, onUpdate, isReply = false, parentCommentId = null) => {
    const { isAuthentication, userEmail } = useAuthContext();
    const { 
        updateComment, 
        deleteComment, 
        likeComment, 
        addReply,
        likeReply 
    } = useInitiativeContext();
    
    const [isEditing, setIsEditing] = useState(false);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);

    // Permissions
    const isOwner = isAuthentication && userEmail === comment.userEmail;
    const isLiked = isAuthentication && comment.likes.includes(userEmail);
    const hasReplies = comment.replies && comment.replies.length > 0;

    const handleLike = async () => {
        if (!isAuthentication) return;

        try {
            let updatedComment;
            
            // Ако това е reply, използваме likeReply
            if (isReply && parentCommentId) {
                updatedComment = await likeReply(initiativeId, parentCommentId, comment.id);
            } else {
                // Ако това е основен коментар, използваме likeComment
                updatedComment = await likeComment(initiativeId, comment.id);
            }
            
            onUpdate(updatedComment, 'like');
        } catch (error) {
            console.error('Error liking comment:', error);
        }
    };

    const handleEdit = async () => {
        if (!editContent.trim()) return;

        try {
            const updatedComment = await updateComment(initiativeId, comment.id, editContent);
            onUpdate(updatedComment, 'update');
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating comment:', error);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteComment(initiativeId, comment.id);
            onUpdate(comment, 'delete');
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    const handleReply = async (content) => {
        try {
            const reply = await addReply(initiativeId, comment.id, content);
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