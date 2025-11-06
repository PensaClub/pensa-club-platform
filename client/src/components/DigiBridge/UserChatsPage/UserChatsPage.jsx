// src/components/DigiBridge/UserChatsPage/UserChatsPage.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../contexts/UserContext';
import { listenToUserConversations } from '../../firebase/firebaseChat';
import { useAcademy } from '../../contexts/AcademyProvider';
import './userChatsPage.css';
import { DigiBridgeChatWindow } from '../DigiBridgeChatWindow/DigiBridgeChatWindow';
import { UserChatCard } from './UserChatCard';
import { MentorReviewModal } from '../MentorReviewModal/MentorReviewModal';

export const UserChatsPage = () => {
  const { t } = useTranslation();
  const { profileData } = useAuthContext();
  const { checkUserMentorReviewStatus, getAllMentors } = useAcademy();
  
  const [conversations, setConversations] = useState([]);
  const [activeConversations, setActiveConversations] = useState([]);
  const [completedConversations, setCompletedConversations] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // ✅ Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewModalMentor, setReviewModalMentor] = useState(null);

  const userEmail = profileData?.email || '';
  const userId = userEmail.replace(/\./g, '_dot_').replace(/@/g, '_at_');

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

  const handleOpenChat = (conversation) => {
    setSelectedConversation(conversation);
    setIsChatOpen(true);
  };

  // ✅ ОБНОВЕНА handleCloseChat с review check
  const handleCloseChat = async (shouldCheckReview = false, firebaseMentorId = null) => {
    setIsChatOpen(false);
    setSelectedConversation(null);

    // ✅ Ако трябва да проверим за review
    if (shouldCheckReview && firebaseMentorId) {
      setTimeout(async () => {
        try {
          // Конвертирай Firebase ID → Email
          const mentorEmail = firebaseMentorId
            .replace(/_at_/g, '@')
            .replace(/_dot_/g, '.');
          
          // Fetch mentor
          const mentorsResponse = await getAllMentors({ email: mentorEmail });
          const mentor = mentorsResponse?.mentors?.[0];
          
          if (!mentor?.id) {
            return;
          }

          // Провери review status
          const reviewStatus = await checkUserMentorReviewStatus(mentor.id);
          
          if (!reviewStatus.hasReview) {
            setReviewModalMentor(mentor);
            setShowReviewModal(true);
          }
        } catch (error) {
          console.error('❌ Error checking review:', error);
        }
      }, 300);
    }
  };

  const handleReviewModalClose = () => {
    setShowReviewModal(false);
    setReviewModalMentor(null);
  };

  return (
    <>
      <div className="user-chats-page">
        
        <div className="user-chats-header">
          <h1>{t('digiBridge.userChats.title')}</h1>
          <p className="user-chats-subtitle">{t('digiBridge.userChats.subtitle')}</p>
        </div>

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

        <div className="user-chats-content">
          
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

        {isChatOpen && selectedConversation && (
          <DigiBridgeChatWindow 
            existingConversation={selectedConversation}
            onClose={handleCloseChat}
          />
        )}
      </div>

      {/* ✅ REVIEW MODAL */}
      {showReviewModal && reviewModalMentor && (
        <MentorReviewModal
          mentor={reviewModalMentor}
          onClose={handleReviewModalClose}
          onSuccess={() => console.log('Review submitted')}
        />
      )}
    </>
  );
};