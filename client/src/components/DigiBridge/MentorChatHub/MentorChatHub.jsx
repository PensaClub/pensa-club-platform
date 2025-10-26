// src/components/DigiBridge/MentorMultiChat/MentorChatHub.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../contexts/UserContext';
import { 
  listenToMentorConversations,
  listenToPendingRequests,
  acceptChatRequest 
} from '../../firebase/firebaseChat';
import { toast } from 'react-toastify';
import './mentorChatHub.css';
import { ChatWindowManager } from '../ChatWindowManager/ChatWindowManager';

export const MentorChatHub = ({ onClose }) => {
  const { t } = useTranslation();
  const { profileData } = useAuthContext();
  
  const [conversations, setConversations] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [openChats, setOpenChats] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'requests' | 'active'

  const mentorEmail = profileData?.email || '';
  const mentorId = mentorEmail.replace(/\./g, '_dot_').replace(/@/g, '_at_');
  const mentorName = profileData?.details?.username || profileData?.details?.firstName || mentorEmail.split('@')[0] || 'Mentor';

  // Слушай за pending requests
  useEffect(() => {
    const unsubscribe = listenToPendingRequests((requests) => {
      setPendingRequests(requests);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Слушай за активни conversations
  useEffect(() => {
    if (!mentorId) return;

    const unsubscribe = listenToMentorConversations(mentorId, (convs) => {
      const active = convs.filter(c => c.status === 'active');
      setConversations(active);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [mentorId]);

  // Accept request и отвори чат
  const handleAcceptRequest = async (request) => {
    try {
      const conversationId = await acceptChatRequest(
        request.id,
        mentorId,
        mentorName
      );

      // Отвори чата веднага
      const newConversation = {
        id: conversationId,
        userId: request.userId,
        userName: request.userName,
        problem: request.problem,
        category: request.category,
        status: 'active',
        mentorId: mentorId,
        mentorName: mentorName
      };

      handleOpenChat(newConversation);
      toast.success(t('digiBridge.mentorHub.requestAccepted'));
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error(t('digiBridge.mentorHub.errorAccepting'));
    }
  };

  // Отвори чат
  const handleOpenChat = (conversation) => {
    if (openChats.find(c => c.id === conversation.id)) {
      return;
    }
    setOpenChats([...openChats, conversation]);
  };

  // Затвори чат
  const handleCloseChat = (conversationId) => {
    setOpenChats(openChats.filter(c => c.id !== conversationId));
  };

  // Филтрирай според активен таб
  const getFilteredItems = () => {
    if (activeTab === 'requests') {
      return { requests: pendingRequests, conversations: [] };
    } else if (activeTab === 'active') {
      return { requests: [], conversations: conversations };
    } else {
      return { requests: pendingRequests, conversations: conversations };
    }
  };

  const { requests, conversations: filteredConversations } = getFilteredItems();
  const totalCount = pendingRequests.length + conversations.length;

  return (
    <>
      {/* HUB OVERLAY */}
      <div className="mentor-chat-hub-overlay" onClick={onClose}>
        <div className="mentor-chat-hub" onClick={(e) => e.stopPropagation()}>
          
          {/* HEADER */}
          <div className="mentor-chat-hub-header">
            <h3>💬 {t('digiBridge.mentorHub.chatHub')}</h3>
            <button className="mentor-chat-hub-close" onClick={onClose}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* TABS */}
          <div className="mentor-chat-hub-tabs">
            <button 
              className={`mentor-chat-hub-tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              {t('digiBridge.mentorHub.all')} ({totalCount})
            </button>
            <button 
              className={`mentor-chat-hub-tab ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('requests')}
            >
              {t('digiBridge.mentorHub.requests')} 
              {pendingRequests.length > 0 && (
                <span className="mentor-chat-hub-tab-badge">{pendingRequests.length}</span>
              )}
            </button>
            <button 
              className={`mentor-chat-hub-tab ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => setActiveTab('active')}
            >
              {t('digiBridge.mentorHub.activeChats')} ({conversations.length})
            </button>
          </div>

          {/* LIST */}
          <div className="mentor-chat-hub-list">
            {totalCount === 0 ? (
              <div className="mentor-chat-hub-empty">
                <div className="mentor-chat-hub-empty-icon">💬</div>
                <p>{t('digiBridge.mentorHub.nothingHere')}</p>
              </div>
            ) : (
              <>
                {/* PENDING REQUESTS */}
                {requests.length > 0 && (
                  <div className="mentor-chat-hub-section">
                    {activeTab === 'all' && (
                      <h4 className="mentor-chat-hub-section-title">
                        🔔 {t('digiBridge.mentorHub.newRequests')}
                      </h4>
                    )}
                    {requests.map(request => (
                      <div 
                        key={request.id} 
                        className="mentor-chat-hub-item request-item"
                        onClick={() => handleAcceptRequest(request)}
                      >
                        <div className="mentor-chat-hub-item-avatar request-avatar">
                          {request.userName?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="mentor-chat-hub-item-info">
                          <h4>{request.userName}</h4>
                          <p>{request.problem}</p>
                          <span className="mentor-chat-hub-item-badge">
                            🆕 {t('digiBridge.mentorHub.newRequest')}
                          </span>
                        </div>
                        <button className="mentor-chat-hub-item-btn request-btn">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* ACTIVE CONVERSATIONS */}
                {filteredConversations.length > 0 && (
                  <div className="mentor-chat-hub-section">
                    {activeTab === 'all' && requests.length > 0 && (
                      <h4 className="mentor-chat-hub-section-title">
                        💬 {t('digiBridge.mentorHub.activeChats')}
                      </h4>
                    )}
                    {filteredConversations.map(conversation => (
                      <div 
                        key={conversation.id} 
                        className="mentor-chat-hub-item"
                        onClick={() => handleOpenChat(conversation)}
                      >
                        <div className="mentor-chat-hub-item-avatar">
                          {conversation.userName?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="mentor-chat-hub-item-info">
                          <h4>{conversation.userName}</h4>
                          <p>{conversation.problem}</p>
                        </div>
                        <button className="mentor-chat-hub-item-btn">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* CHAT WINDOWS MANAGER */}
      <ChatWindowManager 
        openChats={openChats}
        onCloseChat={handleCloseChat}
      />
    </>
  );
};