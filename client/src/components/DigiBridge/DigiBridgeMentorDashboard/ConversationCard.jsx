// src/components/DigiBridge/DigiBridgeMentorDashboard/ConversationCard.jsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalizedNavigate } from '../../../hooks/useLocalizedNavigate';
import { endConversation } from '../../firebase/firebaseChat';
import { toast } from 'react-toastify';
import './conversationCard.css';
import { MentorChatWindow } from './MentorChatWindow';

export const ConversationCard = ({ conversation, isCompleted = false }) => {
    const { t } = useTranslation('digibridge');
    const navigate = useLocalizedNavigate();
    const [isEnding, setIsEnding] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    // Форматиране на времето
    const formatTime = (timestamp) => {
        const now = Date.now();
        const diff = now - timestamp;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return t('digiBridge.dashboard.timeJustNow');
        if (minutes < 60) return t('digiBridge.dashboard.timeMinutesAgo', { count: minutes });
        if (hours < 24) return t('digiBridge.dashboard.timeHoursAgo', { count: hours });
        return t('digiBridge.dashboard.timeDaysAgo', { count: days });
    };

    // Форматиране на дата
    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('bg-BG', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Категория емоджи
    const getCategoryEmoji = (category) => {
        const emojiMap = {
            'General': '❓',
            'Online Banking': '🏦',
            'Social Media': '📱',
            'Digital Security': '🔒',
            'Email': '📧',
            'Basic Computer Skills': '💻'
        };
        return emojiMap[category] || '❓';
    };

    // Категория превод
    const getCategoryTranslationKey = (category) => {
        const keyMap = {
            'General': 'general',
            'Online Banking': 'banking',
            'Social Media': 'socialMedia',
            'Digital Security': 'security',
            'Email': 'email',
            'Basic Computer Skills': 'computer'
        };
        return keyMap[category] || 'general';
    };

    // Отвори чат (TODO: Implement chat window for mentor)
    const handleOpenChat = () => {
        setIsChatOpen(true);
    };

    // Приключи чат
    const handleEndChat = async () => {
        const confirmed = window.confirm(t('digiBridge.dashboard.confirmEndChat'));
        if (!confirmed) return;

        setIsEnding(true);
        try {
            await endConversation(conversation.id);
            toast.success(t('digiBridge.dashboard.chatEnded'));
        } catch (error) {
            console.error('Error ending conversation:', error);
            toast.error(t('digiBridge.dashboard.errorEndingChat'));
        } finally {
            setIsEnding(false);
        }
    };

    return (
        <>
            <div className={`digibridge-conversation-card ${isCompleted ? 'completed' : 'active'}`}>

                {/* HEADER */}
                <div className="digibridge-conversation-card-header">
                    <div className="digibridge-conversation-card-user">
                        <div className="digibridge-conversation-card-avatar">
                            {conversation.userName?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="digibridge-conversation-card-user-info">
                            <h3 className="digibridge-conversation-card-user-name">{conversation.userName}</h3>
                            <div className="digibridge-conversation-card-category">
                                <span className="digibridge-conversation-card-category-emoji">
                                    {getCategoryEmoji(conversation.category)}
                                </span>
                                <span className="digibridge-conversation-card-category-text">
                                    {t(`digiBridge.chatWindow.categories.${getCategoryTranslationKey(conversation.category)}`)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className={`digibridge-conversation-card-status ${isCompleted ? 'completed' : 'active'}`}>
                        {isCompleted ? (
                            <>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                {t('digiBridge.dashboard.completed')}
                            </>
                        ) : (
                            <>
                                <span className="digibridge-conversation-card-status-dot"></span>
                                {t('digiBridge.dashboard.active')}
                            </>
                        )}
                    </div>
                </div>

                {/* CONTENT */}
                <div className="digibridge-conversation-card-content">
                    {/* Problem */}
                    <div className="digibridge-conversation-card-problem">
                        <strong>{t('digiBridge.dashboard.problem')}:</strong> {conversation.problem}
                    </div>

                    {/* Last Message */}
                    {conversation.lastMessage && (
                        <div className="digibridge-conversation-card-last-message">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            <span className="digibridge-conversation-card-last-message-text">
                                {conversation.lastMessage}
                            </span>
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="digibridge-conversation-card-footer">
                    <div className="digibridge-conversation-card-time">
                        {isCompleted ? (
                            <>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                                <span>
                                    {t('digiBridge.dashboard.completedAt')}: {formatDate(conversation.endedAt)}
                                </span>
                            </>
                        ) : (
                            <>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                                <span>
                                    {conversation.lastMessageAt
                                        ? t('digiBridge.dashboard.lastMessage') + ': ' + formatTime(conversation.lastMessageAt)
                                        : t('digiBridge.dashboard.started') + ': ' + formatTime(conversation.startedAt)
                                    }
                                </span>
                            </>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="digibridge-conversation-card-buttons">
                        <button
                            className="digibridge-conversation-card-open-btn"
                            onClick={handleOpenChat}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                {isCompleted ? (
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                ) : (
                                    <>
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                        <circle cx="12" cy="12" r="1" />
                                    </>
                                )}
                            </svg>
                            {isCompleted ? t('digiBridge.dashboard.viewChat') : t('digiBridge.dashboard.openChat')}
                        </button>

                        {/* End Chat Button - само за активни чатове */}
                        {!isCompleted && (
                            <button
                                className="digibridge-conversation-card-end-btn"
                                onClick={handleEndChat}
                                disabled={isEnding}
                            >
                                {isEnding ? (
                                    <>
                                        <span className="digibridge-conversation-card-spinner"></span>
                                        {t('digiBridge.dashboard.ending')}
                                    </>
                                ) : (
                                    <>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <line x1="15" y1="9" x2="9" y2="15" />
                                            <line x1="9" y1="9" x2="15" y2="15" />
                                        </svg>
                                        {t('digiBridge.dashboard.endChat')}
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {isChatOpen && (
                <MentorChatWindow
                    conversation={conversation}
                    onClose={() => setIsChatOpen(false)}
                />
            )}
        </>
    );
};