// src/components/DigiBridge/MentorMultiChat/MiniChatWindow.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../contexts/UserContext';
import {
  listenToMessages,
  sendMessage,
  markMessagesAsRead,
  endConversation,
  uploadChatFile,
  createMentorSession,   
  endMentorSession 
} from '../../firebase/firebaseChat';
import { DigiBridgeChatMessage } from '../DigiBridgeChatMessage/DigiBridgeChatMessage';
import { toast } from 'react-toastify';
import './miniChatWindow.css';
import { useAcademy } from '../../contexts/AcademyProvider';  
export const MiniChatWindow = ({ conversation, getPosition, onClose, isMobile }) => {
  const { t } = useTranslation('digibridge');
  const { profileData } = useAuthContext();
  const { syncSession } = useAcademy(); 
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const mentorEmail = profileData?.email || '';
  const mentorId = mentorEmail.replace(/\./g, '_dot_').replace(/@/g, '_at_');
  const mentorName = profileData?.details?.username || profileData?.details?.firstName || mentorEmail.split('@')[0] || 'Mentor';

  // ✅ Изчисли позицията динамично според minimized state
  const position = getPosition(isMinimized);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
// ✅ SESSION TRACKING
useEffect(() => {
    if (!conversation?.id || !mentorId) return;

    let sessionId = null;

    const initSession = async () => {
      try {
        sessionId = await createMentorSession(mentorId, conversation.id);
        setCurrentSessionId(sessionId);
      } catch (error) {
        console.error('Error starting session:', error);
      }
    };

    initSession();

    return () => {
      if (sessionId) {
        endMentorSession(mentorId, sessionId, syncSession);  // ✅ ПОДАВАЙ syncSession
      }
    };
  }, [conversation?.id, mentorId, syncSession]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!conversation?.id) return;

    const unsubscribe = listenToMessages(conversation.id, (msgs) => {
      setMessages(msgs);
      markMessagesAsRead(conversation.id, mentorId);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [conversation?.id, mentorId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || !conversation?.id) return;

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
      toast.error(t('digiBridge.chatWindow.errorSending'));
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !conversation?.id) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error(t('digiBridge.chatWindow.fileTooLarge'));
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const fileInfo = await uploadChatFile(
        file,
        conversation.id,
        (progress) => setUploadProgress(progress)
      );

      const messageData = {
        senderId: mentorId,
        senderName: mentorName,
        senderType: 'mentor',
        message: file.type.startsWith('image/') ? '📷 Изображение' : '📎 Файл',
        type: file.type.startsWith('image/') ? 'image' : 'file',
        fileUrl: fileInfo.url,
        fileName: fileInfo.name,
        fileSize: fileInfo.size,
        userId: conversation.userId,
        mentorId: mentorId
      };

      await sendMessage(conversation.id, messageData);
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

  const handleEndChat = async () => {
    if (!conversation?.id) return;

    if (!window.confirm(t('digiBridge.mentorHub.confirmEndChat'))) return;

    try {
      await endConversation(conversation.id);
      toast.success(t('digiBridge.chatWindow.chatEnded'));
      onClose();
    } catch (error) {
      console.error('Error ending chat:', error);
      toast.error(t('digiBridge.chatWindow.errorEnding'));
    }
  };

  return (
    <div 
      className={`mini-chat-window ${isMinimized ? 'minimized' : ''} ${isMobile ? 'mobile' : ''}`}
      style={{ 
        right: position.right ? `${position.right}px` : 'auto',
        bottom: `${position.bottom}px`,
        left: position.left === 'auto' ? 'auto' : (position.left ? `${position.left}px` : 'auto'),
        width: position.width ? (typeof position.width === 'number' ? `${position.width}px` : position.width) : undefined,
        height: position.height ? `${position.height}px` : undefined
      }}
    >
      {/* HEADER */}
      <div className="mini-chat-window-header">
        <div className="mini-chat-window-user-info">
          {/* ✅ Показвай само аватар ако е minimized на mobile */}
          {isMinimized && isMobile ? (
            <div 
              className="mini-chat-window-avatar-only"
              onClick={() => setIsMinimized(false)}
            >
              {conversation.userName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          ) : (
            <>
              <div className="mini-chat-window-avatar">
                {conversation.userName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="mini-chat-window-user-details">
                <h4>{conversation.userName}</h4>
                <span>{conversation.problem}</span>
              </div>
            </>
          )}
        </div>
        
        {/* ✅ Скрий actions на mobile minimized */}
        {!(isMinimized && isMobile) && (
          <div className="mini-chat-window-actions">
            <button 
              className="mini-chat-window-btn"
              onClick={() => setIsMinimized(!isMinimized)}
              title={isMinimized ? t('digiBridge.mentorHub.maximize') : t('digiBridge.mentorHub.minimize')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {isMinimized ? (
                  <path d="M4 14h6v6M20 10h-6V4"/>
                ) : (
                  <line x1="5" y1="12" x2="19" y2="12"/>
                )}
              </svg>
            </button>
            <button 
              className="mini-chat-window-btn"
              onClick={onClose}
              title={t('digiBridge.mentorHub.close')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* BODY */}
      {!isMinimized && (
        <>
          <div className="mini-chat-window-body">
            <div className="mini-chat-window-messages">
              {messages.map((message) => (
                <DigiBridgeChatMessage
                  key={message.id}
                  message={message}
                  isOwn={message.senderId === mentorId}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* FOOTER */}
          <div className="mini-chat-window-footer">
            {isUploading && (
              <div className="mini-chat-window-upload-progress">
                <div
                  className="mini-chat-window-upload-bar"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}

            <form onSubmit={handleSendMessage} className="mini-chat-window-input-form">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*,.pdf,.doc,.docx"
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="mini-chat-window-attach-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              </button>

              <input
                type="text"
                className="mini-chat-window-input"
                placeholder={t('digiBridge.chatWindow.inputPlaceholder')}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isUploading}
              />

              <button
                type="submit"
                className="mini-chat-window-send-btn"
                disabled={!inputMessage.trim() || isUploading}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>

            <button
              className="mini-chat-window-end-btn"
              onClick={handleEndChat}
            >
              {t('digiBridge.chatWindow.endChat')}
            </button>
          </div>
        </>
      )}
    </div>
  );
};