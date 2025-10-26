// src/components/DigiBridge/DigiBridgeMentorDashboard/MentorChatWindow.jsx

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../contexts/UserContext';
import { 
  listenToMessages,
  sendMessage,
  markMessagesAsRead
} from '../../firebase/firebaseChat';
import { toast } from 'react-toastify';
import './mentorChatWindow.css';

export const MentorChatWindow = ({ conversation, onClose }) => {
  const { t } = useTranslation();
  const { profileData } = useAuthContext();
  
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const mentorEmail = profileData?.email || '';
  const mentorId = mentorEmail.replace(/\./g, '_dot_').replace(/@/g, '_at_');
  const mentorName = profileData?.details?.username || profileData?.details?.firstName || 'Mentor';

  // Auto-scroll до дъното
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Слушай за съобщения
  useEffect(() => {
    if (!conversation?.id) return;

    const unsubscribe = listenToMessages(conversation.id, (msgs) => {
      setMessages(msgs);
      // Маркирай съобщенията като прочетени
      markMessagesAsRead(conversation.id, mentorId);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [conversation?.id, mentorId]);

  // Изпрати съобщение
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !conversation?.id) return;

    setIsSending(true);

    const messageData = {
      senderId: mentorId,
      senderName: mentorName,
      senderType: 'mentor',
      message: inputMessage.trim(),
      userId: conversation.userId,
      mentorId: mentorId
    };

    try {
      await sendMessage(conversation.id, messageData);
      setInputMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(t('digiBridge.mentorChat.errorSending'));
    } finally {
      setIsSending(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Форматиране на време
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('bg-BG', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="mentor-chat-overlay" onClick={onClose}>
      <div className="mentor-chat-window" onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="mentor-chat-header">
          <div className="mentor-chat-user-info">
            <div className="mentor-chat-user-avatar">
              {conversation.userName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="mentor-chat-user-details">
              <h3>{conversation.userName}</h3>
              <span className="mentor-chat-problem">{conversation.problem}</span>
            </div>
          </div>
          
          <button className="mentor-chat-close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* MESSAGES */}
        <div className="mentor-chat-messages">
          {messages.length === 0 ? (
            <div className="mentor-chat-empty">
              <div className="mentor-chat-empty-icon">💬</div>
              <p>{t('digiBridge.mentorChat.noMessages')}</p>
              <p className="mentor-chat-empty-hint">
                {t('digiBridge.mentorChat.startConversation')}
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`mentor-chat-message ${message.senderType === 'mentor' ? 'own' : 'other'}`}
                >
                  <div className="mentor-chat-message-bubble">
                    <div className="mentor-chat-message-text">{message.message}</div>
                    <div className="mentor-chat-message-time">
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* INPUT */}
        <div className="mentor-chat-footer">
          <form onSubmit={handleSendMessage} className="mentor-chat-input-form">
            <input
              type="text"
              className="mentor-chat-input"
              placeholder={t('digiBridge.mentorChat.inputPlaceholder')}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSending}
              autoFocus
            />
            
            <button 
              type="submit" 
              className="mentor-chat-send-btn"
              disabled={!inputMessage.trim() || isSending}
            >
              {isSending ? (
                <span className="mentor-chat-spinner"></span>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};