// src/components/DigiBridge/MentorMultiChat/MentorChatHub.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../contexts/UserContext';
import { 
  listenToMentorConversations,
  listenToPendingRequests,
  acceptChatRequest,
  listenToMessages
} from '../../firebase/firebaseChat';
import { toast } from 'react-toastify';
import './mentorChatHub.css';

export const MentorChatHub = ({ onClose, onOpenChat }) => {
  const { t } = useTranslation('digibridge');
  const { profileData } = useAuthContext();
  
  const [conversations, setConversations] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [unreadCounts, setUnreadCounts] = useState({});
  const [lastMessageTimes, setLastMessageTimes] = useState({});

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

  // Слушай за unread messages и last message time
  useEffect(() => {
    if (conversations.length === 0) return;

    const unsubscribes = [];

    conversations.forEach(conv => {
      const unsubscribe = listenToMessages(conv.id, (messages) => {
        const unreadMessages = messages.filter(
          msg => msg.senderId !== mentorId && !msg.read
        );

        setUnreadCounts(prev => ({
          ...prev,
          [conv.id]: unreadMessages.length
        }));

        if (messages.length > 0) {
          const lastMessage = messages[messages.length - 1];
          setLastMessageTimes(prev => ({
            ...prev,
            [conv.id]: lastMessage.timestamp || 0
          }));
        }
      });

      unsubscribes.push(unsubscribe);
    });

    return () => {
      unsubscribes.forEach(unsub => unsub && unsub());
    };
  }, [conversations, mentorId]);

  // Accept request и отвори чат
  const handleAcceptRequest = async (request) => {
    if (!mentorId) {
      toast.error('Mentor ID not found. Please refresh and try again.');
      return;
    }

    try {
      const conversationId = await acceptChatRequest(
        request.id,
        mentorId,
        mentorName
      );

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

      onOpenChat(newConversation);
      onClose();
      toast.success(t('digiBridge.mentorHub.requestAccepted'));
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error(t('digiBridge.mentorHub.errorAccepting'));
    }
  };

  // Отвори чат
  const handleOpenChat = (conversation) => {
    onOpenChat(conversation);
    onClose();
  };

  // Сортирай conversations
  const getSortedConversations = (convs) => {
    return [...convs].sort((a, b) => {
      const aUnread = unreadCounts[a.id] || 0;
      const bUnread = unreadCounts[b.id] || 0;
      const aTime = lastMessageTimes[a.id] || 0;
      const bTime = lastMessageTimes[b.id] || 0;

      if (aUnread !== bUnread) {
        return bUnread - aUnread;
      }

      return bTime - aTime;
    });
  };

  // Филтрирай според активен таб
  const getFilteredItems = () => {
    const sortedConversations = getSortedConversations(conversations);

    if (activeTab === 'requests') {
      return { requests: pendingRequests, conversations: [] };
    } else if (activeTab === 'active') {
      return { requests: [], conversations: sortedConversations };
    } else {
      return { requests: pendingRequests, conversations: sortedConversations };
    }
  };

  const { requests, conversations: filteredConversations } = getFilteredItems();
  const totalCount = pendingRequests.length + conversations.length;

  return (
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
                        {unreadCounts[conversation.id] > 0 && (
                          <span className="mentor-chat-hub-avatar-badge">
                            {unreadCounts[conversation.id]}
                          </span>
                        )}
                      </div>
                      <div className="mentor-chat-hub-item-info">
                        <h4>
                          {conversation.userName}
                          {unreadCounts[conversation.id] > 0 && (
                            <span className="mentor-chat-hub-unread-dot"></span>
                          )}
                        </h4>
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
  );
};