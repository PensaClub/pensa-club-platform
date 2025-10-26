// src/components/DigiBridge/DigiBridgeChatWindow/DigiBridgeChatWindow.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  createChatRequest,
  listenToMessages,
  sendMessage,
  markMessagesAsRead,
  endConversation,
  uploadChatFile
} from '../../firebase/firebaseChat';
import { DigiBridgeChatMessage } from '../DigiBridgeChatMessage/DigiBridgeChatMessage';
import { toast } from 'react-toastify';
import './digiBridgeChatWindow.css';
import { useAuthContext } from '../../contexts/UserContext';

export const DigiBridgeChatWindow = ({ onClose, existingConversation = null }) => {
  const { t } = useTranslation();
  const { profileData } = useAuthContext();
  const [status, setStatus] = useState('idle');
  const [conversationId, setConversationId] = useState(null);
  const [mentorName, setMentorName] = useState('');
  const [mentorId, setMentorId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const userEmail = profileData?.email || '';
  const userId = userEmail.replace(/\./g, '_dot_').replace(/@/g, '_at_');
  const userName = profileData?.details?.username || profileData?.details?.firstName || userEmail.split('@')[0] || 'Потребител';

  // Scroll до дъното при нови съобщения
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Ако има existingConversation, използвай го
  useEffect(() => {
    if (existingConversation) {
      setConversationId(existingConversation.id);
      setMentorName(existingConversation.mentorName);
      setMentorId(existingConversation.mentorId);
      setStatus('connected');
    }
  }, [existingConversation]);

  // ❌ ИЗТРИЙ ТОЗИ useEffect - не слушай автоматично за conversations
  // useEffect(() => {
  //   if (!userId || status !== 'idle' || existingConversation) return;
  //   ...
  // }, [userId, status, existingConversation]);

  // Слушай за съобщения само ако има conversation
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = listenToMessages(conversationId, (msgs) => {
      setMessages(msgs);
      // Set mentorId from first message if not already set
      if (msgs.length > 0 && !mentorId) {
        setMentorId(msgs[0].mentorId);
      }
      // Маркирай като прочетени
      markMessagesAsRead(conversationId, userId);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [conversationId, userId]);

  // ✅ ОБНОВИ: Търси ментор
  const handleSearchMentor = async (problem, category) => {
    setStatus('searching');

    try {
      await createChatRequest({
        userId: userId,
        userName: userName,
        userEmail: profileData?.email,
        problem: problem,
        category: category
      });

      toast.info(t('digiBridge.chatWindow.requestSent'));
      
      // ✅ ЗАТВОРИ прозореца след 2 секунди
      setTimeout(() => {
        onClose();
        toast.success(t('digiBridge.chatWindow.requestCreated'));
      }, 2000);

    } catch (error) {
      console.error('Error creating chat request:', error);
      toast.error(t('digiBridge.chatWindow.errorSearching'));
      setStatus('idle');
    }
  };

  // Изпрати съобщение
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || !conversationId || !mentorId) return;

    const messageData = {
      senderId: userId,
      senderName: userName,
      senderType: 'user',
      message: inputMessage.trim(),
      userId: userId,
      mentorId: mentorId
    };

    try {
      await sendMessage(conversationId, messageData);
      setInputMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(t('digiBridge.chatWindow.errorSending'));
    }
  };

  // Upload файл
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !conversationId || !mentorId) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error(t('digiBridge.chatWindow.fileTooLarge'));
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const fileInfo = await uploadChatFile(
        file,
        conversationId,
        (progress) => setUploadProgress(progress)
      );

      const messageData = {
        senderId: userId,
        senderName: userName,
        senderType: 'user',
        message: file.type.startsWith('image/') ? '📷 Изображение' : '📎 Файл',
        type: file.type.startsWith('image/') ? 'image' : 'file',
        fileUrl: fileInfo.url,
        fileName: fileInfo.name,
        fileSize: fileInfo.size,
        userId: userId,
        mentorId: mentorId
      };

      await sendMessage(conversationId, messageData);
      toast.success(t('digiBridge.chatWindow.fileUploaded'));
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(t('digiBridge.chatWindow.errorUploading'));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Приключи чат
  const handleEndChat = async () => {
    if (!conversationId) return;

    try {
      await endConversation(conversationId);
      setStatus('ended');
      toast.success(t('digiBridge.chatWindow.chatEnded'));
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error ending chat:', error);
      toast.error(t('digiBridge.chatWindow.errorEnding'));
    }
  };

  return (
    <div className="digibridge-chat-window-overlay" onClick={onClose}>
      <div className="digibridge-chat-window" onClick={(e) => e.stopPropagation()}>

        {/* HEADER */}
        <div className="digibridge-chat-header">
          <div className="digibridge-chat-header-info">
            {status === 'connected' && (
              <>
                <div className="digibridge-chat-mentor-avatar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="digibridge-chat-mentor-details">
                  <h3>{mentorName}</h3>
                  <span className="digibridge-chat-mentor-status">
                    <span className="digibridge-chat-status-dot"></span>
                    {t('digiBridge.chatWindow.online')}
                  </span>
                </div>
              </>
            )}
            {status === 'searching' && (
              <h3>{t('digiBridge.chatWindow.searching')}</h3>
            )}
            {status === 'idle' && (
              <h3>{t('digiBridge.chatWindow.needHelp')}</h3>
            )}
            {status === 'ended' && (
              <h3>{t('digiBridge.chatWindow.ended')}</h3>
            )}
          </div>

          <button className="digibridge-chat-close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* BODY */}
        <div className="digibridge-chat-body">

          {/* IDLE - Избор на проблем */}
          {status === 'idle' && (
            <div className="digibridge-chat-start">
              <div className="digibridge-chat-start-icon">💬</div>
              <h3>{t('digiBridge.chatWindow.startTitle')}</h3>
              <p>{t('digiBridge.chatWindow.startDescription')}</p>

              <div className="digibridge-chat-categories">
                <button onClick={() => handleSearchMentor('Общ въпрос', 'General')}>
                  ❓ {t('digiBridge.chatWindow.categories.general')}
                </button>
                <button onClick={() => handleSearchMentor('Онлайн банкиране', 'Online Banking')}>
                  🏦 {t('digiBridge.chatWindow.categories.banking')}
                </button>
                <button onClick={() => handleSearchMentor('Социални мрежи', 'Social Media')}>
                  📱 {t('digiBridge.chatWindow.categories.socialMedia')}
                </button>
                <button onClick={() => handleSearchMentor('Сигурност', 'Digital Security')}>
                  🔒 {t('digiBridge.chatWindow.categories.security')}
                </button>
                <button onClick={() => handleSearchMentor('Email и съобщения', 'Email')}>
                  📧 {t('digiBridge.chatWindow.categories.email')}
                </button>
                <button onClick={() => handleSearchMentor('Компютърни умения', 'Basic Computer Skills')}>
                  💻 {t('digiBridge.chatWindow.categories.computer')}
                </button>
              </div>
            </div>
          )}

          {/* SEARCHING - Търси ментор */}
          {status === 'searching' && (
            <div className="digibridge-chat-searching">
              <div className="digibridge-chat-searching-spinner">
                <div className="digibridge-spinner"></div>
              </div>
              <h3>{t('digiBridge.chatWindow.searchingTitle')}</h3>
              <p>{t('digiBridge.chatWindow.searchingDescription')}</p>
            </div>
          )}

          {/* CONNECTED - Съобщения */}
          {status === 'connected' && (
            <div className="digibridge-chat-messages">
              {messages.length === 0 && (
                <div className="digibridge-chat-welcome">
                  <p>{t('digiBridge.chatWindow.welcomeMessage', { mentorName })}</p>
                </div>
              )}

              {messages.map((message) => (
                <DigiBridgeChatMessage
                  key={message.id}
                  message={message}
                  isOwn={message.senderId === userId}
                />
              ))}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* ENDED - Чатът приключи */}
          {status === 'ended' && (
            <div className="digibridge-chat-ended">
              <div className="digibridge-chat-ended-icon">✅</div>
              <h3>{t('digiBridge.chatWindow.endedTitle')}</h3>
              <p>{t('digiBridge.chatWindow.endedDescription')}</p>
            </div>
          )}
        </div>

        {/* FOOTER - Input за съобщения */}
        {status === 'connected' && (
          <div className="digibridge-chat-footer">

            {/* Upload progress */}
            {isUploading && (
              <div className="digibridge-chat-upload-progress">
                <div
                  className="digibridge-chat-upload-bar"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}

            <form onSubmit={handleSendMessage} className="digibridge-chat-input-form">

              {/* Бутон за файлове */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*,.pdf,.doc,.docx"
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="digibridge-chat-attach-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              </button>

              {/* Input за текст */}
              <input
                type="text"
                className="digibridge-chat-input"
                placeholder={t('digiBridge.chatWindow.inputPlaceholder')}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isUploading}
              />

              {/* Бутон за изпращане */}
              <button
                type="submit"
                className="digibridge-chat-send-btn"
                disabled={!inputMessage.trim() || isUploading}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>

            {/* Бутон за приключване на чат */}
            <button
              className="digibridge-chat-end-btn"
              onClick={handleEndChat}
            >
              {t('digiBridge.chatWindow.endChat')}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};