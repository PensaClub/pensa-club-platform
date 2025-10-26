// src/components/DigiBridge/UserChatsPage/UserChatsPage.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../contexts/UserContext';
import { listenToUserConversations } from '../../firebase/firebaseChat';
// import { UserChatCard } from './UserChatCard';
// import { DigiBridgeChatWindow } from '../DigiBridgeChatWindow/DigiBridgeChatWindow';
import './userChatsPage.css';
import { DigiBridgeChatWindow } from '../DigiBridgeChatWindow/DigiBridgeChatWindow';
import { UserChatCard } from './UserChatCard';

export const UserChatsPage = () => {
  const { t } = useTranslation();
  const { profileData } = useAuthContext();
  
  const [conversations, setConversations] = useState([]);
  const [activeConversations, setActiveConversations] = useState([]);
  const [completedConversations, setCompletedConversations] = useState([]);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'completed'
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const userEmail = profileData?.email || '';
  const userId = userEmail.replace(/\./g, '_dot_').replace(/@/g, '_at_');

  // Слушай за разговори
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = listenToUserConversations(userId, (convs) => {
      setConversations(convs);
      
      const active = convs.filter(c => c.status === 'active');
      const completed = convs.filter(c => c.status === 'completed');
      
      setActiveConversations(active);
      setCompletedConversations(completed);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userId]);

  // Отвори чат
  const handleOpenChat = (conversation) => {
    setSelectedConversation(conversation);
    setIsChatOpen(true);
  };

  // Затвори чат
  const handleCloseChat = () => {
    setIsChatOpen(false);
    setSelectedConversation(null);
  };

  return (
    <div className="user-chats-page">
      
      {/* HEADER */}
      <div className="user-chats-header">
        <h1>{t('digiBridge.userChats.title')}</h1>
        <p className="user-chats-subtitle">{t('digiBridge.userChats.subtitle')}</p>
      </div>

      {/* TABS */}
      <div className="user-chats-tabs">
        <button
          className={`user-chats-tab ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          <span className="user-chats-tab-icon">💬</span>
          {t('digiBridge.userChats.activeChats')}
          {activeConversations.length > 0 && (
            <span className="user-chats-tab-badge">{activeConversations.length}</span>
          )}
        </button>

        <button
          className={`user-chats-tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          <span className="user-chats-tab-icon">✅</span>
          {t('digiBridge.userChats.completedChats')}
        </button>
      </div>

      {/* CONTENT */}
      <div className="user-chats-content">
        
        {/* ACTIVE CHATS */}
        {activeTab === 'active' && (
          <div className="user-chats-list">
            {activeConversations.length === 0 ? (
              <div className="user-chats-empty">
                <div className="user-chats-empty-icon">💬</div>
                <h3>{t('digiBridge.userChats.noActiveChats')}</h3>
                <p>{t('digiBridge.userChats.noActiveChatsDesc')}</p>
              </div>
            ) : (
              activeConversations.map(conversation => (
                <UserChatCard
                  key={conversation.id}
                  conversation={conversation}
                  onOpen={() => handleOpenChat(conversation)}
                />
              ))
            )}
          </div>
        )}

        {/* COMPLETED CHATS */}
        {activeTab === 'completed' && (
          <div className="user-chats-list">
            {completedConversations.length === 0 ? (
              <div className="user-chats-empty">
                <div className="user-chats-empty-icon">✅</div>
                <h3>{t('digiBridge.userChats.noCompletedChats')}</h3>
                <p>{t('digiBridge.userChats.noCompletedChatsDesc')}</p>
              </div>
            ) : (
              completedConversations.map(conversation => (
                <UserChatCard
                  key={conversation.id}
                  conversation={conversation}
                  isCompleted={true}
                  onOpen={() => handleOpenChat(conversation)}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* CHAT WINDOW */}
      {isChatOpen && selectedConversation && (
        <DigiBridgeChatWindow 
          existingConversation={selectedConversation}
          onClose={handleCloseChat}
        />
      )}
    </div>
  );
};