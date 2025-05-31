
import { useState } from 'react';

export const useCommentForm = (onSubmitCallback, onCancelCallback) => {
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!content.trim()) {
            setError('Comment cannot be empty');
            return;
        }
        
        setIsSubmitting(true);
        setError('');
        
        try {
            await onSubmitCallback(content.trim());
            setContent(''); 
        } catch (error) {
            console.error('Error submitting comment:', error);
            setError('Failed to submit comment. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setContent('');
        setError('');
        if (onCancelCallback) {
            onCancelCallback();
        }
    };

    const handleContentChange = (newContent) => {
        setContent(newContent);
        if (error) setError(''); 
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            handleSubmit(e);
        }
    };

    return {
        content,
        isSubmitting,
        error,
        handleSubmit,
        handleCancel,
        handleContentChange,
        handleKeyDown,
        isValid: content.trim().length > 0
    };
};