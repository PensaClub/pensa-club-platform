import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  createChatRequest,
  listenToMessages,
  listenToRequestMessages,
  sendMessage,
  sendMessageToRequest,
  markMessagesAsRead,
  endConversation,
  uploadChatFile
} from '../../firebase/firebaseChat';
import { DigiBridgeChatMessage } from '../DigiBridgeChatMessage/DigiBridgeChatMessage';
import { toast } from 'react-toastify';
import './digiBridgeChatWindow.css';
import { useAuthContext } from '../../contexts/UserContext';

export const DigiBridgeChatWindow = ({ 
  onClose, 
  existingConversation = null,
  pendingRequest = null,
  onRequestCreated
}) => {
  const { t } = useTranslation();
  const { profileData } = useAuthContext();
  const [step, setStep] = useState('category');
  const [currentRequest, setCurrentRequest] = useState(pendingRequest);
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

  // Scroll до дъното
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ✅ Update pending request
  useEffect(() => {
    if (pendingRequest) {
      setCurrentRequest(pendingRequest);
    }
  }, [pendingRequest]);

  // ✅ Ако има conversation - използвай го
  useEffect(() => {
    if (existingConversation) {
      setConversationId(existingConversation.id);
      setMentorName(existingConversation.mentorName);
      setMentorId(existingConversation.mentorId);
      setStep('chat');
    }
  }, [existingConversation]);

  // ✅ Ако има request или conversation - покажи chat
  useEffect(() => {
    if (existingConversation || currentRequest) {
      setStep('chat');
    } else {
      setStep('category');
    }
  }, [existingConversation, currentRequest]);

  // ✅ Слушай за messages (или от request или от conversation)
  useEffect(() => {
    let unsubscribe;

    if (existingConversation?.id) {
      unsubscribe = listenToMessages(existingConversation.id, (msgs) => {
        setMessages(msgs);
        if (msgs.length > 0) {
          markMessagesAsRead(existingConversation.id, userId);
        }
      });
    } else if (currentRequest?.id) {
      unsubscribe = listenToRequestMessages(currentRequest.id, (msgs) => {
        setMessages(msgs);
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [existingConversation?.id, currentRequest?.id, userId]);

  // ✅ Избор на категория - създай request и отвори chat
  const handleCategorySelect = async (category, problem) => {
    if (!userId || !userName) return;

    try {
      const requestData = {
        userId,
        userName,
        userEmail: userEmail,
        problem,
        category,
        timestamp: Date.now(),
        status: 'pending'
      };

      const requestId = await createChatRequest(requestData);
      
      const newRequest = {
        id: requestId,
        ...requestData
      };
      
      setCurrentRequest(newRequest);
      onRequestCreated?.(newRequest);
      setStep('chat');
      toast.success('Можеш да започнеш да пишеш!');
    } catch (error) {
      console.error('Error creating request:', error);
      toast.error('Грешка при създаване на заявка');
    }
  };

  // ✅ Изпрати съобщение (в request или conversation)
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const messageData = {
      senderId: userId,
      senderName: userName,
      senderType: 'user',
      message: inputMessage.trim()
    };

    try {
      if (currentRequest && !existingConversation) {
        // Изпращане в REQUEST
        await sendMessageToRequest(currentRequest.id, messageData);
      } else if (existingConversation) {
        // Изпращане в CONVERSATION
        await sendMessage(existingConversation.id, {
          ...messageData,
          userId: userId,
          mentorId: existingConversation.mentorId
        });
      }
      
      setInputMessage('');
    } catch (error) {
      console.error('❌ Error sending message:', error);
      toast.error('Грешка при изпращане на съобщение');
    }
  };

  // Upload файл
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const activeConvId = existingConversation?.id;
    if (!activeConvId) {
      toast.error('Моля изчакайте да бъде приет чатът');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error(t('digiBridge.chatWindow.fileTooLarge'));
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const fileInfo = await uploadChatFile(
        file,
        activeConvId,
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
        mentorId: existingConversation.mentorId
      };

      await sendMessage(activeConvId, messageData);
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
    const activeConvId = existingConversation?.id;
    if (!activeConvId) return;

    try {
      await endConversation(activeConvId);
      setStep('ended');
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
            {existingConversation && (
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
            {currentRequest && !existingConversation && (
              <h3>⏳ Чака се ментор</h3>
            )}
            {!currentRequest && !existingConversation && step === 'category' && (
              <h3>{t('digiBridge.chatWindow.needHelp')}</h3>
            )}
            {step === 'ended' && (
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

          {/* CATEGORY SELECTION */}
          {step === 'category' && !currentRequest && !existingConversation && (
            <div className="digibridge-chat-start">
              <div className="digibridge-chat-start-icon">💬</div>
              <h3>{t('digiBridge.chatWindow.startTitle')}</h3>
              <p>{t('digiBridge.chatWindow.startDescription')}</p>

              <div className="digibridge-chat-categories">
                <button onClick={() => handleCategorySelect('General', 'Общ въпрос')}>
                  ❓ {t('digiBridge.chatWindow.categories.general')}
                </button>
                <button onClick={() => handleCategorySelect('Online Banking', 'Онлайн банкиране')}>
                  🏦 {t('digiBridge.chatWindow.categories.banking')}
                </button>
                <button onClick={() => handleCategorySelect('Social Media', 'Социални мрежи')}>
                  📱 {t('digiBridge.chatWindow.categories.socialMedia')}
                </button>
                <button onClick={() => handleCategorySelect('Digital Security', 'Сигурност')}>
                  🔒 {t('digiBridge.chatWindow.categories.security')}
                </button>
                <button onClick={() => handleCategorySelect('Email', 'Email и съобщения')}>
                  📧 {t('digiBridge.chatWindow.categories.email')}
                </button>
                <button onClick={() => handleCategorySelect('Basic Computer Skills', 'Компютърни умения')}>
                  💻 {t('digiBridge.chatWindow.categories.computer')}
                </button>
              </div>
            </div>
          )}

          {/* CHAT - Съобщения */}
          {step === 'chat' && (
            <div className="digibridge-chat-messages">
              {messages.length === 0 && (
                <div className="digibridge-chat-welcome">
                  <p>
                    {existingConversation 
                      ? t('digiBridge.chatWindow.welcomeMessage', { mentorName })
                      : '👋 Можеш да започнеш да пишеш. Ментор ще ти отговори скоро!'}
                  </p>
                </div>
              )}

              {messages.map((message) => {
                return (
                  <DigiBridgeChatMessage
                    key={message.id}
                    message={message}
                    isOwn={message.senderId === userId}
                  />
                );
              })}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* ENDED */}
          {step === 'ended' && (
            <div className="digibridge-chat-ended">
              <div className="digibridge-chat-ended-icon">✅</div>
              <h3>{t('digiBridge.chatWindow.endedTitle')}</h3>
              <p>{t('digiBridge.chatWindow.endedDescription')}</p>
            </div>
          )}
        </div>

        {/* FOOTER - Input за съобщения */}
        {step === 'chat' && (
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

              {/* Файлове - само ако е accepted */}
              {existingConversation && (
                <>
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
                </>
              )}

              {/* Input */}
              <input
                type="text"
                className="digibridge-chat-input"
                placeholder={t('digiBridge.chatWindow.inputPlaceholder')}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isUploading}
              />

              {/* Send */}
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

            {/* End chat - само ако е accepted */}
            {existingConversation && (
              <button
                className="digibridge-chat-end-btn"
                onClick={handleEndChat}
              >
                {t('digiBridge.chatWindow.endChat')}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};